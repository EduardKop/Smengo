'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
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
}

export function GroupRow({ deptName, count, collapsed, onToggle, employeesCountLabel }: GroupRowProps) {
  return (
    <div
      role="row"
      className="flex h-9 items-center border-b border-border bg-muted/60 hover:bg-muted transition-colors"
    >
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="flex flex-1 items-center gap-2 min-w-0 h-full px-3 cursor-pointer select-none w-full text-left"
      >
        {collapsed
          ? <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        }
        <span className="truncate text-[13px] font-semibold text-foreground">{deptName}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{employeesCountLabel}</span>
      </button>
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
}: EmployeeRowProps) {
  return (
    <div
      role="row"
      className="flex border-b border-border group"
      style={{ height: rowHeight }}
      data-employee-id={employee.id}
    >
      {/* Sticky name column */}
      <div
        className="sticky left-0 z-10 flex shrink-0 flex-col justify-center border-r border-border bg-background px-3"
        style={{ width: NAME_COL_WIDTH, minWidth: NAME_COL_WIDTH }}
      >
        <span className="truncate text-[13px] font-medium leading-tight text-foreground">
          {employee.full_name}
        </span>
        {employee.position && (
          <span className="truncate text-[11px] leading-tight text-muted-foreground">
            {employee.position}
          </span>
        )}
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
