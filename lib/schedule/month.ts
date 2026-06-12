export interface MonthDay {
  dateISO: string
  day: number
  /** 0 = понедельник … 6 = воскресенье */
  weekday: number
  isWeekend: boolean
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`
}

export function monthDays(year: number, month: number): MonthDay[] {
  if (month < 1 || month > 12) throw new RangeError(`month must be 1-12, got ${month}`)
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const jsDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay() // 0=вс
    const weekday = (jsDow + 6) % 7 // 0=пн
    return {
      dateISO: `${year}-${pad(month)}-${pad(day)}`,
      day,
      weekday,
      isWeekend: weekday >= 5,
    }
  })
}

export function monthRange(year: number, month: number): { from: string; to: string } {
  const days = monthDays(year, month)
  return { from: days[0].dateISO, to: days[days.length - 1].dateISO }
}

/**
 * Длительность смены в часах; ночная через полночь корректна (22:00-06:00 → 8).
 * 09:00-09:00 считается полной 24-часовой сменой.
 */
export function shiftDurationHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startMin = (sh ?? 0) * 60 + (sm ?? 0)
  const endMin = (eh ?? 0) * 60 + (em ?? 0)
  const diff = (endMin - startMin + 24 * 60) % (24 * 60)
  return (diff === 0 ? 24 * 60 : diff) / 60
}

/**
 * True if a shift crosses midnight (end < start by clock time).
 * 16:00–00:00 is an evening shift ending exactly at midnight — NOT a night shift.
 */
export function isNightShift(start: string, end: string): boolean {
  const [sh = 0, sm = 0] = start.split(':').map(Number)
  const [eh = 0, em = 0] = end.split(':').map(Number)
  const startMin = (sh) * 60 + (sm)
  const endMin = (eh) * 60 + (em)
  // end === '00:00' means midnight exactly — treat as end-of-day, not overnight
  return endMin < startMin && end.slice(0, 5) !== '00:00'
}

/**
 * Дней до ближайшего дня рождения (0 = сегодня, считается UTC-чисто).
 * null если birthDateISO не задан.
 */
export function daysUntilBirthday(birthDateISO: string | null, todayISO: string): number | null {
  if (!birthDateISO) return null
  const [ty, tm, td] = todayISO.split('-').map(Number)
  const [, bm, bd] = birthDateISO.split('-').map(Number)

  // Next birthday in current or next year
  let nextYear = ty!
  const nextBirthday = new Date(Date.UTC(nextYear, bm! - 1, bd!))
  const todayDate = new Date(Date.UTC(ty!, tm! - 1, td!))

  if (nextBirthday < todayDate) {
    // Already passed this year — next birthday is in the next year
    nextYear += 1
    const nextBd = new Date(Date.UTC(nextYear, bm! - 1, bd!))
    return Math.round((nextBd.getTime() - todayDate.getTime()) / 86_400_000)
  }

  return Math.round((nextBirthday.getTime() - todayDate.getTime()) / 86_400_000)
}

/**
 * Полных лет стажа от hired_on до today (UTC-чисто).
 * null если hiredOnISO не задан.
 */
export function yearsOfService(hiredOnISO: string | null, todayISO: string): number | null {
  if (!hiredOnISO) return null
  const [ty, tm, td] = todayISO.split('-').map(Number)
  const [hy, hm, hd] = hiredOnISO.split('-').map(Number)

  let years = ty! - hy!
  // If we haven't reached the anniversary month/day yet this year, subtract 1
  if (tm! < hm! || (tm === hm && td! < hd!)) {
    years -= 1
  }
  return Math.max(0, years)
}

/**
 * Дата «сегодня» в таймзоне организации, формат YYYY-MM-DD.
 * @throws {RangeError} if timeZone is not a valid IANA zone
 */
export function todayISOInTz(timeZone: string, reference = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(reference)
}
