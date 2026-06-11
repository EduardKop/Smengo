import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, Check } from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { HrManagementDemo, type HrManagementDemoLabels } from '@/components/marketing/hr-management-demo'
import {
  CTA_PRIMARY, CTA_SECONDARY_ADAPTIVE,
  PlatformBackdrop, SalesCapRow, VsSection, RestSection, FinalCtaSection,
} from '@/components/marketing/platform-sales-sections'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_URL = 'https://smengo.com'
const PAGE_PATH = '/platform/hr-management'

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
  const t = await getTranslations({ locale, namespace: 'marketing.hrManagement.seo' })
  const canonical = localizedUrl(locale, PAGE_PATH)
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l, PAGE_PATH)
  languages['x-default'] = localizedUrl(routing.defaultLocale, PAGE_PATH)

  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical, languages },
    keywords: t.raw('keywords') as string[],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: canonical,
      siteName: 'Smengo',
      locale: OG_LOCALE[locale] ?? 'en_US',
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
  }
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function HrManagementPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.hrManagement' })
  const demoLabels = t.raw('demoLabels') as HrManagementDemoLabels
  const pageUrl = localizedUrl(locale, PAGE_PATH)

  const pageJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('seo.title'),
      description: t('seo.description'),
      url: pageUrl,
      inLanguage: locale,
      isPartOf: { '@type': 'WebSite', name: 'Smengo', url: SITE_URL },
      about: {
        '@type': 'SoftwareApplication',
        name: 'Smengo',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t('seo.appDescription'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Smengo', item: localizedUrl(locale) },
        { '@type': 'ListItem', position: 2, name: t('seo.breadcrumbPlatform'), item: localizedUrl(locale, '/platform') },
        { '@type': 'ListItem', position: 3, name: t('seo.breadcrumbPage'), item: pageUrl },
      ],
    },
  ]

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* ─────────────── 1. HERO ─────────────── */}
      <section className="relative overflow-hidden">
        <PlatformBackdrop tone="light" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[660px] text-center">
            <h1 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.025em', lineHeight: 1.04 }}>
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-[500px] text-[17px] leading-[1.6] text-foreground/65">
              {t('hero.subtitle')}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/register" className={`${CTA_PRIMARY} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaStart')}</Link>
              <Link href="/pricing" className={`${CTA_SECONDARY_ADAPTIVE} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaPricing')}</Link>
              <span className="pt-1 text-center text-[12.5px] leading-snug text-foreground/50 sm:pt-0">{t('hero.hint')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 2. INTERACTIVE DEMO — CREAM ─────────────── */}
      <section className="relative overflow-hidden bg-[#faf4ea] px-4 py-14 sm:px-6 sm:py-16">
        <PlatformBackdrop tone="warm" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
              {t('demo.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-[#1f1e1c]/65">
              {t('demo.subtitle')}
            </p>
          </div>
          <div className="mt-10">
            <HrManagementDemo labels={demoLabels} />
          </div>
        </div>
      </section>

      {/* ─────────────── 3. CAPABILITIES — WHITE ─────────────── */}
      <section className="relative overflow-hidden bg-white px-4 py-14 dark:bg-background sm:px-6 sm:py-16">
        <PlatformBackdrop tone="light" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('caps.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-16">
            <SalesCapRow
              side="left"
              accent="#3b6fd4"
              title={t('caps.i1Title')}
              desc={t('caps.i1Desc')}
              bullets={[t('caps.i1B1'), t('caps.i1B2'), t('caps.i1B3')]}
              metric={{ value: t('caps.i1MetricValue'), label: t('caps.i1MetricLabel') }}
              visual={(
                <MiniPipelineVisual
                  stages={[demoLabels.stageApplied, demoLabels.stageInterview, demoLabels.stageOffer, demoLabels.stageOnboarding]}
                  counts={[2, 2, 1, 1]}
                  names={demoLabels.candidates.map((c) => c.name)}
                />
              )}
            />
            <SalesCapRow
              side="right"
              accent="#2f9e6f"
              title={t('caps.i2Title')}
              desc={t('caps.i2Desc')}
              bullets={[t('caps.i2B1'), t('caps.i2B2'), t('caps.i2B3')]}
              visual={(
                <MiniChecklistVisual
                  title={demoLabels.journeySubtitle}
                  progress={demoLabels.journeyProgress}
                  steps={demoLabels.steps}
                  doneCount={3}
                />
              )}
            />
            <SalesCapRow
              side="left"
              accent="#7c5cc4"
              title={t('caps.i3Title')}
              desc={t('caps.i3Desc')}
              bullets={[t('caps.i3B1'), t('caps.i3B2'), t('caps.i3B3')]}
              visual={(
                <MiniHireFlowVisual
                  candidate={demoLabels.candidates[0].name}
                  role={demoLabels.candidates[0].role}
                  stages={[demoLabels.stageOffer, demoLabels.hired, demoLabels.steps[demoLabels.steps.length - 1]]}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ─────────────── 4. VS — BLUE ─────────────── */}
      <VsSection
        labels={{
          eyebrow: t('vs.eyebrow'),
          title: t('vs.title'),
          subtitle: t('vs.subtitle'),
          leftTitle: t('vs.leftTitle'),
          leftNote: t('vs.leftNote'),
          smengoTitle: t('vs.smengoTitle'),
          smengoNote: t('vs.smengoNote'),
          rows: [
            { left: t('vs.r1Left'), smengo: t('vs.r1Smengo') },
            { left: t('vs.r2Left'), smengo: t('vs.r2Smengo') },
            { left: t('vs.r3Left'), smengo: t('vs.r3Smengo') },
            { left: t('vs.r4Left'), smengo: t('vs.r4Smengo') },
          ],
          pills: [t('vs.pill1'), t('vs.pill2'), t('vs.pill3')],
          footerTitle: t('vs.footerTitle'),
          footerText: t('vs.footerText'),
          ctaStart: t('vs.ctaStart'),
          ctaPricing: t('vs.ctaPricing'),
        }}
      />

      {/* ─────────────── 5. PART OF THE PLATFORM — CREAM ─────────────── */}
      <RestSection
        labels={{
          eyebrow: t('rest.eyebrow'),
          title: t('rest.title'),
          subtitle: t('rest.subtitle'),
          more: t('rest.more'),
          cards: [
            { title: t('rest.c1Title'), desc: t('rest.c1Desc'), note: t('rest.c1Note'), href: '/platform/hr-dashboard' },
            { title: t('rest.c2Title'), desc: t('rest.c2Desc'), note: t('rest.c2Note'), href: '/platform/onboarding' },
            { title: t('rest.c3Title'), desc: t('rest.c3Desc'), note: t('rest.c3Note'), href: '/platform/schedule-grid' },
          ],
        }}
      />

      {/* ─────────────── 6. FINAL CTA — SAND ─────────────── */}
      <FinalCtaSection
        title={t('final.title')}
        subtitle={t('final.subtitle')}
        ctaStart={t('final.ctaStart')}
        ctaPricing={t('final.ctaPricing')}
        hint={t('final.hint')}
      />
    </div>
  )
}

/* ───────────── Static capability visuals ───────────── */

const STAGE_COLORS = ['#3b6fd4', '#e0b53a', '#7c5cc4', '#2f9e6f']

function MiniPipelineVisual({ stages, counts, names }: { stages: string[]; counts: number[]; names: string[] }) {
  let nameIdx = 0
  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-3.5 dark:border-white/10 dark:bg-[#171a1f]">
      {stages.map((stage, col) => (
        <div key={stage} className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1 px-0.5">
            <span className="truncate text-[9.5px] font-bold uppercase tracking-wide" style={{ color: STAGE_COLORS[col] }}>
              {stage}
            </span>
            <span
              className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums"
              style={{ background: `${STAGE_COLORS[col]}22`, color: STAGE_COLORS[col] }}
            >
              {counts[col]}
            </span>
          </div>
          {Array.from({ length: counts[col] }).map((_, i) => {
            const name = names[nameIdx++ % names.length]
            return (
              <div key={i} className="rounded-lg border border-foreground/8 bg-background px-2 py-1.5">
                <span className="block h-1.5 w-7 rounded-full" style={{ background: STAGE_COLORS[col], opacity: 0.65 }} />
                <span className="mt-1.5 block truncate text-[9.5px] font-semibold text-foreground/75">{name.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function MiniChecklistVisual({ title, progress, steps, doneCount }: { title: string; progress: string; steps: string[]; doneCount: number }) {
  const pct = Math.round((doneCount / steps.length) * 100)
  return (
    <div className="rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-bold text-foreground">{title}</span>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: '#2f9e6f' }}>{progress} {pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: '#2f9e6f' }} />
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {steps.map((step, i) => {
          const done = i < doneCount
          return (
            <div key={step} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5" style={{ background: done ? 'rgba(47,158,111,0.07)' : 'transparent' }}>
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                style={{
                  borderColor: done ? '#2f9e6f' : 'rgba(31,30,28,0.2)',
                  background: done ? '#2f9e6f' : 'transparent',
                  color: '#fff',
                }}
              >
                {done && <Check size={10} strokeWidth={3} />}
              </span>
              <span className="truncate text-[12px] font-medium" style={{ color: done ? 'rgba(31,30,28,0.45)' : undefined, textDecoration: done ? 'line-through' : 'none' }}>
                <span className="text-foreground/80">{step}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MiniHireFlowVisual({ candidate, role, stages }: { candidate: string; role: string; stages: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
      <div className="flex items-center gap-3 rounded-xl border border-foreground/8 bg-background px-3.5 py-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: '#7c5cc4' }}>
          {candidate.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-foreground">{candidate}</div>
          <div className="truncate text-[11px] text-foreground/55">{role}</div>
        </div>
        <span className="ml-auto rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: 'rgba(124,92,196,0.13)', color: '#7c5cc4' }}>
          {stages[0]}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 text-foreground/35">
        <ArrowRight size={16} strokeWidth={2.4} className="rotate-90" />
      </div>
      <div className="grid grid-cols-7 gap-1 rounded-xl border border-foreground/8 bg-background p-3">
        {Array.from({ length: 14 }).map((_, i) => {
          const isShift = i === 4 || i === 5 || i === 11 || i === 12
          const isFirst = i === 4
          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-md text-[8.5px] font-bold"
              style={{
                background: isShift ? (isFirst ? '#2f9e6f' : 'rgba(47,158,111,0.18)') : 'rgba(31,30,28,0.04)',
                color: isFirst ? '#fff' : 'transparent',
                outline: isFirst ? '2px solid rgba(47,158,111,0.35)' : 'none',
                outlineOffset: 1,
              }}
            >
              {isFirst ? '9–17' : '·'}
            </div>
          )
        })}
      </div>
      <div className="text-center text-[11px] font-semibold" style={{ color: '#2f9e6f' }}>
        {stages[1]} · {stages[2]}
      </div>
    </div>
  )
}
