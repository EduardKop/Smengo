'use client'

/**
 * Шестерёнка «Отображение» с поповером тумблеров — копия настроек демо
 * (grid-preview.tsx 2821–2849 + SettingRow 5165–5181):
 * smengo-tool--icon → smengo-pop со строками smengo-pop-item + smengo-switch.
 */

import { useEffect, useRef, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SettingRow({
  label, value, onChange, disabled = false,
}: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onChange(!value) }}
      aria-pressed={value}
      aria-disabled={disabled}
      className="smengo-pop-item justify-between"
      style={{ opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="smengo-switch" aria-pressed={value} aria-hidden="true" />
    </button>
  )
}

export interface DisplayToggle {
  key: string
  label: string
  value: boolean
  disabled?: boolean
}

export function DisplaySettingsButton({
  toggles,
  onToggle,
}: {
  toggles: DisplayToggle[]
  onToggle: (key: string, value: boolean) => void
}) {
  const t = useTranslations('app.schedule')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('displayLabel')}
        aria-expanded={open}
        className="smengo-tool smengo-tool--icon"
      >
        <Settings2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="smengo-pop absolute right-0 z-30 mt-2 w-72 p-1.5 text-[13px] max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2">
          <div className="smengo-pop-label">{t('displayLabel')}</div>
          {toggles.map((toggle) => (
            <SettingRow
              key={toggle.key}
              label={toggle.label}
              value={toggle.value}
              disabled={toggle.disabled}
              onChange={(v) => onToggle(toggle.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
