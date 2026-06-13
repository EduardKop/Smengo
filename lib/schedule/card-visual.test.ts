import { describe, it, expect } from 'vitest'
import type { CardVisual } from '@/lib/validation/grid-view'
import { GridViewSettingsSchema } from '@/lib/validation/grid-view'
import {
  cardBodyForTone,
  makeCardSector,
  makeDefaultCardVisual,
  normalizeCardBody,
  normalizeCardVisual,
  resizeCardBody,
  DEFAULT_SECTOR_COLORS,
  DEFAULT_SECTOR_TEXT_COLOR,
} from './card-visual'

describe('makeCardSector', () => {
  it('обрезает text до лимитов схемы и подставляет цвета по индексу', () => {
    const sector = makeCardSector(1, { text: 'x'.repeat(40) })
    expect(sector.text).toHaveLength(24)
    expect(sector.color).toBe(DEFAULT_SECTOR_COLORS[1])
    expect(sector.textColor).toBe(DEFAULT_SECTOR_TEXT_COLOR)
  })

  it('отклоняет невалидный hex (не падаем на мусоре из БД статуса)', () => {
    const sector = makeCardSector(0, { color: 'red', textColor: '#zzzzzz' })
    expect(sector.color).toBe(DEFAULT_SECTOR_COLORS[0])
    expect(sector.textColor).toBe(DEFAULT_SECTOR_TEXT_COLOR)
  })
})

describe('makeDefaultCardVisual', () => {
  it('создаёт single-визуал с цветом статуса, проходящий Zod-схему', () => {
    const visual = makeDefaultCardVisual('Отпуск', '#d97757', '#ffffff')
    expect(visual.mode).toBe('single')
    expect(visual.sectorCount).toBe(1)
    expect(visual.sectors[0]).toMatchObject({ text: 'Отпуск', color: '#d97757' })
    const parsed = GridViewSettingsSchema.safeParse({
      cardVisuals: { '5b1f1c52-0c0e-4d62-9d6a-111111111111': visual },
    })
    expect(parsed.success).toBe(true)
  })
})

describe('normalizeCardBody', () => {
  it('mode=single всегда схлопывает до одного сектора', () => {
    const body = normalizeCardBody({
      mode: 'single',
      sectorCount: 3,
      sectors: [makeCardSector(0, { text: 'a' }), makeCardSector(1, { text: 'b' })],
    })
    expect(body.sectorCount).toBe(1)
    expect(body.sectors).toHaveLength(1)
    expect(body.sectors[0].text).toBe('a')
  })

  it('добивает недостающие сектора дефолтами при sectorCount=3', () => {
    const body = normalizeCardBody({
      mode: 'split',
      sectorCount: 3,
      sectors: [makeCardSector(0, { text: 'один' })],
    })
    expect(body.sectors).toHaveLength(3)
    expect(body.sectors[2].color).toBe(DEFAULT_SECTOR_COLORS[2])
  })
})

describe('cardBodyForTone (применение визуала в гриде)', () => {
  const lightBody = {
    mode: 'single' as const,
    sectorCount: 1 as const,
    sectors: [makeCardSector(0, { text: 'день', color: '#fff0c7', textColor: '#111827' })],
  }
  const darkBody = {
    mode: 'split' as const,
    sectorCount: 2 as const,
    sectors: [
      makeCardSector(0, { text: 'ночь', color: '#06395e' }),
      makeCardSector(1, { text: 'смена', color: '#27303c' }),
    ],
  }

  it('themeMode=single: одна и та же карточка в обеих темах', () => {
    const visual: CardVisual = { ...lightBody, themeMode: 'single' }
    expect(cardBodyForTone(visual, 'light').sectors[0].color).toBe('#fff0c7')
    expect(cardBodyForTone(visual, 'dark').sectors[0].color).toBe('#fff0c7')
  })

  it('themeMode=split: light/dark рендерят свои тела', () => {
    const visual: CardVisual = {
      ...lightBody,
      themeMode: 'split',
      themes: { light: lightBody, dark: darkBody },
    }
    const light = cardBodyForTone(visual, 'light')
    const dark = cardBodyForTone(visual, 'dark')
    expect(light.sectors[0].color).toBe('#fff0c7')
    expect(dark.mode).toBe('split')
    expect(dark.sectors).toHaveLength(2)
    expect(dark.sectors[1].color).toBe('#27303c')
  })

  it('themeMode=split без themes: фолбэк на базовое тело', () => {
    const visual: CardVisual = { ...darkBody, themeMode: 'split' }
    const body = cardBodyForTone(visual, 'dark')
    expect(body.sectors[0].text).toBe('ночь')
    expect(body.sectors).toHaveLength(2)
  })
})

describe('normalizeCardVisual', () => {
  it('split: нормализует обе темы независимо', () => {
    const visual: CardVisual = {
      mode: 'split',
      sectorCount: 2,
      sectors: [makeCardSector(0), makeCardSector(1)],
      themeMode: 'split',
      themes: {
        light: { mode: 'single', sectorCount: 1, sectors: [makeCardSector(0, { text: 'л' })] },
        // тёмная тема «битая»: mode=split, но сектор один — добьётся дефолтом
        dark: { mode: 'split', sectorCount: 2, sectors: [makeCardSector(0, { text: 'т' })] },
      },
    }
    const normalized = normalizeCardVisual(visual)
    expect(normalized.themes?.light.sectors).toHaveLength(1)
    expect(normalized.themes?.dark.sectors).toHaveLength(2)
  })

  it('single: отбрасывает themes', () => {
    const visual: CardVisual = {
      mode: 'single',
      sectorCount: 1,
      sectors: [makeCardSector(0)],
      themeMode: 'single',
      themes: {
        light: { mode: 'single', sectorCount: 1, sectors: [makeCardSector(0)] },
        dark: { mode: 'single', sectorCount: 1, sectors: [makeCardSector(0)] },
      },
    }
    expect(normalizeCardVisual(visual).themes).toBeUndefined()
  })
})

describe('resizeCardBody', () => {
  it('расширение сохраняет настроенные сектора и добавляет дефолтные', () => {
    const body = resizeCardBody(
      { mode: 'single', sectorCount: 1, sectors: [makeCardSector(0, { text: 'утро', emoji: '⭐' })] },
      3,
    )
    expect(body.mode).toBe('split')
    expect(body.sectors).toHaveLength(3)
    expect(body.sectors[0]).toMatchObject({ text: 'утро', emoji: '⭐' })
    expect(body.sectors[1].color).toBe(DEFAULT_SECTOR_COLORS[1])
  })

  it('сужение до 1 переключает mode в single', () => {
    const body = resizeCardBody(
      {
        mode: 'split',
        sectorCount: 3,
        sectors: [makeCardSector(0, { text: 'a' }), makeCardSector(1), makeCardSector(2)],
      },
      1,
    )
    expect(body.mode).toBe('single')
    expect(body.sectors).toHaveLength(1)
    expect(body.sectors[0].text).toBe('a')
  })
})
