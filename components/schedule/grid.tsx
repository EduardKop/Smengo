'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations, useLocale } from 'next-intl'
import { Search, X, Pencil } from 'lucide-react'
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
import type { GridViewSettings } from '@/lib/validation/grid-view'
import { monthDays } from '@/lib/schedule/month'
import { buildScheduleMap, coverageByDay, aggregateMinPresent, shortageByDay } from '@/lib/schedule/map'
import { nameColumnWidth, deptColor, AppleHScrollbar } from './grid-visual'
import { can } from '@/lib/permissions'
import { useScheduleData, useUpsertEntry, useClearEntry } from './use-schedule'
import type { UpsertInput } from './use-schedule'
import { scheduleKey } from './use-schedule'
import { useQueryClient } from '@tanstack/react-query'
import { GridHeader, TOTALS_OFF_W, TOTALS_HRS_W } from './grid-header'
import { GroupRow, EmployeeGridRow, AddEmployeeRow } from './grid-row'
import type { GridRowLabels, CellRect } from './grid-row'
import { OnShiftRow } from './on-shift-row'
import { DisplaySettingsButton, type DisplayToggle } from './display-settings'
import { useGridView, type GridViewToggles } from './use-grid-view'
import { useSiteTone } from './card-visual-chip'
import { AlertsForm } from './settings/alerts-form'
import { StatusManager } from './settings/status-manager'
import { VisualEditor } from './settings/visual-editor'
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
import { EmployeeOverlay } from './employees-tab/employee-overlay'

// ── Row height by mode (сняты с живого демо: compact 43.5, detail 56.6, ext 79.8) ──

const ROW_HEIGHT: Record<GridMode, number> = {
  compact: 44,
  detail: 57,
  extended: 80,
}

// ── Cell width by mode (демо: compact dayMinW 44, detail colW 56, extended colW 86) ──

export const CELL_WIDTH: Record<GridMode, number> = {
  compact: 44,
  detail: 56,
  extended: 86,
}

const GROUP_ROW_HEIGHT = 28

// ── Constants ───────────────────────────────────────────────────────

const NO_DEPT_KEY = '__no_dept__'
/** Sentinel value used in URL ?dept= param to mean "no department" group */
const NO_DEPT_FILTER = 'null'

/**
 * Пустой набор проблемных дней — стабильная ссылка для режима просмотра.
 * Вне «Правки» строки и «НА СМЕНЕ» не тонируются и не рисуют dashed-чипы;
 * красными остаются только число дня в шапке и счётчик «НА СМЕНЕ».
 */
const NO_PROBLEM_DAYS: ReadonlySet<string> = new Set()

// ── Display settings ────────────────────────────────────────────────
// Шесть тумблеров «Отображения» живут в сохраняемом «Виде» организации
// (use-grid-view.ts, таблица grid_view_settings). strongWeekend остаётся
// личной настройкой в localStorage — его нет в схеме вида.

const DISPLAY_SETTINGS_KEY = 'smengo:app:gridDisplay'

// ── Virtual row types ───────────────────────────────────────────────

type VirtualRow =
  | { kind: 'group'; deptId: string | null; deptName: string; count: number }
  | { kind: 'employee'; employeeId: string }
  /** Ghost-плашка «+ Добавить сотрудника» под заголовком пустого отдела */
  | { kind: 'addEmployee'; deptId: string }

/** Высота ghost-плашки пустого отдела (во всех режимах одинаковая) */
const ADD_EMPLOYEE_ROW_HEIGHT = 42

// ── Props ───────────────────────────────────────────────────────────

export interface ScheduleGridProps {
  orgId: string
  role: UserRole
  isReadOnly: boolean
  year: number
  month: number
  /** YYYY-MM-DD in organization timezone */
  today: string
  initialData: MonthData
  /** Сохранённый «Вид» грида организации (grid_view_settings, может быть пустым) */
  initialView: GridViewSettings
}

// ── Main component ──────────────────────────────────────────────────

