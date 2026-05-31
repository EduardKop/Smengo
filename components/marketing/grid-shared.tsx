'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'
import type { RoleKey, GridPreviewLabels } from './grid-preview'

export type CustomSection = { key: string; name: string; color: string }
export type RoleOrSectionKey = RoleKey | string // custom section keys are prefixed with `cs:`

export const SOLID_COLORS = [
  { id: 'rose',    value: '#f43f5e' },
  { id: 'orange',  value: '#f97316' },
  { id: 'amber',   value: '#eab308' },
  { id: 'emerald', value: '#10b981' },
  { id: 'sky',     value: '#0ea5e9' },
  { id: 'violet',  value: '#8b5cf6' },
  { id: 'pink',    value: '#ec4899' },
  { id: 'teal',    value: '#14b8a6' },
] as const

export const GRADIENT_COLORS = [
  { id: 'grad-sunset',   value: 'linear-gradient(135deg, #f43f5e 0%, #f97316 55%, #fbbf24 100%)' },
  { id: 'grad-ocean',    value: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 45%, #10b981 100%)' },
  { id: 'grad-aurora',   value: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #38bdf8 100%)' },
  { id: 'grad-candy',    value: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb923c 100%)' },
  { id: 'grad-forest',   value: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #84cc16 100%)' },
  { id: 'grad-twilight', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' },
  { id: 'grad-fire',     value: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 45%, #fbbf24 100%)' },
  { id: 'grad-midnight', value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #38bdf8 100%)' },
] as const

// backward compat alias
export const COLOR_PRESETS = [...SOLID_COLORS, ...GRADIENT_COLORS]

export const ROLE_COLORS: Record<RoleKey, string> = {
  waiter:       '#f43f5e',
  host:         '#a855f7',
  barista:      '#f59e0b',
  cook:         '#8b5cf6',
  souschef:     '#06b6d4',
  pastry:       '#ec4899',
  floormanager: '#10b981',
  shiftlead:    '#3b82f6',
  cashier:      '#eab308',
  courier:      '#84cc16',
}

export const ALL_ROLE_KEYS: RoleKey[] = [
  'waiter','host','barista','cook','souschef','pastry','floormanager','shiftlead','cashier','courier',
]

type ModalShellProps = {
  theme: 'standard' | 'classic'
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

function ModalShell({ theme, title, onClose, children, width = 380 }: ModalShellProps) {
  const isClassic = theme === 'classic'
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: isClassic ? 'rgba(20,24,36,0.45)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        ref={ref}
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--surface)',
          color: 'var(--foreground)',
          borderRadius: isClassic ? 6 : 12,
          border: '1px solid var(--border)',
          boxShadow: isClassic
            ? '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)'
            : '0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: isClassic ? 'ui-serif, Georgia, "Times New Roman", serif' : 'inherit',
          overflow: 'hidden',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isClassic ? '14px 18px' : '14px 16px',
            borderBottom: '1px solid var(--border)',
            background: isClassic ? 'var(--muted)' : 'transparent',
          }}
        >
          <span style={{
            fontSize: isClassic ? 16 : 14,
            fontWeight: isClassic ? 500 : 600,
            letterSpacing: isClassic ? '-0.01em' : '0',
          }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent', border: 0, padding: 4,
              borderRadius: 4, cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ padding: 16, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

type RolePickerProps = {
  theme: 'standard' | 'classic'
  labels: GridPreviewLabels
  empName: string
  currentKey: RoleOrSectionKey
  customSections: CustomSection[]
  onPick: (key: RoleOrSectionKey) => void
  onClose: () => void
}

export function RolePickerModal({ theme, labels, empName, currentKey, customSections, onPick, onClose }: RolePickerProps) {
  const isClassic = theme === 'classic'
  const items: { key: RoleOrSectionKey; label: string; color: string; isCustom?: boolean }[] = [
    ...ALL_ROLE_KEYS.map((rk) => ({ key: rk as RoleOrSectionKey, label: labels.roles[rk], color: ROLE_COLORS[rk] })),
    ...customSections.map((cs) => ({ key: cs.key, label: cs.name, color: cs.color, isCustom: true })),
  ]
  return (
    <ModalShell theme={theme} title={`${labels.changeRoleTitle} — ${empName}`} onClose={onClose} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => {
          const active = it.key === currentKey
          return (
            <button
              key={String(it.key)}
              type="button"
              onClick={() => { onPick(it.key); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: isClassic ? '10px 12px' : '9px 10px',
                borderRadius: isClassic ? 4 : 8,
                border: active ? '1px solid var(--accent)' : '1px solid transparent',
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
                fontSize: isClassic ? 14 : 13,
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: it.color,
                  flexShrink: 0,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                }}
              />
              <span style={{ flex: 1, fontWeight: active ? 600 : 500 }}>{it.label}</span>
              {it.isCustom && (
                <span style={{
                  fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--muted-foreground)',
                  padding: '2px 6px', borderRadius: 4,
                  background: 'var(--muted)',
                }}>{labels.customBadge}</span>
              )}
              {active && <Check style={{ width: 14, height: 14, color: 'var(--accent)' }} />}
            </button>
          )
        })}
      </div>
    </ModalShell>
  )
}

type AddSectionProps = {
  theme: 'standard' | 'classic'
  labels: GridPreviewLabels
  onCreate: (section: CustomSection) => void
  onClose: () => void
}

export function AddSectionModal({ theme, labels, onCreate, onClose }: AddSectionProps) {
  const isClassic = theme === 'classic'
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string>('rose')
  const [customHex, setCustomHex] = useState<string>('#6366f1')
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  const ALL_PRESETS = [...SOLID_COLORS, ...GRADIENT_COLORS] as { id: string; value: string }[]
  const color = selectedId === 'custom'
    ? customHex
    : (ALL_PRESETS.find((c) => c.id === selectedId)?.value ?? SOLID_COLORS[0].value)

  const trimmed = name.trim()
  const canCreate = trimmed.length > 0

  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--muted-foreground)', marginBottom: 8,
    }}>{text}</div>
  )

  const swatchGrid = (items: { id: string; value: string }[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 7 }}>
      {items.map((c) => {
        const active = selectedId === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: '50%',
              background: c.value,
              border: 0, padding: 0, cursor: 'pointer',
              boxShadow: active
                ? `0 0 0 2.5px var(--surface), 0 0 0 4.5px var(--accent), 0 4px 12px rgba(0,0,0,0.25)`
                : '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.12s, box-shadow 0.12s',
              transform: active ? 'scale(1.12)' : 'scale(1)',
            }}
          />
        )
      })}
    </div>
  )

  return (
    <ModalShell theme={theme} title={labels.addSectionTitle} onClose={onClose} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Name input */}
        <div>
          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--muted-foreground)',
          }}>{labels.sectionNameLabel}</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.sectionNamePlaceholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 12px',
              borderRadius: isClassic ? 4 : 8,
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              color: 'inherit',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canCreate) {
                onCreate({ key: `cs:${Date.now()}`, name: trimmed, color })
                onClose()
              }
            }}
          />
        </div>

        {/* Standard colors */}
        <div>
          {sectionLabel(labels.stdColorsLabel)}
          {swatchGrid(SOLID_COLORS as unknown as { id: string; value: string }[])}
        </div>

        {/* Gradients */}
        <div>
          {sectionLabel(labels.gradientsLabel)}
          {swatchGrid(GRADIENT_COLORS as unknown as { id: string; value: string }[])}
        </div>

        {/* Custom color */}
        <div>
          {sectionLabel(labels.customColorLabel)}
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setSelectedId('custom'); colorInputRef.current?.click() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedId('custom'); colorInputRef.current?.click() } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: isClassic ? 4 : 8,
              border: `1.5px solid ${selectedId === 'custom' ? 'var(--accent)' : 'var(--border)'}`,
              background: selectedId === 'custom' ? 'var(--accent-soft)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'border-color 0.12s, background 0.12s',
              position: 'relative',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: customHex,
              boxShadow: '0 0 0 1.5px var(--border)',
            }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{labels.customColorLabel}</span>
            <span style={{
              fontSize: 11, fontFamily: 'ui-monospace, monospace',
              color: 'var(--muted-foreground)', letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>{customHex}</span>
            <input
              ref={colorInputRef}
              type="color"
              value={customHex}
              onChange={(e) => { setCustomHex(e.target.value); setSelectedId('custom') }}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, padding: 0, border: 0 }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          borderRadius: isClassic ? 4 : 8,
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: color,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{labels.previewLabel}:</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{trimmed || labels.sectionNamePlaceholder}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: isClassic ? 4 : 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'inherit',
              fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >{labels.cancelBtn}</button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => {
              if (!canCreate) return
              onCreate({ key: `cs:${Date.now()}`, name: trimmed, color })
              onClose()
            }}
            style={{
              padding: '8px 20px',
              borderRadius: isClassic ? 4 : 8,
              border: 0,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              opacity: canCreate ? 1 : 0.45,
              transition: 'opacity 0.12s',
            }}
          >{labels.createBtn}</button>
        </div>
      </div>
    </ModalShell>
  )
}
