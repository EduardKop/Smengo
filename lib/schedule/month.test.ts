import { describe, it, expect } from 'vitest'
import { monthDays, monthKey, monthRange, todayISOInTz } from './month'

describe('monthDays', () => {
  it('returns 31 days for July 2026 with correct weekdays', () => {
    const days = monthDays(2026, 7)
    expect(days).toHaveLength(31)
    expect(days[0]).toEqual({ dateISO: '2026-07-01', day: 1, weekday: 2, isWeekend: false }) // ВНИМАНИЕ: проверь календарь — 1 июля 2026 это среда, weekday при 0=понедельник должен быть 2. Если расчёт даёт иное — разберись прежде чем менять ожидание; ожидание в плане могло содержать опечатку, истина — реальный календарь.
    expect(days[3].isWeekend).toBe(true) // 4 июля 2026 — суббота
  })

  it('handles February non-leap (2026) and leap (2028)', () => {
    expect(monthDays(2026, 2)).toHaveLength(28)
    expect(monthDays(2028, 2)).toHaveLength(29)
  })
})

describe('monthKey / monthRange', () => {
  it('formats key and inclusive range', () => {
    expect(monthKey(2026, 6)).toBe('2026-06')
    expect(monthRange(2026, 6)).toEqual({ from: '2026-06-01', to: '2026-06-30' })
  })
})

describe('todayISOInTz', () => {
  it('respects timezone across midnight', () => {
    // 2026-06-12T23:30:00Z = 13 июня 02:30 в Киеве (UTC+3 летом)
    const ref = new Date('2026-06-12T23:30:00Z')
    expect(todayISOInTz('Europe/Kyiv', ref)).toBe('2026-06-13')
    expect(todayISOInTz('UTC', ref)).toBe('2026-06-12')
  })
})
