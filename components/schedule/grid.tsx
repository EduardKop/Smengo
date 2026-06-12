'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations, useLocale } from 'next-intl'
import { Search, X } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { UserRole } from '@/supabase/types'
import type { MonthData, GridMode, ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import { monthDays } from '@/lib/schedule/month'
import { buildScheduleMap } from '@/lib/schedule/map'
import { can } from '@/lib/permissions'
import { useScheduleData, useUpsertEntry, useClearEntry } from './use-schedule'
import type { UpsertInput } from './use-schedule'
import { scheduleKey } from './use-schedule'
import { useQueryClient } from '@tanstack/react-query'
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
import { QuickStart, QuickStartBanner } from './quick-start'
import { DeptModal } from './dept-modal'
import type { DeptModalState } from './dept-modal'
import { EmployeeModal } from './employee-modal'
import type { EmployeeModalState } from './employee-modal'
import type { EmployeeRow } from '@/lib/schedule/types'
import { reorderEmployeesAction } from '@/lib/actions/employees'

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
      const knownCodes = [
        'server_error', 'forbidden', 'invalid_reference', 'duplicate',
        'status_wrong_org', 'ids_outside_scope', 'status_not_found',
        'invalid_value', 'empty_list',
        'plan_limit_employees', 'invalid_id',
      ] as const
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
  const canCrudEmployees = !isReadOnly && can(role, 'crud_employees')
  const canManageDepts = !isReadOnly && can(role, 'manage_departments')

  // ── DnD hooks (must be unconditional) ───────────────────────────
  const qc = useQueryClient()
  const schedKey = scheduleKey(orgId, year, month)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }, [])

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

  // ── Modal state ──────────────────────────────────────────────────

  const [deptModal, setDeptModal] = useState<DeptModalState | null>(null)
  const [employeeModal, setEmployeeModal] = useState<EmployeeModalState | null>(null)

  const handleModalError = useCallback(
    (code: string) => {
      pushToast(resolveErrorMessage(code))
    },
    [pushToast, resolveErrorMessage],
  )

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

  // Full dept lookup map: id → DepartmentRow
  const deptById = useMemo(() => {
    const m = new Map<string, typeof data.departments[number]>()
    for (const d of data.departments) m.set(d.id, d)
    return m
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
    const m = new Map<string, EmployeeRow>()
    for (const e of data.employees) m.set(e.id, e)
    return m
  }, [data.employees])

  // ── DnD handleDragEnd — placed after empById + groups are defined ─
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = active.id as string
      const overId = over.id as string

      // Validate same department
      const activeEmp = empById.get(activeId)
      const overEmp = empById.get(overId)
      if (!activeEmp || !overEmp) return
      if (activeEmp.dept_id !== overEmp.dept_id) return

      const deptId = activeEmp.dept_id ?? null

      // Use the FULL dept list from data.employees (sorted by sort_order from server),
      // not the filtered subset — otherwise reorder indices are wrong when search is active.
      // (drag is disabled when qFilter is set, but this is defensive and correct regardless.)
      const fullDeptList = data.employees.filter((e) => (e.dept_id ?? null) === deptId)
      const oldOrder = fullDeptList.map((e) => e.id)
      const oldIndex = oldOrder.indexOf(activeId)
      const newIndex = oldOrder.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return

      const reorderedDept = arrayMove(fullDeptList, oldIndex, newIndex)
      const ordered_ids = reorderedDept.map((e) => e.id)

      // Optimistic update: splice the reordered dept employees back into prev.employees
      // without touching sort_order values — the array order itself is the source of truth
      // for the virtualizer, and the server will persist the new order.
      const prev = qc.getQueryData<MonthData>(schedKey)
      if (prev) {
        let deptCursor = 0
        const newEmployees = prev.employees.map((e) => {
          if ((e.dept_id ?? null) === deptId) {
            // Replace with next employee from the reordered dept list
            return reorderedDept[deptCursor++]
          }
          return e
        })
        qc.setQueryData<MonthData>(schedKey, { ...prev, employees: newEmployees })
      }

      // Fire server action; on error roll back + toast
      reorderEmployeesAction({ dept_id: deptId, ordered_ids }).then((res) => {
        if (!res.ok) {
          if (prev) qc.setQueryData<MonthData>(schedKey, prev)
          pushToast(resolveErrorMessage(res.error))
        }
      })
    },
    [empById, data.employees, qc, schedKey, pushToast, resolveErrorMessage],
  )

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

  // Системный статус «работает»: код 'work' сидирован в нижнем регистре
  const workStatus: StatusTypeRow | undefined = useMemo(
    () => data.statusTypes.find((s) => s.org_id === null && s.code === 'work'),
    [data.statusTypes],
  )

  // ── Computed empty state flags ────────────────────────────────────
  const isFullyEmpty = data.departments.length === 0 && data.employees.length === 0
  const hasDeptsNoEmployees = data.departments.length > 0 && data.employees.length === 0

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Toolbar — hidden when fully empty (month/filters are meaningless) */}
      {!isFullyEmpty && (
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

        {/* CRUD buttons — rightmost before alerts */}
        {canCrudEmployees && (
          <button
            type="button"
            onClick={() => setEmployeeModal({ mode: 'create' })}
            className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('addEmployee')}
          </button>
        )}
        {canManageDepts && (
          <button
            type="button"
            onClick={() => setDeptModal({ mode: 'create' })}
            className="h-8 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t('addDepartment')}
          </button>
        )}

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
      )}

      {/* Fully empty state — QuickStart replaces the grid entirely */}
      {isFullyEmpty ? (
        <QuickStart
          departmentsCount={data.departments.length}
          employeesCount={data.employees.length}
          onCreateDepartment={canManageDepts ? () => setDeptModal({ mode: 'create' }) : undefined}
          onAddEmployee={canCrudEmployees ? () => setEmployeeModal({ mode: 'create' }) : undefined}
        />
      ) : (
        <>
          {/* Mini-banner: depts exist but no employees yet */}
          {hasDeptsNoEmployees && (
            <QuickStartBanner
              onAddEmployee={canCrudEmployees ? () => setEmployeeModal({ mode: 'create' }) : undefined}
            />
          )}

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
            {/* DndContext wraps the sortable list; SortableContext gets all employee ids */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={data.employees.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ height: totalHeight, width: totalWidth, position: 'relative' }}>
                  {items.map((virtualItem) => {
                    const row = virtualRows[virtualItem.index]
                    if (!row) return null

                    if (row.kind === 'group') {
                      const collapsed = isDeptCollapsed(row.deptId)
                      const dept = row.deptId ? deptById.get(row.deptId) : undefined
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
                            onAddEmployee={canCrudEmployees
                              ? () => setEmployeeModal({ mode: 'create', deptId: row.deptId })
                              : undefined}
                            onRenameDept={canManageDepts && dept
                              ? () => setDeptModal({ mode: 'rename', dept })
                              : undefined}
                            onDeleteDept={canManageDepts && dept
                              ? () => setDeptModal({ mode: 'delete', dept })
                              : undefined}
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
                          onEmployeeClick={canCrudEmployees
                            ? (e) => setEmployeeModal({ mode: 'edit', employee: e })
                            : undefined}
                          draggable={canCrudEmployees && !qFilter}
                        />
                      </div>
                    )
                  })}
                </div>
              </SortableContext>

              {/* DragOverlay — simple name pill while dragging */}
              <DragOverlay dropAnimation={null}>
                {activeDragId ? (() => {
                  const emp = empById.get(activeDragId)
                  if (!emp) return null
                  return (
                    <div className="bg-card border border-border rounded px-3 py-1 shadow-md text-[13px] font-medium text-foreground select-none">
                      {emp.full_name}
                    </div>
                  )
                })() : null}
              </DragOverlay>
            </DndContext>

            {/* Filter empty state (search/dept returned nothing) */}
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
        </>
      )}

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

      {/* Dept modal */}
      {deptModal && (
        <DeptModal
          state={deptModal}
          orgId={orgId}
          onClose={() => setDeptModal(null)}
          onError={handleModalError}
        />
      )}

      {/* Employee modal */}
      {employeeModal && (
        <EmployeeModal
          state={employeeModal}
          orgId={orgId}
          departments={data.departments}
          currentCount={data.employees.length}
          onClose={() => setEmployeeModal(null)}
          onError={handleModalError}
        />
      )}

      {/* Toast notifications */}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
