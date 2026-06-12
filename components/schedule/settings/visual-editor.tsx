'use client'

/**
 * Конструктор «Визуал» — внешний вид карточек статусов для всей организации.
 * Поповер с кнопки-палитры в тулбаре грида; по образцу конструктора кастомной
 * карточки демо (grid-preview.tsx: CustomCellEditor 1200–1378,
 * CustomCellBodyEditor 1044–1141, CustomColorDropdown 869–958,
 * CustomCellPreview 1143–1198). Каждый статус организации — строка-аккордеон
 * с живым предпросмотром; правки применяются к гриду немедленно (optimistic)
 * и сохраняются debounced (use-grid-view.ts).
 */

import { useState } from 'react'
import { Check, ChevronDown, Palette, RotateCcw } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { UserRole } from '@/supabase/types'
import type { StatusTypeRow } from '@/lib/schedule/types'
import type { CardVisual } from '@/lib/validation/grid-view'
import { can } from '@/lib/permissions'
import {
  type CardBody,
  type CardSector,
  type SiteTone,
  CARD_COLOR_OPTIONS,
  CARD_EMOJI_OPTIONS,
  cardBodyForTone,
  makeDefaultCardVisual,
  normalizeCardBody,
  normalizeCardVisual,
  resizeCardBody,
} from '@/lib/schedule/card-visual'
import { statusLabel } from '../status-style'
import { readableColorForHex } from '../grid-visual'
import { CardVisualChip } from '../card-visual-chip'

const PANEL_W = 480

// ── Дропдаун цвета (демо CustomColorDropdown: свотч 32px + сетка кружков) ──

function ColorDropdown({
  value,
  onChange,
  title,
}: {
  value: string
  onChange: (value: string) => void
  title: string
}) {
  const checkColor = readableColorForHex(value)
  return (
    <details style={{ position: 'relative' }}>
      <summary
        title={`${title}: ${value}`}
        aria-label={title}
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          width: 30,
          height: 30,
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: 'var(--grid-pill-bg)',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 19,
            height: 19,
            borderRadius: '50%',
            background: value,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
          }}
        />
      </summary>
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 24px)',
          gap: 6,
          width: 324,
          maxWidth: 'calc(100vw - 32px)',
          padding: 9,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.25)',
        }}
      >
        {CARD_COLOR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            title={option}
            onClick={(e) => {
              onChange(option)
              e.currentTarget.closest('details')?.removeAttribute('open')
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.16)',
              background: option,
              boxShadow: option === value
                ? '0 0 0 2px var(--surface), 0 0 0 4px color-mix(in oklab, var(--accent) 70%, #fff)'
                : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            {option === value && <Check size={14} strokeWidth={3} color={checkColor} />}
          </button>
        ))}
      </div>
    </details>
  )
}

// ── Дропдаун эмодзи (демо CustomChoiceDropdown) ─────────────────────

function EmojiDropdown({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <details style={{ position: 'relative' }}>
      <summary
        title={label}
        aria-label={label}
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          minWidth: 38,
          height: 30,
          boxSizing: 'border-box',
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: 'var(--grid-pill-bg)',
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
          padding: '5px 7px',
          fontSize: 11,
          fontWeight: 650,
          textAlign: 'center',
        }}
      >
        {value || '—'}
      </summary>
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 4,
          minWidth: 150,
          padding: 6,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.25)',
        }}
      >
        {CARD_EMOJI_OPTIONS.map((option) => (
          <button
            key={option || 'none'}
            type="button"
            onClick={(e) => {
              onChange(option)
              e.currentTarget.closest('details')?.removeAttribute('open')
            }}
            style={{
              height: 28,
              border: 0,
              borderRadius: 6,
              cursor: 'pointer',
              background: option === value ? 'var(--accent)' : 'var(--grid-pill-bg)',
              color: option === value ? '#fff' : 'var(--foreground)',
              fontSize: option ? 12 : 10,
              fontWeight: 650,
            }}
          >
            {option || '—'}
          </button>
        ))}
      </div>
    </details>
  )
}

// ── Редактор тела карточки (демо CustomCellBodyEditor) ──────────────

