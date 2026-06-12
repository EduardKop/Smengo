import { describe, it, expect } from 'vitest'
import { monthDays, monthKey, monthRange, todayISOInTz, shiftDurationHours } from './month'

describe('monthDays', () => {
  it('returns 31 days for July 2026 with correct weekdays', () => {
    const days = monthDays(2026, 7)
    expect(days).toHaveLength(31)
    expect(days[0]).toEqual({ dateISO: '2026-07-01', day: 1, weekday: 2, isWeekend: false }) // 1 июля 2026 — среда
    expect(days[3].isWeekend).toBe(true) // 4 июля 2026 — суббота
  })

  it('handles February non-leap (2026) and leap (2028)', () => {
    expect(monthDays(2026, 2)).toHaveLength(28)
    expect(monthDays(2028, 2)).toHaveLength(29)
  })

  it('handles December (JS month-index boundary)', () => {
    const days = monthDays(2026, 12)
    expect(days).toHaveLength(31)
    expect(days[0].dateISO).toBe('2026-12-01')
    expect(days[30].dateISO).toBe('2026-12-31')
  })

  it('throws on invalid month', () => {
    expect(() => monthDays(2026, 0)).toThrow(RangeError)
    expect(() => monthDays(2026, 13)).toThrow(RangeError)
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

describe('shiftDurationHours', () => {
  it('ночная смена через полночь 22:00-06:00 → 8', () => {
    expect(shiftDurationHours('22:00', '06:00')).toBe(8)
  })

  it('обычная смена 09:00-17:30 → 8.5', () => {
    expect(shiftDurationHours('09:00', '17:30')).toBe(8.5)
  })

  it('одинаковое время 09:00-09:00 → 24 (полные сутки)', () => {
    expect(shiftDurationHours('09:00', '09:00')).toBe(24)
  })
})
