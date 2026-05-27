import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  LayoutGrid,
  Bell,
  Users,
  FileDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

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
    { '@type': 'Offer', name: 'Старт', price: '29', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Команда', price: '79', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Бизнес', price: '149', priceCurrency: 'USD' },
  ],
}

export default async function LandingPage() {
  const t = await getTranslations('marketing')

  const features = [
    {
      icon: LayoutGrid,
      title: t('features.f1Title'),
      desc: t('features.f1Desc'),
    },
    {
      icon: Bell,
      title: t('features.f2Title'),
      desc: t('features.f2Desc'),
    },
    {
      icon: Users,
      title: t('features.f3Title'),
      desc: t('features.f3Desc'),
    },
    {
      icon: FileDown,
      title: t('features.f4Title'),
      desc: t('features.f4Desc'),
    },
  ]

  const painPoints = [
    t('pain.item1'),
    t('pain.item2'),
    t('pain.item3'),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24">
        {/* Warm radial background glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(217,119,87,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent">
            {t('hero.badge')}
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t('hero.headline').split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t('hero.subheadline')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent/90"
            >
              {t('hero.cta')}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-muted-foreground">{t('hero.ctaHint')}</p>
          </div>
        </div>

        {/* Grid mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <GridMockup />
        </div>
      </section>

      {/* ── PAIN POINTS ───────────────────────────────────────── */}
      <section className="bg-muted/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {t('pain.title')}
          </h2>
          <ul className="flex flex-col gap-4">
            {painPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-[--radius] border border-border bg-card p-4 shadow-sm"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <p className="text-muted-foreground">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-[--radius] border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[--radius-sm] bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="bg-muted/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
            {t('testimonials.title')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { q: t('testimonials.q1'), author: t('testimonials.q1Author') },
              { q: t('testimonials.q2'), author: t('testimonials.q2Author') },
            ].map(({ q, author }) => (
              <blockquote
                key={author}
                className="rounded-[--radius] border border-border bg-card p-6 shadow-sm"
              >
                <p className="leading-relaxed text-foreground before:content-['\u201C'] after:content-['\u201D']">
                  {q}
                </p>
                <footer className="mt-4 text-sm text-muted-foreground">— {author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ───────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Простые цены
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Начните с 14-дневного бесплатного триала. Выберите план когда будете готовы.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-[--radius] border border-border bg-card px-5 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span><strong>Старт</strong> — $29/мес</span>
            </div>
            <div className="flex items-center gap-2 rounded-[--radius] border-2 border-accent bg-accent/5 px-5 py-3 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span><strong>Команда</strong> — $79/мес</span>
            </div>
            <div className="flex items-center gap-2 rounded-[--radius] border border-border bg-card px-5 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span><strong>Бизнес</strong> — $149/мес</span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Сравнить все планы <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-[--radius-lg] bg-accent/8 border border-accent/20 px-6 py-12 text-center sm:px-12">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">{t('cta.subtitle')}</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-[--radius-sm] bg-accent px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent/90"
            >
              {t('cta.button')}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              {t('cta.hint')} <span className="underline">Войти</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/* ── Inline grid mockup (SVG-based, no external images) ── */
function GridMockup() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const employees = [
    { name: 'Иван С.', statuses: [1,1,1,0,0,1,1,1,1,0,0,1,1,2,1,0,0,1,1,1,3,0,0,1,1,1,1,0,0,1,1] },
    { name: 'Мария К.', statuses: [1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,2,0,0,1,1,1,1,0,0,3,1,1] },
    { name: 'Алексей П.', statuses: [0,0,1,1,1,1,0,0,1,1,1,1,3,0,0,1,1,1,1,0,0,1,1,1,2,0,0,1,1,1,1] },
    { name: 'Ольга Н.', statuses: [1,1,1,1,0,0,1,1,1,3,0,0,1,1,1,1,0,0,1,1,1,1,0,0,2,1,1,1,0,0,1] },
    { name: 'Дмитрий В.', statuses: [1,0,0,1,1,1,1,2,0,0,1,1,1,1,0,0,1,1,1,1,3,0,0,1,1,0,0,1,1,1,1] },
  ]
  // 0=dayoff, 1=work, 2=vacation, 3=sick
  const colors: Record<number, string> = {
    0: 'var(--st-dayoff)',
    1: 'var(--st-work)',
    2: 'var(--st-vacation)',
    3: 'var(--st-sick)',
  }

  return (
    <div className="overflow-hidden rounded-[--radius-lg] border border-border shadow-[var(--shadow-md)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-card px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm text-foreground">График команды — Июнь 2025</span>
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-st-sick opacity-60" style={{ background: 'var(--st-sick)' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: 'var(--st-vacation)' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: 'var(--st-work)' }} />
        </div>
      </div>

      <div className="overflow-x-auto bg-card">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-muted/60 px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[100px]">
                Сотрудник
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className={`min-w-[24px] px-1 py-2 text-center font-normal text-muted-foreground ${
                    d === 15 ? 'bg-accent/10 font-semibold text-accent' : ''
                  }`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, ri) => (
              <tr key={emp.name} className={ri % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium text-foreground">
                  {emp.name}
                </td>
                {emp.statuses.map((s, ci) => (
                  <td key={ci} className="px-0.5 py-1">
                    <div
                      className="mx-auto h-5 w-5 rounded-sm"
                      style={{ background: colors[s], opacity: 0.85 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-muted/30 border-t border-border px-4 py-2.5">
        {[
          { color: 'var(--st-work)', label: 'Работает' },
          { color: 'var(--st-vacation)', label: 'Отпуск' },
          { color: 'var(--st-sick)', label: 'Больничный' },
          { color: 'var(--st-dayoff)', label: 'Выходной' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
