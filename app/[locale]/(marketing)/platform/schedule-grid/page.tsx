import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Calendar, Layers, BarChart3, Moon,
  Hand, Sparkles, ArrowRight, Check, X,
  Send, ArrowLeftRight, Quote,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { InteractiveScheduleDemo } from '@/components/marketing/interactive-schedule-demo'
import { HeroGridMockup } from '@/components/marketing/hero-grid-mockup'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.scheduleGrid.hero' })
  return {
    title: `Smengo · ${t('title')}`,
    description: t('subtitle'),
  }
}

// Single CTA style — used everywhere
const CTA_PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-[#e0a96d] px-6 py-3 text-[14.5px] font-semibold text-[#1f1e1c] shadow-[0_8px_24px_-8px_rgba(224,169,109,0.65)] transition-transform hover:-translate-y-0.5 hover:bg-[#d49a5a]'

const CTA_SECONDARY_LIGHT =
  'inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-white/10'

const CTA_SECONDARY_DARK =
  'inline-flex items-center justify-center rounded-full border border-[#1f1e1c]/15 px-6 py-3 text-[14.5px] font-medium text-[#1f1e1c] transition-colors hover:bg-[#1f1e1c]/5'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ScheduleGridPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.scheduleGrid' })

  const weekdays = (await getTranslations({ locale, namespace: 'marketing.scheduleGrid.demo' })).raw('weekdays') as string[]

  return (
    <div className="overflow-x-hidden">

      {/* ──────────────────────── 1. HERO — DARK ──────────────────────── */}
      <section className="bg-[#1f1e1c] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e0a96d]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#e0a96d]">
              <Calendar size={12} strokeWidth={2.5} />
              {t('hero.eyebrow')}
            </span>
            <h1 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.025em', lineHeight: 1.04 }}>
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-[520px] text-[17px] leading-[1.6] text-white/70">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className={CTA_PRIMARY}>{t('hero.ctaStart')}</Link>
              <Link href="/pricing" className={CTA_SECONDARY_LIGHT}>{t('hero.ctaPricing')}</Link>
              <span className="text-[12.5px] text-white/55">{t('hero.hint')}</span>
            </div>
          </div>

          <div>
            <HeroGridMockup weekdays={weekdays} offLabel={t('demo.off')} />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 2. INTERACTIVE DEMO — CREAM ──────────────────────── */}
      <section className="bg-[#faf4ea] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-flex rounded-full bg-[#3b6fd4]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3b6fd4]">
              {t('demo.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
              {t('demo.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-[#1f1e1c]/65">
              {t('demo.subtitle')}
            </p>
          </div>

          <div className="mt-12">
            <InteractiveScheduleDemo
              dict={{
                eyebrow:           t('demo.eyebrow'),
                title:             t('demo.title'),
                subtitle:          t('demo.subtitle'),
                week:              t('demo.week'),
                month:             t('demo.month'),
                departmentLabel:   t('demo.departmentLabel'),
                deptAll:           t('demo.deptAll'),
                deptKitchen:       t('demo.deptKitchen'),
                deptHall:          t('demo.deptHall'),
                deptBar:           t('demo.deptBar'),
                coverageLabel:     t('demo.coverageLabel'),
                coverageGood:      t('demo.coverageGood'),
                coverageGapPrefix: t('demo.coverageGapPrefix'),
                off:               t('demo.off'),
                hoursShort:        t('demo.hoursShort'),
                weekdays,
                tooltipRole:       t('demo.tooltipRole'),
                tooltipHours:      t('demo.tooltipHours'),
                tooltipCoverage:   t('demo.tooltipCoverage'),
              }}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 3. CAPABILITIES — WHITE ──────────────────────── */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <span className="mb-3 inline-flex rounded-full bg-[#2f9e6f]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f9e6f]">
              {t('caps.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('caps.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-16">
            <CapRow side="left"  accent="#3b6fd4" Icon={Layers}    title={t('caps.i1Title')} desc={t('caps.i1Desc')} />
            <CapRow side="right" accent="#2f9e6f" Icon={BarChart3} title={t('caps.i2Title')} desc={t('caps.i2Desc')} />
            <CapRow side="left"  accent="#7c5cc4" Icon={Calendar}  title={t('caps.i3Title')} desc={t('caps.i3Desc')} />
            <CapRow side="right" accent="#e0a96d" Icon={Moon}      title={t('caps.i4Title')} desc={t('caps.i4Desc')} />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 4. MANUAL vs AI — DARK ──────────────────────── */}
      <section className="bg-[#1f1e1c] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <span className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
              {t('ways.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('ways.title')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Manual — sand */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0a96d] text-[#1f1e1c]">
                  <Hand size={20} strokeWidth={2} />
                </span>
                <span className="rounded-full bg-[#e0a96d]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e0a96d]">
                  {t('ways.manualBadge')}
                </span>
              </div>
              <h3 className="text-[22px] font-semibold text-white">{t('ways.manualTitle')}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-white/65">{t('ways.manualDesc')}</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {[t('ways.manualB1'), t('ways.manualB2'), t('ways.manualB3')].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[14.5px] text-white/85">
                    <Check size={16} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#e0a96d]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI — purple */}
            <div className="relative overflow-hidden rounded-3xl border border-[#7c5cc4]/40 bg-white/5 p-8 backdrop-blur-sm">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, #7c5cc4, transparent)' }}
              />
              <div className="relative mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7c5cc4] text-white">
                  <Sparkles size={20} strokeWidth={2} />
                </span>
                <span className="rounded-full bg-[#7c5cc4]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b89ee8]">
                  {t('ways.aiBadge')}
                </span>
              </div>
              <h3 className="relative text-[22px] font-semibold text-white">{t('ways.aiTitle')}</h3>
              <p className="relative mt-2 text-[15px] leading-[1.55] text-white/65">{t('ways.aiDesc')}</p>
              <ul className="relative mt-5 flex flex-col gap-2.5">
                {[t('ways.aiB1'), t('ways.aiB2'), t('ways.aiB3')].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[14.5px] text-white/85">
                    <Check size={16} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#b89ee8]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── 5. EXCEL vs SMENGO — BLUE ──────────────────────── */}
      <section className="bg-[#3b6fd4] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              {t('vs.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('vs.title')}
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/15">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-white/8 px-6 py-5 text-center md:text-left">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/55">
                  <X size={14} strokeWidth={2.4} /> {t('vs.excelTitle')}
                </span>
              </div>
              <div className="bg-white px-6 py-5 text-center md:text-left">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2f9e6f]">
                  <Check size={14} strokeWidth={2.6} /> {t('vs.smengoTitle')}
                </span>
              </div>

              {[
                [t('vs.r1Excel'), t('vs.r1Smengo')],
                [t('vs.r2Excel'), t('vs.r2Smengo')],
                [t('vs.r3Excel'), t('vs.r3Smengo')],
                [t('vs.r4Excel'), t('vs.r4Smengo')],
                [t('vs.r5Excel'), t('vs.r5Smengo')],
              ].map(([ex, sm], i) => (
                <VsRow key={i} excel={ex} smengo={sm} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── 6. WORKS WITH THE REST — CREAM ──────────────────────── */}
      <section className="bg-[#faf4ea] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <span className="mb-3 inline-flex rounded-full bg-[#7c5cc4]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c5cc4]">
              {t('rest.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('rest.title')}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <RestCard accent="#3b6fd4" Icon={Send}           title={t('rest.c1Title')} desc={t('rest.c1Desc')} href="/platform/telegram-bot" more={t('rest.more')} />
            <RestCard accent="#7c5cc4" Icon={Sparkles}       title={t('rest.c2Title')} desc={t('rest.c2Desc')} href="/platform/ai-assistant" more={t('rest.more')} />
            <RestCard accent="#2f9e6f" Icon={ArrowLeftRight} title={t('rest.c3Title')} desc={t('rest.c3Desc')} href="/platform/shift-swaps"  more={t('rest.more')} />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 7. SOCIAL PROOF + STAT — WHITE ──────────────────────── */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <span className="mb-3 inline-flex rounded-full bg-[#1f1e1c]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f1e1c]/70">
              {t('proof.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('proof.title')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <figure className="relative rounded-3xl border border-[#1f1e1c]/10 bg-[#faf4ea] p-8">
              <Quote size={32} className="text-[#e0a96d]" />
              <blockquote className="mt-4 font-serif text-[20px] leading-[1.45] text-[#1f1e1c]">
                “{t('proof.quote')}”
              </blockquote>
              <figcaption className="mt-5">
                <div className="text-[14px] font-semibold text-[#1f1e1c]">{t('proof.author')}</div>
                <div className="text-[13px] text-[#1f1e1c]/55">{t('proof.role')}</div>
                <div className="mt-2 inline-flex rounded-md bg-[#1f1e1c]/8 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-[#1f1e1c]/55">
                  {t('proof.stub')}
                </div>
              </figcaption>
            </figure>

            <div className="flex flex-col justify-center rounded-3xl bg-[#2f9e6f] p-8 text-white">
              <div className="font-serif font-bold leading-none" style={{ fontSize: 'clamp(60px, 8vw, 96px)', letterSpacing: '-0.04em' }}>
                {t('proof.statNum')}
              </div>
              <div className="mt-3 text-[17px] font-medium leading-snug text-white/90">
                {t('proof.statLabel')}
              </div>
              <div className="mt-4 inline-flex w-fit rounded-md bg-white/15 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-white/85">
                {t('proof.statNote')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── 8. FINAL CTA — SAND ──────────────────────── */}
      <section className="relative overflow-hidden bg-[#e0a96d] px-4 py-24 sm:px-6 sm:py-28">
        {/* Subtle grid-pattern background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #1f1e1c 1px, transparent 1px), linear-gradient(to bottom, #1f1e1c 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(32px, 4.6vw, 54px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}>
            {t('final.title')}
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-[#1f1e1c]/75">
            {t('final.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#1f1e1c] px-7 py-3 text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-black">
              {t('final.ctaStart')}
            </Link>
            <Link href="/pricing" className={CTA_SECONDARY_DARK}>{t('final.ctaPricing')}</Link>
          </div>
          <div className="mt-4 text-[12.5px] text-[#1f1e1c]/70">{t('final.hint')}</div>
        </div>
      </section>
    </div>
  )
}

// ──────────────────────── Sub-components ────────────────────────

function CapRow({
  side, accent, Icon, title, desc,
}: {
  side: 'left' | 'right'
  accent: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className={side === 'left' ? 'md:order-1' : 'md:order-2'}>
        <span
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <h3 className="text-[22px] font-semibold text-[#1f1e1c] sm:text-[26px]" style={{ letterSpacing: '-0.018em', lineHeight: 1.18 }}>
          {title}
        </h3>
        <p className="mt-3 max-w-[460px] text-[15.5px] leading-[1.6] text-[#1f1e1c]/65">
          {desc}
        </p>
      </div>

      <div className={side === 'left' ? 'md:order-2' : 'md:order-1'}>
        <MiniGridVisual accent={accent} />
      </div>
    </div>
  )
}

function MiniGridVisual({ accent }: { accent: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
        style={{ background: `radial-gradient(60% 60% at 50% 50%, ${accent}55, transparent 70%)` }}
      />
      <div className="relative grid grid-cols-7 gap-1.5 rounded-2xl border border-[#1f1e1c]/10 bg-white p-4">
        {Array.from({ length: 28 }).map((_, i) => {
          const pattern = (i * 3 + (i % 5)) % 7
          const fill = pattern === 0 || pattern === 3 || pattern === 5
          const isWeekend = i % 7 >= 5
          return (
            <div
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: fill ? accent : isWeekend ? '#faf4ea' : '#f5f3ef',
                opacity: fill ? 0.85 : 1,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function VsRow({ excel, smengo }: { excel: string; smengo: string }) {
  return (
    <>
      <div className="flex items-start gap-3 border-t border-white/10 bg-white/5 px-6 py-5 text-[14.5px] text-white/65 md:border-r">
        <X size={16} strokeWidth={2.4} className="mt-0.5 shrink-0 text-white/45" />
        <span className="line-through decoration-white/30">{excel}</span>
      </div>
      <div className="flex items-start gap-3 border-t border-black/8 bg-white px-6 py-5 text-[14.5px] font-medium text-[#1f1e1c]">
        <Check size={16} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#2f9e6f]" />
        <span>{smengo}</span>
      </div>
    </>
  )
}

function RestCard({
  accent, Icon, title, desc, href, more,
}: {
  accent: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  desc: string
  href: string
  more: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-[#1f1e1c]/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(31,30,28,0.25)]"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
    >
      <span
        className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1f`, color: accent }}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <h3 className="text-[17px] font-semibold text-[#1f1e1c]">{title}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-[1.55] text-[#1f1e1c]/60">{desc}</p>
      <span
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ color: accent }}
      >
        {more}
        <ArrowRight size={14} strokeWidth={2.4} />
      </span>
    </Link>
  )
}
