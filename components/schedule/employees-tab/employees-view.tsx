'use client'

/**
 * Страница /employees: справочник сотрудников в демо-стиле
 * (карточки/список + оверлей с мини-календарём), перенесён из бывшей
 * вкладки «Сотрудники» грида. Тулбар — пилюли smengo-tool как в топбаре грида.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'

import type { UserRole } from '@/supabase/types'
import type { MonthData, EmployeeRow, StatusTypeRow } from '@/lib/schedule/types'
import { monthDays } from '@/lib/schedule/month'
import { buildScheduleMap } from '@/lib/schedule/map'
import { can } from '@/lib/permissions'
import { useScheduleData } from '../use-schedule'
import { DeptFilter } from '../dept-filter'
import { EmployeesTab, type EmployeeView } from './index'
import { EmployeeOverlay } from './employee-overlay'
import { EmployeeModal } from '../employee-modal'
import type { EmployeeModalState } from '../employee-modal'
import { ToastViewport, useToasts } from '../toast'

/** Sentinel value used in URL ?dept= param to mean "no department" group */
const NO_DEPT_FILTER = 'null'

export interface EmployeesViewProps {
  orgId: string
  role: UserRole
  isReadOnly: boolean
  /** Текущий месяц (для мини-календаря оверлея) */
  year: number
  month: number
  /** YYYY-MM-DD in organization timezone */
  today: string
  initialData: MonthData
}

export function EmployeesView({ orgId, role, isReadOnly, year, month, today, initialData }: EmployeesViewProps) {
  const t = useTranslations('app.schedule')

  // ── URL state (dept, q, view) — shallow, как в гриде ─────────────
  const searchParams = useSearchParams()
  const deptFilter = searchParams.get('dept') ?? null
  const qFilter = (searchParams.get('q') ?? '').toLowerCase()
  const view: EmployeeView = searchParams.get('view') === 'list' ? 'list' : 'cards'

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  // Sync search input when navigating back/forward (URL changes externally)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- синхронизация с внешним состоянием (URL) при back/forward, как в grid.tsx
    setSearchInput(searchParams.get('q') ?? '')
  }, [searchParams])

  /** Shallow URL update — no RSC refetch; useSearchParams picks it up */
  const setShallowParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value === null) params.delete(key)
    else params.set(key, value)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [])

  // Debounce search input → URL (shallow)
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = searchInput.trim()
      setShallowParam('q', trimmed === '' ? null : trimmed)
    }, 200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // ── Data (общий кэш месяца с гридом) ─────────────────────────────
  const { data } = useScheduleData(orgId, year, month, initialData)

  const days = useMemo(() => monthDays(year, month), [year, month])
  const scheduleMap = useMemo(() => buildScheduleMap(data.entries), [data.entries])
  const statusById = useMemo(() => {
    const m = new Map<string, StatusTypeRow>()
    for (const s of data.statusTypes) m.set(s.id, s)
    return m
  }, [data.statusTypes])

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

  // ── Permissions / toasts / modal & overlay state ─────────────────
  const canCrudEmployees = !isReadOnly && can(role, 'crud_employees')

  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts()

  const resolveErrorMessage = useCallback(
    (errorCode: string): string => {
      const knownCodes = [
        'server_error', 'forbidden', 'invalid_reference', 'duplicate',
        'status_wrong_org', 'ids_outside_scope', 'status_not_found',
        'invalid_value', 'empty_list',
        'plan_limit_employees', 'invalid_id',
        'unauthorized', 'no_org', 'org_not_found', 'status_in_use',
        'avatar_invalid_type', 'avatar_too_large', 'avatar_upload_failed',
      ] as const
      type KnownCode = typeof knownCodes[number]
      const isKnown = (knownCodes as readonly string[]).includes(errorCode)
      return isKnown
        ? t(`errors.${errorCode as KnownCode}`)
        : t('errors.server_error')
    },
    [t],
  )

  const [employeeModal, setEmployeeModal] = useState<EmployeeModalState | null>(null)
  const [overlayEmployee, setOverlayEmployee] = useState<EmployeeRow | null>(null)

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Toolbar — пилюли smengo-tool, как в бывшей вкладке */}
      <div className="mb-3 flex flex-wrap items-center gap-2" data-slot="toolbar">
        <DeptFilter
          departments={data.departments}
          employees={data.employees}
          value={deptFilter}
          onChange={(value) => setShallowParam('dept', value)}
        />
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
            className="smengo-tool"
            style={{ minWidth: 160, cursor: 'text', justifyContent: 'flex-start', paddingLeft: 30, paddingRight: 26 }}
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
        <div style={{ flex: 1 }} />
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

      {/* Cards / list (переключатель видов — внутри EmployeesTab) */}
      <EmployeesTab
        employees={filteredEmployees}
        departments={data.departments}
        today={today}
        view={view}
        onViewChange={(v) => setShallowParam('view', v === 'cards' ? null : v)}
        // Клик по карточке/строке открывает оверлей (read-only для viewer);
        // кнопка «Редактировать» внутри оверлея гейтится canCrudEmployees.
        onEdit={(emp) => setOverlayEmployee(emp)}
      />

      {/* Employee overlay sheet с мини-календарём текущего месяца */}
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

      {/* Employee modal (create / edit) */}
      {employeeModal && (
        <EmployeeModal
          state={employeeModal}
          orgId={orgId}
          departments={data.departments}
          currentCount={data.employees.length}
          onClose={() => setEmployeeModal(null)}
          onError={(code) => pushToast(resolveErrorMessage(code))}
        />
      )}

      {/* Toast notifications */}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
