'use client'

/**
 * Переключатель режимов — Apple-style segmented control из демо
 * (grid-preview.tsx ModeSegmented, 5124–5162): белый «бегунок» скользит
 * под активной опцией, позиция меряется от реальных кнопок.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { GridMode } from '@/lib/schedule/types'

const MODES: GridMode[] = ['compact', 'detail', 'extended']

interface ModeSwitcherProps {
  value: GridMode
  onChange: (mode: GridMode) => void
}

export function ModeSwitcher({ value, onChange }: ModeSwitcherProps) {
  const t = useTranslations('app.schedule')
  const btnRefs = useRef<Partial<Record<GridMode, HTMLButtonElement | null>>>({})
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null)

  const labelKey: Record<GridMode, 'modeCompact' | 'modeDetail' | 'modeExtended'> = {
    compact: 'modeCompact',
    detail: 'modeDetail',
    extended: 'modeExtended',
  }

  useLayoutEffect(() => {
    const update = () => {
      const btn = btnRefs.current[value]
      if (!btn) return
      setThumb({ left: btn.offsetLeft, width: btn.offsetWidth })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [value])

  return (
    <div role="group" aria-label={t('modeGroup')} data-mode-pill className="smengo-seg">
      {thumb && <span className="smengo-seg-thumb" style={{ left: thumb.left, width: thumb.width }} aria-hidden="true" />}
      {MODES.map((mode) => (
        <button
          key={mode}
          ref={(el) => { btnRefs.current[mode] = el }}
          type="button"
          data-active={mode === value}
          aria-pressed={mode === value}
          onClick={() => onChange(mode)}
        >
          {t(labelKey[mode])}
        </button>
      ))}
    </div>
  )
}
