'use client'

import { useEffect, useCallback, useState } from 'react'
import { X, Phone, Send, Mail, Copy, Check, Pencil } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { EmployeeRow, DepartmentRow, ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import type { MonthDay } from '@/lib/schedule/month'
import { daysUntilBirthday, yearsOfService } from '@/lib/schedule/month'
import { Avatar } from '../grid-visual'
import { statusStyle, statusLabel } from '../status-style'

interface EmployeeOverlayProps {
  employee: EmployeeRow
  departments: DepartmentRow[]
  today: string
  days: MonthDay[]
  entriesForEmployee: Map<string, ScheduleEntryRow> | undefined
  statusById: Map<string, StatusTypeRow>
  /** If provided, show Edit button */
  canEdit: boolean
  onEdit: (employee: EmployeeRow) => void
  onClose: () => void
}

export function EmployeeOverlay({
  employee,
  departments,
  today,
  days,
  entriesForEmployee,
  statusById,
  canEdit,
  onEdit,
  onClose,
}: EmployeeOverlayProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const dept = departments.find((d) => d.id === employee.dept_id)
  const isTrainee = employee.employment_kind === 'trainee'
  const birthday = employee.birth_date ? daysUntilBirthday(employee.birth_date, today) : null
  const service = yearsOfService(employee.hired_on, today)

  const birthdayLabel = birthday === null
    ? null
    : birthday === 0
      ? t('birthdayToday')
      : t('birthdayIn', { n: birthday })

  const serviceLabel = service !== null ? t('serviceYears', { n: service }) : null

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const copy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      // silent fail
    }
  }, [])

  const contacts: Array<{ field: string; value: string | null; Icon: typeof Phone; label: string }> = [
    { field: 'phone', value: employee.phone, Icon: Phone, label: t('fieldPhone') },
    { field: 'telegram', value: employee.telegram, Icon: Send, label: t('fieldTelegram') },
    { field: 'email', value: employee.email, Icon: Mail, label: t('fieldEmail') },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={employee.full_name}
        className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[100vw] flex-col border-l border-border bg-card shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <span className="text-sm font-semibold text-foreground truncate pr-4">{employee.full_name}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('overlayClose')}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile */}
        <div className="px-4 pt-4 pb-3 border-b border-border/60 shrink-0">
          {/* Avatar + name */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar name={employee.full_name} src={employee.avatar_url} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[15px] text-foreground">{employee.full_name}</span>
                {isTrainee && (
                  <span className="rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400 text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap">
                    {t('kindTrainee')}
                  </span>
                )}
              </div>
              {employee.position && (
                <p className="text-[12px] text-muted-foreground mt-0.5">{employee.position}</p>
              )}
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            {dept && (
              <span className="rounded-md border border-border bg-muted/60 text-[11px] text-muted-foreground px-1.5 py-0.5 font-medium whitespace-nowrap">
                {dept.name}
              </span>
            )}
            {birthdayLabel && (
              <span className="rounded-md border border-border/50 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-700 dark:text-amber-400 px-1.5 py-0.5 font-medium whitespace-nowrap">
                {birthdayLabel}
              </span>
            )}
            {serviceLabel && (
              <span className="rounded-md border border-border/50 bg-muted/40 text-[11px] text-muted-foreground px-1.5 py-0.5 whitespace-nowrap">
                {serviceLabel}
              </span>
            )}
          </div>
        </div>

        {/* Contacts */}
        {contacts.some((c) => c.value) && (
          <div className="flex flex-col gap-2 px-4 py-3 border-b border-border/60 shrink-0">
            {contacts.map(({ field, value, Icon, label }) =>
              value ? (
                <div key={field} className="flex items-center gap-2 group/contact">
                  <Icon size={13} className="shrink-0 text-muted-foreground" />
                  <span className="flex-1 min-w-0 text-[12px] text-foreground truncate" title={value}>
                    {value}
                  </span>
                  <button
                    type="button"
                    aria-label={copiedField === field ? t('copied') : `${t('copyAction')} ${label}`}
                    onClick={() => copy(value, field)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover/contact:opacity-100 focus-visible:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                  >
                    {copiedField === field
                      ? <Check size={12} className="text-green-600" />
                      : <Copy size={12} />}
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Mini calendar — horizontal strip */}
        <div className="flex-1 px-4 py-3 min-h-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {t('overlayMiniCalTitle')}
          </p>
          <div className="flex gap-1 flex-wrap">
            {days.map((day) => {
              const entry = entriesForEmployee?.get(day.dateISO)
              const status = entry ? statusById.get(entry.status_id) : undefined
              const isToday = day.dateISO === today
              const style = status ? statusStyle(status, day.isWeekend) : null

              return (
                <div
                  key={day.dateISO}
                  className="flex flex-col items-center rounded"
                  style={{ width: 26 }}
                  title={status ? statusLabel(status, locale) : day.dateISO}
                >
                  <span
                    className={[
                      'text-[9px] leading-tight font-medium',
                      isToday ? 'text-primary' : 'text-muted-foreground/60',
                    ].join(' ')}
                  >
                    {day.day}
                  </span>
                  <div
                    className="mt-0.5 rounded"
                    style={{
                      width: 22,
                      height: 16,
                      background: style
                        ? style.bg
                        : day.isWeekend
                          ? 'var(--grid-weekend, color-mix(in oklab, var(--muted) 60%, transparent))'
                          : 'var(--grid-cell, var(--muted))',
                      border: isToday ? '1px solid var(--primary)' : '1px solid var(--border)',
                      opacity: 0.9,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer — Edit button */}
        {canEdit && (
          <div className="border-t border-border px-4 py-3 shrink-0">
            <button
              type="button"
              onClick={() => { onClose(); onEdit(employee) }}
              className="flex items-center gap-1.5 w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Pencil size={14} />
              {t('editEmployee')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
