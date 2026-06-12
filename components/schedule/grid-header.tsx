'use client'

import { useTranslations } from 'next-intl'
import type { MonthDay } from '@/lib/schedule/month'

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

interface GridHeaderProps {
  days: MonthDay[]
  today: string
  /** Width in px for the sticky employee name column */
  nameColWidth: number
}

export function GridHeader({ days, today, nameColWidth }: GridHeaderProps) {
  const t = useTranslations('app.schedule.days')

  return (
    <div
      className="sticky top-0 z-20 flex border-b border-border bg-background"
      role="row"
      aria-label="Days header"
    >
      {/* Sticky name column placeholder */}
      <div
        className="sticky left-0 z-10 shrink-0 border-r border-border bg-background"
        style={{ width: nameColWidth }}
      />

      {/* Day columns */}
      {days.map((d) => {
        const isToday = d.dateISO === today
        const weekdayKey = WEEKDAY_KEYS[d.weekday]

        return (
          <div
            key={d.dateISO}
            role="columnheader"
            aria-label={d.dateISO}
            className="flex min-w-[40px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
            style={{
              background: d.isWeekend ? 'var(--grid-weekend)' : 'var(--background)',
            }}
          >
            {/* Day number — ring marker for today */}
            <span
              className={
                isToday
                  ? 'flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-primary text-[12px] font-semibold leading-none text-primary'
                  : 'flex h-6 w-6 items-center justify-center text-[12px] font-semibold leading-none text-foreground'
              }
            >
              {d.day}
            </span>

            {/* Short weekday name */}
            <span
              className="text-[9px] font-medium uppercase tracking-wide leading-none"
              style={{
                color: d.isWeekend ? 'var(--accent)' : 'var(--muted-foreground)',
              }}
            >
              {t(weekdayKey)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
