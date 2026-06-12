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
        onClick={() => setOpen((v) => !v)}
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

          {/* Panel */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('alertsSettingsLabel')}
            className="absolute right-0 top-10 z-40 w-72 rounded-lg border border-border bg-background p-4 shadow-lg"
          >
            <p className="mb-3 text-[12px] font-semibold text-foreground">
              {t('alertsSettingsLabel')}
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground">
              {t('alertsSettingsHint')}
            </p>

            {departments.length === 0 && (
              <p className="text-[11px] text-muted-foreground">{t('alertsNoDepts')}</p>
            )}

            <ul className="space-y-2">
              {departments.map((dept) => (
                <li key={dept.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">
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
                    className="h-7 w-16 rounded border border-border bg-background px-2 text-right text-[12px] tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[10px] text-muted-foreground">
              {t('alertsZeroHint')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
