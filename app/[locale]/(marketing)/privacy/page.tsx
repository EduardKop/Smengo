import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { LegalArticle } from '@/components/marketing/legal-article'

const SITE_URL = 'https://smengo.com'

function localizedUrl(locale: string, path = ''): string {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path}`
  return `${SITE_URL}/${locale}${path}`
}

const SECTIONS = [
  'collect',
  'use',
  'roles',
  'legalBases',
  'sharing',
  'transfers',
  'retention',
  'rights',
  'security',
  'cookies',
  'children',
  'changes',
  'contact',
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })

  const canonical = localizedUrl(locale, '/privacy')
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l, '/privacy')
  languages['x-default'] = localizedUrl(routing.defaultLocale, '/privacy')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages },
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LegalArticle namespace="legal.privacy" sections={SECTIONS} />
}
