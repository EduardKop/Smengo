'use client'

/**
 * Строки грида: группа отдела + строка сотрудника.
 * Разметка и стили скопированы из демо-грида (grid-preview.tsx, standard):
 * dept-строка 5826–5876, ячейка сотрудника 5877–6087 (detail/extended),
 * compact-таблица 6606–7103, merge-прогоны 6088–6257.
 * Архитектура продукта (виртуализация, dnd, server actions) сохранена.
 */

import { useMemo, useState } from 'react'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MonthDay } from '@/lib/schedule/month'
import { shiftDurationHours } from '@/lib/schedule/month'
import type { EmployeeRow, StatusTypeRow, ScheduleEntryRow, GridMode } from '@/lib/schedule/types'
import type { CardVisual } from '@/lib/validation/grid-view'
import type { SiteTone } from '@/lib/schedule/card-visual'
import {
  type DemoStatusCode,
  demoCode,
  isDefaultMergedLeaveStatus,
} from './status-style'
import {
  Avatar,
  DepartmentDot,
  DepartmentPositionCard,
  positionColor,
  scheduleRunClickTarget,
  TELEGRAM_ACCENT,
} from './grid-visual'
import { TOTALS_OFF_W, TOTALS_HRS_W } from './grid-header'
import { StatusChip, UnassignedChip, EmptyCellMark, type ChipLabels } from './grid-cell'

// ── Лейблы уровня строки (поверх ChipLabels) ────────────────────────

export interface GridRowLabels extends ChipLabels {
  telegramLabel: string
  colOffDays: string
  colWorkHrs: string
}

export interface CellRect {
  top: number
  left: number
  width: number
  height: number
}

// ── Group header row (демо: dept-строка, фон --grid-dept-bg) ────────

interface GroupRowProps {
  deptName: string
  /** Цвет отдела (deptColor по stableHash id) */
  accent: string
  /** Подпись «· мин {n}/день» — уже интерполированная, если порог задан */
  minLabel?: string
  collapsed: boolean
  onToggle: () => void
  nameColWidth: number
  mode: GridMode
  /** If provided, show department action buttons (rename/delete) */
  onRenameDept?: () => void
  onDeleteDept?: () => void
  /** If provided, show "+" add employee button */
  onAddEmployee?: () => void
}

export function GroupRow({
  deptName,
  accent,
  minLabel,
  collapsed,
  onToggle,
  nameColWidth,
  mode,
  onRenameDept,
  onDeleteDept,
  onAddEmployee,
}: GroupRowProps) {
  const isCompact = mode === 'compact'
  const showDeptActions = onRenameDept || onDeleteDept
  const showAddBtn = !!onAddEmployee

  return (
    <div
      role="row"
      className="group flex h-full w-full"
      style={{ background: 'var(--grid-dept-bg)' }}
    >
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center"
        style={{
          padding: isCompact ? '3px 12px 3px 10px' : '4px 12px 4px 10px',
          background: 'var(--grid-dept-bg)',
          width: nameColWidth,
          minWidth: nameColWidth,
          maxWidth: nameColWidth,
          boxSizing: 'border-box',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          borderRight: '1px solid var(--border)',
          fontSize: isCompact ? 9.5 : 10,
          fontWeight: 600,
          color: 'var(--grid-dept-fg)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer select-none items-center bg-transparent p-0 text-left"
          style={{ border: 0, color: 'inherit', font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}
        >
          <DepartmentDot
            color={accent}
            outer={14}
            inner={8}
            marginRight={isCompact ? 5 : 6}
          />
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              marginRight: 4,
              transform: collapsed ? 'none' : 'rotate(90deg)',
              transition: 'transform 120ms ease',
            }}
          >
            ▸
          </span>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{deptName}</span>
          {minLabel && (
            <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: 'none', flexShrink: 0 }}>
              · {minLabel}
            </span>
          )}
        </button>

        {/* Action buttons — appear on group hover */}
        {(showAddBtn || showDeptActions) && (
          <div className="flex shrink-0 items-center gap-0.5 pl-1 opacity-0 transition-opacity group-hover:opacity-100">
            {showAddBtn && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddEmployee?.() }}
                title="Add employee"
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Plus size={12} />
              </button>
            )}
            {onRenameDept && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRenameDept() }}
                title="Rename department"
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <Pencil size={12} />
              </button>
            )}
            {onDeleteDept && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDeleteDept() }}
                title="Delete department"
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
      {/* остаток строки — фон отдела на всю ширину */}
      <div className="min-w-0 flex-1" style={{ background: 'var(--grid-dept-bg)' }} />
    </div>
  )
}

