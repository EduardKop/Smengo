'use client'

import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MonthDay } from '@/lib/schedule/month'
import type { EmployeeRow, StatusTypeRow, ScheduleEntryRow, GridMode, ScheduleMap } from '@/lib/schedule/types'
import { GridCell } from './grid-cell'

export const NAME_COL_WIDTH = 220

// ── Group header row ───────────────────────────────────────────────

interface GroupRowProps {
  deptName: string
  count: number
  collapsed: boolean
  onToggle: () => void
  employeesCountLabel: string
  /** If provided, show department action buttons (rename/delete) */
  onRenameDept?: () => void
  onDeleteDept?: () => void
  /** If provided, show "+" add employee button */
  onAddEmployee?: () => void
}

export function GroupRow({
  deptName,
  count,
  collapsed,
  onToggle,
  employeesCountLabel,
  onRenameDept,
  onDeleteDept,
  onAddEmployee,
}: GroupRowProps) {
  const showDeptActions = onRenameDept || onDeleteDept
  const showAddBtn = !!onAddEmployee

  return (
    <div
      role="row"
      className="group flex h-9 items-center border-b border-border bg-muted/60 hover:bg-muted transition-colors"
    >
      {/* Collapse toggle + label */}
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="flex flex-1 items-center gap-2 min-w-0 h-full px-3 cursor-pointer select-none text-left"
      >
        {collapsed
          ? <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        }
        <span className="truncate text-[13px] font-semibold text-foreground">{deptName}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{employeesCountLabel}</span>
      </button>

      {/* Action buttons — appear on group hover */}
      {(showAddBtn || showDeptActions) && (
        <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {showAddBtn && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddEmployee?.() }}
              title="Add employee"
              className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Plus size={14} />
            </button>
          )}
          {onRenameDept && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRenameDept() }}
              title="Rename department"
              className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDeleteDept && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDeleteDept() }}
              title="Delete department"
              className="rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Employee row ────────────────────────────────────────────────────

interface EmployeeRowProps {
  employee: EmployeeRow
  days: MonthDay[]
  today: string
  rowHeight: number
  /** Deterministic cell width in px (from CELL_WIDTH[mode]) */
  cellW: number
  mode: GridMode
  locale: string
  /** lifted from grid.tsx to avoid per-cell hook call */
  hourSuffix: string
  /** lifted from grid.tsx to avoid per-cell hook call */
  nightBadge: string
  scheduleMap: ScheduleMap
  /** status_id → StatusTypeRow; built from data.statusTypes */
  statusById: Map<string, StatusTypeRow>
  /** Entry for a specific date (resolved from scheduleMap by parent for this employee) */
  entriesForEmployee: Map<string, ScheduleEntryRow> | undefined
  /**
   * Called when a cell is clicked. Passes the cell element (for popover positioning)
   * and the date ISO string. undefined = read-only (no click handler attached).
   */
  onCellClick?: (employeeId: string, dateISO: string, cellEl: HTMLElement) => void
  /** Called when employee name is clicked — opens edit modal */
  onEmployeeClick?: (employee: EmployeeRow) => void
  /** If true, renders a drag handle (GripVertical) in the name column */
  draggable?: boolean
}

export function EmployeeGridRow({
  employee,
  days,
  today,
  rowHeight,
  cellW,
  mode,
  locale,
  hourSuffix,
  nightBadge,
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

  // Build transform style — translate only (no scale) to avoid distortion
  // We apply it as a CSS transform on the row. Since the row is absolute-positioned
  // by the virtualizer, we layer the dnd translate on top of the existing top offset.
  const transformStyle = transform
    ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 })
    : undefined

  return (
    <div
      ref={setNodeRef}
      role="row"
      className="flex border-b border-border group"
      style={{
        height: rowHeight,
        transform: transformStyle,
        transition,
        opacity: isDragging ? 0.4 : undefined,
        zIndex: isDragging ? 1 : undefined,
        position: 'relative',
      }}
      data-employee-id={employee.id}
    >
      {/* Sticky name column */}
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center border-r border-border bg-background px-2 gap-1"
        style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
      >
        {/* Drag handle — only when draggable */}
        {draggable && (
          <button
            type="button"
            aria-label="Drag to reorder"
            className="shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none text-muted-foreground p-0.5 rounded hover:bg-muted"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        )}

        {/* Name + position */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {onEmployeeClick ? (
            <button
              type="button"
              onClick={() => onEmployeeClick(employee)}
              className="truncate text-left text-[13px] font-medium leading-tight text-foreground hover:underline focus:outline-none"
            >
              {employee.full_name}
            </button>
          ) : (
            <span className="truncate text-[13px] font-medium leading-tight text-foreground">
              {employee.full_name}
            </span>
          )}
          {employee.position && (
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              {employee.position}
            </span>
          )}
        </div>
      </div>

      {/* Day cells — deterministic width, no flex-1 */}
      {days.map((d) => {
        const isToday = d.dateISO === today
        const entry = entriesForEmployee?.get(d.dateISO)
        const status = entry ? statusById.get(entry.status_id) : undefined

        return (
          <div
            key={d.dateISO}
            role="presentation"
            data-cell={`${employee.id}-${d.dateISO}`}
            className="border-r border-border/50 last:border-r-0 transition-colors"
            style={{
              width: cellW,
              flex: 'none',
              height: '100%',
              background: isToday
                ? 'color-mix(in oklab, var(--primary) 6%, var(--grid-cell))'
                : d.isWeekend
                  ? 'var(--grid-weekend)'
                  : 'var(--grid-cell)',
            }}
          >
            <GridCell
              entry={entry}
              status={status}
              mode={mode}
              isWeekend={d.isWeekend}
              isToday={isToday}
              cellW={cellW}
              locale={locale}
              hourSuffix={hourSuffix}
              nightBadge={nightBadge}
              onClick={onCellClick
                ? () => {
                    const el = document.querySelector(`[data-cell="${employee.id}-${d.dateISO}"]`) as HTMLElement | null
                    if (el) onCellClick(employee.id, d.dateISO, el)
                  }
                : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}
