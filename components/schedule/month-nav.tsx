'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={t('prevMonth')}
        disabled={!canGoPrev}
        onClick={() => navigate(prevYear, prevMonth)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="min-w-[130px] text-center text-sm font-medium tabular-nums">
        {label}
      </span>

      <button
        type="button"
        aria-label={t('nextMonth')}
        disabled={!canGoNext}
        onClick={() => navigate(nextYear, nextMonth)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
