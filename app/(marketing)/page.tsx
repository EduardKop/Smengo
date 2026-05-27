import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Check } from 'lucide-react'
import { FaqAccordion } from '@/components/marketing/faq-accordion'

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

  const faqItems = Array.from({ length: 5 }, (_, i) => ({
    q: t(`faq.q${i + 1}` as Parameters<typeof t>[0]),
    a: t(`faq.a${i + 1}` as Parameters<typeof t>[0]),
  }))

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
              className="mb-5 inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wider"
              style={{ background: 'rgba(217,119,87,0.1)', color: 'var(--accent)' }}
            >
              {t('hero.tag')}
            </span>
            <h1
              className="font-serif font-bold leading-[1.15] tracking-tight text-foreground"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
            >
              {t('hero.headline')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('hero.sub')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[--accent-hover]"
                style={{ '--accent-hover': '#C45D3D' } as React.CSSProperties}
              >
                {t('hero.cta1')} →
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 rounded-[--radius-sm] border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
              >
                {t('hero.cta2')}
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t('hero.note')}</p>
          </div>

          {/* Grid preview — flush to bottom of hero */}
          <div className="mt-14 overflow-hidden">
            <GridPreview />
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ─────────────────────────────────────────── */}
      <section className="border-y border-border bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-5 text-center text-sm text-muted-foreground">{t('proof.label')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[82, 96, 70, 108, 88, 74].map((w, i) => (
              <div
                key={i}
                style={{ width: w, height: 18, borderRadius: 4, background: '#C9C5BA', opacity: 0.55 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how" className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wider"
              style={{ background: 'rgba(217,119,87,0.1)', color: 'var(--accent)' }}
            >
              {t('how.tag')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              {t('how.title')}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
                  style={{ background: 'rgba(217,119,87,0.12)', color: 'var(--accent)' }}
                >
                  {step}
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {t(`how.step${step}Title` as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`how.step${step}Desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wider"
              style={{ background: 'rgba(217,119,87,0.1)', color: 'var(--accent)' }}
            >
              {t('features.tag')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
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
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <div key={n} style={{ background: '#fff', padding: '28px 24px' }}>
                <div
                  style={{
                    height: 76,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <FeatureSvg n={n} />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {t(`features.f${n}Title` as Parameters<typeof t>[0])}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`features.f${n}Desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ──────────────────────────────────────────── */}
      <section
        className="px-4 py-16 sm:px-6"
        style={{ background: '#EDEBE3', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {t('band.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('band.sub')}</p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[--accent-hover]"
            style={{ '--accent-hover': '#C45D3D' } as React.CSSProperties}
          >
            {t('band.cta')}
          </Link>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wider"
              style={{ background: 'rgba(217,119,87,0.1)', color: 'var(--accent)' }}
            >
              {t('plans.tag')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
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
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <FaqAccordion tag={t('faq.tag')} title={t('faq.title')} items={faqItems} />
        </div>
      </section>
    </>
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
      className={`relative flex flex-col rounded-[--radius] border p-6 ${
        highlighted
          ? 'border-accent bg-accent/5 shadow-[var(--shadow-md)]'
          : 'border-border bg-white shadow-[var(--shadow-sm)]'
      }`}
    >
      {badge && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-b-lg bg-accent px-3 py-0.5 text-xs font-semibold text-white"
          style={{ top: -1 }}
        >
          {badge}
        </span>
      )}
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-4xl font-bold text-foreground">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <ul className="mb-6 flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-auto block rounded-[--radius-sm] px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
          highlighted
            ? 'bg-accent text-white hover:bg-[--accent-hover]'
            : 'border border-border bg-background text-foreground hover:bg-muted/60'
        }`}
        style={{ '--accent-hover': '#C45D3D' } as React.CSSProperties}
      >
        {cta}
      </Link>
    </div>
  )
}

/* ── Feature SVG illustrations ───────────────────────────────── */
function FeatureSvg({ n }: { n: number }) {
  if (n === 1) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {(['#E8F5F1','#FDF3E3','#E8F5F1','#FCECEA','#E8F5F1','#F3F4F6','#E8F5F1','#FDF3E3','#F9EFF9','#E8F5F1','#FCECEA','#E8F5F1','#F3F4F6','#E8F5F1','#E8F5F1'] as const).map((c, j) => (
        <rect key={j} x={4 + (j % 5) * 23} y={4 + Math.floor(j / 5) * 19} width={19} height={15} rx="3" fill={c} />
      ))}
    </svg>
  )
  if (n === 2) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['#3B9B7F', 62], ['#E8A04C', 48], ['#9CA3AF', 56]] as const).map(([c, w], i) => (
        <g key={i}>
          <rect x="8" y={8 + i * 17} width="104" height="13" rx="4" fill="#EDEBE3" />
          <circle cx="18" cy={14.5 + i * 17} r="4" fill={c} />
          <rect x="28" y={12 + i * 17} width={w} height="4" rx="2" fill="#C9C5BA" />
        </g>
      ))}
    </svg>
  )
  if (n === 3) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="104" height="44" rx="7" fill="#FFF5F5" stroke="#D4604A" strokeWidth="1" />
      <circle cx="26" cy="30" r="9" fill="#FCECEA" stroke="#D4604A" strokeWidth="1.4" />
      <rect x="25" y="24" width="2" height="8" rx="1" fill="#D4604A" />
      <rect x="25" y="33.5" width="2" height="2" rx="1" fill="#D4604A" />
      <rect x="42" y="25" width="56" height="3" rx="1.5" fill="#E0DDD4" />
      <rect x="42" y="31" width="40" height="3" rx="1.5" fill="#E0DDD4" />
    </svg>
  )
  if (n === 4) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['#E8F5F1', '#3B9B7F', 54], ['#FDF3E3', '#E8A04C', 40], ['#F9EFF9', '#C77DC0', 62]] as const).map(([bg, c, w], i) => (
        <g key={i}>
          <rect x="8" y={8 + i * 17} width={w + 24} height="13" rx="6" fill={bg} />
          <rect x="16" y={12 + i * 17} width="8" height="5" rx="2.5" fill={c} />
          <rect x="30" y={12.5 + i * 17} width={w - 8} height="4" rx="2" fill={c} opacity="0.35" />
        </g>
      ))}
    </svg>
  )
  if (n === 5) return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="50" height="44" rx="7" fill="#EDEBE3" />
      {([0, 1, 2] as const).map((i) => (
        <rect key={i} x="14" y={18 + i * 12} width={([34, 26, 30] as const)[i]} height="4" rx="2" fill="#C9C5BA" />
      ))}
      <rect x="64" y="8" width="50" height="44" rx="7" fill="#F5F4EF" stroke="#E0DDD4" strokeWidth="1" />
      {([0, 1, 2] as const).map((i) => (
        <rect key={i} x="72" y={18 + i * 12} width={([28, 36, 24] as const)[i]} height="4" rx="2" fill="#C9C5BA" />
      ))}
    </svg>
  )
  // n === 6
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {([['#D97757', 36], ['#3B9B7F', 46], ['#9CA3AF', 38]] as const).map(([c, w], i) => (
        <g key={i}>
          <circle cx="20" cy={15 + i * 18} r="6" fill="#EDEBE3" />
          <circle cx="20" cy={13 + i * 18} r="3" fill="#C9C5BA" />
          <rect x="32" y={12 + i * 18} width={w} height="4" rx="2" fill="#C9C5BA" />
          <rect x="88" y={11 + i * 18} width="24" height="8" rx="4" fill={c} opacity="0.22" />
        </g>
      ))}
    </svg>
  )
}

/* ── Grid preview ─────────────────────────────────────────────── */
const DAYS_DEMO = [
  { n: 1, d: 'Thu' }, { n: 2, d: 'Fri' }, { n: 3, d: 'Sat' }, { n: 4, d: 'Sun' },
  { n: 5, d: 'Mon' }, { n: 6, d: 'Tue' }, { n: 7, d: 'Wed' }, { n: 8, d: 'Thu' },
  { n: 9, d: 'Fri' }, { n: 10, d: 'Sat' }, { n: 11, d: 'Sun' }, { n: 12, d: 'Mon' },
  { n: 13, d: 'Tue' }, { n: 14, d: 'Wed' }, { n: 15, d: 'Thu' },
]
const TODAY_COL = 9
const WKND = new Set([3, 4, 10, 11])
const SALES_ALERT = new Set([7, 8])

type Status = 'W' | 'V' | 'S' | 'D' | 'L'

const CHIP_META: Record<Status, { lbl: string; c: string; bg: string }> = {
  W: { lbl: 'Work', c: '#2E8A6A', bg: '#E8F5F1' },
  V: { lbl: 'Vac',  c: '#C07825', bg: '#FDF3E3' },
  S: { lbl: 'Sick', c: '#B84030', bg: '#FCECEA' },
  D: { lbl: 'Off',  c: '#7A8290', bg: '#F3F4F6' },
  L: { lbl: 'Late', c: '#9E5A97', bg: '#F9EFF9' },
}

const GRID_DEPTS = [
  {
    name: 'Sales', min: 3,
    rows: [
      { name: 'Anna Petrov',   s: 'WWWWWWWWWVVWWWW' },
      { name: 'Mark Sidorov',  s: 'WWWWWWSSWWWWWWW' },
      { name: 'Kate Volkova',  s: 'VVWWWWWWWWWWDDW' },
    ],
  },
  {
    name: 'Operations', min: 2,
    rows: [
      { name: 'Ivan Melnikov', s: 'WWWWWWWWWWWWWWW' },
      { name: 'Daria Kos',     s: 'WWWWVVVWWWWWWWW' },
      { name: 'Alex Novikov',  s: 'WWWWWWWWWWWLWWW' },
    ],
  },
]

function GridPreview() {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(31,30,28,.04), 0 12px 48px rgba(31,30,28,.08)',
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            background: '#F7F6F2',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0C2C2' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F0DFB0' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#B5DBCA' }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
            smengo · May 2026
          </span>
        </div>

        {/* App topbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)',
            background: '#fff',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#F5F4EF',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--foreground)',
            }}
          >
            <span>‹</span>
            <span>May 2026</span>
            <span>›</span>
          </div>
          <div
            style={{
              background: '#F5F4EF',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              color: 'var(--muted-foreground)',
            }}
          >
            All departments ▾
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: '#F5F4EF',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              color: 'var(--muted-foreground)',
            }}
          >
            Export
          </div>
          <div
            style={{
              background: 'var(--accent)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            + Add employee
          </div>
        </div>

        {/* Grid table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    background: '#fff',
                    padding: '6px 10px',
                    width: 148,
                    minWidth: 148,
                    textAlign: 'left',
                    fontWeight: 500,
                    color: 'var(--muted-foreground)',
                    fontSize: 10,
                  }}
                >
                  Employee
                </th>
                {DAYS_DEMO.map((d) => {
                  const isToday = d.n === TODAY_COL
                  const isWkd = WKND.has(d.n)
                  return (
                    <th
                      key={d.n}
                      style={{
                        width: 52,
                        minWidth: 44,
                        padding: '4px 2px',
                        textAlign: 'center',
                        background: isToday
                          ? 'rgba(217,119,87,0.09)'
                          : isWkd
                          ? '#FAFAF8'
                          : '#fff',
                        color: isToday ? 'var(--accent)' : 'var(--muted-foreground)',
                        position: 'relative',
                      }}
                    >
                      {isToday && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: 'var(--accent)',
                          }}
                        />
                      )}
                      <div style={{ fontWeight: isToday ? 700 : 500, fontSize: 11 }}>{d.n}</div>
                      <div style={{ fontSize: 9, opacity: 0.65 }}>{d.d}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {GRID_DEPTS.flatMap((dept, di) => [
                <tr key={`dept-${di}`}>
                  <td
                    colSpan={DAYS_DEMO.length + 1}
                    style={{
                      padding: '4px 10px',
                      background: '#EDEBE3',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#6B6862',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ▸ {dept.name}
                    <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: 'none' }}>
                      · min {dept.min}/day
                    </span>
                  </td>
                </tr>,
                ...dept.rows.map((emp, ei) => (
                  <tr key={`${di}-${ei}`} style={{ borderBottom: '1px solid #F0EDE5' }}>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        background: '#fff',
                        padding: '4px 10px',
                        fontWeight: 500,
                        color: 'var(--foreground)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {emp.name}
                    </td>
                    {DAYS_DEMO.map((d, ci) => {
                      const code = emp.s[ci] as Status
                      const isWkd = WKND.has(d.n)
                      const isToday = d.n === TODAY_COL
                      const isAlert = dept.name === 'Sales' && SALES_ALERT.has(d.n) && !isWkd
                      const chip = CHIP_META[code]
                      return (
                        <td
                          key={d.n}
                          style={{
                            padding: '3px 2px',
                            textAlign: 'center',
                            background: isAlert
                              ? '#FFF5F5'
                              : isToday
                              ? 'rgba(217,119,87,0.04)'
                              : isWkd
                              ? '#FAFAF8'
                              : '#fff',
                            position: 'relative',
                          }}
                        >
                          {isAlert && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 2,
                                right: 2,
                                height: 2,
                                background: '#D4604A',
                                borderRadius: 1,
                              }}
                            />
                          )}
                          {isWkd ? (
                            <span style={{ fontSize: 9, color: '#D0CDC5' }}>—</span>
                          ) : chip ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: chip.bg,
                                color: chip.c,
                                padding: '1px 5px',
                                borderRadius: 3,
                                fontSize: 9.5,
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {chip.lbl}
                            </div>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>

        {/* Alert strip */}
        <div
          style={{
            padding: '7px 12px',
            background: '#FFF5F5',
            borderTop: '1px solid #F8D0CC',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 500, color: '#D4604A' }}>
            ⚠ Coverage alert: Sales · Wed 7, Thu 8 — below minimum of 3
          </span>
        </div>
      </div>

      {/* Right edge fade */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 80,
          background: 'linear-gradient(to right, transparent, var(--background))',
          pointerEvents: 'none',
          borderRadius: '0 var(--radius) var(--radius) 0',
        }}
      />
    </div>
  )
}

