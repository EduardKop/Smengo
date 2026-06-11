import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Calendar, Send, ArrowLeftRight, Sparkles, LayoutDashboard, GraduationCap,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import {
  RestaurantIcon, RetailIcon, ServicesIcon, ClinicIcon, LogisticsIcon,
  ProductionIcon, SalesIcon, ITIcon, ArbitrageIcon,
  type IndustrySlug,
} from '@/components/marketing/built-for-icons'
import { ParallaxLayer } from '@/components/marketing/parallax-layer'
import { SketchHighlight } from '@/components/marketing/sketch-highlight'
import { SpinningText } from '@/components/marketing/spinning-text'
import { ParallaxChips } from '@/components/marketing/parallax-chips'
import { ComingSoon } from '@/components/marketing/coming-soon'


export const revalidate = 3600

const VALID_SLUGS: IndustrySlug[] = [
  'restaurants', 'retail', 'services', 'clinics',
  'logistics', 'production', 'sales', 'it', 'arbitrage',
]

const ICON_FOR: Record<IndustrySlug, (p: { size?: number }) => React.ReactElement> = {
  restaurants: RestaurantIcon,
  retail: RetailIcon,
  services: ServicesIcon,
  clinics: ClinicIcon,
  logistics: LogisticsIcon,
  production: ProductionIcon,
  sales: SalesIcon,
  it: ITIcon,
  arbitrage: ArbitrageIcon,
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug: IndustrySlug }[] = []
  for (const locale of routing.locales) {
    for (const slug of VALID_SLUGS) params.push({ locale, slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!VALID_SLUGS.includes(slug as IndustrySlug)) return {}
  const t = await getTranslations({ locale, namespace: 'marketing.builtFor' })
  return {
    title: `Smengo · ${t(`items.${slug}` as Parameters<typeof t>[0])}`,
  }
}

export default async function BuiltForPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  if (!VALID_SLUGS.includes(slug as IndustrySlug)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'marketing.builtFor' })
  const label = t(`items.${slug}` as Parameters<typeof t>[0])
  const Icon = ICON_FOR[slug as IndustrySlug]

  // Only restaurants has full content for now
  if (slug !== 'restaurants') {
    return <ComingSoon locale={locale} label={label} icon={<Icon size={36} />} variant="industry" />
  }

  return <RestaurantsPage label={label} locale={locale} />
}