export function ScheduleGrid({ orgId, role, isReadOnly, year, month, today, initialData, initialView }: ScheduleGridProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()

  // Лейблы чипов/строк — собираются один раз, без useTranslations на ячейку
  const rowLabels = useMemo((): GridRowLabels => ({
    shiftMorning: t('shiftMorning'),
    shiftEvening: t('shiftEvening'),
    shiftNight: t('shiftNight'),
    unassigned: t('statusUncovered'),
    vacShort: t('statusVacShort'),
    sickShort: t('statusSickShort'),
    offShort: t('statusOffShort'),
    lateShort: t('statusLateShort'),
    hourSuffix: t('hourSuffix'),
    telegramLabel: t('telegramBtn'),
    colOffDays: t('colOffDays'),
    colWorkHrs: t('colWorkHrs'),
  }), [t])

  // ── URL state (dept, q, mode) ───────────────────────────────────
  const searchParams = useSearchParams()

  const deptFilter = searchParams.get('dept') ?? null   // dept id or null = all
  const qFilter = (searchParams.get('q') ?? '').toLowerCase()
  const mode: GridMode = (['compact', 'detail', 'extended'].includes(searchParams.get('mode') ?? '')
    ? (searchParams.get('mode') as GridMode)
    : 'detail')
  // NOTE: устаревший параметр ?tab= (вкладка «Сотрудники») игнорируется —
  // раздел сотрудников живёт на /employees.

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

  // ── Display: личный strongWeekend (localStorage) + edit mode ─────
  const [strongWeekend, setStrongWeekendState] = useState(false)
  const [showTelegram, setShowTelegram] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISPLAY_SETTINGS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, unknown>
      // Старый формат хранил все тумблеры — берём только strongWeekend
      if (typeof parsed.strongWeekend === 'boolean') setStrongWeekendState(parsed.strongWeekend)
    } catch { /* ignore */ }
  }, [])

  const setStrongWeekend = useCallback((value: boolean) => {
    setStrongWeekendState(value)
    try {
      localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify({ strongWeekend: value }))
    } catch { /* ignore */ }
  }, [])

  const weekendBg = strongWeekend ? 'var(--accent-soft)' : 'var(--grid-weekend)'

  // Тема сайта (класс dark на <html>) — для рендера cardVisuals
  const tone = useSiteTone()

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
        'unauthorized', 'no_org', 'org_not_found', 'status_in_use',
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

  // ── Сохраняемый «Вид» грида (тумблеры + визуалы карточек) ────────
  const canCustomize = !isReadOnly && can(role, 'customize_view')

  const handleViewSaveError = useCallback(
    (code: string) => pushToast(resolveErrorMessage(code)),
    [pushToast, resolveErrorMessage],
  )

  const { view, setToggle, setCardVisual } = useGridView(initialView, canCustomize, handleViewSaveError)

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
    (employeeId: string, dateISO: string, cellRect: CellRect) => {
      if (!canEdit) return
      const container = scrollContainerRef.current
      if (!container) return

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
  // Employee overlay (click on name in grid → sheet)
  const [overlayEmployee, setOverlayEmployee] = useState<EmployeeRow | null>(null)

  const handleModalError = useCallback(
    (code: string) => {
      pushToast(resolveErrorMessage(code))
    },
    [pushToast, resolveErrorMessage],
  )

  // ── Computed widths ──────────────────────────────────────────────

  const cellW = CELL_WIDTH[mode]
  // Колонка сотрудника: число (compact) или CSS clamp-строка (detail/ext),
  // как в демо — резолвится чистым CSS без замера window.innerWidth.
  const nameColW = nameColumnWidth(mode, {
    showEmployeeRole: view.showEmployeeRole,
    showEmployeeDepartment: view.showEmployeeDepartment,
    showEmployeeDot: view.showEmployeeDot,
    showTelegram,
  })
  const totalsW = mode === 'compact' ? 0 : TOTALS_OFF_W + TOTALS_HRS_W
  // Полная ширина контента: px-число или calc() поверх clamp-строки.
  // Одно и то же выражение во всех трёх слоях → пиксельное выравнивание.
  const dayRegionW = days.length * cellW + totalsW
  const totalWidth: number | string = typeof nameColW === 'number'
    ? nameColW + dayRegionW
    : `calc(${nameColW} + ${dayRegionW}px)`

  // ── Проблемные колонки: дефицит покрытия ниже порога alert_configs ──

  const problemDays = useMemo((): ReadonlySet<string> => {
    const scopeDept = deptFilter !== NO_DEPT_FILTER ? deptFilter : null
    const coverage = coverageByDay(data.entries, data.employees, data.statusTypes, scopeDept)
    const minPresent = aggregateMinPresent(data.alertConfigs, scopeDept)
    const shortage = shortageByDay(coverage, minPresent, days.map((d) => d.dateISO))
    const out = new Set<string>()
    for (const [dateISO, deficit] of shortage) {
      if (deficit > 0) out.add(dateISO)
    }
    return out
  }, [data.entries, data.employees, data.statusTypes, data.alertConfigs, deptFilter, days])

  // Полные демо-визуалы проблемных колонок (тонировка + dashed-чипы) — только в «Правке»
  const problemDaysVisual = editMode ? problemDays : NO_PROBLEM_DAYS

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

  // Порог min_present по отделу (для подписи «· мин {n}/день» в строке группы)
  const minByDept = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of data.alertConfigs) {
      if (c.min_present > 0) m.set(c.department_id, c.min_present)
    }
    return m
  }, [data.alertConfigs])

  // Filter employees by search query + dept filter.
  // The groups useMemo below buckets filteredEmployees by dept without
  // re-applying the dept filter (it is already applied here).
  const filteredEmployees = useMemo(() => {
    let list = data.employees
    if (qFilter) {
      list = list.filter((e) => e.full_name.toLowerCase().includes(qFilter))
    }
    if (deptFilter === NO_DEPT_FILTER) {
      list = list.filter((e) => e.dept_id === null)
    } else if (deptFilter) {
      list = list.filter((e) => e.dept_id === deptFilter)
    }
    return list
  }, [data.employees, qFilter, deptFilter])

  // Group employees: by dept_id (departments in sort order), null dept last
  interface DeptGroup {
    deptId: string | null
    deptName: string
    employees: typeof filteredEmployees
  }

  // Group employees: filteredEmployees is already filtered by q and dept,
  // so we just bucket them by dept_id here without re-applying dept filter.
  const groups = useMemo((): DeptGroup[] => {
    const byDept = new Map<string | null, typeof filteredEmployees>()
    for (const e of filteredEmployees) {
      const key = e.dept_id ?? null
      const existing = byDept.get(key)
      if (existing) existing.push(e)
      else byDept.set(key, [e])
    }

    const result: DeptGroup[] = []

    // Named departments (in sort order). Пустой отдел тоже попадает в грид
    // (группа + плашка «Добавить сотрудника»), кроме случаев: активен поиск
    // (ищем сотрудников — пустые группы только шумят) или dept-фильтр
    // указывает на другой отдел / «без отдела».
    for (const deptId of sortedDeptIds) {
      const employees = byDept.get(deptId)
      if (!employees || employees.length === 0) {
        if (qFilter) continue
        if (deptFilter && deptFilter !== deptId) continue
        result.push({ deptId, deptName: deptMap.get(deptId) ?? deptId, employees: [] })
        continue
      }
      result.push({ deptId, deptName: deptMap.get(deptId) ?? deptId, employees })
    }

    // "No department" group — only when employees exist without dept_id
    const noDeptEmployees = byDept.get(null)
    if (noDeptEmployees && noDeptEmployees.length > 0) {
      result.push({ deptId: null, deptName: t('deptNoDept'), employees: noDeptEmployees })
    }

    return result
  }, [filteredEmployees, sortedDeptIds, deptMap, t, qFilter, deptFilter])

  // ── «НА СМЕНЕ»: охват и счётчики по дням ─────────────────────────
  const [onShiftScope, setOnShiftScope] = useState('all')

  const onShiftEmployees = useMemo(() => {
    if (onShiftScope === 'all') return filteredEmployees
    if (onShiftScope === NO_DEPT_KEY) return filteredEmployees.filter((e) => e.dept_id === null)
    return filteredEmployees.filter((e) => e.dept_id === onShiftScope)
  }, [filteredEmployees, onShiftScope])

  const onShiftCounts = useMemo(
    () => coverageByDay(data.entries, onShiftEmployees, data.statusTypes, null),
    [data.entries, onShiftEmployees, data.statusTypes],
  )

  const onShiftScopeOptions = useMemo(
    () => groups
      .filter((g) => g.employees.length > 0)
      .map((g) => ({ key: g.deptId ?? NO_DEPT_KEY, name: g.deptName })),
    [groups],
  )

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
        // Пустой отдел: ghost-плашка «+ Добавить сотрудника» (только с правом crud)
        if (group.employees.length === 0 && group.deptId && canCrudEmployees) {
          rows.push({ kind: 'addEmployee', deptId: group.deptId })
        }
      }
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, collapsedDepts, canCrudEmployees])

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
      if (row?.kind === 'group') return GROUP_ROW_HEIGHT
      if (row?.kind === 'addEmployee') return ADD_EMPLOYEE_ROW_HEIGHT
      return rowHeight
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

  // ── Тумблеры поповера «Отображение» (порядок и disabled — как в демо) ──
  // strongWeekend — личный (localStorage); остальные — общий «Вид» организации:
  // без права customize_view они задизейблены, сервер всё равно fail-closed.
  const displayToggles: DisplayToggle[] = [
    { key: 'strongWeekend', label: t('highlightWeekendsLabel'), value: strongWeekend },
    { key: 'showTimes', label: t('showTimesLabel'), value: view.showTimes, disabled: !canCustomize },
    { key: 'merged', label: t('mergedLabel'), value: view.merged, disabled: !canCustomize },
    { key: 'showGrid', label: t('gridLabel'), value: view.showGrid, disabled: !canCustomize },
    { key: 'showEmployeeDepartment', label: t('showEmployeeDepartmentLabel'), value: view.showEmployeeDepartment, disabled: !canCustomize || mode === 'compact' },
    { key: 'showEmployeeRole', label: t('showEmployeeRoleLabel'), value: view.showEmployeeRole, disabled: !canCustomize || mode === 'compact' },
    { key: 'showEmployeeDot', label: t('showEmployeeDotLabel'), value: view.showEmployeeDot, disabled: !canCustomize },
  ]

  const handleDisplayToggle = useCallback((key: string, value: boolean) => {
    if (key === 'strongWeekend') {
      setStrongWeekend(value)
      return
    }
    setToggle(key as keyof GridViewToggles, value)
  }, [setStrongWeekend, setToggle])

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">

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

          {/* Карточка грида: топбар + скролл-контейнер («окно» демо от тулбара вниз) */}
          <div
            style={{
              background: 'var(--grid-cell)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
          {/* App topbar (демо 3041–3165) */}
          <div
            data-grid-topbar
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              background: 'var(--grid-cell)', flexWrap: 'wrap',
            }}
          >
            {/* Month switcher */}
            <MonthNav year={year} month={month} />

            {/* Dept dropdown */}
            <DeptFilter
              departments={data.departments}
              employees={data.employees}
              value={deptFilter}
              onChange={handleDeptChange}
            />

            {/* Mode segmented */}
            <ModeSwitcher value={mode} onChange={handleModeChange} />

            <div style={{ flex: 1 }} />

            {/* Search */}
            <div className="relative flex items-center max-sm:hidden">
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
                className="smengo-tool"
                style={{ minWidth: 150, cursor: 'text', justifyContent: 'flex-start', paddingLeft: 30, paddingRight: 26 }}
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

            {/* Add department (аналог «+ Секция» демо) */}
            {canManageDepts && (
              <button
                type="button"
                onClick={() => setDeptModal({ mode: 'create' })}
                className="smengo-tool max-sm:hidden"
              >
                {t('addDepartment')}
              </button>
            )}

            {/* Edit toggle */}
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="smengo-tool"
                data-active={editMode}
              >
                <Pencil style={{ width: 11, height: 11 }} />
                {editMode ? t('editDone') : t('editBtn')}
              </button>
            )}

            {/* Export — реализация экспорта в этапе 1.5, пока тост */}
            <button
              type="button"
              onClick={() => pushToast(t('toastExported'))}
              className="smengo-tool"
            >
              {t('exportBtn')}
            </button>

            {/* Пороги покрытия (⚙) / статусы / визуал (палитра) / отображение */}
            <AlertsForm
              orgId={orgId}
              year={year}
              month={month}
              role={role}
              departments={data.departments}
              alertConfigs={data.alertConfigs}
            />
            <StatusManager
              orgId={orgId}
              year={year}
              month={month}
              role={role}
              statusTypes={data.statusTypes}
            />
            <VisualEditor
              role={role}
              statusTypes={data.statusTypes}
              cardVisuals={view.cardVisuals}
              tone={tone}
              onChange={setCardVisual}
            />
            <DisplaySettingsButton
              toggles={displayToggles}
              onToggle={handleDisplayToggle}
            />

            {/* Add employee */}
            {canCrudEmployees && (
              <button
                type="button"
                onClick={() => setEmployeeModal({ mode: 'create' })}
                className="smengo-tool smengo-tool--primary"
              >
                {t('addEmployee')}
              </button>
            )}
          </div>

          {/* macOS-style оверлей-скроллбар над гридом (demo AppleHScrollbar) */}
          <AppleHScrollbar
            scrollerRef={scrollContainerRef}
            style={{ marginLeft: nameColW, marginRight: 6 }}
          />

          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className="overflow-auto"
            style={{ height: 'max(calc(100vh - 270px), 400px)' }}
          >
            {/* Sticky header — same totalWidth as spacer guarantees alignment */}
            <GridHeader
              days={days}
              today={today}
              mode={mode}
              nameColWidth={nameColW}
              cellW={cellW}
              totalWidth={totalWidth}
              weekendBg={weekendBg}
              problemDays={problemDays}
              problemTint={editMode}
              showTelegram={showTelegram}
              onToggleProjects={() => setShowTelegram((v) => !v)}
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
                {/* width+minWidth: спейсер тянется до clientWidth скроллера,
                    как шапка/«НА СМЕНЕ» (minWidth 100%) — иначе на широких
                    экранах строки компактного режима не растягивались бы. */}
                <div style={{ height: totalHeight, width: totalWidth, minWidth: '100%', position: 'relative' }}>
                  {items.map((virtualItem) => {
                    const row = virtualRows[virtualItem.index]
                    if (!row) return null

                    if (row.kind === 'group') {
                      const collapsed = isDeptCollapsed(row.deptId)
                      const dept = row.deptId ? deptById.get(row.deptId) : undefined
                      const min = row.deptId ? minByDept.get(row.deptId) : undefined
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
                            accent={deptColor(row.deptId)}
                            minLabel={min ? t('minDay', { n: min }) : undefined}
                            collapsed={collapsed}
                            onToggle={() => toggleDept(row.deptId)}
                            nameColWidth={nameColW}
                            mode={mode}
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

                    if (row.kind === 'addEmployee') {
                      return (
                        <div
                          key={`add-emp-${row.deptId}`}
                          style={{
                            position: 'absolute',
                            top: virtualItem.start,
                            left: 0,
                            right: 0,
                            height: virtualItem.size,
                          }}
                        >
                          <AddEmployeeRow
                            label={t('emptyDeptAddEmployee')}
                            nameColWidth={nameColW}
                            onClick={() => setEmployeeModal({ mode: 'create', deptId: row.deptId })}
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
                          deptName={emp.dept_id ? (deptMap.get(emp.dept_id) ?? t('deptNoDept')) : t('deptNoDept')}
                          deptAccent={deptColor(emp.dept_id)}
                          days={days}
                          rowHeight={virtualItem.size}
                          nameColWidth={nameColW}
                          cellW={cellW}
                          mode={mode}
                          locale={locale}
                          labels={rowLabels}
                          weekendBg={weekendBg}
                          problemDays={problemDaysVisual}
                          showGrid={view.showGrid}
                          showTimes={view.showTimes}
                          merged={view.merged}
                          showTelegram={showTelegram}
                          showEmployeeDepartment={view.showEmployeeDepartment}
                          showEmployeeRole={view.showEmployeeRole}
                          showEmployeeDot={view.showEmployeeDot}
                          cardVisuals={view.cardVisuals}
                          tone={tone}
                          statusById={statusById}
                          entriesForEmployee={scheduleMap.get(emp.id)}
                          onCellClick={canEdit && editMode ? handleCellClick : undefined}
                          onEmployeeClick={
                            // All roles can see overlay (read-only content); edit button inside is guarded
                            (e) => setOverlayEmployee(e)
                          }
                          draggable={canCrudEmployees && !qFilter && editMode}
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

            {/* «НА СМЕНЕ» — нижняя строка как tfoot демо */}
            {virtualRows.length > 0 && (
              <OnShiftRow
                days={days}
                mode={mode}
                nameColWidth={nameColW}
                cellW={cellW}
                totalWidth={totalWidth}
                weekendBg={weekendBg}
                problemDays={problemDaysVisual}
                showGrid={view.showGrid}
                counts={onShiftCounts}
                total={onShiftEmployees.length}
                scope={onShiftScope}
                onScopeChange={setOnShiftScope}
                scopeOptions={onShiftScopeOptions}
              />
            )}
          </div>
          {/* конец карточки грида */}
          </div>

          {/* Legend — status chips below grid */}
          <Legend statusTypes={data.statusTypes} />
        </>
      )}
      {/* end isFullyEmpty ternary */}

      {/* Cell editor popover */}
      {editorAnchor && (
        <CellEditor
          anchor={editorAnchor}
          entry={editorEntry}
          statusTypes={data.statusTypes}
          workStatus={workStatus}
          employeeName={empById.get(editorAnchor.employeeId)?.full_name ?? ''}
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

      {/* Employee overlay sheet (click on name in grid → sheet) */}
      {overlayEmployee && (
        <EmployeeOverlay
          employee={overlayEmployee}
          departments={data.departments}
          today={today}
          days={days}
          entriesForEmployee={scheduleMap.get(overlayEmployee.id)}
          statusById={statusById}
          canEdit={canCrudEmployees}
          onEdit={(emp) => { setOverlayEmployee(null); setEmployeeModal({ mode: 'edit', employee: emp }) }}
          onClose={() => setOverlayEmployee(null)}
        />
      )}

      {/* Toast notifications */}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
