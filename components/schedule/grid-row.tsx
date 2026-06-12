'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { MonthDay } from '@/lib/schedule/month'
import type { EmployeeRow } from '@/lib/schedule/types'

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
      className="flex h-9 items-center border-b border-border bg-muted/60 px-3 hover:bg-muted transition-colors cursor-pointer select-none"
      onClick={onToggle}
      aria-expanded={!collapsed}
    >
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {collapsed
          ? <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        }
        <span className="truncate text-[13px] font-semibold text-foreground">{deptName}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{employeesCountLabel}</span>
      </div>
    </div>
  )
}

// ── Employee row ────────────────────────────────────────────────────

interface EmployeeRowProps {
  employee: EmployeeRow
  days: MonthDay[]
  today: string
  rowHeight: number
}

export function EmployeeGridRow({ employee, days, today, rowHeight }: EmployeeRowProps) {
  return (
    <div
      role="row"
      className="flex border-b border-border"
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

      {/* Day cells */}
      {days.map((d) => {
        const isToday = d.dateISO === today
        return (
          <div
            key={d.dateISO}
            role="gridcell"
            data-cell={`${employee.id}-${d.dateISO}`}
            className="min-w-[40px] flex-1 border-r border-border/50 last:border-r-0 transition-colors"
            style={{
              background: isToday
                ? 'color-mix(in oklab, var(--primary) 6%, var(--grid-cell))'
                : d.isWeekend
                  ? 'var(--grid-weekend)'
                  : 'var(--grid-cell)',
            }}
          />
        )
      })}
    </div>
  )
}

