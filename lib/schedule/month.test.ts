import { describe, it, expect } from 'vitest'
import { monthDays, monthKey, monthRange, todayISOInTz, shiftDurationHours, isNightShift, daysUntilBirthday, yearsOfService } from './month'

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

describe('isNightShift', () => {
  it('22:00–06:00 → true (crosses midnight)', () => {
    expect(isNightShift('22:00', '06:00')).toBe(true)
  })

  it('16:00–00:00 → false (evening shift ending exactly at midnight)', () => {
    expect(isNightShift('16:00', '00:00')).toBe(false)
  })

  it('09:00–17:00 → false (regular day shift)', () => {
    expect(isNightShift('09:00', '17:00')).toBe(false)
  })
})

describe('daysUntilBirthday', () => {
  it('birthday tomorrow → 1', () => {
    expect(daysUntilBirthday('1990-06-13', '2026-06-12')).toBe(1)
  })

  it('birthday today → 0', () => {
    expect(daysUntilBirthday('1990-06-12', '2026-06-12')).toBe(0)
  })

  it('null birth date → null', () => {
    expect(daysUntilBirthday(null, '2026-06-12')).toBeNull()
  })

  it('birthday Dec 29 with today Dec 30 → 364 (non-leap) or 365 (leap)', () => {
    // 2026 is non-leap. Dec 29 already passed (today=Dec 30), so next birthday is 2027-12-29.
    // From 2026-12-30 to 2027-12-29 = 364 days
    const result = daysUntilBirthday('1990-12-29', '2026-12-30')
    expect(result).toBe(364)
  })

  it('birthday one year away exactly wraps correctly', () => {
    // today = 2026-06-12, birthday = 1990-06-11 (passed yesterday) → next is 2027-06-11 = 364 days
    expect(daysUntilBirthday('1990-06-11', '2026-06-12')).toBe(364)
  })

  it('handles Feb 29 birthdays in non-leap years', () => {
    // 2026 is not a leap year → Feb-29 normalised to Feb-28
    // today = 2026-02-27, effective birthday = 2026-02-28 → 1 day away
    expect(daysUntilBirthday('1996-02-29', '2026-02-27')).toBe(1)
    // today = 2026-02-28, effective birthday = 2026-02-28 → 0 (today)
    expect(daysUntilBirthday('1996-02-29', '2026-02-28')).toBe(0)
    // today = 2026-03-01, effective birthday 2026-02-28 already passed →
    // next is 2027-02-28 (2027 is also non-leap); 2026-03-01 to 2027-02-28 = 364 days
    expect(daysUntilBirthday('1996-02-29', '2026-03-01')).toBe(364)
  })
})

describe('yearsOfService', () => {
  it('2024-03-01 to 2026-06-12 = 2 full years', () => {
    expect(yearsOfService('2024-03-01', '2026-06-12')).toBe(2)
  })

  it('null hired_on → null', () => {
    expect(yearsOfService(null, '2026-06-12')).toBeNull()
  })

  it('same-day hire = 0 years', () => {
    expect(yearsOfService('2026-06-12', '2026-06-12')).toBe(0)
  })

  it('anniversary not yet reached this year → subtract 1', () => {
    // hired 2024-09-01, today 2026-06-12 → anniversary 2026-09-01 not yet → 1 year
    expect(yearsOfService('2024-09-01', '2026-06-12')).toBe(1)
  })

  it('exact anniversary → full year', () => {
    // hired 2024-06-12, today 2026-06-12 → exactly 2 years
    expect(yearsOfService('2024-06-12', '2026-06-12')).toBe(2)
  })
})
