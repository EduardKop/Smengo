'use client'

import { useState, useCallback } from 'react'
import { Phone, Send, Mail, Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { EmployeeRow, DepartmentRow } from '@/lib/schedule/types'
import { daysUntilBirthday, yearsOfService } from '@/lib/schedule/month'
import { Avatar } from '../grid-visual'

interface EmployeeCardProps {
  employee: EmployeeRow
  departments: DepartmentRow[]
  today: string
  /** If provided, card click and edit button are enabled */
  onEdit?: (employee: EmployeeRow) => void
}

export function EmployeeCard({ employee, departments, today, onEdit }: EmployeeCardProps) {
  const t = useTranslations('app.schedule')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const dept = departments.find((d) => d.id === employee.dept_id)
  const isTrainee = employee.employment_kind === 'trainee'

  const birthday = employee.birth_date ? daysUntilBirthday(employee.birth_date, today) : null
  const service = yearsOfService(employee.hired_on, today)

  const copy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      // clipboard unavailable — silent fail
    }
  }, [])

  const birthdayLabel = birthday === null
    ? null
    : birthday === 0
      ? t('birthdayToday')
      : t('birthdayIn', { n: birthday })

  const serviceLabel = service !== null
    ? t('serviceYears', { n: service })
    : null

  const contacts: Array<{ field: string; value: string | null; Icon: typeof Phone; label: string }> = [
    { field: 'phone', value: employee.phone, Icon: Phone, label: t('fieldPhone') },
    { field: 'telegram', value: employee.telegram, Icon: Send, label: t('fieldTelegram') },
    { field: 'email', value: employee.email, Icon: Mail, label: t('fieldEmail') },
  ]

  return (
    <article
      className="flex flex-col rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      onClick={onEdit ? () => onEdit(employee) : undefined}
      style={{ cursor: onEdit ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Avatar: фото или инициалы на градиенте */}
        <Avatar name={employee.full_name} src={employee.avatar_url} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[14px] text-foreground leading-tight truncate">
              {employee.full_name}
            </span>
            {isTrainee && (
              <span className="shrink-0 rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400 text-[10px] font-semibold px-2 py-0.5 leading-tight whitespace-nowrap">
                {t('kindTrainee')}
              </span>
            )}
          </div>

          {employee.position && (
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5 truncate">
              {employee.position}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {dept && (
              <span className="rounded-md border border-border bg-muted/60 text-[11px] text-muted-foreground px-1.5 py-0.5 font-medium leading-tight whitespace-nowrap">
                {dept.name}
              </span>
            )}
            {birthdayLabel && (
              <span className="rounded-md border border-border/50 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-700 dark:text-amber-400 px-1.5 py-0.5 font-medium leading-tight whitespace-nowrap">
                {birthdayLabel}
              </span>
            )}
            {serviceLabel && (
              <span className="rounded-md border border-border/50 bg-muted/40 text-[11px] text-muted-foreground px-1.5 py-0.5 leading-tight whitespace-nowrap">
                {serviceLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contacts */}
      {contacts.some((c) => c.value) && (
        <div
          className="flex flex-col gap-1 px-4 py-3 border-t border-border/60"
          onClick={(e) => e.stopPropagation()}
        >
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
    </article>
  )
}
