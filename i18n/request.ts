import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

const LOCALES = ['ru', 'uk', 'en'] as const
type Locale = (typeof LOCALES)[number]

function isValidLocale(value: string): value is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(value)
}

export default getRequestConfig(async () => {
  // Locale is resolved by middleware and forwarded via the x-locale header.
  const headersList = await headers()
  const raw = headersList.get('x-locale') ?? 'ru'
  const locale: Locale = isValidLocale(raw) ? raw : 'ru'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
