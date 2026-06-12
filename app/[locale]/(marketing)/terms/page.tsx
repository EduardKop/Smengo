import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { LegalArticle } from '@/components/marketing/legal-article'

const SITE_URL = 'https://smengo.com'

function localizedUrl(locale: string, path = ''): string {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path}`
  return `${SITE_URL}/${locale}${path}`
}

// TODO: подтвердить у основателя юрлицо и юрисдикцию (сейчас в тексте — право Украины)
// и дату вступления в силу перед публичным запуском.
const SECTIONS = [
  'service',
  'accounts',
  'billing',
  'customerData',
  'acceptableUse',
  'ip',
  'disclaimer',
  'liability',
  'termination',
  'changes',
  'law',
  'contact',
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.terms' })

  const canonical = localizedUrl(locale, '/terms')
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l, '/terms')
  languages['x-default'] = localizedUrl(routing.defaultLocale, '/terms')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages },
  }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LegalArticle namespace="legal.terms" sections={SECTIONS} />
}
