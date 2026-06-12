'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { MonthDay } from '@/lib/schedule/month'
import type { AlertConfigRow, EmployeeRow, ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import { coverageByDay, shortageByDay, aggregateMinPresent } from '@/lib/schedule/map'
import { NAME_COL_WIDTH } from './grid-row'

interface CoverageRowProps {
  days: MonthDay[]
  entries: ScheduleEntryRow[]
  employees: EmployeeRow[]
  statusTypes: StatusTypeRow[]
  alertConfigs: AlertConfigRow[]
  /** null = all departments */
  deptId: string | null
  cellW: number
}

export function CoverageRow({
  days,
  entries,
  employees,
  statusTypes,
  alertConfigs,
  deptId,
  cellW,
}: CoverageRowProps) {
  const t = useTranslations('app.schedule')

  const allDates = useMemo(() => days.map((d) => d.dateISO), [days])

  const coverage = useMemo(
    () => coverageByDay(entries, employees, statusTypes, deptId),
    [entries, employees, statusTypes, deptId],
  )

  const minPresent = useMemo(
    () => aggregateMinPresent(alertConfigs, deptId),
    [alertConfigs, deptId],
  )

  const shortage = useMemo(
    () => shortageByDay(coverage, minPresent, allDates),
    [coverage, minPresent, allDates],
  )

  // Label: «Покрытие» + threshold annotation when a threshold is set
  const labelText = minPresent > 0
    ? `${t('coverageLabel')} · ${t('minShort', { n: minPresent })}`
    : t('coverageLabel')

  return (
    <div
      role="row"
      aria-label={t('coverageLabel')}
      className="flex border-b border-border bg-background"
      style={{ position: 'sticky', top: 40, zIndex: 15 }}
    >
      {/* Sticky label column */}
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center border-r border-border bg-background px-3"
        style={{ width: NAME_COL_WIDTH }}
      >
        <span className="truncate text-[11px] font-medium text-muted-foreground">
          {labelText}
        </span>
      </div>

      {/* Day cells */}
      {days.map((d) => {
        const present = coverage.get(d.dateISO) ?? 0
        const deficit = shortage.get(d.dateISO) ?? 0
        const hasShortage = deficit > 0

        return (
          <div
            key={d.dateISO}
            role="cell"
            className="relative flex flex-col items-center justify-center py-0.5"
            style={{
              width: cellW,
              flex: 'none',
              height: 28,
              background: hasShortage
                ? 'color-mix(in srgb, var(--destructive) 15%, transparent)'
                : d.isWeekend
                  ? 'var(--grid-weekend)'
                  : 'var(--background)',
            }}
          >
            {/* Present count */}
            <span
              className="text-[11px] font-medium leading-none tabular-nums"
              style={{ color: hasShortage ? 'var(--destructive)' : 'var(--muted-foreground)' }}
            >
              {present}
            </span>

            {/* Shortage badge */}
            {hasShortage && (
              <span
                className="mt-0.5 text-[9px] font-semibold leading-none tabular-nums"
                style={{ color: 'var(--destructive)' }}
                aria-label={t('shortageBadge', { n: deficit })}
              >
                {t('shortageBadge', { n: deficit })}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
