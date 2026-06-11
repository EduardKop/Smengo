import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { HrDashboardDemo, type HrDashboardDemoLabels } from '@/components/marketing/hr-dashboard-demo'
import {
  CTA_PRIMARY, CTA_SECONDARY_ADAPTIVE,
  PlatformBackdrop, SalesCapRow, VsSection, RestSection, FinalCtaSection,
} from '@/components/marketing/platform-sales-sections'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_URL = 'https://smengo.com'
const PAGE_PATH = '/platform/hr-dashboard'

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
  const t = await getTranslations({ locale, namespace: 'marketing.hrDashboard.seo' })
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

export default async function HrDashboardPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.hrDashboard' })
  const demoLabels = t.raw('demoLabels') as HrDashboardDemoLabels
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
          <div className="mx-auto max-w-[640px] text-center">
            <h1 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.025em', lineHeight: 1.04 }}>
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-[480px] text-[17px] leading-[1.6] text-foreground/65">
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
            <HrDashboardDemo labels={demoLabels} />
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
              accent="#d0773f"
              title={t('caps.i1Title')}
              desc={t('caps.i1Desc')}
              bullets={[t('caps.i1B1'), t('caps.i1B2'), t('caps.i1B3')]}
              metric={{ value: t('caps.i1MetricValue'), label: t('caps.i1MetricLabel') }}
              visual={(
                <MiniKpiVisual
                  labels={[demoLabels.kpiEmployees, demoLabels.kpiOnShift, demoLabels.kpiApplicants, demoLabels.kpiOpenRoles]}
                  values={['24', '9', '132', '3']}
                  deltas={['+2', '+1', '+18', '-1']}
                />
              )}
            />
            <SalesCapRow
              side="right"
              accent="#3b6fd4"
              title={t('caps.i2Title')}
              desc={t('caps.i2Desc')}
              bullets={[t('caps.i2B1'), t('caps.i2B2'), t('caps.i2B3')]}
              visual={(
                <MiniChartVisual
                  planned={demoLabels.chartPlanned}
                  actual={demoLabels.chartActual}
                  axis={demoLabels.chartWeekdays}
                />
              )}
            />
            <SalesCapRow
              side="left"
              accent="#2f9e6f"
              title={t('caps.i3Title')}
              desc={t('caps.i3Desc')}
              bullets={[t('caps.i3B1'), t('caps.i3B2'), t('caps.i3B3')]}
              visual={<MiniAgendaVisual meetings={demoLabels.meetings} month={demoLabels.calMonth} />}
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
            { title: t('rest.c1Title'), desc: t('rest.c1Desc'), note: t('rest.c1Note'), href: '/platform/schedule-grid' },
            { title: t('rest.c2Title'), desc: t('rest.c2Desc'), note: t('rest.c2Note'), href: '/platform/hr-management' },
            { title: t('rest.c3Title'), desc: t('rest.c3Desc'), note: t('rest.c3Note'), href: '/platform/employee-database' },
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

function MiniKpiVisual({ labels, values, deltas }: { labels: string[]; values: string[]; deltas: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
      {labels.map((label, i) => {
        const positive = !deltas[i].startsWith('-')
        return (
          <div key={label} className="rounded-xl border border-foreground/8 bg-background px-3.5 py-3">
            <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground/55">{label}</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-serif text-[26px] font-bold leading-none tabular-nums text-foreground" style={{ letterSpacing: '-0.02em' }}>
                {values[i]}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{
                  background: positive ? 'rgba(47,158,111,0.14)' : 'rgba(212,96,74,0.13)',
                  color: positive ? '#2f9e6f' : '#d4604a',
                }}
              >
                {deltas[i]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const MINI_PLAN = [38, 38, 38, 38, 38, 22, 12]
const MINI_FACT = [39, 37, 41, 38, 40, 24, 11]

function MiniChartVisual({ planned, actual, axis }: { planned: string; actual: string; axis: string[] }) {
  const w = 440
  const h = 180
  const pad = 16
  const all = [...MINI_PLAN, ...MINI_FACT]
  const max = Math.max(...all) + 6
  const min = Math.max(0, Math.min(...all) - 8)
  const pts = (vals: number[]) => vals
    .map((v, i) => `${(pad + (i * (w - pad * 2)) / (vals.length - 1)).toFixed(1)},${(h - pad - ((v - min) / (max - min)) * (h - pad * 2)).toFixed(1)}`)
    .join(' ')
  return (
    <div className="rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
      <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" aria-hidden="true">
        {[0.3, 0.6].map((p) => (
          <line key={p} x1={pad} x2={w - pad} y1={pad + (h - pad * 2) * p} y2={pad + (h - pad * 2) * p} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 5" />
        ))}
        <polyline points={pts(MINI_PLAN)} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.8" strokeDasharray="5 5" strokeLinecap="round" />
        <polyline points={pts(MINI_FACT)} fill="none" stroke="#d0773f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {MINI_FACT.map((v, i) => (
          <circle
            key={i}
            cx={pad + (i * (w - pad * 2)) / (MINI_FACT.length - 1)}
            cy={h - pad - ((v - min) / (max - min)) * (h - pad * 2)}
            r="3.4"
            fill="#d0773f"
            stroke="#fffdf8"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[10px] font-semibold text-foreground/45">
        {axis.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-2.5 flex gap-4 text-[10.5px] text-foreground/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[2.5px] w-3.5 rounded" style={{ background: '#d0773f' }} />
          {actual}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 border-t-2 border-dashed border-foreground/35" />
          {planned}
        </span>
      </div>
    </div>
  )
}

function MiniAgendaVisual({ meetings, month }: { meetings: { title: string; time: string; place: string }[]; month: string }) {
  return (
    <div className="rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-foreground">{month}</span>
        <span className="flex gap-1">
          {[5, 14, 22].map((d) => (
            <span
              key={d}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] font-bold tabular-nums"
              style={{
                background: d === 14 ? '#d0773f' : 'rgba(208,119,63,0.13)',
                color: d === 14 ? '#fff' : '#d0773f',
              }}
            >
              {d}
            </span>
          ))}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {meetings.map((m, i) => (
          <div
            key={m.title}
            className="rounded-xl border border-foreground/8 px-3.5 py-2.5"
            style={{ background: i === 0 ? 'rgba(208,119,63,0.08)' : 'transparent' }}
          >
            <div className="text-[12.5px] font-semibold text-foreground">{m.title}</div>
            <div className="mt-0.5 text-[11px] text-foreground/55">{m.time} · {m.place}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
