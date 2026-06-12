'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations, useLocale } from 'next-intl'
import { Search, X } from 'lucide-react'

import type { UserRole } from '@/supabase/types'
import type { MonthData, GridMode, ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import { monthDays } from '@/lib/schedule/month'
import { buildScheduleMap } from '@/lib/schedule/map'
import { can } from '@/lib/permissions'
import { useScheduleData, useUpsertEntry, useClearEntry } from './use-schedule'
import type { UpsertInput } from './use-schedule'
import { GridHeader } from './grid-header'
import { GroupRow, EmployeeGridRow, NAME_COL_WIDTH } from './grid-row'
import { CoverageRow } from './coverage-row'
import { AlertsForm } from './settings/alerts-form'
import { CellEditor } from './cell-editor'
import type { CellEditorAnchor } from './cell-editor'
import { ToastViewport, useToasts } from './toast'
import { MonthNav } from './month-nav'
import { DeptFilter } from './dept-filter'
import { ModeSwitcher } from './mode-switcher'
import { Legend } from './legend'

// ── Row height by mode ──────────────────────────────────────────────

const ROW_HEIGHT: Record<GridMode, number> = {
  compact: 36,
  detail: 52,
  extended: 84,
}

// ── Cell width by mode (deterministic — header and rows must use the same value) ──

export const CELL_WIDTH: Record<GridMode, number> = {
  compact: 36,
  detail: 48,
  extended: 84,
}

const GROUP_ROW_HEIGHT = 36

// ── Constants ───────────────────────────────────────────────────────

const NO_DEPT_KEY = '__no_dept__'
/** Sentinel value used in URL ?dept= param to mean "no department" group */
const NO_DEPT_FILTER = 'null'

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
  const locale = useLocale()
  const hourSuffix = t('hourSuffix')
  const nightBadge = t('nightBadge')

  // ── URL state (dept, q, mode) ───────────────────────────────────
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const deptFilter = searchParams.get('dept') ?? null   // dept id or null = all
  const qFilter = (searchParams.get('q') ?? '').toLowerCase()
  const mode: GridMode = (['compact', 'detail', 'extended'].includes(searchParams.get('mode') ?? '')
    ? (searchParams.get('mode') as GridMode)
    : 'detail')

  // Local search input state — debounced 200ms before pushing to URL
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  // Sync search input when navigating back/forward (URL changes externally)
  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '')
  }, [searchParams])

  /** Shallow URL update — does NOT trigger RSC refetch; useSearchParams picks it up */
  const setShallowParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value === null) params.delete(key)
    else params.set(key, value)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }, [])

  const handleDeptChange = useCallback((value: string | null) => {
    setShallowParam('dept', value)
  }, [setShallowParam])

  const handleModeChange = useCallback((newMode: GridMode) => {
    // mode is shallow — no router.replace, no RSC refetch
    setShallowParam('mode', newMode)
  }, [setShallowParam])

  // Debounce search input → URL (shallow)
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = searchInput.trim()
      setShallowParam('q', trimmed === '' ? null : trimmed)
    }, 200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // ── Data ────────────────────────────────────────────────────────
  const { data } = useScheduleData(orgId, year, month, initialData)

  const days = useMemo(() => monthDays(year, month), [year, month])

  // Build schedule map: employee_id → dateISO → entry
  const scheduleMap = useMemo(() => buildScheduleMap(data.entries), [data.entries])

  // Build status lookup map: status_id → StatusTypeRow
  const statusById = useMemo(() => {
    const m = new Map<string, StatusTypeRow>()
    for (const s of data.statusTypes) m.set(s.id, s)
    return m
  }, [data.statusTypes])

  // ── Toasts ──────────────────────────────────────────────────────
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts()

  // ── Mutations ───────────────────────────────────────────────────

  const resolveErrorMessage = useCallback(
    (errorCode: string): string => {
      const knownCodes = ['server_error', 'forbidden', 'invalid_reference', 'duplicate', 'status_wrong_org', 'ids_outside_scope', 'status_not_found', 'invalid_value', 'empty_list'] as const
      type KnownCode = typeof knownCodes[number]
      const isKnown = (knownCodes as readonly string[]).includes(errorCode)
      return isKnown
        ? t(`errors.${errorCode as KnownCode}`)
        : t('errors.server_error')
    },
    [t],
  )

  const upsertMutation = useUpsertEntry(orgId, year, month)
  const clearMutation = useClearEntry(orgId, year, month)

  // ── Editor state ────────────────────────────────────────────────
  /**
   * Tracks which cell has the editor open.
   * We store anchor data computed from the cell element rect vs scroll container.
   */
  const [editorAnchor, setEditorAnchor] = useState<CellEditorAnchor | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const canEdit = !isReadOnly && can(role, 'edit_schedule')

  const handleCellClick = useCallback(
    (employeeId: string, dateISO: string, cellEl: HTMLElement) => {
      if (!canEdit) return
      const container = scrollContainerRef.current
      if (!container) return

      const cellRect = cellEl.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      // Convert to coordinates relative to the scroll container content area
      const relTop = cellRect.top - containerRect.top + container.scrollTop
      const relLeft = cellRect.left - containerRect.left + container.scrollLeft

      setEditorAnchor({
        employeeId,
        dateISO,
        rect: {
          top: relTop,
          left: relLeft,
          width: cellRect.width,
          height: cellRect.height,
        },
      })
    },
    [canEdit],
  )

  const handleEditorClose = useCallback(() => setEditorAnchor(null), [])

  const handleUpsert = useCallback(
    (input: UpsertInput) => {
      upsertMutation.mutate(input, {
        onError: (err) => {
          pushToast(resolveErrorMessage(err.message))
        },
      })
    },
    [upsertMutation, pushToast, resolveErrorMessage],
  )

  const handleClear = useCallback(() => {
    if (!editorAnchor) return
    clearMutation.mutate(
      { employee_id: editorAnchor.employeeId, entry_date: editorAnchor.dateISO },
      {
        onError: (err) => {
          pushToast(resolveErrorMessage(err.message))
        },
      },
    )
  }, [editorAnchor, clearMutation, pushToast, resolveErrorMessage])

  // ── Computed widths ──────────────────────────────────────────────

  const cellW = CELL_WIDTH[mode]
  const totalWidth = NAME_COL_WIDTH + days.length * cellW

  // ── Grouping ─────────────────────────────────────────────────────

  // Map dept id → dept name AND sorted dept ids in a single pass
  const { deptMap, sortedDeptIds } = useMemo(() => {
    const sorted = [...data.departments].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    const deptMap = new Map<string, string>()
    for (const d of sorted) deptMap.set(d.id, d.name)
    const sortedDeptIds = sorted.map((d) => d.id)
    return { deptMap, sortedDeptIds }
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
    if (noDeptEmployees && noDeptEmployees.length > 0 && (!deptFilter || deptFilter === NO_DEPT_FILTER)) {
      result.push({ deptId: null, deptName: t('deptNoDept'), employees: noDeptEmployees })
    }

    return result
  }, [filteredEmployees, sortedDeptIds, deptMap, deptFilter, t])

  // ── Collapsible groups ───────────────────────────────────────────
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set())

  const toggleDept = useCallback((deptId: string | null) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev)
      const key = deptId ?? NO_DEPT_KEY
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const isDeptCollapsed = (deptId: string | null): boolean =>
    collapsedDepts.has(deptId ?? NO_DEPT_KEY)

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

  // Re-measure when mode changes (row heights change with mode)
  useEffect(() => { virtualizer.measure() }, [mode, virtualizer])

  const totalHeight = virtualizer.getTotalSize()
  const items = virtualizer.getVirtualItems()

  // ── Editor entry/status resolution ─────────────────────────────

  const editorEntry: ScheduleEntryRow | undefined = editorAnchor
    ? scheduleMap.get(editorAnchor.employeeId)?.get(editorAnchor.dateISO)
    : undefined

  // System "work" status: org_id IS NULL and counts_as_present = true, code starts with 'W'
  const workStatus: StatusTypeRow | undefined = useMemo(
    () => data.statusTypes.find((s) => s.org_id === null && s.counts_as_present && s.code.startsWith('W')),
    [data.statusTypes],
  )

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2" data-slot="toolbar">
        {/* Mode switcher — left */}
        <ModeSwitcher value={mode} onChange={handleModeChange} />

        {/* Month nav — centered */}
        <div className="flex flex-1 justify-center">
          <MonthNav year={year} month={month} />
        </div>

        {/* Dept filter */}
        <DeptFilter
          departments={data.departments}
          employees={data.employees}
          value={deptFilter}
          onChange={handleDeptChange}
        />

        {/* Search input */}
        <div className="relative flex items-center">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 text-muted-foreground"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="h-8 rounded-md border border-border bg-background pl-8 pr-7 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            style={{ minWidth: 160 }}
          />
          {searchInput && (
            <button
              type="button"
              aria-label={t('clearSearch')}
              onClick={() => setSearchInput('')}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Alerts / coverage thresholds — rightmost */}
        <AlertsForm
          orgId={orgId}
          year={year}
          month={month}
          role={role}
          departments={data.departments}
          alertConfigs={data.alertConfigs}
        />
      </div>

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto rounded-lg border border-border"
        style={{ height: 'max(calc(100vh - 220px), 400px)' }}
      >
        {/* Sticky header — same totalWidth as spacer guarantees alignment */}
        <GridHeader
          days={days}
          today={today}
          nameColWidth={NAME_COL_WIDTH}
          cellW={cellW}
        />

        {/* Coverage row — sticky below header */}
        <CoverageRow
          days={days}
          entries={data.entries}
          employees={data.employees}
          statusTypes={data.statusTypes}
          alertConfigs={data.alertConfigs}
          deptId={deptFilter !== NO_DEPT_FILTER ? deptFilter : null}
          cellW={cellW}
        />

        {/* Virtual rows spacer — explicit width drives horizontal scroll */}
        <div style={{ height: totalHeight, width: totalWidth, position: 'relative' }}>
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
                  cellW={cellW}
                  mode={mode}
                  locale={locale}
                  hourSuffix={hourSuffix}
                  nightBadge={nightBadge}
                  scheduleMap={scheduleMap}
                  statusById={statusById}
                  entriesForEmployee={scheduleMap.get(emp.id)}
                  onCellClick={canEdit ? handleCellClick : undefined}
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

      {/* Legend — status chips below grid */}
      <Legend statusTypes={data.statusTypes} />

      {/* Cell editor popover */}
      {editorAnchor && (
        <CellEditor
          anchor={editorAnchor}
          entry={editorEntry}
          statusTypes={data.statusTypes}
          workStatus={workStatus}
          onUpsert={handleUpsert}
          onClear={handleClear}
          onClose={handleEditorClose}
          containerRef={scrollContainerRef}
        />
      )}

      {/* Toast notifications */}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