function CardBodyEditor({
  body,
  onChange,
}: {
  body: CardBody
  onChange: (next: CardBody) => void
}) {
  const t = useTranslations('app.schedule')
  const normalized = normalizeCardBody(body)

  const updateSector = (index: number, patch: Partial<CardSector>) => {
    onChange({
      ...normalized,
      sectors: normalized.sectors.map((sector, i) => (i === index ? { ...sector, ...patch } : sector)),
    })
  }

  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {/* Сегмент 1/2/3 секторов */}
      <div
        style={{
          display: 'flex',
          gap: 3,
          padding: 3,
          borderRadius: 11,
          background: 'var(--grid-pill-bg)',
          border: '1px solid var(--border)',
        }}
      >
        {[
          { label: t('visualSectors1'), count: 1 as const },
          { label: t('visualSectors2'), count: 2 as const },
          { label: t('visualSectors3'), count: 3 as const },
        ].map((item) => {
          const active = normalized.sectorCount === item.count
          return (
            <button
              key={item.count}
              type="button"
              onClick={() => onChange(resizeCardBody(normalized, item.count))}
              style={{
                flex: 1,
                border: 0,
                borderRadius: 8,
                background: active ? 'var(--surface)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: 10.5,
                fontWeight: 700,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.16), inset 0 0 0 1px var(--border)' : 'none',
                transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Строки секторов: текст / эмодзи / цвет фона / цвет текста */}
      <div style={{ display: 'grid', gap: 6 }}>
        {normalized.sectors.map((sector, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto auto auto',
              gap: 5,
              alignItems: 'center',
            }}
          >
            <input
              value={sector.text}
              maxLength={24}
              onChange={(e) => updateSector(index, { text: e.currentTarget.value })}
              placeholder={t('visualTextPlaceholder')}
              aria-label={t('visualTextPlaceholder')}
              className="smengo-custom-input"
              style={{
                minWidth: 0,
                height: 30,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--grid-cell)',
                color: 'var(--foreground)',
                padding: '0 9px',
                fontSize: 11.5,
                fontWeight: 550,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <EmojiDropdown
              value={sector.emoji}
              label={t('visualEmojiLabel')}
              onChange={(value) => updateSector(index, { emoji: value })}
            />
            <ColorDropdown
              value={sector.color}
              title={t('visualBgColorLabel')}
              onChange={(value) => updateSector(index, { color: value })}
            />
            <ColorDropdown
              value={sector.textColor}
              title={t('visualTextColorLabel')}
              onChange={(value) => updateSector(index, { textColor: value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Колонка предпросмотра: карточка во всех 3 режимах (демо CustomCellPreview) ──

function PreviewColumn({
  config,
  tone,
  label,
}: {
  config: CardVisual
  tone: SiteTone
  label: string
}) {
  const t = useTranslations('app.schedule')
  // Размеры зеркалят реальные ячейки: compact 34 / detail 36 / extended 46
  const variants = [
    { key: 'compact', caption: t('modeCompact'), width: 56, minHeight: 34, compact: true },
    { key: 'detail', caption: t('modeDetail'), width: 64, minHeight: 36, compact: true },
    { key: 'extended', caption: t('modeExtended'), width: 92, minHeight: 46, compact: false },
  ]
  return (
    <div
      style={{
        display: 'grid',
        gap: 7,
        alignContent: 'start',
        justifyItems: 'center',
        padding: '8px 7px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--grid-pill-bg) 76%, transparent)',
      }}
    >
      <span
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 9.5,
          fontWeight: 750,
          lineHeight: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      {variants.map((v) => (
        <div key={v.key} style={{ display: 'grid', gap: 3, justifyItems: 'center' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 8.5, fontWeight: 650, lineHeight: 1, opacity: 0.85 }}>
            {v.caption}
          </span>
          <div style={{ width: v.width, display: 'grid', alignItems: 'center' }}>
            <CardVisualChip config={config} tone={tone} compact={v.compact} minHeight={v.minHeight} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Секция статуса: предпросмотр + конструктор (аккордеон) ──────────

function StatusVisualSection({
  status,
  visual,
  tone,
  expanded,
  onToggleExpand,
  onChange,
}: {
  status: StatusTypeRow
  /** Сохранённый визуал или undefined (дефолтный рендер чипа) */
  visual: CardVisual | undefined
  tone: SiteTone
  expanded: boolean
  onToggleExpand: () => void
  onChange: (visual: CardVisual | null) => void
}) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()

  const label = statusLabel(status, locale)
  // Стартовый конфиг для нетронутого статуса: один сектор цвета статуса
  const config = normalizeCardVisual(
    visual ?? makeDefaultCardVisual(label, status.color, readableColorForHex(status.color)),
  )
  const splitByTheme = config.themeMode === 'split'
  const activeBody = cardBodyForTone(config, tone)
  const lightBody = cardBodyForTone(config, 'light')
  const darkBody = cardBodyForTone(config, 'dark')
  const lightConfig: CardVisual = { ...lightBody, themeMode: 'single' }
  const darkConfig: CardVisual = { ...darkBody, themeMode: 'single' }

  const setSingleBody = (body: CardBody) => {
    onChange({ ...normalizeCardBody(body), themeMode: 'single' })
  }
  const setThemeBody = (target: SiteTone, body: CardBody) => {
    const themes: Record<SiteTone, CardBody> = {
      light: lightBody,
      dark: darkBody,
      [target]: normalizeCardBody(body),
    }
    onChange({ ...themes.light, themeMode: 'split', themes })
  }
  const toggleThemeMode = () => {
    if (splitByTheme) {
      onChange({ ...activeBody, themeMode: 'single' })
      return
    }
    onChange({ ...activeBody, themeMode: 'split', themes: { light: activeBody, dark: activeBody } })
  }

  return (
    <li style={{ borderRadius: 10 }}>
      {/* Строка статуса: точка, имя, мини-превью, маркер кастомизации */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="smengo-pop-item"
        style={{ width: '100%', gap: 8 }}
      >
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full"
          style={{
            width: 10,
            height: 10,
            background: status.color,
            boxShadow: `0 0 0 2.5px color-mix(in oklab, ${status.color} 18%, transparent)`,
          }}
        />
        <span className="min-w-0 flex-1 truncate text-left" style={{ fontSize: 12, fontWeight: 550 }}>
          {label}
        </span>
        {visual && (
          <span
            aria-hidden="true"
            title={t('visualResetBtn')}
            className="shrink-0 rounded-full"
            style={{ width: 5, height: 5, background: 'var(--accent)' }}
          />
        )}
        <span className="shrink-0" style={{ width: 56 }}>
          <CardVisualChip config={config} tone={tone} compact minHeight={22} />
        </span>
        <ChevronDown
          size={12}
          className="shrink-0 text-muted-foreground"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 140ms ease' }}
        />
      </button>

      {expanded && (
        <div style={{ padding: '6px 4px 10px' }}>
          {/* Тумблер раздельных тем (демо customByThemeLabel-свитч) */}
          <button
            type="button"
            onClick={toggleThemeMode}
            role="switch"
            aria-checked={splitByTheme}
            className="smengo-pop-item justify-between"
            style={{
              width: '100%',
              marginBottom: 8,
              border: `1px solid ${splitByTheme ? 'color-mix(in oklab, var(--accent) 45%, var(--border))' : 'var(--border)'}`,
              borderRadius: 10,
              background: splitByTheme ? 'color-mix(in oklab, var(--accent) 9%, var(--grid-pill-bg))' : 'var(--grid-pill-bg)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <span className="min-w-0 truncate">{t('visualByThemeLabel')}</span>
            <span className="smengo-switch" aria-pressed={splitByTheme} aria-hidden="true" />
          </button>

          {splitByTheme ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 116px', gap: 10, alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 9.5, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('siteThemeLight')}
                  </span>
                  <CardBodyEditor body={lightBody} onChange={(next) => setThemeBody('light', next)} />
                </div>
                <PreviewColumn config={lightConfig} tone="light" label={t('siteThemeLight')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 116px', gap: 10, alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 9.5, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('siteThemeDark')}
                  </span>
                  <CardBodyEditor body={darkBody} onChange={(next) => setThemeBody('dark', next)} />
                </div>
                <PreviewColumn config={darkConfig} tone="dark" label={t('siteThemeDark')} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 116px', gap: 10, alignItems: 'start' }}>
              <CardBodyEditor body={activeBody} onChange={setSingleBody} />
              <PreviewColumn
                config={config}
                tone={tone}
                label={tone === 'dark' ? t('siteThemeDark') : t('siteThemeLight')}
              />
            </div>
          )}

          {/* Сбросить — вернуть дефолтный вид статуса */}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={!visual}
              className="smengo-tool disabled:cursor-default disabled:opacity-45"
            >
              <RotateCcw size={11} />
              {t('visualResetBtn')}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

// ── Кнопка-палитра + поповер со списком всех статусов ───────────────

export interface VisualEditorProps {
  role: UserRole
  statusTypes: StatusTypeRow[]
  cardVisuals: Record<string, CardVisual>
  tone: SiteTone
  onChange: (statusTypeId: string, visual: CardVisual | null) => void
}

export function VisualEditor({ role, statusTypes, cardVisuals, tone, onChange }: VisualEditorProps) {
  const t = useTranslations('app.schedule')
  const [open, setOpen] = useState(false)
  /** Раскрытие панели вправо, когда слева не хватает места (паттерн StatusManager). */
  const [alignLeft, setAlignLeft] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Вид применяется всем, но редактирование закрыто для ролей без права
  if (!can(role, 'customize_view')) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('visualEditorLabel')}
        aria-expanded={open}
        onClick={(e) => {
          const btnRect = e.currentTarget.getBoundingClientRect()
          const card = e.currentTarget.closest('[data-grid-topbar]')?.parentElement
          const boundary = card ? card.getBoundingClientRect().left : 0
          setAlignLeft(btnRect.right - PANEL_W < boundary + 8)
          setOpen((v) => !v)
        }}
        className="smengo-tool smengo-tool--icon"
      >
        <Palette size={15} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" aria-hidden="true" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            role="dialog"
            aria-label={t('visualEditorLabel')}
            className={`smengo-pop absolute top-10 z-40 p-2.5 ${alignLeft ? 'left-0' : 'right-0'}`}
            style={{
              width: PANEL_W,
              maxWidth: 'calc(100vw - 28px)',
              maxHeight: 'min(72vh, 640px)',
              overflowY: 'auto',
              ['--pop-origin' as string]: alignLeft ? 'top left' : 'top right',
            }}
          >
            <div className="smengo-pop-label">{t('visualEditorLabel')}</div>
            <ul className="flex flex-col gap-0.5">
              {statusTypes.map((status) => (
                <StatusVisualSection
                  key={status.id}
                  status={status}
                  visual={cardVisuals[status.id]}
                  tone={tone}
                  expanded={expandedId === status.id}
                  onToggleExpand={() => setExpandedId((prev) => (prev === status.id ? null : status.id))}
                  onChange={(visual) => onChange(status.id, visual)}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
