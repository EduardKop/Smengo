'use client'

/**
 * CardVisualChip — карточка статуса по сохранённому «Визуалу» организации.
 * Разметка скопирована из демо-грида (grid-preview.tsx: CustomScheduleChip
 * 718–795): grid-секторы, эмодзи/лого-строка, текст с ellipsis.
 * useSiteTone — реакция на класс dark на <html> (демо detectSiteTone +
 * MutationObserver, 2150–2166).
 */

import { useEffect, useState } from 'react'
import type { CardVisual } from '@/lib/validation/grid-view'
import {
  type SiteTone,
  cardBodyForTone,
  DEFAULT_SECTOR_COLORS,
  DEFAULT_SECTOR_TEXT_COLOR,
} from '@/lib/schedule/card-visual'

export function useSiteTone(): SiteTone {
  const [tone, setTone] = useState<SiteTone>('light')

  useEffect(() => {
    const root = document.documentElement
    const update = () => {
      setTone(root.classList.contains('dark') ? 'dark' : 'light')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return tone
}

export function CardVisualChip({
  config,
  tone = 'light',
  compact = false,
  minHeight = 34,
}: {
  config: CardVisual
  tone?: SiteTone
  compact?: boolean
  minHeight?: number
}) {
  const normalized = cardBodyForTone(config, tone)
  const isSplit = normalized.mode === 'split'
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        minHeight,
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: isSplit ? `repeat(${normalized.sectorCount}, minmax(0, 1fr))` : '1fr',
        overflow: 'hidden',
        borderRadius: compact ? 4 : 8,
        background: normalized.sectors[0]?.color ?? DEFAULT_SECTOR_COLORS[0],
        color: normalized.sectors[0]?.textColor ?? DEFAULT_SECTOR_TEXT_COLOR,
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}
    >
      {normalized.sectors.map((sector, index) => (
        <div
          key={`${sector.text}-${index}`}
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: isSplit ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: compact ? 2 : 4,
            padding: compact ? '1px 2px' : (isSplit ? '2px 4px' : '5px 4px'),
            borderTop: index > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
            background: sector.color,
            color: sector.textColor,
            textAlign: 'center',
          }}
        >
          {(sector.emoji || sector.logo) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: compact ? 8 : 10, lineHeight: 1 }}>
              {sector.emoji && <span>{sector.emoji}</span>}
              {sector.logo && (
                <span style={{ borderRadius: 999, background: 'rgba(255,255,255,0.16)', color: sector.textColor, padding: '1px 4px', fontSize: compact ? 6.5 : 8, fontWeight: 700, letterSpacing: 0.02 }}>
                  {sector.logo}
                </span>
              )}
            </span>
          )}
          <span
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: sector.textColor,
              fontSize: compact ? 8.2 : 11,
              fontWeight: 650,
              lineHeight: 1.05,
            }}
          >
            {sector.text}
          </span>
        </div>
      ))}
    </div>
  )
}
