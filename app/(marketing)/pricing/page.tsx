import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Check, Minus } from 'lucide-react'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Цены — Smengo',
    description:
      'Простые цены без сюрпризов. Старт $29, Команда $79, Бизнес $149 в месяц. 14 дней бесплатно, без карты.',
    alternates: {
      canonical: 'https://smengo.com/pricing',
    },
    openGraph: {
      title: 'Цены — Smengo',
      description: 'Старт $29 / Команда $79 / Бизнес $149. 14 дней бесплатно.',
      type: 'website',
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
    price: 29,
    employees: '25',
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
    price: 79,
    employees: '100',
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
    price: 149,
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

export default async function PricingPage() {
  const t = await getTranslations('pricing')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-20">
        <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">{t('subtitle')}</p>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.key} plan={plan} t={t} />
          ))}
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground">
            {t('featuresTitle')}
          </h2>
          <div className="overflow-hidden rounded-[--radius] border border-border">
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

/* ── Pricing card ── */
type TFunc = Awaited<ReturnType<typeof getTranslations<'pricing'>>>

function PricingCard({
  plan,
  t,
}: {
  plan: (typeof PLANS)[number]
  t: TFunc
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[--radius] border p-6 shadow-sm transition-shadow hover:shadow-md ${
        plan.recommended
          ? 'border-accent bg-accent/5 shadow-md'
          : 'border-border bg-card'
      }`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
            {t('recommended')}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-serif text-xl font-bold text-foreground">
          {t(plan.nameKey as Parameters<typeof t>[0])}
        </h3>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
          <span className="mb-1 text-sm text-muted-foreground">{t('monthly')}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t('trialNote')}</p>
      </div>

      {/* Key limits */}
      <ul className="mb-6 flex flex-col gap-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-accent" />
          {t('upTo', { n: plan.employees })} {t('employees')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-accent" />
          {plan.groups ? `${plan.groups} ${t('groups')}` : t('unlimited')}
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-accent" />
          {plan.managers}{' '}
          {plan.managers === '1'
            ? t('managers')
            : plan.managers === '3'
              ? t('managersPlural')
              : t('managersMany')}
        </li>
      </ul>

      <Link
        href="/register"
        className={`mt-auto block rounded-[--radius-sm] px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
          plan.recommended
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'border border-accent text-accent hover:bg-accent/5'
        }`}
      >
        {t('startTrial')}
      </Link>
    </div>
  )
}
