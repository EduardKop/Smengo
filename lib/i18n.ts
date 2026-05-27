import 'server-only'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['ru', 'uk', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(value)
}

/** Read current locale from cookie. Cookie name matches middleware: NEXT_LOCALE. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  // Support both cookie names during transition
  const value =
    cookieStore.get('NEXT_LOCALE')?.value ??
    cookieStore.get('locale')?.value ??
    'ru'
  return isLocale(value) ? value : 'ru'
}