// ──────────────────────────────────────────────────────────────────────
// RESTAURANTS — full page
// ──────────────────────────────────────────────────────────────────────
async function RestaurantsPage({
  label,
  locale,
}: {
  label: string
  locale: Locale
}) {
  const img = '/img/restaurants'
  const t = await getTranslations({ locale, namespace: 'marketing.builtForRestaurants' })

  const features: { key: 'schedule' | 'telegram' | 'swaps' | 'ai' | 'hr' | 'onboarding'; Icon: LucideIcon; color: string }[] = [
    { key: 'schedule',   Icon: Calendar,        color: '#2563eb' }, // синий   — планирование
    { key: 'telegram',   Icon: Send,            color: '#0284c7' }, // небесный — Telegram
    { key: 'swaps',      Icon: ArrowLeftRight,  color: '#16a34a' }, // зелёный  — замены
    { key: 'ai',         Icon: Sparkles,        color: '#7c3aed' }, // фиолет   — AI
    { key: 'hr',         Icon: LayoutDashboard, color: '#ea580c' }, // оранж    — HR
    { key: 'onboarding', Icon: GraduationCap,   color: '#0891b2' }, // циан     — обучение
  ]

  const painKeys = ['1', '2', '3'] as const
  const stepKeys = ['1', '2', '3'] as const
  const roiKeys  = ['1', '2', '3'] as const
  const chipLabels = ['1','2','3','4','5','6'].map(k => t(`pain.chip${k}` as 'pain.chip1'))

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ── Block 1: Hero ─────────────────────────────────────────── */}
      <section className="px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">

          {/* Left: copy */}
          <div
            className="animate-fade-in-up"
            style={{ ['--delay' as string]: '0ms' }}
          >
            <p className="mb-5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-foreground/70">
              {t('hero.eyebrowBefore')}<SketchHighlight color="var(--accent)" action="underline" strokeWidth={2.5} padding={2}>{t('hero.eyebrowAccent')}</SketchHighlight>
            </p>

            <h1
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(36px, 4.8vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.06 }}
            >
              {t('hero.title', { label })}
            </h1>

            <p className="mt-5 max-w-[500px] text-[16.5px] leading-[1.6] text-muted-foreground">
              {t('hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t('hero.ctaStart')}
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                {t('hero.ctaPricing')}
              </Link>
              <span className="text-[12.5px] text-muted-foreground/80">{t('hero.ctaHint')}</span>
            </div>
          </div>

          {/* Right: main photo (no floating chip) */}
          <div
            className="relative animate-fade-in-up"
            style={{ ['--delay' as string]: '80ms' }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: 20,
                boxShadow: '0 24px 64px -24px rgba(31,30,28,0.45)',
                border: '1px solid var(--border)',
              }}
            >
              <ParallaxLayer speed={0.15} maxOffset={70}>
                <Image
                  src={`${img}/main.jpg`}
                  alt={t('hero.imageAlt')}
                  width={760}
                  height={520}
                  className="block w-full object-cover"
                  style={{
                    aspectRatio: '4/3',
                    filter: 'brightness(0.97) saturate(1.05)',
                    transform: 'scale(1.18)',
                    transformOrigin: 'center',
                  }}
                  priority
                />
              </ParallaxLayer>
              {/* Warm overlay to harmonize with sand palette */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(31,30,28,0.45) 0%, rgba(31,30,28,0.08) 40%, transparent 70%)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Block 2: Pain → Solution ──────────────────────────────── */}
      <section className="relative px-4 py-20 sm:px-6">
        <ParallaxChips labels={chipLabels} />

        <div className="relative z-10 mx-auto max-w-6xl rounded-3xl border border-border/50 bg-card px-8 py-12 shadow-sm sm:px-12 sm:py-16">
          <div className="mb-12 flex items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p
                className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'var(--accent)' }}
              >
                {t('pain.eyebrow')}
              </p>
              <h2
                className="font-serif font-semibold text-foreground"
                style={{
                  fontSize: 'clamp(28px, 3.4vw, 42px)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.12,
                }}
              >
                {t('pain.titleLine1')}<br />{t('pain.titleLine2')}
              </h2>
            </div>

            {/* Spinning text badge — desktop only */}
            <div className="hidden shrink-0 lg:block">
              <SpinningText
                radius={58}
                duration={14}
                fontSize={10.5}
                color="currentColor"
                className="text-foreground/75"
              >
                {t('pain.spinText')}
              </SpinningText>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {painKeys.map((k, i) => {
              const PainIcon = i === 0 ? PainChairIcon : i === 1 ? PainChatIcon : PainCalendarIcon
              return (
                <div
                  key={k}
                  className="grid items-center gap-4 md:grid-cols-[1fr_56px_1fr] md:gap-0"
                >
                  {/* Pain — muted, no card */}
                  <div className="flex items-center gap-4 py-5 pr-0 md:pr-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
                      <span className="text-foreground/50 dark:text-foreground/60">
                        <PainIcon />
                      </span>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">
                        {t('pain.painLabel')}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: 17, lineHeight: 1.55 }}>
                        {t(`pain.items.${k}.pain` as 'pain.items.1.pain')}
                      </p>
                    </div>
                  </div>

                  {/* Arrow — centered */}
                  <div
                    className="flex items-center justify-center"
                    style={{ color: 'var(--accent)' }}
                    aria-hidden="true"
                  >
                    <span className="hidden md:inline-flex">
                      <SketchyArrowRight />
                    </span>
                    <span className="ml-14 inline-flex opacity-70 md:hidden">
                      <SketchyArrowDown />
                    </span>
                  </div>

                  {/* Solution — green card */}
                  <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 px-5 pb-5 pt-6 transition-opacity duration-200 hover:opacity-95 dark:border-emerald-800/40 dark:bg-emerald-950/60 md:ml-4">
                    {/* Решено — sticker */}
                    <span
                      className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-emerald-200 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                      style={{
                        transform: 'rotate(-2deg)',
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.10)',
                        display: 'inline-flex',
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                      {t('pain.solved')}
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-100" style={{ fontSize: 17, lineHeight: 1.55 }}>
                      {t(`pain.items.${k}.fix` as 'pain.items.1.fix')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Block 3: Restaurant-relevant features ──────────────────── */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <p
              className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--accent)' }}
            >
              {t('features.eyebrow')}
            </p>
            <h2
              className="font-serif font-semibold text-foreground"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 42px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
              }}
            >
              {t('features.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ key, Icon: FIcon, color }) => (
              <div
                key={key}
                className="group flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: color,
                  boxShadow: `0 8px 32px -8px ${color}99`,
                }}
              >
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <FIcon className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-[18px] font-semibold text-white">
                  {t(`features.items.${key}.title` as 'features.items.schedule.title')}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-white/75">
                  {t(`features.items.${key}.desc` as 'features.items.schedule.desc')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Block 4: 3 steps + photo 2 ─────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div>
              <h2
                className="font-serif font-semibold text-foreground"
                style={{ fontSize: 'clamp(26px, 3.2vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 440 }}
              >
                {t('steps.title')}
              </h2>
              <div className="mt-10 flex flex-col gap-8">
                {stepKeys.map((k, idx) => (
                  <div key={k} className="flex items-start gap-5">
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                      style={{
                        width: 34,
                        height: 34,
                        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                        color: 'var(--accent)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-semibold text-foreground">
                        {t(`steps.items.${k}.title` as 'steps.items.1.title')}
                      </h3>
                      <p className="mt-1 text-[14.5px] leading-[1.55] text-muted-foreground">
                        {t(`steps.items.${k}.desc` as 'steps.items.1.desc')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="hidden overflow-hidden lg:block"
              style={{
                borderRadius: 20,
                boxShadow: '0 20px 56px -20px rgba(31,30,28,0.32)',
                border: '1px solid var(--border)',
              }}
            >
              <Image
                src={`${img}/2.jpg`}
                alt={t('steps.imageAlt')}
                width={420}
                height={520}
                className="block w-full object-cover"
                style={{ aspectRatio: '4/5', filter: 'brightness(0.95) saturate(1.06) sepia(0.04)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Block 5: ROI / metric ──────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(26px, 3.2vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              {t('roi.title')}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-muted-foreground">
              {t('roi.subtitle')}
            </p>
            <ul className="mt-7 flex flex-col gap-3.5">
              {roiKeys.map((k) => (
                <li key={k} className="flex items-start gap-3 text-[15px] text-foreground">
                  <span
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                  {t(`roi.items.${k}` as 'roi.items.1')}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-3xl border p-8 text-center"
            style={{ background: 'var(--surface, var(--muted))', borderColor: 'var(--border)' }}
          >
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {t('roi.metricLabel')}
            </p>
            <p
              className="mt-3 font-serif font-semibold leading-none"
              style={{ fontSize: 72, color: 'var(--accent)', letterSpacing: '-0.03em' }}
            >
              +18%
            </p>
            <p className="mt-4 text-[12.5px] leading-[1.6] text-muted-foreground/70">
              {t('roi.metricCaption')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Block 6: Testimonial ───────────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <figure className="overflow-hidden rounded-3xl border border-border bg-background">
            <div className="grid lg:grid-cols-[1fr_200px]">
              <div className="p-8 sm:p-10">
                <blockquote
                  className="font-serif text-foreground"
                  style={{ fontSize: 'clamp(19px, 2vw, 25px)', lineHeight: 1.45, letterSpacing: '-0.01em' }}
                >
                  «{t('testimonial.quote')}»
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
                    style={{ border: '1.5px solid var(--border)' }}
                  >
                    <Image
                      src={`${img}/1.jpg`}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{t('testimonial.author')}</p>
                    <p className="text-[12.5px] text-muted-foreground/60">{t('testimonial.role')}</p>
                  </div>
                </figcaption>
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* ── Block 7: Final CTA — 3.jpg full-width bg ──────────────── */}
      <section className="relative overflow-hidden px-4 py-28 sm:px-6">
        <ParallaxLayer
          speed={0.15}
          maxOffset={90}
          className="pointer-events-none absolute inset-0"
          style={{ transform: 'scale(1.18)', transformOrigin: 'center' }}
        >
          <Image
            src={`${img}/3.jpg`}
            alt=""
            fill
            className="object-cover object-center"
            style={{ filter: 'brightness(0.55) saturate(1.1) sepia(0.08)' }}
            aria-hidden="true"
          />
        </ParallaxLayer>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(31,30,28,0.72) 0%, rgba(31,30,28,0.80) 100%)' }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2
            className="font-serif font-semibold"
            style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em', lineHeight: 1.12, color: '#f5f3ef' }}
          >
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-[16px]" style={{ color: 'rgba(245,243,239,0.7)', lineHeight: 1.6 }}>
            {t('cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="cta-sand rounded-full px-7 py-3 text-[14px] font-semibold transition-colors"
              style={{ background: '#e0a96d', color: '#1f1e1c' }}
            >
              {t('cta.ctaStart')}
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border px-7 py-3 text-[14px] font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(245,243,239,0.35)', color: '#f5f3ef' }}
            >
              {t('cta.ctaPricing')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Hand-drawn icons (pain + check) — used in Block 2
// Slightly wobbly strokes, rounded caps, no fills. Warm + friendly.
// ──────────────────────────────────────────────────────────────────────
const HD_STROKE = {
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
}

function PainChairIcon() {
  // Empty chair — "the staff member who didn't show up"
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <g {...HD_STROKE}>
        <path d="M11 8.5c2-.8 4.2-1.1 6.6-1.1 3 0 5.8.3 8.4 1.2" />
        <path d="M11.2 8.5c-.2 3 .1 6 .7 8.8.2 1 .9 1.5 1.9 1.6 3.6.3 7.2.3 10.8 0 1-.1 1.7-.6 1.9-1.6.6-2.8.9-5.8.7-8.8" />
        <path d="M11.6 18.8c-.3 2.7-.2 5.4.2 8" />
        <path d="M26.5 18.8c.3 2.7.2 5.4-.2 8" />
        <path d="M14 27.5l-1.4 5.2" />
        <path d="M24.2 27.5l1.4 5.2" />
      </g>
    </svg>
  )
}

function PainChatIcon() {
  // Tangled chat bubbles — "messages in three chats"
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <g {...HD_STROKE}>
        <path d="M7 11c0-1.8 1.5-3.2 3.4-3.2h10.2c1.9 0 3.4 1.4 3.4 3.2v5.6c0 1.8-1.5 3.2-3.4 3.2h-7l-3.8 3.1c-.3.3-.8 0-.8-.4v-2.7c-1.1-.4-2-1.5-2-2.8z" />
        <path d="M16 24.5c.4 1.4 1.7 2.4 3.2 2.4h7.6l3.5 2.9c.3.2.7 0 .7-.4v-2.5c1-.4 1.8-1.4 1.8-2.6v-4.6c0-1.4-1.1-2.5-2.5-2.5" />
      </g>
    </svg>
  )
}

function PainCalendarIcon() {
  // Calendar with a question — "weekend chaos"
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <g {...HD_STROKE}>
        <path d="M9 12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v17c0 1.1-.9 2-2 2H11c-1.1 0-2-.9-2-2z" />
        <path d="M9.2 16.5c7.2-.4 14.4-.4 21.6 0" />
        <path d="M14 7.5v4" />
        <path d="M26 7.5v4" />
        <path d="M18.4 22.5c.3-1.1 1.4-1.9 2.6-1.8 1.3.1 2.3 1.2 2.3 2.5 0 1.6-2.2 1.8-2.2 3.3" />
        <path d="M21.1 28.8v.05" />
      </g>
    </svg>
  )
}

function SketchyArrowRight() {
  // Hand-drawn marker-style arrow pointing right (desktop)
  return (
    <svg width="96" height="44" viewBox="0 0 96 44" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M4 23c12-2.5 24-2.8 36-1.5 14 1.5 28 2 42 .8" />
        <path d="M74 12.5c3.5 3.4 7.2 6.6 11 9.5-3.9 2.7-7.6 5.8-11 9.2" />
      </g>
    </svg>
  )
}

function SketchyArrowDown() {
  // Hand-drawn marker-style arrow pointing down (mobile)
  return (
    <svg width="44" height="72" viewBox="0 0 44 72" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M22 4c-1.5 10-1.8 20-.8 30 .8 8 1 17 .4 28" />
        <path d="M12 56c3.4 3.5 6.6 7.2 9.5 11 2.7-3.9 5.8-7.6 9.2-11" />
      </g>
    </svg>
  )
}
