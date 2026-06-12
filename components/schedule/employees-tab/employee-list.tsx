'use client'

import { useState, useCallback } from 'react'
import { Phone, Send, Mail, Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { EmployeeRow, DepartmentRow } from '@/lib/schedule/types'
import { daysUntilBirthday, yearsOfService } from '@/lib/schedule/month'

interface EmployeeListProps {
  employees: EmployeeRow[]
  departments: DepartmentRow[]
  today: string
  onEdit?: (employee: EmployeeRow) => void
}

export function EmployeeList({ employees, departments, today, onEdit }: EmployeeListProps) {
  const t = useTranslations('app.schedule')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const deptMap = new Map(departments.map((d) => [d.id, d.name]))

  const copy = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      // silent fail
    }
  }, [])

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fieldFullName')}
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fieldDept')}
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fieldContacts')}
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fieldBirthDate')}
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('fieldHiredOn')}
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const birthday = emp.birth_date ? daysUntilBirthday(emp.birth_date, today) : null
            const service = yearsOfService(emp.hired_on, today)
            const isTrainee = emp.employment_kind === 'trainee'

            const birthdayLabel = birthday === null
              ? null
              : birthday === 0
                ? t('birthdayToday')
                : t('birthdayIn', { n: birthday })

            const serviceLabel = service !== null ? t('serviceYears', { n: service }) : null

            const contacts: Array<{ field: string; value: string | null; Icon: typeof Phone; label: string }> = [
              { field: `${emp.id}-phone`, value: emp.phone, Icon: Phone, label: t('fieldPhone') },
              { field: `${emp.id}-telegram`, value: emp.telegram, Icon: Send, label: t('fieldTelegram') },
              { field: `${emp.id}-email`, value: emp.email, Icon: Mail, label: t('fieldEmail') },
            ]

            return (
              <tr
                key={emp.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                onClick={onEdit ? () => onEdit(emp) : undefined}
                style={{ cursor: onEdit ? 'pointer' : 'default' }}
              >
                {/* Name + position */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground leading-tight">{emp.full_name}</span>
                    {isTrainee && (
                      <span className="rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400 text-[10px] font-semibold px-1.5 py-0.5 leading-tight whitespace-nowrap">
                        {t('kindTrainee')}
                      </span>
                    )}
                  </div>
                  {emp.position && (
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{emp.position}</p>
                  )}
                </td>

                {/* Department */}
                <td className="px-3 py-2.5 text-[12px] text-muted-foreground whitespace-nowrap">
                  {emp.dept_id ? (deptMap.get(emp.dept_id) ?? '—') : '—'}
                </td>

                {/* Contacts */}
                <td
                  className="px-3 py-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    {contacts.map(({ field, value, Icon, label }) =>
                      value ? (
                        <button
                          key={field}
                          type="button"
                          title={value}
                          aria-label={copiedKey === field ? t('copied') : `${t('copyAction')} ${label}`}
                          onClick={() => copy(value, field)}
                          className="group/btn flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:border-border hover:text-foreground focus-visible:opacity-100 transition-colors"
                        >
                          {copiedKey === field
                            ? <Check size={11} className="text-green-600" />
                            : <Icon size={11} />}
                        </button>
                      ) : null
                    )}
                  </div>
                </td>

                {/* Birthday */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {birthdayLabel ? (
                    <span className="text-[12px] text-amber-700 dark:text-amber-400">{birthdayLabel}</span>
                  ) : emp.birth_date ? (
                    <span className="text-[12px] text-muted-foreground">{emp.birth_date}</span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground/40">—</span>
                  )}
                </td>

                {/* Service */}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {serviceLabel ? (
                    <span className="text-[12px] text-muted-foreground">{serviceLabel}</span>
                  ) : emp.hired_on ? (
                    <span className="text-[12px] text-muted-foreground">{emp.hired_on}</span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground/40">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {employees.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          {t('emptyTitle')}
        </div>
      )}
    </div>
  )
}
