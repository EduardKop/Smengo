'use client'

import { useTranslations } from 'next-intl'
import type { GridMode } from '@/lib/schedule/types'

const MODES: GridMode[] = ['compact', 'detail', 'extended']

interface ModeSwitcherProps {
  value: GridMode
  onChange: (mode: GridMode) => void
}

export function ModeSwitcher({ value, onChange }: ModeSwitcherProps) {
  const t = useTranslations('app.schedule')

  const labelKey: Record<GridMode, 'modeCompact' | 'modeDetail' | 'modeExtended'> = {
    compact: 'modeCompact',
    detail: 'modeDetail',
    extended: 'modeExtended',
  }

  return (
    <div
      role="group"
      aria-label={t('modeGroup')}
      className="flex h-8 items-stretch rounded-md border border-border bg-background overflow-hidden"
    >
      {MODES.map((mode) => {
        const active = mode === value
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={[
              'px-3 text-sm transition-colors',
              active
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            {t(labelKey[mode])}
          </button>
        )
      })}
    </div>
  )
}
