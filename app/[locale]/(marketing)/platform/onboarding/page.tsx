import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  FileCheck2, Handshake, GraduationCap, Award,
  ClipboardList, UserCheck, Compass,
  ArrowRight, Check, X, type LucideIcon,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { OnboardingDemo, type OnboardingDemoLabels } from '@/components/marketing/onboarding-demo'
import {
  CTA_PRIMARY, CTA_SECONDARY_ADAPTIVE,
  PlatformBackdrop, FinalCtaSection,
} from '@/components/marketing/platform-sales-sections'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_URL = 'https://smengo.com'
const PAGE_PATH = '/platform/onboarding'

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
  const t = await getTranslations({ locale, namespace: 'marketing.onboarding.seo' })
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

const TIMELINE_ICONS: LucideIcon[] = [FileCheck2, Handshake, GraduationCap, Award]
const TIMELINE_ACCENTS = ['#3b6fd4', '#d0773f', '#b8862f', '#2f9e6f']
const PERSONA_ICONS: LucideIcon[] = [ClipboardList, UserCheck, Compass]
const PERSONA_ACCENTS = ['#d0773f', '#3b6fd4', '#2f9e6f']

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.onboarding' })
  const demoLabels = t.raw('demoLabels') as OnboardingDemoLabels
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

  const timelineSteps = [0, 1, 2, 3].map((i) => ({
    title: t(`timeline.s${i + 1}Title` as Parameters<typeof t>[0]),
    desc: t(`timeline.s${i + 1}Desc` as Parameters<typeof t>[0]),
    Icon: TIMELINE_ICONS[i],
    accent: TIMELINE_ACCENTS[i],
  }))

  const personas = [0, 1, 2].map((i) => ({
    title: t(`personas.p${i + 1}Title` as Parameters<typeof t>[0]),
    desc: t(`personas.p${i + 1}Desc` as Parameters<typeof t>[0]),
    chip: t(`personas.p${i + 1}Chip` as Parameters<typeof t>[0]),
    Icon: PERSONA_ICONS[i],
    accent: PERSONA_ACCENTS[i],
  }))

  const flowSteps = [
    { label: t('flow.s1'), href: '/platform/hr-management' },
    { label: t('flow.s2'), href: null },
    { label: t('flow.s3'), href: '/platform/schedule-grid' },
    { label: t('flow.s4'), href: '/platform/hr-dashboard' },
  ]

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* ─────────────── 1. HERO with mini-stepper ─────────────── */}
      <section className="relative overflow-hidden">
        <PlatformBackdrop tone="light" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[680px] text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45] dark:text-[#c6ad86]">
              {t('hero.eyebrow')}
            </p>
            <h1 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.025em', lineHeight: 1.04 }}>
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-[500px] text-[17px] leading-[1.6] text-foreground/65">
              {t('hero.subtitle')}
            </p>

            {/* Hero stepper motif */}
            <div className="mx-auto mt-7 flex max-w-[420px] items-center justify-center">
              {[t('hero.stepDay1'), t('hero.stepWeek'), t('hero.stepMonth')].map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold"
                    style={{
                      borderColor: i === 0 ? '#2f9e6f' : 'var(--border)',
                      background: i === 0 ? 'color-mix(in oklab, #2f9e6f 12%, transparent)' : 'var(--surface)',
                      color: i === 0 ? '#2f9e6f' : 'var(--muted-foreground)',
                    }}
                  >
                    {i === 0 && <Check size={12} strokeWidth={3} />}
                    {step}
                  </span>
                  {i < 2 && <span aria-hidden="true" className="mx-1.5 h-px flex-1" style={{ background: 'var(--border)' }} />}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
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
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45]">
              {t('demo.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
              {t('demo.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-[#1f1e1c]/65">
              {t('demo.subtitle')}
            </p>
          </div>
          <div className="mt-10">
            <OnboardingDemo labels={demoLabels} />
          </div>
        </div>
      </section>

      {/* ─────────────── 3. 30-DAY TIMELINE — WHITE ─────────────── */}
      <section className="relative overflow-hidden bg-white px-4 py-14 dark:bg-background sm:px-6 sm:py-16">
        <PlatformBackdrop tone="light" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45] dark:text-[#c6ad86]">
              {t('timeline.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('timeline.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-foreground/65">
              {t('timeline.subtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-[26px] hidden h-px lg:block"
              style={{ background: 'linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent)' }}
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {timelineSteps.map(({ title, desc, Icon, accent }, i) => (
                <div key={title} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  <span
                    className="relative z-10 inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-4"
                    style={{ background: `${accent}1a`, color: accent, borderColor: 'var(--background)' }}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <span
                    className="mt-4 font-serif text-[15px] font-bold tabular-nums"
                    style={{ color: accent, letterSpacing: '-0.01em' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 text-[18px] font-semibold text-foreground" style={{ letterSpacing: '-0.015em' }}>
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[280px] text-[14px] leading-[1.55] text-foreground/65">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 4. PERSONAS — GREEN-TINT ─────────────── */}
      <section className="relative overflow-hidden bg-[#eef4ee] px-4 py-14 dark:bg-[#121712] sm:px-6 sm:py-16">
        <PlatformBackdrop tone="green" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#4c7a5c] dark:text-[#a9b99e]">
              {t('personas.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('personas.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#5b6657] dark:text-[#aaa39a]">
              {t('personas.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {personas.map(({ title, desc, chip, Icon, accent }) => (
              <div
                key={title}
                className="flex min-w-0 flex-col rounded-3xl border border-[#cfdccf] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(31,30,28,0.35)] dark:border-white/10 dark:bg-[#171a1f]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${accent}1a`, color: accent }}>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className="text-[19px] font-semibold text-foreground" style={{ letterSpacing: '-0.015em' }}>
                    {title}
                  </h3>
                </div>
                <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/65">{desc}</p>
                <span
                  className="mt-auto inline-flex self-start rounded-full px-3 py-1.5 pt-1.5 text-[11.5px] font-bold"
                  style={{ background: `${accent}14`, color: accent, marginTop: '16px' }}
                >
                  {chip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 5. LIGHT COMPARE ─────────────── */}
      <section className="bg-background px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45] dark:text-[#c6ad86]">
              {t('compare.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {t('compare.title')}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-7">
              <h3 className="text-[16px] font-bold uppercase tracking-wide text-foreground/55">
                {t('compare.badTitle')}
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {[t('compare.bad1'), t('compare.bad2'), t('compare.bad3'), t('compare.bad4')].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] leading-[1.5] text-foreground/65">
                    <X size={16} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#d0584a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#2f9e6f]/30 bg-[#2f9e6f]/[0.06] p-7 shadow-[0_24px_60px_-40px_rgba(47,158,111,0.5)]">
              <h3 className="text-[16px] font-bold uppercase tracking-wide" style={{ color: '#2f9e6f' }}>
                {t('compare.goodTitle')}
              </h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {[t('compare.good1'), t('compare.good2'), t('compare.good3'), t('compare.good4')].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] font-medium leading-[1.5] text-foreground/85">
                    <Check size={16} strokeWidth={2.8} className="mt-0.5 shrink-0 text-[#2f9e6f]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 6. FLOW STRIP — CREAM ─────────────── */}
      <section className="relative overflow-hidden bg-[#f6f1e8] px-4 py-14 dark:bg-[#111317] sm:px-6 sm:py-16">
        <PlatformBackdrop tone="warm" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h2 className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]" style={{ fontSize: 'clamp(26px, 3.2vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            {t('flow.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15.5px] leading-[1.6] text-[#6d675d] dark:text-[#aaa39a]">
            {t('flow.subtitle')}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                {step.href ? (
                  <Link
                    href={step.href}
                    title={t('flow.linkLabel')}
                    className="group inline-flex items-center gap-2 rounded-full border border-[#ded8cc] bg-[#fffdf8] px-4 py-2.5 text-[13.5px] font-semibold text-foreground/75 transition-all hover:-translate-y-0.5 hover:border-[#d0773f]/50 hover:text-foreground dark:border-white/10 dark:bg-[#171a1f]"
                  >
                    {step.label}
                    <ArrowRight size={13} strokeWidth={2.5} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#1f1e1c] px-4 py-2.5 text-[13.5px] font-bold text-white shadow-[0_14px_36px_-18px_rgba(31,30,28,0.8)] dark:bg-[#e0a96d] dark:text-[#1f1e1c]">
                    {step.label}
                  </span>
                )}
                {i < flowSteps.length - 1 && (
                  <ArrowRight size={15} strokeWidth={2.4} className="shrink-0 text-[#1f1e1c]/30 dark:text-white/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 7. FINAL CTA ─────────────── */}
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
