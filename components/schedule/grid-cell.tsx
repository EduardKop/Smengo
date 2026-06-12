'use client'

import { useTranslations } from 'next-intl'
import type { ScheduleEntryRow, StatusTypeRow, GridMode } from '@/lib/schedule/types'
import { statusStyle, statusLabel } from './status-style'
import { shiftDurationHours } from '@/lib/schedule/month'

// ── Props ───────────────────────────────────────────────────────────

export interface GridCellProps {
  entry: ScheduleEntryRow | undefined
  /** resolved by parent from statusTypes map */
  status: StatusTypeRow | undefined
  mode: GridMode
  isWeekend: boolean
  isToday: boolean
  cellW: number
  locale: string
  onClick?: () => void
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Format time as HH:MM; pass raw 'HH:MM:SS' or 'HH:MM' string */
function fmtTime(t: string): string {
  return t.slice(0, 5) // 'HH:MM'
}

/** True if end < start — shift crosses midnight */
function isNightShift(start: string, end: string): boolean {
  const [sh = 0, sm = 0] = start.split(':').map(Number)
  const [eh = 0, em = 0] = end.split(':').map(Number)
  return eh * 60 + em < sh * 60 + sm
}

// ── Component ───────────────────────────────────────────────────────

export function GridCell({
  entry,
  status,
  mode,
  isWeekend,
  isToday: _isToday, // background handled by parent; kept for aria-label
  cellW,
  locale,
  onClick,
}: GridCellProps) {
  const t = useTranslations('app.schedule')

  // ── Empty cell ─────────────────────────────────────────────────
  if (!entry || !status) {
    const label = entry ? `entry-no-status` : 'empty'
    return (
      <div
        role="gridcell"
        aria-label={label}
        onClick={onClick}
        style={{ width: cellW, flex: 'none', height: '100%' }}
        className={[
          'flex items-center justify-center',
          onClick ? 'cursor-pointer' : '',
          'hover:bg-muted/30 transition-colors',
        ].join(' ')}
      >
        {onClick && (
          <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity select-none">
            +
          </span>
        )}
      </div>
    )
  }

  const style = statusStyle(status, isWeekend)
  const label = statusLabel(status, locale)
  const ariaLabel = `${entry.entry_date}: ${label}`
  const startTime = entry.start_time ?? status.start_time
  const endTime = entry.end_time ?? status.end_time

  // ── Compact mode ──────────────────────────────────────────────
  if (mode === 'compact') {
    const letter = label.charAt(0).toUpperCase()
    return (
      <div
        role="gridcell"
        aria-label={ariaLabel}
        onClick={onClick}
        style={{ width: cellW, flex: 'none', height: '100%' }}
        className={[
          'flex items-center justify-center',
          onClick ? 'cursor-pointer' : '',
          'hover:bg-muted/10 transition-colors',
        ].join(' ')}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'calc(100% - 4px)',
            boxSizing: 'border-box',
            background: style.bg,
            color: style.fg,
            borderRadius: 4,
            fontSize: 10.5,
            fontWeight: 600,
            padding: '3px 2px',
            lineHeight: 1.15,
            minHeight: 28,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {letter}
        </div>
      </div>
    )
  }

  // ── Detail mode ───────────────────────────────────────────────
  if (mode === 'detail') {
    return (
      <div
        role="gridcell"
        aria-label={ariaLabel}
        onClick={onClick}
        style={{ width: cellW, flex: 'none', height: '100%' }}
        className={[
          'flex items-center justify-center px-[2px]',
          onClick ? 'cursor-pointer' : '',
          'hover:bg-muted/10 transition-colors',
        ].join(' ')}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            width: 'calc(100% - 4px)',
            boxSizing: 'border-box',
            background: style.bg,
            color: style.fg,
            borderRadius: 6,
            padding: '4px 3px',
            minHeight: 36,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {startTime && endTime ? (
            <>
              <span style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.02, fontVariantNumeric: 'tabular-nums' }}>
                {fmtTime(startTime)}–{fmtTime(endTime)}
              </span>
              <span style={{ fontSize: 8.2, fontWeight: 600, lineHeight: 1, opacity: 0.78, letterSpacing: '0.02em' }}>
                {label}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.1 }}>
              {label}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ── Extended mode ─────────────────────────────────────────────
  // extended: time + duration chip + optional night badge
  const hasTime = !!(startTime && endTime)
  const durationH = hasTime ? shiftDurationHours(startTime!, endTime!) : null
  const nightShift = hasTime ? isNightShift(startTime!, endTime!) : false

  return (
    <div
      role="gridcell"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ width: cellW, flex: 'none', height: '100%' }}
      className={[
        'flex items-center justify-center px-[2px]',
        onClick ? 'cursor-pointer' : '',
        'hover:bg-muted/10 transition-colors',
      ].join(' ')}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          width: 'calc(100% - 4px)',
          boxSizing: 'border-box',
          background: style.bg,
          color: style.fg,
          padding: '5px 6px 6px',
          borderRadius: 8,
          minHeight: 46,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Top row: duration chip (right-aligned) */}
        {durationH !== null && (
          <span
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            <span
              style={{
                padding: '2.5px 6px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                fontSize: 8,
                fontWeight: 750,
                lineHeight: 1,
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {durationH}{t('hourSuffix')}
            </span>
          </span>
        )}

        {/* Time window or label */}
        {hasTime ? (
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.02,
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>{fmtTime(startTime!)}</span>
            <span>{fmtTime(endTime!)}</span>
          </span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.05 }}>
            {label}
          </span>
        )}

        {/* Label below time */}
        {hasTime && (
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1, opacity: 0.78, letterSpacing: '0.02em' }}>
            {label}
          </span>
        )}

        {/* Night badge */}
        {nightShift && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1.5px 5px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.18)',
              fontSize: 7.5,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}
          >
            {t('nightBadge')}
          </span>
        )}
      </div>
    </div>
  )
}
