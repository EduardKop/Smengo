import type { CardVisual } from '@/lib/validation/grid-view'

/**
 * Чистые хелперы «Визуала» карточек статусов — порт нормализации кастомной
 * карточки демо (grid-preview.tsx: normalizeCustomCellBody /
 * normalizeCustomCellConfig / customCellBodyForTone / resizeCustomCellBody).
 * Отличие от демо: никаких захардкоженных текстов-заглушек («Кастом») —
 * дефолтный текст сектора задаёт вызывающий код (лейбл статуса в локали).
 */

export type SiteTone = 'light' | 'dark'
export type CardSector = CardVisual['sectors'][number]
export type CardBody = Pick<CardVisual, 'mode' | 'sectorCount' | 'sectors'>

export const DEFAULT_SECTOR_COLORS = ['#19795f', '#5a3aa4', '#743944'] as const
export const DEFAULT_SECTOR_TEXT_COLOR = '#ffffff'

/** Палитра свотчей конструктора — демо CUSTOM_COLOR_OPTIONS (hex без подписей). */
export const CARD_COLOR_OPTIONS = [
  '#000000', '#3f4247', '#676a6e', '#96999c', '#b8babd', '#cfcfd1', '#dedfe1', '#eff0f0', '#f8f8f6', '#19795f',
  '#5a3aa4', '#b50000', '#ff1414', '#ff9b12', '#fff10a', '#00ed00', '#1ad9d2', '#4c86dd', '#0800f5', '#8f00f4',
  '#ea0ee7', '#efb9ad', '#f5c9c2', '#f8dbb2', '#fff0c7', '#d8efd2', '#d4e7e9', '#c8dcf7', '#c2dcec', '#d7cde3',
  '#e8cad9', '#e37b66', '#ee8d8d', '#fac58d', '#ffdf94', '#acd09c', '#9cc5c8', '#9dbdea', '#91bedf', '#aa9bcf',
  '#d1a0b9', '#dc4524', '#e66364', '#f5ad60', '#ffd160', '#87bd75', '#75a9b3', '#6fa1e5', '#65a5dc', '#8876bb',
  '#c47ca7', '#bd210c', '#dc0000', '#ec8b27', '#f4bd2b', '#5ca147', '#3c8793', '#397bd6', '#327dbd', '#6849a2',
  '#ad4779', '#97250e', '#b00000', '#bd6500', '#d29b00', '#6d5724', '#2f7b20', '#155b68', '#2f5f9f', '#1d5dcc',
  '#0b5a9a', '#743944', '#3d2275', '#7d1d4b', '#6d1606', '#740000', '#864500', '#9b7500', '#1e5514', '#0d3d45',
  '#244b91', '#06395e', '#27303c', '#28145a', '#4b0d33',
] as const

/** Эмодзи-опции сектора (демо CUSTOM_EMOJI_OPTIONS; '' = без эмодзи). */
export const CARD_EMOJI_OPTIONS = ['', '⭐', '🔥', '☕', '🍕', '💬', '✅', '⚠️'] as const

const HEX_RE = /^#[0-9a-fA-F]{6}$/

function safeHex(value: string | undefined, fallback: string): string {
  return value && HEX_RE.test(value) ? value : fallback
}

/** Сектор с дефолтами по индексу (цвета — демо DEFAULT_CUSTOM_SECTOR_COLORS). */
export function makeCardSector(index: number, init?: Partial<CardSector>): CardSector {
  const fallbackColor = DEFAULT_SECTOR_COLORS[index] ?? DEFAULT_SECTOR_COLORS[0]
  return {
    text: (init?.text ?? '').slice(0, 24),
    emoji: (init?.emoji ?? '').slice(0, 8),
    logo: (init?.logo ?? '').slice(0, 24),
    color: safeHex(init?.color, fallbackColor),
    textColor: safeHex(init?.textColor, DEFAULT_SECTOR_TEXT_COLOR),
  }
}

/** Стартовый визуал статуса: один сектор с цветом статуса и его подписью. */
export function makeDefaultCardVisual(text: string, color: string, textColor: string): CardVisual {
  return {
    mode: 'single',
    sectorCount: 1,
    sectors: [makeCardSector(0, { text, color, textColor })],
    themeMode: 'single',
  }
}

/** Тело карточки: mode/sectorCount/sectors согласованы, сектора добиты дефолтами. */
export function normalizeCardBody(body?: Partial<CardBody>): CardBody {
  const count: 1 | 2 | 3 =
    body?.mode === 'single' ? 1 : body?.sectorCount === 3 ? 3 : body?.sectorCount === 2 ? 2 : 1
  const sectors = Array.from({ length: count }, (_, i) => makeCardSector(i, body?.sectors?.[i]))
  return { mode: count === 1 ? 'single' : 'split', sectorCount: count, sectors }
}

/** Полная нормализация конфига: базовое тело + темы при themeMode='split'. */
export function normalizeCardVisual(visual: CardVisual): CardVisual {
  const base = normalizeCardBody(visual)
  if (visual.themeMode === 'split') {
    return {
      ...base,
      themeMode: 'split',
      themes: {
        light: normalizeCardBody(visual.themes?.light ?? base),
        dark: normalizeCardBody(visual.themes?.dark ?? base),
      },
    }
  }
  return { ...base, themeMode: 'single' }
}

/** Тело карточки для текущей темы сайта (split → themes[tone], иначе база). */
export function cardBodyForTone(visual: CardVisual, tone: SiteTone): CardBody {
  const normalized = normalizeCardVisual(visual)
  if (normalized.themeMode === 'split' && normalized.themes) return normalized.themes[tone]
  return { mode: normalized.mode, sectorCount: normalized.sectorCount, sectors: normalized.sectors }
}

/** Смена числа секторов с сохранением уже настроенных. */
export function resizeCardBody(body: Partial<CardBody>, count: 1 | 2 | 3): CardBody {
  const normalized = normalizeCardBody(body)
  const sectors = Array.from({ length: count }, (_, i) => normalized.sectors[i] ?? makeCardSector(i))
  return { mode: count === 1 ? 'single' : 'split', sectorCount: count, sectors }
}
