'use client'

import { useCallback, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@/supabase/types'
import type { AlertConfigRow, DepartmentRow } from '@/lib/schedule/types'
import { can } from '@/lib/permissions'
import { upsertAlertConfigAction, deleteAlertConfigAction } from '@/lib/actions/alerts'
import { scheduleKey } from '../use-schedule'

interface AlertsFormProps {
  orgId: string
  year: number
  month: number
  role: UserRole
  departments: DepartmentRow[]
  alertConfigs: AlertConfigRow[]
}

export function AlertsForm({ orgId, year, month, role, departments, alertConfigs }: AlertsFormProps) {
  const t = useTranslations('app.schedule')
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)
  const [open, setOpen] = useState(false)
  /**
   * Куда раскрывать панель: при переносе тулбара кнопка может оказаться слева,
   * и right-0-панель срезается overflow:hidden карточки грида.
   */
  const [alignLeft, setAlignLeft] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)


  const getMinPresent = (deptId: string): number =>
    alertConfigs.find((c) => c.department_id === deptId)?.min_present ?? 0

  const handleBlur = useCallback(
    async (deptId: string, raw: string) => {
      const val = parseInt(raw, 10)
      const current = getMinPresent(deptId)
      // NaN or same as current → no-op
      if (isNaN(val) || val === current) return

      if (val <= 0) {
        await deleteAlertConfigAction(deptId)
      } else {
        await upsertAlertConfigAction({ department_id: deptId, min_present: val })
      }
      await qc.invalidateQueries({ queryKey: key })
    },
    // getMinPresent замыкает alertConfigs, который в deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alertConfigs, key, qc],
  )

  if (!can(role, 'manage_alerts')) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('alertsSettingsLabel')}
        aria-expanded={open}
        onClick={(e) => {
          // Не хватает места слева от кнопки (панель 288px) — раскрываем вправо
          const btnRect = e.currentTarget.getBoundingClientRect()
          const card = e.currentTarget.closest('[data-grid-topbar]')?.parentElement
          const boundary = card ? card.getBoundingClientRect().left : 0
          setAlignLeft(btnRect.right - 288 < boundary + 8)
          setOpen((v) => !v)
        }}
        className="smengo-tool smengo-tool--icon"
      >
        <Settings size={15} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Panel — демо-язык: .smengo-pop + .smengo-pop-label + инпуты h28/r9 */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('alertsSettingsLabel')}
            className={`smengo-pop absolute top-10 z-40 w-72 p-2.5 ${alignLeft ? 'left-0' : 'right-0'}`}
            style={{ ['--pop-origin' as string]: alignLeft ? 'top left' : 'top right' }}
          >
            <div className="smengo-pop-label">{t('alertsSettingsLabel')}</div>
            <p className="mb-2 px-1" style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--muted-foreground)' }}>
              {t('alertsSettingsHint')}
            </p>

            {departments.length === 0 && (
              <p className="px-1" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                {t('alertsNoDepts')}
              </p>
            )}

            <ul className="flex flex-col gap-1.5">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="flex items-center justify-between gap-3"
                  style={{ padding: '2px 4px', borderRadius: 9 }}
                >
                  <span
                    className="min-w-0 flex-1 truncate"
                    style={{ fontSize: 12, fontWeight: 550, color: 'var(--foreground)' }}
                  >
                    {dept.name}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    defaultValue={getMinPresent(dept.id)}
                    aria-label={`${dept.name} min`}
                    onBlur={(e) => { void handleBlur(dept.id, e.currentTarget.value) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.currentTarget.blur() }
                    }}
                    className="smengo-custom-input"
                    style={{
                      width: 56,
                      height: 28,
                      borderRadius: 9,
                      border: '1px solid var(--pop-border)',
                      background: 'var(--grid-cell)',
                      color: 'var(--foreground)',
                      padding: '0 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      outline: 'none',
                    }}
                  />
                </li>
              ))}
            </ul>

            <div className="smengo-pop-sep" />
            <p className="px-1 pb-0.5" style={{ fontSize: 10, lineHeight: 1.4, color: 'var(--muted-foreground)' }}>
              {t('alertsZeroHint')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
