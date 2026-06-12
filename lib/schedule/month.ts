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

/** Дата «сегодня» в таймзоне организации, формат YYYY-MM-DD. */
export function todayISOInTz(timeZone: string, reference = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(reference)
}
