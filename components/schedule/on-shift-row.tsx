'use client'

/**
 * Строка «НА СМЕНЕ» внизу грида — копия tfoot демо-грида
 * (grid-preview.tsx 6445–6495, compact 7056–7102): uppercase 800,
 * пикер охвата по отделам, цветные счётчики OnShiftCountCell.
 */

import { useTranslations } from 'next-intl'
import type { MonthDay } from '@/lib/schedule/month'
import type { GridMode } from '@/lib/schedule/types'
import { OnShiftCountCell, OnShiftScopePicker, type OnShiftScopeOption } from './grid-visual'
import { TOTALS_OFF_W, TOTALS_HRS_W } from './grid-header'

interface OnShiftRowProps {
  days: MonthDay[]
  mode: GridMode
  nameColWidth: number
  cellW: number
  weekendBg: string
  problemDays: ReadonlySet<string>
  showGrid: boolean
  /** dateISO → сколько сотрудников на смене (counts_as_present) */
  counts: ReadonlyMap<string, number>
  /** Размер выборки (сотрудники в текущем охвате) */
  total: number
  scope: string
  onScopeChange: (value: string) => void
  scopeOptions: OnShiftScopeOption[]
}

export function OnShiftRow({
  days,
  mode,
  nameColWidth,
  cellW,
  weekendBg,
  problemDays,
  showGrid,
  counts,
  total,
  scope,
  onScopeChange,
  scopeOptions,
}: OnShiftRowProps) {
  const t = useTranslations('app.schedule')

  const isExt = mode === 'extended'
  const isCompact = mode === 'compact'

  return (
    <div
      role="row"
      aria-label={t('onShiftRowLabel')}
      className="sticky bottom-0 z-20 flex"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--grid-cell)',
        width: 'max-content',
        minWidth: '100%',
      }}
    >
      {/* Sticky label cell */}
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center"
        style={{
          padding: isCompact ? '4px 12px 4px 10px' : isExt ? '6px 10px' : '8px 12px',
          width: nameColWidth,
          minWidth: nameColWidth,
          maxWidth: nameColWidth,
          boxSizing: 'border-box',
          background: 'var(--grid-cell)',
          color: 'var(--muted-foreground)',
          borderRight: '1px solid var(--border)',
          fontSize: isCompact ? 9 : isExt ? 10 : 11.5,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('onShiftRowLabel')}</span>
          <OnShiftScopePicker
            allLabel={t('scopeAll')}
            options={scopeOptions}
            value={scope}
            onChange={onScopeChange}
          />
        </div>
      </div>

      {/* Count cells */}
      {days.map((d) => {
        const isWkd = d.isWeekend
        const isProblemCol = problemDays.has(d.dateISO)
        return (
          <div
            key={d.dateISO}
            role="cell"
            style={{
              width: isCompact ? undefined : cellW,
              minWidth: cellW,
              flex: isCompact ? `1 0 ${cellW}px` : 'none',
              padding: isCompact ? '4px 0' : isExt ? '5px 2px' : '7px 4px',
              boxSizing: 'border-box',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isProblemCol ? 'var(--grid-problem-col)' : isWkd ? weekendBg : 'var(--grid-cell)',
              borderRight: showGrid ? '1px solid var(--border)' : 'none',
              transition: 'background 360ms ease',
            }}
          >
            <OnShiftCountCell count={counts.get(d.dateISO) ?? 0} total={total} compact={!isExt} />
          </div>
        )
      })}

      {/* Trailing totals columns (detail/extended) */}
      {!isCompact && (
        <>
          <div style={{ borderLeft: '2px solid var(--border)', width: TOTALS_OFF_W, minWidth: TOTALS_OFF_W, flex: 'none', background: 'var(--grid-cell)', boxSizing: 'border-box' }} />
          <div style={{ borderLeft: '1px solid var(--border)', width: TOTALS_HRS_W, minWidth: TOTALS_HRS_W, flex: 'none', background: 'var(--grid-cell)', boxSizing: 'border-box' }} />
        </>
      )}
    </div>
  )
}
