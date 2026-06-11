import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Phone, FileText, CalendarDays, ShieldCheck, History, CalendarRange,
  ArrowRight, Check, type LucideIcon,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { EmployeeDatabaseDemo, type EmployeeDatabaseDemoLabels } from '@/components/marketing/employee-database-demo'
import {
  CTA_PRIMARY, CTA_SECONDARY_ADAPTIVE,
  PlatformBackdrop, RestSection, FinalCtaSection,
} from '@/components/marketing/platform-sales-sections'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_URL = 'https://smengo.com'
const PAGE_PATH = '/platform/employee-database'

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
  const t = await getTranslations({ locale, namespace: 'marketing.employeeDatabase.seo' })
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

const BENTO_ICONS: LucideIcon[] = [Phone, FileText, CalendarDays, ShieldCheck, History, CalendarRange]
const BENTO_ACCENTS = ['#d0773f', '#3b6fd4', '#2f9e6f', '#7c5cc4', '#b8862f', '#d0584a']

export default async function EmployeeDatabasePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.employeeDatabase' })
  const demoLabels = t.raw('demoLabels') as EmployeeDatabaseDemoLabels
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

  const bentoTiles = [0, 1, 2, 3, 4, 5].map((i) => ({
    title: t(`bento.t${i + 1}Title` as Parameters<typeof t>[0]),
    desc: t(`bento.t${i + 1}Desc` as Parameters<typeof t>[0]),
    Icon: BENTO_ICONS[i],
    accent: BENTO_ACCENTS[i],
  }))

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* ─────────────── 1. SPLIT HERO: text + live demo ─────────────── */}
      <section className="relative overflow-hidden">
        <PlatformBackdrop tone="light" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <div className="mx-auto max-w-[520px] text-center lg:mx-0 lg:text-left">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45] dark:text-[#c6ad86]">
                {t('hero.eyebrow')}
              </p>
              <h1 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(34px, 4.6vw, 54px)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
                {t('hero.title')}
              </h1>
              <p className="mx-auto mt-5 max-w-[440px] text-[16.5px] leading-[1.6] text-foreground/65 lg:mx-0">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
                <Link href="/register" className={`${CTA_PRIMARY} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaStart')}</Link>
                <Link href="/pricing" className={`${CTA_SECONDARY_ADAPTIVE} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaPricing')}</Link>
              </div>
              <p className="mt-3 text-[12.5px] leading-snug text-foreground/50">{t('hero.hint')}</p>
            </div>

            <div className="relative min-w-0">
              <span
                className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ background: '#e0a96d', color: '#1f1e1c', boxShadow: '0 8px 20px -8px rgba(224,169,109,0.7)' }}
              >
                {t('hero.demoHint')}
              </span>
              <EmployeeDatabaseDemo labels={demoLabels} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 2. BENTO: what's inside a card ─────────────── */}
      <section className="relative overflow-hidden bg-[#faf4ea] px-4 py-14 sm:px-6 sm:py-16">
        <PlatformBackdrop tone="warm" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45]">
              {t('bento.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
              {t('bento.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-[#1f1e1c]/65">
              {t('bento.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bentoTiles.map(({ title, desc, Icon, accent }, i) => (
              <div
                key={title}
                className={`group rounded-3xl border border-[#ded8cc] bg-[#fffdf8] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(31,30,28,0.35)] dark:border-white/10 dark:bg-[#171a1f] ${i === 0 || i === 3 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                  style={{ background: `${accent}1a`, color: accent }}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold text-foreground" style={{ letterSpacing: '-0.015em' }}>
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-foreground/65">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 3. CHAOS → ONE CARD (dark ink) ─────────────── */}
      <section className="relative overflow-hidden bg-[#1f1e1c] px-4 py-16 text-white sm:px-6 sm:py-20">
        <PlatformBackdrop tone="ink" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c6ad86]">
              {t('chaos.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {t('chaos.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.65] text-white/65">
              {t('chaos.subtitle')}
            </p>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            {/* Scattered chaos chips */}
            <div className="flex flex-col gap-3">
              {[t('chaos.item1'), t('chaos.item2'), t('chaos.item3'), t('chaos.item4')].map((item, i) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-[13.5px] leading-snug text-white/75 backdrop-blur-sm"
                  style={{
                    transform: `rotate(${[-1.6, 1.2, -0.8, 1.8][i]}deg) translateX(${[0, 14, 4, 18][i]}px)`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <ArrowRight size={26} strokeWidth={2.4} className="mx-auto rotate-90 text-[#e0a96d] md:rotate-0" />

            {/* One card */}
            <div className="rounded-3xl border border-[#e0a96d]/40 bg-[#26241f] p-5 shadow-[0_30px_80px_-40px_rgba(224,169,109,0.45)]">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e0a96d] text-[15px] font-bold text-[#1f1e1c]">
                  {demoLabels.employees[0].name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-bold text-white">{demoLabels.employees[0].name}</div>
                  <div className="truncate text-[11.5px] text-white/55">{demoLabels.departments[0]} · {demoLabels.employees[0].role}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-[12.5px] text-white/80">
                {[
                  [demoLabels.phone, demoLabels.employees[0].phone],
                  [demoLabels.docNames[0], demoLabels.docSigned],
                  [demoLabels.datesTenure, demoLabels.employees[0].tenure],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] px-3 py-2">
                    <span className="text-white/50">{k}</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-white">
                      <Check size={12} strokeWidth={2.8} className="text-[#2f9e6f]" />
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-9 max-w-2xl rounded-2xl border border-[#e0a96d]/30 bg-[#e0a96d]/10 px-5 py-4 text-center">
            <p className="text-[14.5px] leading-[1.55] text-white/85">
              <span className="font-semibold text-[#e0a96d]">{t('chaos.resultTitle')}</span>{' '}
              {t('chaos.resultText')}
            </p>
          </div>

          <div className="mt-7 text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#e0a96d] px-7 py-3 text-[14.5px] font-semibold text-[#1f1e1c] transition-transform hover:-translate-y-0.5"
            >
              {t('chaos.cta')}
              <ArrowRight size={16} strokeWidth={2.5} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── 4. PART OF THE PLATFORM ─────────────── */}
      <RestSection
        labels={{
          eyebrow: t('rest.eyebrow'),
          title: t('rest.title'),
          subtitle: t('rest.subtitle'),
          more: t('rest.more'),
          cards: [
            { title: t('rest.c1Title'), desc: t('rest.c1Desc'), note: t('rest.c1Note'), href: '/platform/schedule-grid' },
            { title: t('rest.c2Title'), desc: t('rest.c2Desc'), note: t('rest.c2Note'), href: '/platform/hr-dashboard' },
            { title: t('rest.c3Title'), desc: t('rest.c3Desc'), note: t('rest.c3Note'), href: '/platform/onboarding' },
          ],
        }}
      />

      {/* ─────────────── 5. FINAL CTA ─────────────── */}
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
