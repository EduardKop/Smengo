import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { ParallaxLayer } from './parallax-layer'

/**
 * Shared building blocks for /platform/* sales pages (hr-dashboard,
 * hr-management). Visual idioms follow the schedule-grid page: serif
 * headings, cream/white/blue/sand section rhythm, parallax grid backdrop.
 */

export const CTA_PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-[#e0a96d] px-6 py-3 text-[14.5px] font-semibold text-[#1f1e1c] shadow-[0_8px_24px_-8px_rgba(224,169,109,0.65)] transition-transform hover:-translate-y-0.5 hover:bg-[#d49a5a]'

export const CTA_SECONDARY_ADAPTIVE =
  'inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 text-[14.5px] font-medium text-foreground transition-colors hover:bg-foreground/6'

export const CTA_SECONDARY_DARK =
  'inline-flex items-center justify-center rounded-full border border-[#1f1e1c]/15 px-6 py-3 text-[14.5px] font-medium text-[#1f1e1c] transition-colors hover:bg-[#1f1e1c]/5'

export type BackdropTone = 'light' | 'warm' | 'ink' | 'blue' | 'green' | 'sand'

const BACKDROP_TONES: Record<BackdropTone, { grid: string; track: string }> = {
  light: { grid: 'rgba(31,30,28,0.055)', track: 'rgba(31,30,28,0.10)' },
  warm:  { grid: 'rgba(31,30,28,0.06)',  track: 'rgba(134,106,69,0.16)' },
  ink:   { grid: 'rgba(255,255,255,0.055)', track: 'rgba(255,255,255,0.12)' },
  blue:  { grid: 'rgba(255,255,255,0.20)',  track: 'rgba(255,255,255,0.22)' },
  green: { grid: 'rgba(31,30,28,0.055)', track: 'rgba(47,158,111,0.15)' },
  sand:  { grid: 'rgba(31,30,28,0.10)',  track: 'rgba(31,30,28,0.18)' },
}

export function PlatformBackdrop({ tone }: { tone: BackdropTone }) {
  const colors = BACKDROP_TONES[tone]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <ParallaxLayer speed={0.035} maxOffset={32} className="absolute inset-x-0 -inset-y-20">
        <div
          className="h-full w-full opacity-70"
          style={{
            backgroundImage:
              `linear-gradient(to right, ${colors.grid} 1px, transparent 1px), ` +
              `linear-gradient(to bottom, ${colors.grid} 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />
      </ParallaxLayer>
      <ParallaxLayer speed={-0.055} maxOffset={48} className="absolute inset-x-0 top-4 hidden h-[430px] md:block">
        <div className="relative mx-auto h-full max-w-6xl">
          {[18, 34, 50, 66, 82].map((top) => (
            <span
              key={top}
              className="absolute left-[-8%] h-px w-[116%]"
              style={{
                top: `${top}%`,
                background: `linear-gradient(to right, transparent, ${colors.track}, transparent)`,
              }}
            />
          ))}
        </div>
      </ParallaxLayer>
    </div>
  )
}

export function SalesCapRow({
  side, accent, title, desc, visual, bullets, metric,
}: {
  side: 'left' | 'right'
  accent: string
  title: string
  desc: string
  visual: React.ReactNode
  bullets: string[]
  metric?: { value: string; label: string }
}) {
  return (
    <div className="grid min-w-0 items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-14">
      <div className={side === 'left' ? 'min-w-0 md:order-1' : 'min-w-0 md:order-2'}>
        <h3
          className="max-w-full text-balance break-words text-[21px] font-semibold text-foreground sm:text-[26px]"
          style={{ letterSpacing: '-0.018em', lineHeight: 1.18 }}
        >
          {title}
        </h3>
        <p className="mt-3 max-w-[460px] break-words text-[15px] leading-[1.6] text-foreground/65 sm:text-[15.5px]">
          {desc}
        </p>
        <ul className="mt-6 flex min-w-0 flex-col gap-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex min-w-0 items-start gap-2.5 text-[14px] leading-[1.5] text-foreground/80 sm:text-[14.5px]">
              <Check size={16} strokeWidth={2.6} className="mt-0.5 shrink-0" style={{ color: accent }} />
              <span className="min-w-0 break-words">{b}</span>
            </li>
          ))}
        </ul>
        {metric && (
          <div
            className="mt-7 inline-flex items-baseline gap-2.5 rounded-2xl border px-4 py-3"
            style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
          >
            <span className="font-serif font-bold leading-none" style={{ fontSize: '40px', letterSpacing: '-0.03em', color: accent }}>
              {metric.value}
            </span>
            <span className="text-[13.5px] font-medium leading-[1.3] text-foreground/70">{metric.label}</span>
          </div>
        )}
      </div>
      <div className={side === 'left' ? 'min-w-0 md:order-2' : 'min-w-0 md:order-1'}>
        {visual}
      </div>
    </div>
  )
}

export type VsSectionLabels = {
  eyebrow: string
  title: string
  subtitle: string
  leftTitle: string
  leftNote: string
  smengoTitle: string
  smengoNote: string
  rows: { left: string; smengo: string }[]
  pills: string[]
  footerTitle: string
  footerText: string
  ctaStart: string
  ctaPricing: string
}

export function VsSection({ labels }: { labels: VsSectionLabels }) {
  return (
    <section className="relative overflow-hidden bg-[#3b6fd4] px-4 py-16 text-white sm:px-6 sm:py-20">
      <PlatformBackdrop tone="blue" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)' }}
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{labels.eyebrow}</p>
          <h2 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
            {labels.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.65] text-white/80">{labels.subtitle}</p>
        </div>

        {/* Mobile stack */}
        <div className="flex flex-col gap-3 md:hidden">
          {labels.rows.map((row, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/20 bg-[#214fae]/50">
              <div className="flex items-start gap-2.5 bg-[#1d4599]/80 px-4 py-3 text-[13.5px] leading-snug text-white/75">
                <X size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-white/55" />
                {row.left}
              </div>
              <div className="flex items-start gap-2.5 bg-[#101827] px-4 py-3 text-[13.5px] font-medium leading-snug text-white">
                <Check size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#2f9e6f]" />
                {row.smengo}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-[28px] border border-white/20 bg-[#214fae]/50 shadow-[0_28px_80px_-36px_rgba(31,30,28,0.75)] md:block">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-[#1d4599]/80 px-6 py-5 text-center md:px-8 md:text-left">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/65">
                <X size={14} strokeWidth={2.4} /> {labels.leftTitle}
              </span>
              <p className="mt-2 text-[13px] leading-snug text-white/55">{labels.leftNote}</p>
            </div>
            <div className="bg-[#101827] px-6 py-5 text-center text-white md:px-8 md:text-left">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2f9e6f]">
                <Check size={14} strokeWidth={2.6} /> {labels.smengoTitle}
              </span>
              <p className="mt-2 text-[13px] leading-snug text-white/60">{labels.smengoNote}</p>
            </div>
            {labels.rows.map((row, i) => (
              <Fragment2 key={i} left={row.left} smengo={row.smengo} />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {labels.pills.map((pill) => (
            <div
              key={pill}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-[13px] font-semibold text-white shadow-[0_18px_50px_-34px_rgba(31,30,28,0.65)] backdrop-blur-sm"
            >
              {pill}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-white/20 bg-[#1f1e1c]/15 px-5 py-4 text-center backdrop-blur-sm">
          <p className="text-[14.5px] leading-[1.55] text-white/85">
            <span className="font-semibold text-white">{labels.footerTitle}</span>{' '}
            {labels.footerText}
          </p>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-[14.5px] font-semibold text-[#1f1e1c] shadow-[0_18px_48px_-28px_rgba(31,30,28,0.85)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            {labels.ctaStart}
            <ArrowRight size={16} strokeWidth={2.5} className="ml-2" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/28 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            {labels.ctaPricing}
          </Link>
        </div>
      </div>
    </section>
  )
}

function Fragment2({ left, smengo }: { left: string; smengo: string }) {
  return (
    <>
      <div className="flex items-start gap-3 border-t border-white/12 bg-[#1d4599]/45 px-6 py-4 text-[14px] leading-[1.5] text-white/75 md:px-8">
        <X size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-white/50" />
        {left}
      </div>
      <div className="flex items-start gap-3 border-t border-white/10 bg-[#101827] px-6 py-4 text-[14px] font-medium leading-[1.5] text-white md:px-8">
        <Check size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#2f9e6f]" />
        {smengo}
      </div>
    </>
  )
}

export type RestSectionLabels = {
  eyebrow: string
  title: string
  subtitle: string
  more: string
  cards: { title: string; desc: string; note: string; href: string }[]
}

const REST_TONES = [
  { badge: 'bg-[#e7eefb] text-[#3b6fd4] dark:bg-[#1d2c4d] dark:text-[#9db8ec]', ring: 'hover:border-[#3b6fd4]/45' },
  { badge: 'bg-[#efe9fb] text-[#7c5cc4] dark:bg-[#2c2447] dark:text-[#b6a3e8]', ring: 'hover:border-[#7c5cc4]/45' },
  { badge: 'bg-[#e7f2ea] text-[#2f9e6f] dark:bg-[#1e3328] dark:text-[#8fc8a8]', ring: 'hover:border-[#2f9e6f]/45' },
]

export function RestSection({ labels }: { labels: RestSectionLabels }) {
  return (
    <section className="relative overflow-hidden bg-[#f6f1e8] px-4 py-16 dark:bg-[#111317] sm:px-6 sm:py-20">
      <PlatformBackdrop tone="green" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#866a45] dark:text-[#c6ad86]">
            {labels.eyebrow}
          </p>
          <h2 className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            {labels.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#6d675d] dark:text-[#aaa39a]">
            {labels.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labels.cards.map((card, i) => {
            const tone = REST_TONES[i % REST_TONES.length]
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex min-w-0 flex-col rounded-3xl border border-[#ded8cc] bg-[#fffdf8] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(31,30,28,0.4)] dark:border-white/10 dark:bg-[#171a1f] ${tone.ring}`}
              >
                <span className={`inline-flex h-8 w-12 items-center justify-center self-start rounded-full text-[12px] font-bold tabular-nums ${tone.badge}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-[18px] font-semibold text-foreground" style={{ letterSpacing: '-0.015em' }}>
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-foreground/65">{card.desc}</p>
                <p className="mt-3 text-[12.5px] leading-snug text-foreground/50">{card.note}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
                  {labels.more}
                  <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function FinalCtaSection({
  title, subtitle, ctaStart, ctaPricing, hint,
}: {
  title: string
  subtitle: string
  ctaStart: string
  ctaPricing: string
  hint: string
}) {
  return (
    <section className="relative overflow-hidden bg-[#e0a96d] px-4 py-24 sm:px-6 sm:py-28">
      <PlatformBackdrop tone="sand" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(32px, 4.6vw, 54px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}>
          {title}
        </h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-[#1f1e1c]/75">{subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-[#1f1e1c] px-7 py-3 text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-black"
          >
            {ctaStart}
          </Link>
          <Link href="/pricing" className={CTA_SECONDARY_DARK}>{ctaPricing}</Link>
        </div>
        <div className="mt-4 text-[12.5px] text-[#1f1e1c]/70">{hint}</div>
      </div>
    </section>
  )
}
