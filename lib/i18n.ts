import 'server-only'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['ru', 'uk', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(value)
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('locale')?.value ?? 'ru'
  return isLocale(value) ? value : 'ru'
}

type RuMessages = typeof import('../messages/ru.json')

export async function getDict(locale: Locale): Promise<RuMessages> {
  switch (locale) {
    case 'uk':
      return (await import('../messages/uk.json')) as unknown as RuMessages
    case 'en':
      return (await import('../messages/en.json')) as unknown as RuMessages
    default:
      return await import('../messages/ru.json')
  }
}

export type Messages = RuMessages
export type AuthMessages = RuMessages['auth']
export type OnboardingMessages = RuMessages['onboarding']
