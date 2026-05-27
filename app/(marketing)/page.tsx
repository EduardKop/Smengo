import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Check } from 'lucide-react'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { GridPreview, type GridPreviewLabels } from '@/components/marketing/grid-preview'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Smengo — умный планировщик смен для команд',
    description:
      'Замените Excel умным планировщиком. Весь график команды в одном grid-виде. Алерты покрытия, роли, экспорт. 14 дней бесплатно.',
    alternates: {
      canonical: 'https://smengo.com',
      languages: {
        ru: 'https://smengo.com',
        uk: 'https://smengo.com',
        en: 'https://smengo.com',
      },
    },
    openGraph: {
      title: 'Smengo — умный планировщик смен',
      description: 'Весь график команды в одном взгляде. Замените Excel.',
      type: 'website',
      locale: 'ru_RU',
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Smengo',
  applicationCategory: 'BusinessApplication',
  description: 'Умный планировщик смен для команд 15–300 человек',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', name: 'Старт', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Команда', price: '29', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Бизнес', price: '79', priceCurrency: 'USD' },
  ],
}

export default async function LandingPage() {
  const t = await getTranslations('marketing')
  const tg = await getTranslations('marketing.gridMockup')

  const faqItems = Array.from({ length: 5 }, (_, i) => ({
    q: t(`faq.q${i + 1}` as Parameters<typeof t>[0]),
    a: t(`faq.a${i + 1}` as Parameters<typeof t>[0]),
  }))

  const gridLabels: GridPreviewLabels = {
    modeDetail: tg('modeDetail'),
    modeCompact: tg('modeCompact'),
    modeExtended: tg('modeExtended'),
    monthLabel: tg('monthLabel'),
    allDepts: tg('allDepts'),
    exportBtn: tg('exportBtn'),
    addEmployee: tg('addEmployee'),
    employee: tg('employee'),
    deptSales: tg('deptSales'),
    deptOps: tg('deptOps'),
    deptSupport: tg('deptSupport'),
    deptMarketing: tg('deptMarketing'),
    deptDesign: tg('deptDesign'),
    demoDept: tg('demoDept'),
    minDay: tg.raw('minDay'),
    alert: tg('alert'),
    allOnShift: tg('allOnShift'),
    statusWork: tg('statusWork'),
    statusVac: tg('statusVac'),
    statusSick: tg('statusSick'),
    statusOff: tg('statusOff'),
    statusLate: tg('statusLate'),
    statusWorkFull: tg('statusWorkFull'),
    showTimesLabel: tg('showTimesLabel'),
    days: {
      mon: tg('days.mon'), tue: tg('days.tue'), wed: tg('days.wed'),
      thu: tg('days.thu'), fri: tg('days.fri'), sat: tg('days.sat'), sun: tg('days.sun'),
    },
    projectsBtn: tg('projectsBtn'),
    telegramBtn: tg('telegramBtn'),
    editBtn: tg('editBtn'),
    editDone: tg('editDone'),
    toastCopied: tg('toastCopied'),
    toastExported: tg('toastExported'),
    toastAdded: tg('toastAdded'),
    newEmployee: tg('newEmployee'),
    projectBadge: tg.raw('projectBadge'),
    projectTeam: tg('projectTeam'),
    projectStatus: tg('projectStatus'),
    projectClose: tg('projectClose'),
    projects: {
      p1: { name: tg('p1Name'), desc: tg('p1Desc'), tag: tg('p1Tag') },
      p2: { name: tg('p2Name'), desc: tg('p2Desc'), tag: tg('p2Tag') },
      p3: { name: tg('p3Name'), desc: tg('p3Desc'), tag: tg('p3Tag') },
      p4: { name: tg('p4Name'), desc: tg('p4Desc'), tag: tg('p4Tag') },
      p5: { name: tg('p5Name'), desc: tg('p5Desc'), tag: tg('p5Tag') },
      p6: { name: tg('p6Name'), desc: tg('p6Desc'), tag: tg('p6Tag') },
    },
    months: [tg('m1'), tg('m2'), tg('m3'), tg('m4'), tg('m5')],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-background px-4 pb-0 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <span
              className="mb-5 inline-block rounded-full px-3.5 py-1 text-[12.5px] font-medium tracking-wider"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {t('hero.tag')}
            </span>
            <h1
              className="font-serif font-semibold leading-[1.1] text-foreground"
              style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', letterSpacing: '-0.025em' }}
            >
              {t('hero.headline')}
            </h1>
            <p
              className="mx-auto mt-5 text-[17px] leading-[1.65] text-muted-foreground"
              style={{ maxWidth: 500 }}
            >
              {t('hero.sub')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-[22px] py-[11px] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t('hero.cta1')} →
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-[22px] py-[11px] text-sm font-medium text-foreground transition-[color,border-color] hover:bg-muted/40"
              >
                {t('hero.cta2')}
              </Link>
            </div>
            <p className="mt-3 text-[12.5px]" style={{ color: 'var(--subtle)' }}>
              {t('hero.note')}
            </p>
          </div>

          {/* Grid preview — flush to bottom of hero */}
          <div className="mt-14 overflow-hidden">
            <GridPreview labels={gridLabels} />
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ─────────────────────────────────────────── */}
      <section
        className="border-y border-border px-4 sm:px-6"
        style={{ background: 'var(--surface)', padding: '42px 0' }}
      >
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <p
            className="mb-5 text-center text-[11.5px] font-medium uppercase"
            style={{ letterSpacing: '0.07em', color: 'var(--subtle)' }}
          >
            {t('proof.label')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[82, 96, 70, 108, 88, 74].map((w, i) => (
              <div
                key={i}
                style={{ width: w, height: 18, borderRadius: 4, background: 'var(--muted)', opacity: 0.75 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how" className="bg-background px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SecEye>{t('how.tag')}</SecEye>
            <h2
              className="mx-auto mt-3 font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', maxWidth: 460, lineHeight: 1.18 }}
            >
              {t('how.title')}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full text-[15px] font-semibold"
                  style={{ width: 34, height: 34, background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {step}
                </div>
                <div>
                  <h3 className="mb-2 text-[15px] font-semibold text-foreground">
                    {t(`how.step${step}Title` as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">
                    {t(`how.step${step}Desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section
        id="features"
        className="px-4 py-24 sm:px-6"
        style={{ background: 'var(--surface)' }}
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SecEye>{t('features.tag')}</SecEye>
            <h2
              className="mx-auto mt-3 font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', maxWidth: 460, lineHeight: 1.18 }}
            >
              {t('features.title').split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>
          </div>
          {/* Hairline separator grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              background: 'var(--border)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <div key={n} style={{ background: 'var(--surface)', padding: '26px 28px' }}>
                <div
                  style={{
                    height: 76,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <FeatureSvg n={n} />
                </div>
                <h3 className="mb-2 text-[14.5px] font-semibold text-foreground">
                  {t(`features.f${n}Title` as Parameters<typeof t>[0])}
                </h3>
                <p className="text-[13px] leading-[1.6] text-muted-foreground">
                  {t(`features.f${n}Desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ──────────────────────────────────────────── */}
      <section
        className="px-4 sm:px-6"
        style={{
          background: 'var(--zone)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 60,
          paddingBottom: 60,
        }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-serif font-semibold text-foreground"
            style={{ fontSize: 'clamp(26px, 3vw, 34px)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
          >
            {t('band.title')}
          </h2>
          <p
            className="mx-auto mt-3 text-[15px] leading-[1.6] text-muted-foreground"
            style={{ maxWidth: 480 }}
          >
            {t('band.sub')}
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-[24px] py-[12px] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
          >
            {t('band.cta')}
          </Link>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="bg-background px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SecEye>{t('plans.tag')}</SecEye>
            <h2
              className="mx-auto mt-3 font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', maxWidth: 460, lineHeight: 1.18 }}
            >
              {t('plans.title').split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <PlanCard
              name={t('plans.startName')}
              price={t('plans.startPrice')}
              period={t('plans.startPeriod')}
              desc={t('plans.startDesc')}
              features={[
                t('plans.startF1'),
                t('plans.startF2'),
                t('plans.startF3'),
                t('plans.startF4'),
              ]}
              cta={t('plans.startCta')}
              href="/register"
              highlighted={false}
            />
            <PlanCard
              name={t('plans.teamName')}
              price={t('plans.teamPrice')}
              period={t('plans.teamPeriod')}
              desc={t('plans.teamDesc')}
              features={[
                t('plans.teamF1'),
                t('plans.teamF2'),
                t('plans.teamF3'),
                t('plans.teamF4'),
                t('plans.teamF5'),
                t('plans.teamF6'),
              ]}
              cta={t('plans.teamCta')}
              href="/register"
              highlighted
              badge={t('plans.teamBadge')}
            />
            <PlanCard
              name={t('plans.bizName')}
              price={t('plans.bizPrice')}
              period={t('plans.bizPeriod')}
              desc={t('plans.bizDesc')}
              features={[
                t('plans.bizF1'),
                t('plans.bizF2'),
                t('plans.bizF3'),
                t('plans.bizF4'),
                t('plans.bizF5'),
                t('plans.bizF6'),
              ]}
              cta={t('plans.bizCta')}
              href="/contact"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto max-w-[1100px]">
          <FaqAccordion tag={t('faq.tag')} title={t('faq.title')} items={faqItems} />
        </div>
      </section>
    </>
  )
}

/* ── Section eyebrow (uppercase accent text, no pill) ──────────── */
function SecEye({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mb-3 inline-block text-[11.5px] font-semibold uppercase"
      style={{ letterSpacing: '0.08em', color: 'var(--accent)' }}
    >
      {children}
    </span>
  )
}

/* ── Plan card ─────────────────────────────────────────────────── */
function PlanCard({
  name,
  price,
  period,
  desc,
  features,
  cta,
  href,
  highlighted,
  badge,
}: {
  name: string
  price: string
  period: string
  desc: string
  features: string[]
  cta: string
  href: string
  highlighted: boolean
  badge?: string
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[--radius] ${highlighted ? 'border-[1.5px] border-accent' : 'border border-border'} shadow-[var(--shadow-sm)]`}
      style={{ background: 'var(--surface)', padding: 28 }}
    >
      {badge && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-b-lg bg-accent px-3 py-0.5 text-[11px] font-semibold text-white"
          style={{ top: -1 }}
        >
          {badge}
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-foreground">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className="font-serif font-semibold text-foreground"
            style={{ fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {price}
          </span>
          <span className="text-[13px]" style={{ color: 'var(--subtle)' }}>{period}</span>
        </div>
        <p className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">{desc}</p>
      </div>
      <ul className="mb-6 flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13.5px] text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-auto block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
          highlighted
            ? 'bg-accent text-white hover:bg-[var(--accent-hover)]'
            : 'border border-border bg-background text-foreground hover:bg-muted/60'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

/* ── Feature SVG illustrations (theme-aware via CSS vars) ────── */
function FeatureSvg({ n }: { n: number }) {
  // n=1 — chip grid
  if (n === 1) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {(['--chip-w-bg','--chip-v-bg','--chip-w-bg','--chip-s-bg','--chip-w-bg','--chip-d-bg','--chip-w-bg','--chip-v-bg','--chip-l-bg','--chip-w-bg','--chip-s-bg','--chip-w-bg','--chip-d-bg','--chip-w-bg','--chip-w-bg'] as const).map((v, j) => (
        <rect key={j} x={4 + (j % 5) * 23} y={4 + Math.floor(j / 5) * 19} width={19} height={15} rx="3" fill={`var(${v})`} />
      ))}
    </svg>
  )
  // n=2 — list of departments
  if (n === 2) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['var(--st-work)', 62], ['var(--st-vacation)', 48], ['var(--st-dayoff)', 56]] as const).map(([c, w], i) => (
        <g key={i}>
          <rect x="8" y={8 + i * 17} width="104" height="13" rx="4" fill="var(--grid-dept-bg)" />
          <circle cx="18" cy={14.5 + i * 17} r="4" fill={c} />
          <rect x="28" y={12 + i * 17} width={w} height="4" rx="2" fill="var(--border)" />
        </g>
      ))}
    </svg>
  )
  // n=3 — alert card
  if (n === 3) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="104" height="44" rx="7" fill="var(--grid-alert-bg)" stroke="var(--grid-alert-fg)" strokeWidth="1" />
      <circle cx="26" cy="30" r="9" fill="var(--chip-s-bg)" stroke="var(--grid-alert-fg)" strokeWidth="1.4" />
      <rect x="25" y="24" width="2" height="8" rx="1" fill="var(--grid-alert-fg)" />
      <rect x="25" y="33.5" width="2" height="2" rx="1" fill="var(--grid-alert-fg)" />
      <rect x="42" y="25" width="56" height="3" rx="1.5" fill="var(--border)" />
      <rect x="42" y="31" width="40" height="3" rx="1.5" fill="var(--border)" />
    </svg>
  )
  // n=4 — custom statuses
  if (n === 4) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['--chip-w-bg', 'var(--st-work)', 54], ['--chip-v-bg', 'var(--st-vacation)', 40], ['--chip-l-bg', 'var(--st-late)', 62]] as const).map(([bg, c, w], i) => (
        <g key={i}>
          <rect x="8" y={8 + i * 17} width={w + 24} height="13" rx="6" fill={`var(${bg})`} />
          <rect x="16" y={12 + i * 17} width="8" height="5" rx="2.5" fill={c} />
          <rect x="30" y={12.5 + i * 17} width={w - 8} height="4" rx="2" fill={c} opacity="0.4" />
        </g>
      ))}
    </svg>
  )
  // n=5 — two language cards
  if (n === 5) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="50" height="44" rx="7" fill="var(--muted)" />
      {([0, 1, 2] as const).map((i) => (
        <rect key={i} x="14" y={18 + i * 12} width={([34, 26, 30] as const)[i]} height="4" rx="2" fill="var(--border)" />
      ))}
      <rect x="64" y="8" width="50" height="44" rx="7" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      {([0, 1, 2] as const).map((i) => (
        <rect key={i} x="72" y={18 + i * 12} width={([28, 36, 24] as const)[i]} height="4" rx="2" fill="var(--border)" />
      ))}
    </svg>
  )
  // n=6 — roles list
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['var(--accent)', 36], ['var(--st-work)', 46], ['var(--st-dayoff)', 38]] as const).map(([c, w], i) => (
        <g key={i}>
          <circle cx="20" cy={15 + i * 18} r="6" fill="var(--muted)" />
          <circle cx="20" cy={13 + i * 18} r="3" fill="var(--border)" />
          <rect x="32" y={12 + i * 18} width={w} height="4" rx="2" fill="var(--border)" />
          <rect x="88" y={11 + i * 18} width="24" height="8" rx="4" fill={c} opacity="0.3" />
        </g>
      ))}
    </svg>
  )
}

