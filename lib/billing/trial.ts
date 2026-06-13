const MS_PER_DAY = 86_400_000

/**
 * Сколько целых дней осталось до конца триала (вверх до целого), не меньше 0.
 * null — если триал не задан (платный план). `now` параметризован для тестов.
 */
export function trialDaysLeft(trialEndsAt: string | null | undefined, now: number = Date.now()): number | null {
  if (!trialEndsAt) return null
  const ms = new Date(trialEndsAt).getTime() - now
  if (Number.isNaN(ms)) return null
  return Math.max(0, Math.ceil(ms / MS_PER_DAY))
}
