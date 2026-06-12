'use client'

import { useTranslations } from 'next-intl'
import type { MonthDay } from '@/lib/schedule/month'
import type { GridMode } from '@/lib/schedule/types'

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** Высота шапки по режиму — снята с демо (54 detail/extended, 44 compact). */
export const HEADER_HEIGHTS: Record<GridMode, number> = {
  compact: 44,
  detail: 54,
  extended: 54,
}

/** Ширины колонок-итогов «Вых.»/«Час.» (демо: 40 и 48). */
export const TOTALS_OFF_W = 40
export const TOTALS_HRS_W = 48

interface GridHeaderProps {
  days: MonthDay[]
  today: string
  mode: GridMode
  /** Width in px for the sticky employee name column */
  nameColWidth: number
  /** Deterministic cell width in px (from CELL_WIDTH[mode]) */
  cellW: number
  /**
   * Полная ширина контента грида в px (nameColW + days×cellW + итоги).
   * Все три слоя (шапка, строки, «НА СМЕНЕ») задают её явно — intrinsic
   * max-content зависел бы от контента ячеек (1px бордеры «Сетки» раздували
   * строки тела) и ломал выравнивание колонок между слоями.
   */
  totalWidth: number
  /** Фон выходных колонок (зависит от настройки «Выделять выходные») */
  weekendBg: string
  /** Даты (dateISO) с дефицитом покрытия — «проблемные» колонки */
  problemDays: ReadonlySet<string>
  /**
   * Полные демо-визуалы проблемной колонки (тонировка фона + inset-тень).
   * false (режим просмотра) — остаётся только красное число дня.
   */
  problemTint: boolean
  /** Тумблер «Проекты/Телеграм» в шапке колонки сотрудника */
  showTelegram: boolean
  onToggleProjects: () => void
}

export function GridHeader({
  days,
  today,
  mode,
  nameColWidth,
  cellW,
  totalWidth,
  weekendBg,
  problemDays,
  problemTint,
  showTelegram,
  onToggleProjects,
}: GridHeaderProps) {
  const t = useTranslations('app.schedule')
  const td = useTranslations('app.schedule.days')

  const isCompact = mode === 'compact'
  const showTotals = !isCompact
  const headerHeight = HEADER_HEIGHTS[mode]

  return (
    <div
      className="sticky top-0 z-30 flex"
      role="row"
      aria-label="Days header"
      style={{
        height: headerHeight,
        borderBottom: '1px solid var(--border)',
        background: 'var(--grid-cell)',
        // Явная px-ширина (не max-content): геометрия колонок не должна
        // зависеть от intrinsic-ширины контента ячеек ни в одном слое.
        width: totalWidth,
        minWidth: '100%',
      }}
    >
      {/* Sticky name column header */}
      <div
        className="sticky left-0 z-10 flex shrink-0 flex-col justify-center"
        style={{
          width: nameColWidth,
          minWidth: nameColWidth,
          maxWidth: nameColWidth,
          boxSizing: 'border-box',
          background: 'var(--grid-cell)',
          padding: '6px 12px 6px 10px',
          overflow: 'hidden',
          borderRight: '1px solid var(--border)',
          textAlign: 'left',
          fontWeight: 500,
          color: 'var(--muted-foreground)',
          fontSize: isCompact ? 9.5 : 10,
          ...(isCompact ? { textTransform: 'uppercase' as const, letterSpacing: '0.05em' } : {}),
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('employeeCol')}
          </span>
          <button
            type="button"
            onClick={onToggleProjects}
            className="hidden cursor-pointer transition-colors sm:inline-block"
            style={{
              background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
              color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
              border: 0, borderRadius: 5, padding: isCompact ? '2px 8px' : '2px 9px',
              fontSize: isCompact ? 9 : 9.5, fontWeight: 600,
              textTransform: 'none', letterSpacing: 0,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {showTelegram ? t('telegramBtn') : t('projectsBtn')}
          </button>
        </div>
      </div>

      {/* Day columns */}
      {days.map((d, ci) => {
        const isToday = d.dateISO === today
        const weekdayKey = WEEKDAY_KEYS[d.weekday]
        const isWkd = d.isWeekend
        const isProblemCol = problemDays.has(d.dateISO)
        const isProblemColTinted = problemTint && isProblemCol
        const isWeekBoundary = ci > 0 && (d.weekday === 0 || d.weekday === 5)

        return (
          <div
            key={d.dateISO}
            role="columnheader"
            aria-label={d.dateISO}
            aria-current={isToday ? 'date' : undefined}
            style={{
              width: cellW,
              minWidth: cellW,
              flex: isCompact ? `1 0 ${cellW}px` : 'none',
              height: '100%',
              padding: isCompact ? '5px 0' : '8px 4px',
              textAlign: 'center',
              background: isProblemColTinted
                ? 'var(--grid-problem-col)'
                : isWkd ? weekendBg : 'var(--grid-cell)',
              color: 'var(--foreground)',
              position: 'relative',
              overflow: 'hidden',
              borderLeft: isWeekBoundary ? '1px solid var(--border)' : 'none',
              borderRight: d.weekday === 6 ? '1px solid var(--border)' : 'none',
              boxSizing: 'border-box',
              boxShadow: isProblemColTinted ? 'inset 0 -2px 0 color-mix(in oklab, var(--st-alert) 55%, transparent)' : 'none',
              transition: 'background 360ms ease, box-shadow 360ms ease',
            }}
          >
            <div style={{ display: 'flex', minHeight: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: isToday ? (isCompact ? 22 : 27) : 'auto',
                  height: isToday ? (isCompact ? 23 : 28) : 'auto',
                  padding: isToday ? (isCompact ? '0 4px' : '0 5px') : 0,
                  borderRadius: isToday ? (isCompact ? 7 : 8) : 0,
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? '#fff' : isProblemCol ? 'var(--st-alert)' : (isWkd ? 'var(--muted-foreground)' : 'var(--foreground)'),
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif',
                  fontWeight: isCompact ? 600 : 650,
                  fontSize: isCompact ? 10.5 : 13,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {d.day}
              </span>
              <span
                style={{
                  color: 'var(--muted-foreground)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif',
                  fontSize: isCompact ? 7.2 : 8.5,
                  fontWeight: isCompact ? 500 : 520,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                {td(weekdayKey)}
              </span>
            </div>
          </div>
        )
      })}

      {/* Totals columns — detail/extended only */}
      {showTotals && (
        <>
          <div
            role="columnheader"
            style={{
              width: TOTALS_OFF_W, minWidth: TOTALS_OFF_W, flex: 'none',
              padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)',
              color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600,
              borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {t('colOffDays')}
          </div>
          <div
            role="columnheader"
            style={{
              width: TOTALS_HRS_W, minWidth: TOTALS_HRS_W, flex: 'none',
              padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)',
              color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600,
              borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {t('colWorkHrs')}
          </div>
        </>
      )}
    </div>
  )
}
