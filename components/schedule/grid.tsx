'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations } from 'next-intl'

import type { UserRole } from '@/supabase/types'
import type { MonthData, GridMode } from '@/lib/schedule/types'
import { monthDays } from '@/lib/schedule/month'
import { buildScheduleMap } from '@/lib/schedule/map'
import { useScheduleData } from './use-schedule'
import { GridHeader } from './grid-header'
import { GroupRow, EmployeeGridRow, NAME_COL_WIDTH } from './grid-row'

// ── Row height by mode ──────────────────────────────────────────────

const ROW_HEIGHT: Record<GridMode, number> = {
  compact: 36,
  detail: 52,
  extended: 84,
}

const GROUP_ROW_HEIGHT = 36

// ── Virtual row types ───────────────────────────────────────────────

type VirtualRow =
  | { kind: 'group'; deptId: string | null; deptName: string; count: number }
  | { kind: 'employee'; employeeId: string }

// ── Props (signature is frozen — do NOT change) ─────────────────────

export interface ScheduleGridProps {
  orgId: string
  role: UserRole
  isReadOnly: boolean
  year: number
  month: number
  /** YYYY-MM-DD in organization timezone */
  today: string
  initialData: MonthData
}

// ── Main component ──────────────────────────────────────────────────

export function ScheduleGrid({ orgId, role, isReadOnly, year, month, today, initialData }: ScheduleGridProps) {
  const t = useTranslations('app.schedule')

  // ── URL state (dept, q, mode) ───────────────────────────────────
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const deptFilter = searchParams.get('dept') ?? null   // dept id or null = all
  const qFilter = (searchParams.get('q') ?? '').toLowerCase()
  const mode: GridMode = (['compact', 'detail', 'extended'].includes(searchParams.get('mode') ?? '')
    ? (searchParams.get('mode') as GridMode)
    : 'detail')

  const setParam = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value === null) next.delete(key)
    else next.set(key, value)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  // Expose setParam for toolbar (Task 15) via data attributes; kept minimal.
  void setParam // will be used by toolbar in T15

  // ── Data ────────────────────────────────────────────────────────
  const { data } = useScheduleData(orgId, year, month, initialData)

  const days = useMemo(() => monthDays(year, month), [year, month])

  // Build schedule map for future cell rendering (Task 12)
  const scheduleMap = useMemo(() => buildScheduleMap(data.entries), [data.entries])
  void scheduleMap // Task 12 will consume this

  // ── Grouping ─────────────────────────────────────────────────────

  // Map dept id → dept name, sorted by sort_order then name
  const deptMap = useMemo(() => {
    const m = new Map<string, string>()
    const sorted = [...data.departments].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    for (const d of sorted) m.set(d.id, d.name)
    return m
  }, [data.departments])

  // Sorted dept ids list (preserving sort_order)
  const sortedDeptIds = useMemo(() => {
    const sorted = [...data.departments].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    return sorted.map((d) => d.id)
  }, [data.departments])

  // Filter employees by search query and dept filter
  const filteredEmployees = useMemo(() => {
    let list = data.employees
    if (qFilter) {
      list = list.filter((e) => e.full_name.toLowerCase().includes(qFilter))
    }
    return list
  }, [data.employees, qFilter])

  // Group employees: by dept_id (departments in sort order), null dept last
  interface DeptGroup {
    deptId: string | null
    deptName: string
    employees: typeof filteredEmployees
  }

  const groups = useMemo((): DeptGroup[] => {
    const byDept = new Map<string | null, typeof filteredEmployees>()
    for (const e of filteredEmployees) {
      const key = e.dept_id ?? null
      const existing = byDept.get(key)
      if (existing) existing.push(e)
      else byDept.set(key, [e])
    }

    const result: DeptGroup[] = []

    // Named departments (in sort order)
    for (const deptId of sortedDeptIds) {
      const employees = byDept.get(deptId)
      if (!employees || employees.length === 0) continue
      // Apply dept filter: only show selected dept
      if (deptFilter && deptFilter !== deptId) continue
      result.push({ deptId, deptName: deptMap.get(deptId) ?? deptId, employees })
    }

    // "No department" group — only when employees exist without dept_id
    const noDeptEmployees = byDept.get(null)
    if (noDeptEmployees && noDeptEmployees.length > 0 && (!deptFilter || deptFilter === 'null')) {
      if (!deptFilter) {
        result.push({ deptId: null, deptName: t('deptNoDept'), employees: noDeptEmployees })
      }
    }

    return result
  }, [filteredEmployees, sortedDeptIds, deptMap, deptFilter, t])

  // ── Collapsible groups ───────────────────────────────────────────
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string | null>>(new Set())

  const toggleDept = useCallback((deptId: string | null) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev)
      const key = deptId ?? 'null'
      if (next.has(key as string | null)) next.delete(key as string | null)
      else next.add(key as string | null)
      return next
    })
  }, [])

  const isDeptCollapsed = (deptId: string | null): boolean =>
    collapsedDepts.has(deptId ?? 'null' as unknown as null)

  // ── Flat virtual row list ─────────────────────────────────────────
  const virtualRows = useMemo((): VirtualRow[] => {
    const rows: VirtualRow[] = []
    for (const group of groups) {
      rows.push({ kind: 'group', deptId: group.deptId, deptName: group.deptName, count: group.employees.length })
      if (!isDeptCollapsed(group.deptId)) {
        for (const emp of group.employees) {
          rows.push({ kind: 'employee', employeeId: emp.id })
        }
      }
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, collapsedDepts])

  // Employee lookup map for O(1) access in render
  const empById = useMemo(() => {
    const m = new Map<string, (typeof data.employees)[number]>()
    for (const e of data.employees) m.set(e.id, e)
    return m
  }, [data.employees])

  // ── Virtualizer ──────────────────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const rowHeight = ROW_HEIGHT[mode]

  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (i) => {
      const row = virtualRows[i]
      return row?.kind === 'group' ? GROUP_ROW_HEIGHT : rowHeight
    },
    overscan: 10,
  })

  const totalHeight = virtualizer.getTotalSize()
  const items = virtualizer.getVirtualItems()

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Toolbar placeholder — Task 15 will populate */}
      <div className="mb-3 flex items-center gap-2" data-slot="toolbar" />

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto rounded-lg border border-border"
        style={{ height: 'max(calc(100vh - 220px), 400px)' }}
      >
        {/* Sticky header */}
        <GridHeader days={days} today={today} nameColWidth={NAME_COL_WIDTH} />

        {/* Virtual rows container */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {items.map((virtualItem) => {
            const row = virtualRows[virtualItem.index]
            if (!row) return null

            if (row.kind === 'group') {
              const collapsed = isDeptCollapsed(row.deptId)
              return (
                <div
                  key={`group-${row.deptId ?? 'null'}`}
                  style={{
                    position: 'absolute',
                    top: virtualItem.start,
                    left: 0,
                    right: 0,
                    height: virtualItem.size,
                  }}
                >
                  <GroupRow
                    deptName={row.deptName}
                    count={row.count}
                    collapsed={collapsed}
                    onToggle={() => toggleDept(row.deptId)}
                    employeesCountLabel={t('employeesCount', { count: row.count })}
                  />
                </div>
              )
            }

            const emp = empById.get(row.employeeId)
            if (!emp) return null

            return (
              <div
                key={`emp-${row.employeeId}`}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  left: 0,
                  right: 0,
                  height: virtualItem.size,
                }}
              >
                <EmployeeGridRow
                  employee={emp}
                  days={days}
                  today={today}
                  rowHeight={virtualItem.size}
                />
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {virtualRows.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {qFilter
              ? `"${searchParams.get('q')}" — ${t('emptyTitle')}`
              : t('emptyTitle')}
          </div>
        )}
      </div>
    </div>
  )
}
