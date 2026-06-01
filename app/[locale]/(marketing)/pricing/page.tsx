import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check, Minus, Sparkles } from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { PricingCards } from '@/components/marketing/pricing-cards'

export const revalidate = 3600

const SITE_URL = 'https://smengo.com'

function localizedUrl(locale: string, path = ''): string {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path}`
  return `${SITE_URL}/${locale}${path}`
}

const OG_LOCALE: Record<string, string> = { ru: 'ru_RU', uk: 'uk_UA', en: 'en_US' }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.seo' })

  const canonical = localizedUrl(locale, '/pricing')
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l, '/pricing')
  languages['x-default'] = localizedUrl(routing.defaultLocale, '/pricing')

  return {
    title: t('pricingTitle'),
    description: t('pricingDescription'),
    alternates: { canonical, languages },
    openGraph: {
      title: t('ogPricingTitle'),
      description: t('ogPricingDescription'),
      type: 'website',
      url: canonical,
      siteName: 'Smengo',
      locale: OG_LOCALE[locale] ?? 'en_US',
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogPricingTitle'),
      description: t('ogPricingDescription'),
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Нужна ли карта для пробного периода?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Нет. 14 дней полного доступа без карты. После — выберите план или останетесь с ограниченным бесплатным чтением.',
      },
    },
    {
      '@type': 'Question',
      name: 'Что происходит с данными при отмене?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Данные хранятся. Вы переходите в режим чтения — можете выгрузить графики в любое время.',
      },
    },
  ],
}

type FeatureKey =
  | 'feature_grid'
  | 'feature_export'
  | 'feature_alerts'
  | 'feature_analytics'
  | 'feature_telegram'
  | 'feature_portal'
  | 'feature_api'
  | 'feature_support'

const PLANS = [
  {
    key: 'start' as const,
    nameKey: 'planStart',
    price: 0,
    employees: '15',
    groups: '2',
    managers: '1',
    recommended: false,
    features: {
      feature_grid: true,
      feature_export: true,
      feature_alerts: false,
      feature_analytics: false,
      feature_telegram: false,
      feature_portal: false,
      feature_api: false,
      feature_support: false,
    } satisfies Record<FeatureKey, boolean>,
  },
  {
    key: 'team' as const,
    nameKey: 'planTeam',
    price: 29,
    employees: '75',
    groups: null,
    managers: '3',
    recommended: true,
    features: {
      feature_grid: true,
      feature_export: true,
      feature_alerts: true,
      feature_analytics: true,
      feature_telegram: true,
      feature_portal: false,
      feature_api: false,
      feature_support: false,
    } satisfies Record<FeatureKey, boolean>,
  },
  {
    key: 'business' as const,
    nameKey: 'planBusiness',
    price: 79,
    employees: '300',
    groups: null,
    managers: '10',
    recommended: false,
    features: {
      feature_grid: true,
      feature_export: true,
      feature_alerts: true,
      feature_analytics: true,
      feature_telegram: true,
      feature_portal: true,
      feature_api: true,
      feature_support: true,
    } satisfies Record<FeatureKey, boolean>,
  },
]

const FEATURE_KEYS: FeatureKey[] = [
  'feature_grid',
  'feature_export',
  'feature_alerts',
  'feature_analytics',
  'feature_telegram',
  'feature_portal',
  'feature_api',
  'feature_support',
]

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pricing')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-20">
        <h1
          className="font-serif font-semibold text-foreground"
          style={{ fontSize: 'clamp(34px, 5vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
        >
          {t('title')}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">{t('subtitle')}</p>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="px-4 pt-2 pb-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 text-center">
          <p className="text-[12.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
            {t('socialProof')}
          </p>
          <p className="text-[13.5px] font-medium text-foreground">
            {t('socialProofStat')}
          </p>
        </div>
      </section>

      {/* ── PRICING CARDS (toggle + 3 tiers) ── */}
      <section className="px-4 py-12 sm:px-6" style={{ background: 'var(--zone)' }}>
        <PricingCards />

        {/* ── ENTERPRISE BAND ── */}
        <div className="mx-auto mt-8 max-w-5xl">
          <div
            className="flex flex-col items-start gap-6 rounded-3xl border p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.05)',
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h3
                  className="font-serif font-semibold text-foreground"
                  style={{ fontSize: 22, letterSpacing: '-0.01em' }}
                >
                  {t('enterpriseTitle')}
                </h3>
              </div>
              <p className="mt-2 max-w-xl text-[14px] leading-[1.55] text-muted-foreground">
                {t('enterpriseDesc')}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {(['enterpriseFeature1', 'enterpriseFeature2', 'enterpriseFeature3', 'enterpriseFeature4'] as const).map((k) => (
                  <li key={k} className="flex items-center gap-2 text-[13px] text-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="mailto:hello@smengo.com"
              className="shrink-0 rounded-full border px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted/50"
              style={{ borderColor: 'var(--border)' }}
            >
              {t('enterpriseCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground">
            {t('featuresTitle')}
          </h2>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[640px] overflow-hidden rounded-[--radius] border border-border">
            {/* Header row */}
            <div className="grid grid-cols-4 border-b border-border bg-muted/40">
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground" />
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`px-4 py-3 text-center text-sm font-semibold ${
                    plan.recommended ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {t(plan.nameKey as Parameters<typeof t>[0])}
                </div>
              ))}
            </div>

            {/* Employees row */}
            <div className="grid grid-cols-4 border-b border-border bg-card hover:bg-muted/20">
              <div className="px-4 py-3 text-sm text-muted-foreground">{t('rowEmployees')}</div>
              {PLANS.map((plan) => (
                <div key={plan.key} className="px-4 py-3 text-center text-sm text-foreground">
                  {t('upTo', { n: plan.employees })}
                </div>
              ))}
            </div>

            {/* Groups row */}
            <div className="grid grid-cols-4 border-b border-border hover:bg-muted/20">
              <div className="px-4 py-3 text-sm text-muted-foreground">{t('rowGroups')}</div>
              {PLANS.map((plan) => (
                <div key={plan.key} className="px-4 py-3 text-center text-sm text-foreground">
                  {plan.groups ? `${plan.groups} ${t('groups')}` : t('unlimited')}
                </div>
              ))}
            </div>

            {/* Managers row */}
            <div className="grid grid-cols-4 border-b border-border bg-card hover:bg-muted/20">
              <div className="px-4 py-3 text-sm text-muted-foreground">{t('rowManagers')}</div>
              {PLANS.map((plan) => (
                <div key={plan.key} className="px-4 py-3 text-center text-sm text-foreground">
                  {plan.managers}
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {FEATURE_KEYS.map((fk, i) => (
              <div
                key={fk}
                className={`grid grid-cols-4 border-b border-border last:border-0 hover:bg-muted/20 ${
                  i % 2 === 0 ? 'bg-card' : ''
                }`}
              >
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {t(fk as Parameters<typeof t>[0])}
                </div>
                {PLANS.map((plan) => (
                  <div key={plan.key} className="flex items-center justify-center px-4 py-3">
                    {plan.features[fk] ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <Minus className="h-4 w-4 text-border" />
                    )}
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {t('faqTitle')}
          </h2>
          <div className="flex flex-col gap-4">
            {([
              ['faq1q', 'faq1a'],
              ['faq2q', 'faq2a'],
              ['faq3q', 'faq3a'],
              ['faq4q', 'faq4a'],
            ] as const).map(([q, a]) => (
              <div key={q} className="rounded-[--radius] border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">{t(q)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(a)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 text-center sm:px-6">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          {t('ctaTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t('ctaSubtitle')}
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent/90"
        >
          {t('startTrial')}
        </Link>
      </section>
    </>
  )
}
