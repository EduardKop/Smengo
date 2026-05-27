import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Check,
  CalendarRange,
  BellRing,
  MousePointerClick,
  ShieldCheck,
  Tags,
  FileDown,
  Sparkles,
  CheckCircle2,
  Gift,
  Code2,
} from 'lucide-react'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { GridPreview, type GridPreviewLabels } from '@/components/marketing/grid-preview'
import { routing, type Locale } from '@/i18n/routing'

export const revalidate = 3600

const SITE_URL = 'https://smengo.com'

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
  const t = await getTranslations({ locale, namespace: 'marketing.seo' })

  const canonical = localizedUrl(locale)
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l)
  languages['x-default'] = localizedUrl(routing.defaultLocale)

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    alternates: { canonical, languages },
    openGraph: {
      title: t('ogLandingTitle'),
      description: t('ogLandingDescription'),
      type: 'website',
      url: canonical,
      siteName: 'Smengo',
      locale: OG_LOCALE[locale] ?? 'en_US',
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogLandingTitle'),
      description: t('ogLandingDescription'),
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

const WHY_ITEMS = [
  { Icon: CalendarRange, titleKey: 'whyus.i1Title', descKey: 'whyus.i1Desc' },
  { Icon: BellRing,      titleKey: 'whyus.i2Title', descKey: 'whyus.i2Desc' },
  { Icon: MousePointerClick, titleKey: 'whyus.i3Title', descKey: 'whyus.i3Desc' },
  { Icon: ShieldCheck,   titleKey: 'whyus.i4Title', descKey: 'whyus.i4Desc' },
  { Icon: Tags,          titleKey: 'whyus.i5Title', descKey: 'whyus.i5Desc' },
  { Icon: FileDown,      titleKey: 'whyus.i6Title', descKey: 'whyus.i6Desc' },
  { Icon: Sparkles,      titleKey: 'whyus.i7Title', descKey: 'whyus.i7Desc' },
  { Icon: CheckCircle2,  titleKey: 'whyus.i8Title', descKey: 'whyus.i8Desc' },
  { Icon: Gift,          titleKey: 'whyus.i9Title', descKey: 'whyus.i9Desc' },
  { Icon: Code2,        titleKey: 'whyus.i10Title', descKey: 'whyus.i10Desc' },
] as const

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
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
    coverageSummary: tg('coverageSummary'),
    statusWork: tg('statusWork'),
    statusVac: tg('statusVac'),
    statusSick: tg('statusSick'),
    statusOff: tg('statusOff'),
    statusUncovered: tg('statusUncovered'),
    statusWorkFull: tg('statusWorkFull'),
    shiftMorning: tg('shiftMorning'),
    shiftEvening: tg('shiftEvening'),
    shiftNight: tg('shiftNight'),
    shortageBadge: tg('shortageBadge'),
    shortageLabel: tg('shortageLabel'),
    hourSuffix: tg('hourSuffix'),
    displayLabel: tg('displayLabel'),
    highContrastLabel: tg('highContrastLabel'),
    highlightWeekendsLabel: tg('highlightWeekendsLabel'),
    showTimesLabel: tg('showTimesLabel'),
    mergedLabel: tg('mergedLabel'),
    gridLabel: tg('gridLabel'),
    stickyLabel: tg('stickyLabel'),
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
    roles: {
      waiter: tg('roles.waiter'),
      host: tg('roles.host'),
      barista: tg('roles.barista'),
      cook: tg('roles.cook'),
      souschef: tg('roles.souschef'),
      pastry: tg('roles.pastry'),
      floormanager: tg('roles.floormanager'),
      shiftlead: tg('roles.shiftlead'),
      cashier: tg('roles.cashier'),
      courier: tg('roles.courier'),
    },
    shifts: {
      morning: tg('shifts.morning'),
      evening: tg('shifts.evening'),
      night: tg('shifts.night'),
      dayoff: tg('shifts.dayoff'),
      vacation: tg('shifts.vacation'),
      sick: tg('shifts.sick'),
      unfilled: tg('shifts.unfilled'),
    },
    coverageGap: tg('coverageGap'),
    months: [tg('m1'), tg('m2'), tg('m3'), tg('m4'), tg('m5')],
    colOffDays: tg('colOffDays'),
    colWorkHrs: tg('colWorkHrs'),
  }

  const industries = [
    t('proof.ind_restaurants'), t('proof.ind_retail'), t('proof.ind_warehouses'),
    t('proof.ind_callcenters'), t('proof.ind_clinics'), t('proof.ind_hotels'),
    t('proof.ind_beauty'), t('proof.ind_security'), t('proof.ind_manufacturing'),
    t('proof.ind_delivery'), t('proof.ind_fitness'), t('proof.ind_gasstations'),
    t('proof.ind_arbitrage'), t('proof.ind_sales'),
  ]
  const roles = [
    t('proof.role_founders'), t('proof.role_ceo'), t('proof.role_coo'),
    t('proof.role_ops'), t('proof.role_hr'), t('proof.role_shiftleads'),
    t('proof.role_office'), t('proof.role_pm'),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative bg-background px-4 pb-0 pt-16 sm:px-6 sm:pt-24">
        {/* Decorative: discarded spreadsheet → smengo grid — xl screens only */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden xl:block"
          style={{ position: 'absolute', left: 'calc(50% - 600px)', top: 88, zIndex: 1 }}
        >
          <svg width="700" height="640" viewBox="0 0 700 640" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
            <defs />

            {/* Hand-drawn green marker spreadsheet — tilted, cartoony */}
            <g transform="translate(110 115) scale(0.52) rotate(-15 65 80)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <g stroke="#23A566">
                {/* removed page outline */}
              </g>
              <g stroke="var(--foreground)">
                {/* Inner grid box — rounded cartoony rectangle */}
                <path d="M 32 72 C 50 68, 80 70, 102 74 C 104 95, 103 118, 100 135 C 78 138, 50 137, 27 133 C 25 110, 27 88, 32 72 Z" />
                {/* Vertical divider */}
                <path d="M 66 73 C 64 90, 65 115, 65 134" />
                {/* Horizontal dividers */}
                <path d="M 30 90 C 50 87, 80 90, 102 89" />
                <path d="M 28 113 C 50 110, 80 114, 101 112" />
              </g>
              {/* Google wordmark in brand colors */}
              <text x="28" y="42" fontSize="20" fontWeight="700" fontFamily="'Product Sans', Arial, sans-serif" stroke="none">
                <tspan fill="#4285F4">G</tspan>
                <tspan fill="#EA4335">o</tspan>
                <tspan fill="#FBBC04">o</tspan>
                <tspan fill="#4285F4">g</tspan>
                <tspan fill="#34A853">l</tspan>
                <tspan fill="#EA4335">e</tspan>
              </text>
            </g>

            {/* Hand-drawn arrow — short arc pointing down into the grid */}
            <path
              d="M 162 210 C 140 290, 175 382, 215 444"
              stroke="#d97757"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arrowhead — symmetric wings, detached from stroke */}
            <path
              d="M 193 431 L 215 444 L 225 428"
              stroke="#d97757"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Handwritten ironic label */}
            <text
              x="130"
              y="350"
              fill="#d97757"
              fontSize="30"
              fontWeight="700"
              textAnchor="end"
              transform="rotate(-6 130 350)"
              style={{ fontFamily: 'var(--font-handwriting), "Caveat", cursive' }}
            >
              {t('hero.handwrittenNote')}
            </text>
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1100px]" style={{ zIndex: 2 }}>
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
              style={{ maxWidth: 500, whiteSpace: 'pre-line' }}
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

          {/* Grid preview — breaks out wider than the 1100 hero column */}
          <div
            className="mt-14"
            style={{
              width: 'min(1560px, calc(100vw - 64px))',
              marginLeft: 'calc(50% - min(780px, calc(50vw - 32px)))',
              marginRight: 'calc(50% - min(780px, calc(50vw - 32px)))',
            }}
          >
            <GridPreview labels={gridLabels} />
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ────────────────────────────────────────── */}
      <section
        className="overflow-hidden border-y border-border"
        style={{ background: 'var(--surface)', padding: '40px 0' }}
      >
        <p
          className="mb-5 text-center text-[11px] font-semibold uppercase"
          style={{ letterSpacing: '0.1em', color: 'var(--subtle)' }}
        >
          {t('proof.label')}
        </p>

        {/* Industries — forward */}
        <div style={{
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}>
          <div className="smengo-proof-fwd">
            {[0, 1, 2, 3].map((d) => (
              <span key={d} aria-hidden={d > 0} className="smengo-proof-copy">
                {industries.map((item, i) => (
                  <span key={i} className="smengo-proof-item">
                    <span className="smengo-proof-ind">{item}</span>
                    <span className="smengo-proof-dot">·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Roles — reverse */}
        <div style={{
          overflow: 'hidden',
          marginTop: 10,
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}>
          <div className="smengo-proof-rev">
            {[0, 1, 2, 3].map((d) => (
              <span key={d} aria-hidden={d > 0} className="smengo-proof-copy">
                {roles.map((item, i) => (
                  <span key={i} className="smengo-proof-item">
                    <span className="smengo-proof-role">{item}</span>
                    <span className="smengo-proof-dot-sm">·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          .smengo-proof-fwd,
          .smengo-proof-rev {
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
          .smengo-proof-fwd { animation: smengo-scroll 120s linear infinite; }
          .smengo-proof-rev { animation: smengo-scroll 100s linear infinite reverse; }
          .smengo-proof-copy {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
          }
          .smengo-proof-item {
            display: inline-flex;
            align-items: center;
          }
          .smengo-proof-ind {
            font-family: var(--font-serif, Georgia, serif);
            font-size: 19px;
            font-weight: 500;
            letter-spacing: -0.01em;
            color: var(--foreground);
          }
          .smengo-proof-role {
            font-size: 12.5px;
            font-weight: 500;
            letter-spacing: 0.01em;
            color: var(--muted-foreground);
          }
          .smengo-proof-dot {
            margin: 0 18px;
            font-size: 17px;
            color: var(--accent);
            opacity: 0.35;
            line-height: 1;
          }
          .smengo-proof-dot-sm {
            margin: 0 13px;
            font-size: 12px;
            color: var(--subtle);
            opacity: 0.45;
            line-height: 1;
          }
          @keyframes smengo-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .smengo-proof-fwd,
            .smengo-proof-rev { animation: none; }
          }
        `}</style>
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

      {/* ── WHY US ──────────────────────────────────────────── */}
      <section id="why" className="bg-background px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <SecEye>{t('whyus.tag' as Parameters<typeof t>[0])}</SecEye>
            <h2
              className="mx-auto mt-3 font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', maxWidth: 500, lineHeight: 1.18 }}
            >
              {t('whyus.title' as Parameters<typeof t>[0]).split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="mx-auto mt-4 text-[14px] leading-[1.6] text-muted-foreground" style={{ maxWidth: 480 }}>
              {t('whyus.sub' as Parameters<typeof t>[0])}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              background: 'var(--border)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {WHY_ITEMS.map(({ Icon, titleKey, descKey }) => (
              <div key={titleKey} style={{ background: 'var(--surface)', padding: '22px 26px' }} className="flex items-start gap-4">
                <div
                  className="mt-0.5 shrink-0 flex items-center justify-center rounded-lg"
                  style={{ width: 36, height: 36, background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="mb-1 text-[14px] font-semibold text-foreground">
                    {t(titleKey as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-[12.5px] leading-[1.6] text-muted-foreground">
                    {t(descKey as Parameters<typeof t>[0])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section
        className="px-4 sm:px-6"
        style={{
          background: 'var(--zone)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 44,
          paddingBottom: 44,
        }}
      >
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 md:flex-row md:gap-0">
          <div className="flex-1 text-center md:text-left">
            <h2
              className="font-serif font-semibold text-foreground"
              style={{ fontSize: 'clamp(20px, 2.4vw, 26px)', letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              {t('band.title')}
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.55] text-muted-foreground">
              {t('band.sub')}
            </p>
          </div>

          <div className="hidden self-stretch md:block md:mx-8" style={{ width: 1, background: 'var(--border)' }} />

          <div className="flex shrink-0 items-center gap-5">
            <div className="flex items-baseline gap-2.5">
              <span
                className="font-serif font-semibold"
                style={{ fontSize: 48, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--accent)' }}
              >
                {t('band.statBig')}
              </span>
              <div>
                <p className="text-[12.5px] font-medium leading-[1.3] text-foreground">{t('band.statLabel')}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                  {t('band.statGrowth')}
                </p>
              </div>
            </div>
            <BandSparkline />
          </div>
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


function BandSparkline() {
  const pts = [12, 18, 22, 35, 48, 70, 92, 118, 160, 220, 300, 410]
  const max = Math.max(...pts)
  const w = 160, h = 56
  const sx = w / (pts.length - 1)
  const coords = pts.map((v, i) => [i * sx, h - (v / max) * (h - 6) - 2])
  const path = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`
  const last = coords[coords.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="bs-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#bs-fill)" />
      <path d={path} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--accent)" />
      <circle cx={last[0]} cy={last[1]} r="7" fill="var(--accent)" opacity="0.18" />
    </svg>
  )
}

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

