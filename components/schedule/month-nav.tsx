'use client'

/**
 * Месяц-свитчер — пилюля smengo-tool из топбара демо
 * (grid-preview.tsx 3050–3075): ‹ месяц › внутри одной пилюли.
 */

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'

/** ±24 months from today's month */
const MAX_OFFSET = 24

function clampDate(year: number, month: number) {
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1 // 1-based
  const nowTotal = nowYear * 12 + nowMonth
  const targetTotal = year * 12 + month
  const offset = targetTotal - nowTotal
  return Math.abs(offset) <= MAX_OFFSET
}

/** Capitalises the first character of a string */
function ucFirst(s: string) {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
}

interface MonthNavProps {
  year: number
  month: number
}

export function MonthNav({ year, month }: MonthNavProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigate = useCallback(
    (targetYear: number, targetMonth: number) => {
      const next = new URLSearchParams(searchParams.toString())
      const mm = String(targetMonth).padStart(2, '0')
      next.set('m', `${targetYear}-${mm}`)
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  // Compute prev / next months
  let prevYear = year
  let prevMonth = month - 1
  if (prevMonth < 1) { prevMonth = 12; prevYear -= 1 }

  let nextYear = year
  let nextMonth = month + 1
  if (nextMonth > 12) { nextMonth = 1; nextYear += 1 }

  const canGoPrev = clampDate(prevYear, prevMonth)
  const canGoNext = clampDate(nextYear, nextMonth)

  // Format: "Июнь 2026" / "June 2026" / "Червень 2026"
  const label = ucFirst(
    new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
      new Date(year, month - 1, 1),
    ),
  )

  return (
    <div className="smengo-tool" style={{ padding: '0 4px', gap: 2, cursor: 'default' }}>
      <button
        type="button"
        onClick={() => navigate(prevYear, prevMonth)}
        disabled={!canGoPrev}
        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t('prevMonth')}
        style={{ background: 'transparent', border: 0, color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1 }}
      >
        ‹
      </button>
      <span style={{ minWidth: 86, textAlign: 'center', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{label}</span>
      <button
        type="button"
        onClick={() => navigate(nextYear, nextMonth)}
        disabled={!canGoNext}
        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t('nextMonth')}
        style={{ background: 'transparent', border: 0, color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1 }}
      >
        ›
      </button>
    </div>
  )
}
