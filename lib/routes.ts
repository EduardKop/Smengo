/**
 * Карта зон роутинга — единый источник для middleware и клиентских компонентов
 * (клиент-безопасный модуль: без supabase- и server-зависимостей).
 *
 * Auth и продукт-зона живут БЕЗ префикса локали в URL — язык берётся из куки
 * NEXT_LOCALE. Маркетинг — с префиксом next-intl (localePrefix: 'as-needed').
 */

export const APP_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/settings',
  '/employees',
  '/departments',
  '/schedule',
  '/billing',
] as const

export const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/invite',
  '/auth',
] as const

/** Точное совпадение или сегментная вложенность: `/p` либо `/p/...`. */
export function startsWithAny(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/** Зона с локалью из куки (auth + продукт): язык переключается без префикса в URL. */
export function isCookieLocalePath(pathname: string): boolean {
  return startsWithAny(pathname, AUTH_PREFIXES) || startsWithAny(pathname, APP_PREFIXES)
}
