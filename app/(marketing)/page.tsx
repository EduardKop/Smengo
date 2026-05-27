import type { Metadata } from 'next'
import type { ReactElement } from 'react'
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
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(217,119,87,0.09) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
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
            >
              {t('hero.cta1')}
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 rounded-[--radius-sm] border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              {t('hero.cta2')}
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t('hero.note')}</p>
        </div>

        {/* Grid preview */}
        <div className="mx-auto mt-14 max-w-5xl">
          <GridPreview />
        </div>
      </section>

      {/* ── PROOF BAR ─────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 px-4 py-5 sm:px-6">
        <p className="text-center text-sm text-muted-foreground">{t('proof.label')}</p>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how" className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
              {t('how.tag')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              {t('how.title')}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
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
      <section id="features" className="bg-card px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <div
                key={n}
                className="rounded-[--radius] border border-border bg-background p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <FeatureIcon n={n} />
                <h3 className="mb-2 mt-4 font-semibold text-foreground">
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
      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {t('band.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('band.sub')}</p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[--accent-hover]"
          >
            {t('band.cta')}
          </Link>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
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
      <section className="bg-card px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
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
          : 'border-border bg-card shadow-[var(--shadow-sm)]'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{price}</span>
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
      >
        {cta}
      </Link>
    </div>
  )
}

/* ── Feature icon (inline SVG per feature slot) ─────────────── */
function FeatureIcon({ n }: { n: number }) {
  const cls = 'h-8 w-8 text-accent'
  const icons: Record<number, ReactElement> = {
    1: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    2: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
      </svg>
    ),
    3: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    4: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.34-6.66-2.12 2.12M7.46 16.54l-2.12 2.12m0-14.14 2.12 2.12m7.08 7.08 2.12 2.12" strokeLinecap="round" />
      </svg>
    ),
    5: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" />
      </svg>
    ),
    6: (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" strokeLinecap="round" />
      </svg>
    ),
  }
  return icons[n]
}

/* ── Grid preview (hardcoded demo data) ────────────────────── */
type Status = 'W' | 'V' | 'S' | 'D' | 'L'

const STATUS_META: Record<Status, { color: string; label: string }> = {
  W: { color: 'var(--st-work)', label: 'Work' },
  V: { color: 'var(--st-vacation)', label: 'Vacation' },
  S: { color: 'var(--st-sick)', label: 'Sick' },
  D: { color: 'var(--st-dayoff)', label: 'Day off' },
  L: { color: 'var(--st-late)', label: 'Late' },
}

const TODAY_COL = 9
const WEEKENDS = new Set([3, 4, 10, 11])

const DEPTS: { name: string; min: number; employees: { name: string; row: Status[] }[] }[] = [
  {
    name: 'Sales',
    min: 3,
    employees: [
      { name: 'Anna K.',  row: ['W','W','D','D','W','W','V','V','W','D','D','W','W','W','W'] },
      { name: 'Boris M.', row: ['W','W','D','D','W','W','V','V','W','D','D','W','L','W','W'] },
      { name: 'Carla F.', row: ['W','W','D','D','W','W','S','W','W','D','D','W','W','W','W'] },
    ],
  },
  {
    name: 'Operations',
    min: 2,
    employees: [
      { name: 'Dmitri V.', row: ['W','W','D','D','W','W','W','W','W','D','D','W','W','W','W'] },
      { name: 'Eva S.',    row: ['W','V','D','D','W','W','W','W','W','D','D','W','W','W','W'] },
      { name: 'Filip K.',  row: ['W','W','D','D','W','W','W','W','W','D','D','W','W','W','W'] },
    ],
  },
]

function coverageOk(deptIdx: number, dayIdx: number): boolean {
  const dept = DEPTS[deptIdx]
  if (WEEKENDS.has(dayIdx + 1)) return true
  const count = dept.employees.filter((e) => e.row[dayIdx] === 'W' || e.row[dayIdx] === 'L').length
  return count >= dept.min
}

function GridPreview() {
  const DAYS = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="overflow-hidden rounded-[--radius] border border-border bg-white shadow-[var(--shadow-md)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        <span className="ml-2 text-xs text-muted-foreground">smengo — May 2026</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border">
              <th
                className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[11px] font-medium text-muted-foreground"
                style={{ minWidth: 110 }}
              >
                Employee
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="py-2 text-center text-[11px]"
                  style={{
                    minWidth: 28,
                    fontWeight: d === TODAY_COL ? 600 : 400,
                    background: d === TODAY_COL
                      ? 'rgba(217,119,87,0.12)'
                      : WEEKENDS.has(d)
                      ? 'rgba(0,0,0,0.025)'
                      : undefined,
                    color: d === TODAY_COL ? 'var(--accent)' : 'var(--muted-foreground)',
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPTS.flatMap((dept, di) => [
              <tr key={`dept-${di}`}>
                <td
                  colSpan={16}
                  className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--bg-subtle,#EDEBE3)', color: 'var(--text-muted,#6B6862)' }}
                >
                  {dept.name} · min {dept.min}
                </td>
              </tr>,
              ...dept.employees.map((emp, ei) => (
                <tr key={`${di}-${ei}`} className={ei % 2 === 0 ? '' : 'bg-muted/10'}>
                  <td className="sticky left-0 z-10 bg-white px-3 py-1 font-medium text-foreground">
                    {emp.name}
                  </td>
                  {emp.row.map((status, ci) => (
                    <td
                      key={ci}
                      className="px-0.5 py-1 text-center"
                      style={{
                        background:
                          ci + 1 === TODAY_COL ? 'rgba(217,119,87,0.06)' : undefined,
                      }}
                    >
                      {WEEKENDS.has(ci + 1) ? (
                        <div
                          className="mx-auto h-5 w-5 rounded-sm"
                          style={{ background: STATUS_META.D.color, opacity: 0.25 }}
                        />
                      ) : (
                        <div
                          className="relative mx-auto h-5 w-5 rounded-sm"
                          style={{ background: STATUS_META[status].color, opacity: 0.85 }}
                        >
                          {!coverageOk(di, ci) && (status === 'V' || status === 'S') && (
                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>

      {/* Alert strip */}
      <div className="border-t border-red-200 bg-red-50/60 px-4 py-2">
        <span className="text-xs font-medium text-red-600">
          ⚠ Coverage alert: Sales — days 7, 8 (below minimum of 3)
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
        {(['W', 'V', 'S', 'D', 'L'] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: STATUS_META[s].color }} />
            <span className="text-[11px] text-muted-foreground">{STATUS_META[s].label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