// ── Плашка пустого отдела: «+ Добавить сотрудника» ──────────────────
// Ghost-строка под заголовком отдела без сотрудников (язык демо:
// пунктирные dashed-чипы UnassignedChip). Рендерится только ролям
// с правом crud_employees — гейтится наличием onClick в grid.tsx.

interface AddEmployeeRowProps {
  label: string
  nameColWidth: number
  onClick: () => void
}

export function AddEmployeeRow({ label, nameColWidth, onClick }: AddEmployeeRowProps) {
  return (
    <div
      role="row"
      className="flex h-full w-full"
      style={{ borderBottom: '1px solid var(--grid-row-divider)' }}
    >
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center"
        style={{
          width: nameColWidth,
          minWidth: nameColWidth,
          maxWidth: nameColWidth,
          boxSizing: 'border-box',
          padding: '5px 12px 5px 10px',
          background: 'var(--grid-cell)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          style={{
            border: '1.5px dashed color-mix(in oklab, currentColor 45%, transparent)',
            borderRadius: 8,
            background: 'transparent',
            padding: '6px 10px',
            fontSize: 11.5,
            fontWeight: 600,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Plus size={12} strokeWidth={2.4} />
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        </button>
      </div>
      {/* остаток строки — обычный фон ячеек */}
      <div className="min-w-0 flex-1" style={{ background: 'var(--grid-cell)' }} />
    </div>
  )
}

// ── Runs: merge подряд идущих V/S (или всех при merged) ────────────

interface DayCellData {
  day: MonthDay
  dayIdx: number
  entry: ScheduleEntryRow | undefined
  status: StatusTypeRow | undefined
  code: DemoStatusCode | undefined
}

interface CellRun {
  cells: DayCellData[]
  indices: number[]
}

function runMergeKey(cell: DayCellData): string | null {
  if (!cell.entry || !cell.status) return null
  return `${cell.entry.status_id}|${cell.entry.start_time ?? ''}|${cell.entry.end_time ?? ''}`
}

function shouldMergeRun(cell: DayCellData, mergeAll: boolean): boolean {
  if (mergeAll) return true
  return isDefaultMergedLeaveStatus(cell.code)
}

function buildRuns(cells: DayCellData[], mergeAll: boolean): CellRun[] {
  const runs: CellRun[] = []
  for (const cell of cells) {
    const last = runs[runs.length - 1]
    if (
      last &&
      shouldMergeRun(cell, mergeAll) &&
      shouldMergeRun(last.cells[0], mergeAll) &&
      runMergeKey(cell) === runMergeKey(last.cells[0])
    ) {
      last.cells.push(cell)
      last.indices.push(cell.dayIdx)
    } else {
      runs.push({ cells: [cell], indices: [cell.dayIdx] })
    }
  }
  return runs
}

// ── Employee row ────────────────────────────────────────────────────

interface EmployeeRowProps {
  employee: EmployeeRow
  deptName: string
  /** Цвет отдела (deptColor по stableHash id) */
  deptAccent: string
  days: MonthDay[]
  rowHeight: number
  nameColWidth: number
  /** Deterministic cell width in px (from CELL_WIDTH[mode]) */
  cellW: number
  mode: GridMode
  locale: string
  labels: GridRowLabels
  weekendBg: string
  problemDays: ReadonlySet<string>
  showGrid: boolean
  showTimes: boolean
  merged: boolean
  showTelegram: boolean
  showEmployeeDepartment: boolean
  showEmployeeRole: boolean
  showEmployeeDot: boolean
  /** Сохранённые визуалы карточек организации: status_type_id → CardVisual */
  cardVisuals: Record<string, CardVisual>
  /** Текущая тема сайта (класс dark на html) — для cardVisuals */
  tone: SiteTone
  /** status_id → StatusTypeRow; built from data.statusTypes */
  statusById: Map<string, StatusTypeRow>
  /** Entries for this employee (resolved from scheduleMap by parent) */
  entriesForEmployee: Map<string, ScheduleEntryRow> | undefined
  /**
   * Клик по ячейке (только в editMode — undefined гейтит редактирование).
   * rect — viewport-координаты под-ячейки дня (для прогонов — доля прогона).
   */
  onCellClick?: (employeeId: string, dateISO: string, rect: CellRect) => void
  /** Called when employee name is clicked — opens overlay */
  onEmployeeClick?: (employee: EmployeeRow) => void
  /** If true, renders a drag handle (GripVertical) in the name column */
  draggable?: boolean
}

export function EmployeeGridRow({
  employee,
  deptName,
  deptAccent,
  days,
  rowHeight,
  nameColWidth,
  cellW,
  mode,
  locale,
  labels,
  weekendBg,
  problemDays,
  showGrid,
  showTimes,
  merged,
  showTelegram,
  showEmployeeDepartment,
  showEmployeeRole,
  showEmployeeDot,
  cardVisuals,
  tone,
  statusById,
  entriesForEmployee,
  onCellClick,
  onEmployeeClick,
  draggable = false,
}: EmployeeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: employee.id })

  const [hoveredRun, setHoveredRun] = useState<string | null>(null)

  const transformStyle = transform
    ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 })
    : undefined

  const isExt = mode === 'extended'
  const isCompact = mode === 'compact'
  const canEditCells = !!onCellClick

  // ── Данные ячеек + merge-прогоны ──────────────────────────────────
  const cellData = useMemo((): DayCellData[] => days.map((day, dayIdx) => {
    const entry = entriesForEmployee?.get(day.dateISO)
    const status = entry ? statusById.get(entry.status_id) : undefined
    return { day, dayIdx, entry, status, code: status ? demoCode(status) : undefined }
  }), [days, entriesForEmployee, statusById])

  const runs = useMemo(() => buildRuns(cellData, merged), [cellData, merged])

  // ── Итоги по сотруднику (Вых./Час.) — как в демо: V/S/D и W-часы ──
  const totals = useMemo(() => {
    let off = 0
    let hours = 0
    for (const cell of cellData) {
      if (!cell.entry || !cell.status) continue
      if (cell.code === 'V' || cell.code === 'S' || cell.code === 'D') off++
      else if (cell.code === 'W') {
        const start = cell.entry.start_time ?? cell.status.start_time
        const end = cell.entry.end_time ?? cell.status.end_time
        if (start && end) hours += shiftDurationHours(start, end)
      }
    }
    return { off, hours: Math.round(hours * 10) / 10 }
  }, [cellData])

  const position = employee.position ?? ''
  const telegram = employee.telegram || '—'

  const rowPadFor = (span: number): string => {
    if (isExt) return '3px'
    if (!isCompact) return '6px 5px'
    return span > 1 ? '2px 1px' : '2px'
  }

  const handleRunClick = (run: CellRun) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCellClick) return
    if (run.indices.length > 1) {
      const target = scheduleRunClickTarget(e, run.indices)
      const cell = cellData[target.dayIdx]
      if (cell) onCellClick(employee.id, cell.day.dateISO, target.subRect)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      onCellClick(employee.id, run.cells[0].day.dateISO, {
        top: rect.top, left: rect.left, width: rect.width, height: rect.height,
      })
    }
  }

  const handleRunKeyDown = (run: CellRun) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onCellClick || (e.key !== 'Enter' && e.key !== ' ')) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const span = Math.max(run.indices.length, 1)
    onCellClick(employee.id, run.cells[0].day.dateISO, {
      top: rect.top, left: rect.left, width: rect.width / span, height: rect.height,
    })
  }

  return (
    <div
      ref={setNodeRef}
      role="row"
      className="group flex"
      style={{
        height: rowHeight,
        // 100% ширины спейсера (= max(totalWidth, clientWidth) скроллера):
        // intrinsic max-content раздувался контентом ячеек (1px бордеры
        // «Сетки») и смещал колонки тела относительно шапки/«НА СМЕНЕ».
        width: '100%',
        borderBottom: '1px solid var(--grid-row-divider)',
        transform: transformStyle,
        transition,
        opacity: isDragging ? 0.4 : undefined,
        zIndex: isDragging ? 1 : undefined,
        position: 'relative',
      }}
      data-employee-id={employee.id}
    >
      {/* ── Sticky-колонка сотрудника ── */}
      <div
        className="sticky left-0 z-20 shrink-0"
        style={{
          background: isExt
            ? 'linear-gradient(180deg, color-mix(in oklab, var(--grid-cell) 96%, var(--muted) 4%), var(--grid-cell))'
            : 'var(--grid-cell)',
          padding: isExt ? '8px 10px' : isCompact ? '3px 12px 3px 10px' : '10px 12px',
          fontWeight: 500,
          width: nameColWidth,
          minWidth: nameColWidth,
          maxWidth: nameColWidth,
          boxSizing: 'border-box',
          color: 'var(--foreground)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          borderRight: '1px solid var(--border)',
          boxShadow: '1px 0 0 var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: isCompact ? 11 : undefined,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${isExt ? 28 : isCompact ? 16 : 20}px minmax(0, 1fr)${draggable ? ' auto' : ''}`,
            alignItems: 'center',
            columnGap: isExt ? 9 : 8,
            minWidth: 0,
          }}
        >
          <Avatar name={employee.full_name} size={isExt ? 28 : isCompact ? 16 : 20} />

          {isExt ? (
            <div style={{ minWidth: 0, lineHeight: 1.18 }}>
              <button
                type="button"
                onClick={() => onEmployeeClick?.(employee)}
                className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  border: 0,
                  color: 'var(--foreground)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 650,
                  letterSpacing: 0,
                }}
              >
                {employee.full_name}
              </button>
              <div className="smengo-name-scroll" style={{ marginTop: 4 }}>
                {showTelegram ? (
                  <DepartmentPositionCard
                    department={labels.telegramLabel}
                    position={telegram}
                    accent={TELEGRAM_ACCENT}
                  />
                ) : (
                  <DepartmentPositionCard
                    department={deptName}
                    position={position}
                    departmentAccent={deptAccent}
                    accent={positionColor(position || null)}
                    showDepartment={showEmployeeDepartment}
                    showPosition={showEmployeeRole}
                    showDot={showEmployeeDot}
                  />
                )}
              </div>
              {/* Extended mode adds the month summary right next to the name */}
              <div style={{ marginTop: 5, display: 'flex', gap: 4, minWidth: 0 }}>
                <span
                  title={labels.colWorkHrs}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    borderRadius: 6, padding: '2px 7px',
                    fontSize: 10, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
                    background: 'color-mix(in oklab, var(--st-work) 16%, transparent)',
                    color: 'var(--foreground)',
                  }}
                >
                  {totals.hours}{labels.hourSuffix}
                </span>
                <span
                  title={labels.colOffDays}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    borderRadius: 6, padding: '2px 7px',
                    fontSize: 10, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
                    background: 'var(--grid-pill-bg)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {labels.colOffDays} {totals.off}
                </span>
              </div>
            </div>
          ) : isCompact ? (
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <button
                type="button"
                onClick={() => onEmployeeClick?.(employee)}
                className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                style={{
                  minWidth: 0,
                  width: '100%',
                  border: 0,
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 14.5 * 0.85,
                  lineHeight: 1.1,
                }}
              >
                {employee.full_name}
              </button>
              <div className="smengo-name-scroll">
                {showTelegram ? (
                  <DepartmentPositionCard
                    department={labels.telegramLabel}
                    position={telegram}
                    accent={TELEGRAM_ACCENT}
                    compact
                  />
                ) : (
                  <DepartmentPositionCard
                    department={deptName}
                    position={position}
                    departmentAccent={deptAccent}
                    accent={positionColor(position || null)}
                    compact
                    variant="compactSchedule"
                    textScale={0.85}
                    showDepartment={showEmployeeDepartment}
                    showPosition={showEmployeeRole}
                    showDot={showEmployeeDot}
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <button
                type="button"
                onClick={() => onEmployeeClick?.(employee)}
                className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                style={{
                  minWidth: 0,
                  border: 0,
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.08,
                }}
              >
                {employee.full_name}
              </button>
              <div className="smengo-name-scroll">
                <span
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'inherit',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.08,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: showTelegram ? TELEGRAM_ACCENT : deptAccent,
                      boxShadow: `0 0 0 2px color-mix(in oklab, ${showTelegram ? TELEGRAM_ACCENT : deptAccent} 18%, transparent)`,
                    }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {showTelegram
                      ? `${labels.telegramLabel} › ${telegram}`
                      : position ? `${deptName} › ${position}` : deptName}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Drag handle — только в editMode (draggable гейтится выше) */}
          {draggable && (
            <button
              type="button"
              aria-label="Drag to reorder"
              className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Ячейки дней (merge-прогоны) ── */}
      {runs.map((run, ri) => {
        const span = run.indices.length
        const firstCell = run.cells[0]
        const code = firstCell.code
        const isOff = !firstCell.entry || !firstCell.status
        const allWkd = run.cells.every((c) => c.day.isWeekend)
        const isProblemRun = span === 1 && problemDays.has(firstCell.day.dateISO)
        const runKey = `${employee.id}-${ri}`
        const isHovered = hoveredRun === runKey

        return (
          <div
            key={runKey}
            role="gridcell"
            aria-label={`${firstCell.day.dateISO}${span > 1 ? ` ×${span}` : ''}`}
            tabIndex={canEditCells ? 0 : undefined}
            data-span={span}
            className={canEditCells ? 'smengo-schedule-cell smengo-schedule-edit-cell' : 'smengo-schedule-cell'}
            onClick={canEditCells ? handleRunClick(run) : undefined}
            onKeyDown={canEditCells ? handleRunKeyDown(run) : undefined}
            onMouseEnter={() => setHoveredRun(runKey)}
            onMouseLeave={() => setHoveredRun(null)}
            style={{
              padding: rowPadFor(span),
              textAlign: 'center',
              position: 'relative',
              width: isCompact ? undefined : span * cellW,
              minWidth: span * cellW,
              flex: isCompact ? `${span} 0 ${span * cellW}px` : 'none',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: isProblemRun
                ? 'var(--grid-problem-col)'
                : allWkd ? weekendBg : 'var(--grid-cell)',
              borderRight: showGrid ? '1px solid var(--border)' : 'none',
              cursor: canEditCells ? 'pointer' : 'default',
              transition: 'background 360ms ease',
              height: '100%',
            }}
          >
            {isHovered && span > 1 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
              }} />
            )}
            {isOff ? (
              isProblemRun ? (
                <UnassignedChip mode={mode} label={labels.unassigned} />
              ) : (
                <EmptyCellMark />
              )
            ) : (
              <StatusChip
                mode={mode}
                code={code!}
                status={firstCell.status!}
                entry={firstCell.entry!}
                span={span}
                isRun={span > 1}
                showTimes={showTimes}
                locale={locale}
                labels={labels}
                cardVisual={cardVisuals[firstCell.entry!.status_id]}
                tone={tone}
              />
            )}
          </div>
        )
      })}

      {/* ── Итоги по сотруднику: Вых. / Час. (detail/extended) ── */}
      {!isCompact && (
        <>
          <div
            style={{
              borderLeft: '2px solid var(--border)',
              width: TOTALS_OFF_W, minWidth: TOTALS_OFF_W, flex: 'none',
              textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {totals.off || '—'}
            </span>
          </div>
          <div
            style={{
              borderLeft: '1px solid var(--border)',
              width: TOTALS_HRS_W, minWidth: TOTALS_HRS_W, flex: 'none',
              textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--foreground)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {totals.hours > 0 ? `${totals.hours}${labels.hourSuffix}` : '—'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
