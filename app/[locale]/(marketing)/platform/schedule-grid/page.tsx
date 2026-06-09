import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Layers, BarChart3,
  ArrowRight, Check, X,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { GridPreview, type GridPreviewLabels } from '@/components/marketing/grid-preview'
import { ScrollMorphGrid } from '@/components/marketing/scroll-morph-grid'
import { ParallaxLayer } from '@/components/marketing/parallax-layer'
import { GridModeDemo } from '@/components/marketing/grid-mode-demo'
import { RolesAnimVisual } from '@/components/marketing/roles-anim-visual'
import { ScheduleMarqueeCards, type ScheduleMarqueeAlert, type ScheduleMarqueeShift } from '@/components/marketing/schedule-marquee-cards'
import DragAndDropPreview from '@/dragAnddrop.png'
import AiPreview from '@/AI.png'
import PaperRuPreview from '@/paper.png'
import PaperEnPreview from '@/paper_eng.png'
import PaperUkPreview from '@/paper_ua.png'

export const revalidate = 3600

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SITE_URL = 'https://smengo.com'
const SCHEDULE_GRID_PATH = '/platform/schedule-grid'

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
  const t = await getTranslations({ locale, namespace: 'marketing.scheduleGrid.seo' })
  const canonical = localizedUrl(locale, SCHEDULE_GRID_PATH)
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localizedUrl(l, SCHEDULE_GRID_PATH)
  languages['x-default'] = localizedUrl(routing.defaultLocale, SCHEDULE_GRID_PATH)

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

// Single CTA style — used everywhere
const CTA_PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-[#e0a96d] px-6 py-3 text-[14.5px] font-semibold text-[#1f1e1c] shadow-[0_8px_24px_-8px_rgba(224,169,109,0.65)] transition-transform hover:-translate-y-0.5 hover:bg-[#d49a5a]'

const CTA_SECONDARY_ADAPTIVE =
  'inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 text-[14.5px] font-medium text-foreground transition-colors hover:bg-foreground/6'

const CTA_SECONDARY_DARK =
  'inline-flex items-center justify-center rounded-full border border-[#1f1e1c]/15 px-6 py-3 text-[14.5px] font-medium text-[#1f1e1c] transition-colors hover:bg-[#1f1e1c]/5'

const VS_THEME_LOCK_STYLE = {
  colorScheme: 'dark',
  '--background': '#0e1014',
  '--foreground': '#f2eee7',
  '--card': '#101827',
  '--card-foreground': '#f2eee7',
  '--border': 'rgba(255,255,255,0.18)',
} as CSSProperties

type BackdropTone = 'light' | 'warm' | 'ink' | 'blue' | 'green' | 'sand'

const BACKDROP_TONES: Record<
  BackdropTone,
  {
    grid: string
    track: string
  }
> = {
  light: {
    grid: 'rgba(31,30,28,0.055)',
    track: 'rgba(31,30,28,0.10)',
  },
  warm: {
    grid: 'rgba(31,30,28,0.06)',
    track: 'rgba(134,106,69,0.16)',
  },
  ink: {
    grid: 'rgba(255,255,255,0.055)',
    track: 'rgba(255,255,255,0.12)',
  },
  blue: {
    grid: 'rgba(255,255,255,0.20)',
    track: 'rgba(255,255,255,0.22)',
  },
  green: {
    grid: 'rgba(31,30,28,0.055)',
    track: 'rgba(47,158,111,0.15)',
  },
  sand: {
    grid: 'rgba(31,30,28,0.10)',
    track: 'rgba(31,30,28,0.18)',
  },
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ScheduleGridPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'marketing.scheduleGrid' })
  const tg = await getTranslations({ locale, namespace: 'marketing.gridMockup' })

  const gridLabels: GridPreviewLabels = {
    modeDetail: tg('modeDetail'), modeCompact: tg('modeCompact'), modeExtended: tg('modeExtended'),
    monthLabel: tg('monthLabel'), allDepts: tg('allDepts'), exportBtn: tg('exportBtn'),
    addEmployee: tg('addEmployee'), employee: tg('employee'),
    deptSales: tg('deptSales'), deptOps: tg('deptOps'), deptSupport: tg('deptSupport'),
    deptMarketing: tg('deptMarketing'), deptDesign: tg('deptDesign'), demoDept: tg('demoDept'),
    minDay: tg.raw('minDay'), alert: tg('alert'), coverageSummary: tg('coverageSummary'),
    statusWork: tg('statusWork'), statusVac: tg('statusVac'), statusSick: tg('statusSick'),
    statusOff: tg('statusOff'), statusUncovered: tg('statusUncovered'), statusWorkFull: tg('statusWorkFull'),
    shiftMorning: tg('shiftMorning'), shiftEvening: tg('shiftEvening'), shiftNight: tg('shiftNight'),
    shortageBadge: tg('shortageBadge'), shortageLabel: tg('shortageLabel'), hourSuffix: tg('hourSuffix'),
    displayLabel: tg('displayLabel'), highContrastLabel: tg('highContrastLabel'),
    highlightWeekendsLabel: tg('highlightWeekendsLabel'), showTimesLabel: tg('showTimesLabel'),
    mergedLabel: tg('mergedLabel'), gridLabel: tg('gridLabel'), stickyLabel: tg('stickyLabel'),
    onShiftByDepartmentLabel: tg('onShiftByDepartmentLabel'),
    timerLabel: tg('timerLabel'), todayLabel: tg('todayLabel'),
    scheduleTab: tg('scheduleTab'), employeesTab: tg('employeesTab'),
    employeeViewCards: tg('employeeViewCards'), employeeViewList: tg('employeeViewList'),
    employeePhone: tg('employeePhone'), employeeContactInfo: tg('employeeContactInfo'), employeeTelegram: tg('employeeTelegram'), employeeEmail: tg('employeeEmail'),
    employeeProject: tg('employeeProject'), employeeBirthday: tg('employeeBirthday'),
    employeeBirthdayIn: tg.raw('employeeBirthdayIn'), employeeAgeYears: tg.raw('employeeAgeYears'),
    employeeCompanyDays: tg('employeeCompanyDays'), employeeCompanyDaysValue: tg.raw('employeeCompanyDaysValue'),
    employeeAgeYearsOne: tg.raw('employeeAgeYearsOne'), employeeAgeYearsFew: tg.raw('employeeAgeYearsFew'),
    employeeCompanyDaysOne: tg.raw('employeeCompanyDaysOne'), employeeCompanyDaysFew: tg.raw('employeeCompanyDaysFew'),
    employeeActive: tg('employeeActive'), employeeLock: tg('employeeLock'),
    ariaPrevMonth: tg('ariaPrevMonth'), ariaNextMonth: tg('ariaNextMonth'),
    ariaTimerStart: tg('ariaTimerStart'), ariaTimerPause: tg('ariaTimerPause'),
    ariaNotifications: tg('ariaNotifications'), ariaUserMenu: tg('ariaUserMenu'), ariaMore: tg('ariaMore'),
    localeTag: locale,
    employeeTrainee: tg('employeeTrainee'), employeeStaff: tg('employeeStaff'),
    days: { mon: tg('days.mon'), tue: tg('days.tue'), wed: tg('days.wed'), thu: tg('days.thu'), fri: tg('days.fri'), sat: tg('days.sat'), sun: tg('days.sun') },
    projectsBtn: tg('projectsBtn'), telegramBtn: tg('telegramBtn'),
    editBtn: tg('editBtn'), editDone: tg('editDone'),
    toastCopied: tg('toastCopied'), toastExported: tg('toastExported'), toastAdded: tg('toastAdded'),
    newEmployee: tg('newEmployee'), projectBadge: tg.raw('projectBadge'),
    projectTeam: tg('projectTeam'), projectStatus: tg('projectStatus'), projectClose: tg('projectClose'),
    projects: {
      p1: { name: tg('p1Name'), desc: tg('p1Desc'), tag: tg('p1Tag') },
      p2: { name: tg('p2Name'), desc: tg('p2Desc'), tag: tg('p2Tag') },
      p3: { name: tg('p3Name'), desc: tg('p3Desc'), tag: tg('p3Tag') },
      p4: { name: tg('p4Name'), desc: tg('p4Desc'), tag: tg('p4Tag') },
      p5: { name: tg('p5Name'), desc: tg('p5Desc'), tag: tg('p5Tag') },
      p6: { name: tg('p6Name'), desc: tg('p6Desc'), tag: tg('p6Tag') },
    },
    roles: {
      salesDepartment: tg('roles.salesDepartment'),
      developmentDepartment: tg('roles.developmentDepartment'),
      hr: tg('roles.hr'),
      salesLead: tg('roles.salesLead'),
      projectManager: tg('roles.projectManager'),
    },
    roleShortLabels: {
      salesDepartment: tg('roleShortLabels.salesDepartment'),
      developmentDepartment: tg('roleShortLabels.developmentDepartment'),
      hr: tg('roleShortLabels.hr'),
      salesLead: tg('roleShortLabels.salesLead'),
      projectManager: tg('roleShortLabels.projectManager'),
    },
    specialties: {
      sales: tg('specialties.sales'),
      retention: tg('specialties.retention'),
      frontEnd: tg('specialties.frontEnd'),
      backEnd: tg('specialties.backEnd'),
      hr: tg('specialties.hr'),
      salesOps: tg('specialties.salesOps'),
      uiUx: tg('specialties.uiUx'),
      salesLead: tg('specialties.salesLead'),
      projectManager: tg('specialties.projectManager'),
    },
    employeeNames: {
      annaPetrov: tg('employeeNames.annaPetrov'),
      markSidorov: tg('employeeNames.markSidorov'),
      kateVolkova: tg('employeeNames.kateVolkova'),
      ivanMelnikov: tg('employeeNames.ivanMelnikov'),
      olgaRomanenko: tg('employeeNames.olgaRomanenko'),
      pavelYurov: tg('employeeNames.pavelYurov'),
      dariaKos: tg('employeeNames.dariaKos'),
      alexNovikov: tg('employeeNames.alexNovikov'),
      yuliaLebed: tg('employeeNames.yuliaLebed'),
      romaKarpov: tg('employeeNames.romaKarpov'),
      leraTarasova: tg('employeeNames.leraTarasova'),
    },
    shifts: { morning: tg('shifts.morning'), evening: tg('shifts.evening'), night: tg('shifts.night'), dayoff: tg('shifts.dayoff'), vacation: tg('shifts.vacation'), sick: tg('shifts.sick'), unfilled: tg('shifts.unfilled') },
    coverageGap: tg('coverageGap'),
    months: [tg('m1'), tg('m2'), tg('m3'), tg('m4'), tg('m5')],
    colOffDays: tg('colOffDays'), colWorkHrs: tg('colWorkHrs'),
    onShiftRowLabel: tg('onShiftRowLabel'),
    footerLegendDay: tg('footerLegendDay'),
    footerLegendNight: tg('footerLegendNight'),
    footerLegendVacation: tg('footerLegendVacation'),
    footerLegendSick: tg('footerLegendSick'),
    chromeOnShift: tg('chromeOnShift'), chromeOffToday: tg('chromeOffToday'), chromeToday: tg('chromeToday'),
    themeLabel: tg('themeLabel'), themeStandard: tg('themeStandard'), themeClassic: tg('themeClassic'),
    classicTeams: tg('classicTeams'), classicAbsence: tg('classicAbsence'), classicAll: tg('classicAll'), classicSearch: tg('classicSearch'),
    addSectionBtn: tg('addSectionBtn'), addSectionTitle: tg('addSectionTitle'),
    sectionNameLabel: tg('sectionNameLabel'), sectionNamePlaceholder: tg('sectionNamePlaceholder'),
    colorLabel: tg('colorLabel'), previewLabel: tg('previewLabel'), gradientLabel: tg('gradientLabel'),
    stdColorsLabel: tg('stdColorsLabel'), gradientsLabel: tg('gradientsLabel'), customColorLabel: tg('customColorLabel'),
    createBtn: tg('createBtn'), cancelBtn: tg('cancelBtn'), changeRoleTitle: tg('changeRoleTitle'),
    assignmentTitle: tg('assignmentTitle'), assignmentSubtitle: tg('assignmentSubtitle'),
    assignmentStructureLabel: tg('assignmentStructureLabel'),
    assignmentBranchLabel: tg('assignmentBranchLabel'), assignmentAddRole: tg('assignmentAddRole'),
    assignmentAddDepartment: tg('assignmentAddDepartment'),
    assignmentRolePlaceholder: tg('assignmentRolePlaceholder'), assignmentDepartmentPlaceholder: tg('assignmentDepartmentPlaceholder'),
    assignmentRoleCount: tg.raw('assignmentRoleCount'),
    assignmentNoRoles: tg('assignmentNoRoles'), saveBtn: tg('saveBtn'),
    customBadge: tg('customBadge'), resetBtn: tg('resetBtn'), showRolesLabel: tg('showRolesLabel'),
    showEmployeeRoleLabel: tg('showEmployeeRoleLabel'), showEmployeeDepartmentLabel: tg('showEmployeeDepartmentLabel'), showEmployeeDotLabel: tg('showEmployeeDotLabel'),
    empCalendarTitle: tg('empCalendarTitle'), empCalendarClose: tg('empCalendarClose'),
    empCalendarLegendWork: tg('empCalendarLegendWork'), empCalendarLegendOff: tg('empCalendarLegendOff'),
    empCalendarLegendVacation: tg('empCalendarLegendVacation'), empCalendarLegendSick: tg('empCalendarLegendSick'),
    empCalendarLegendDayoff: tg('empCalendarLegendDayoff'),
    empCalendarSummaryWorked: tg('empCalendarSummaryWorked'), empCalendarSummaryOff: tg('empCalendarSummaryOff'),
    empCalendarSummaryHours: tg('empCalendarSummaryHours'),
    aiPrompt: tg('aiPrompt'), aiRun: tg('aiRun'), aiDone: tg('aiDone'),
    aiOptimizedSummary: tg('aiOptimizedSummary'),
  }

  const pageUrl = localizedUrl(locale, SCHEDULE_GRID_PATH)
  const paperPreview = locale === 'en' ? PaperEnPreview : locale === 'uk' ? PaperUkPreview : PaperRuPreview
  const dayShiftWindow = '08:00 - 20:00'
  const nightShiftWindow = '21:00 - 07:00'
  const dayOffLabel = locale === 'ru' ? 'Выходной' : locale === 'uk' ? 'Вихідний' : 'Day off'
  const unassignedSlot = locale === 'en' ? 'Wednesday 6:00 PM' : locale === 'uk' ? 'Середа 18:00' : 'Среда 18:00'
  const unassignedStatus = locale === 'en' ? 'No staff assigned' : locale === 'uk' ? 'Співробітника не призначено' : 'Сотрудник не назначен'
  const coverageShiftCards: ScheduleMarqueeShift[] = [
    { name: gridLabels.employeeNames.annaPetrov,     role: gridLabels.roles.salesDepartment,       time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.markSidorov,    role: gridLabels.roles.salesDepartment,       time: nightShiftWindow, tone: 'night' },
    { name: gridLabels.employeeNames.kateVolkova,    role: gridLabels.roles.salesDepartment,       time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.ivanMelnikov,   role: gridLabels.roles.salesDepartment,       time: nightShiftWindow, tone: 'night' },
    { name: gridLabels.employeeNames.dariaKos,       role: gridLabels.roles.developmentDepartment, time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.alexNovikov,    role: gridLabels.roles.developmentDepartment, time: dayOffLabel,      tone: 'off' },
    { name: gridLabels.employeeNames.olgaRomanenko,  role: gridLabels.roles.salesDepartment,       time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.pavelYurov,     role: gridLabels.roles.salesDepartment,       time: nightShiftWindow, tone: 'night' },
    { name: gridLabels.employeeNames.yuliaLebed,     role: gridLabels.roles.hr,                    time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.romaKarpov,     role: gridLabels.roles.salesLead,             time: dayShiftWindow,   tone: 'day' },
    { name: gridLabels.employeeNames.leraTarasova,   role: gridLabels.roles.projectManager,        time: dayShiftWindow,   tone: 'day' },
  ]
  const coverageAlertCard: ScheduleMarqueeAlert = {
    name: unassignedSlot,
    role: gridLabels.roles.salesDepartment,
    status: unassignedStatus,
  }
  const coverageCallout = `⚠️ ${unassignedSlot} — ${unassignedStatus}`
  const pageJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('seo.title'),
      description: t('seo.description'),
      url: pageUrl,
      inLanguage: locale,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Smengo',
        url: SITE_URL,
      },
      about: {
        '@type': 'SoftwareApplication',
        name: 'Smengo',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t('seo.appDescription'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Smengo',
          item: localizedUrl(locale),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('seo.breadcrumbPlatform'),
          item: localizedUrl(locale, '/platform'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: t('seo.breadcrumbScheduleGrid'),
          item: pageUrl,
        },
      ],
    },
  ]

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* Fixed-positioned real grid that morphs between hero and demo slots on scroll (lg only) */}
      <ScrollMorphGrid labels={gridLabels} heroSlotId="hero-grid-slot" demoSlotId="demo-grid-slot" />

      {/* ──────────────────────── 1. HERO ──────────────────────── */}
      <section className="relative overflow-hidden lg:min-h-[640px]">
        <ScheduleParallaxBackdrop tone="light" />
        {/* Text column — vertically centered on desktop, sits on the left half */}
        <div className="relative z-10 flex min-h-[inherit] items-center">
          <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:py-20 lg:py-0">
            <div data-hero-text className="mx-auto max-w-[480px] text-center lg:mx-0 lg:max-w-[460px] lg:py-20 lg:text-left">
              <h1 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(34px, 5vw, 58px)', letterSpacing: '-0.025em', lineHeight: 1.04 }}>
                {t('hero.title')}
              </h1>
              <p className="mx-auto mt-5 max-w-[430px] text-[17px] leading-[1.6] text-foreground/65 lg:mx-0">
                {t('hero.subtitle')}
              </p>
              <div data-hero-buttons className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
                <Link href="/register" className={`${CTA_PRIMARY} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaStart')}</Link>
                <Link href="/pricing" className={`${CTA_SECONDARY_ADAPTIVE} w-full max-w-[328px] sm:w-auto`}>{t('hero.ctaPricing')}</Link>
                <span className="pt-1 text-center text-[12.5px] leading-snug text-foreground/50 sm:pt-0 lg:text-left">{t('hero.hint')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop hero anchor slot for ScrollMorphGrid.
            Empty — the real grid is rendered by ScrollMorphGrid as fixed-positioned
            and reads this rect to know where to sit. Width 1540 > viewport on the
            right half → right side bleeds off (section overflow-hidden clips DOM,
            morph element is fixed so it bleeds visually off screen). */}
        <div
          id="hero-grid-slot"
          aria-hidden="true"
          className="absolute top-[54%] hidden -translate-y-1/2 lg:block"
          style={{ left: '50%', width: '1540px', height: '600px' }}
        />
      </section>

      {/* ──────────────────────── 2. INTERACTIVE DEMO — CREAM ──────────────────────── */}
      <section className="relative overflow-hidden bg-[#faf4ea] px-4 py-14 sm:px-6 sm:py-16">
        <ScheduleParallaxBackdrop tone="warm" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif font-semibold text-[#1f1e1c]" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
              {t('demo.title')}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-[#1f1e1c]/65">
              {t('demo.subtitle')}
            </p>
          </div>

          {/* Desktop demo anchor slot — ScrollMorphGrid lands the real grid here, then grows it
              to bubble (~viewport) size once seated. CSS transition makes the resize smooth. */}
          <div
            id="demo-grid-slot"
            data-demo-slot
            className="mt-12 hidden w-full lg:block"
            style={{ height: '540px', transition: 'height 700ms cubic-bezier(0.32, 0.72, 0, 1)' }}
          />

          {/* Mobile / tablet: standalone static grid */}
          <div
            className="relative mt-10 lg:hidden"
            style={{
              width: 'min(1560px, calc(100vw - 24px))',
              marginLeft: 'calc(50% - min(780px, calc(50vw - 12px)))',
              marginRight: 'calc(50% - min(780px, calc(50vw - 12px)))',
            }}
          >
            <GridPreview labels={gridLabels} />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 3. CAPABILITIES — WHITE ──────────────────────── */}
      <section className="relative overflow-hidden bg-white px-4 py-14 dark:bg-background sm:px-6 sm:py-16">
        <ScheduleParallaxBackdrop tone="light" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-serif font-semibold text-foreground" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('caps.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-16">
            <CapRow
              side="left"
              accent="#3b6fd4"
              Icon={Layers}
              hideIcon
              title={t('caps.i1Title')}
              desc={t('caps.i1Desc')}
              visual={(
                <GridModeDemo
                  labels={{
                    compact:  tg('modeCompact'),
                    detail:   tg('modeDetail'),
                    extended: tg('modeExtended'),
                    employeeNames: gridLabels.employeeNames,
                    roles: {
                      cook: tg('modeDemoRoles.cook'),
                      manager: tg('modeDemoRoles.manager'),
                      cashier: tg('modeDemoRoles.cashier'),
                      barista: tg('modeDemoRoles.barista'),
                      admin: tg('modeDemoRoles.admin'),
                      waiter: tg('modeDemoRoles.waiter'),
                      courier: tg('modeDemoRoles.courier'),
                      hostess: tg('modeDemoRoles.hostess'),
                    },
                    hourSuffix: tg('hourSuffix'),
                  }}
                />
              )}
              bullets={[
                t('caps.i1B1'),
                t('caps.i1B2'),
                t('caps.i1B3'),
              ]}
              metric={{ value: t('caps.i1MetricValue'), label: t('caps.i1MetricLabel') }}
            />
            <CapRow
              side="right"
              accent="#2f9e6f"
              Icon={BarChart3}
              hideIcon
              visualSize="large"
              title={t('caps.i2Title')}
              desc={t('caps.i2Desc')}
              visual={(
                <ScheduleMarqueeCards shifts={coverageShiftCards} alert={coverageAlertCard} />
              )}
              bullets={[
                t('caps.i2B1'),
                t('caps.i2B2'),
                t('caps.i2B3'),
              ]}
              callout={coverageCallout}
            />
            <CapStacked
              accent="#7c5cc4"
              title={t('caps.i3Title')}
              desc={t('caps.i3Desc')}
              bullets={[
                t('caps.i3B1'),
                t('caps.i3B2'),
                t('caps.i3B3'),
              ]}
              visual={(
                <RolesAnimVisual
                  labels={{
                    days:  t.raw('caps.gridDays') as string[],
                    roles: t.raw('caps.i3Roles') as string[],
                  }}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 4. MANUAL vs ASSISTED ──────────────────────── */}
      <section className="bg-background px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#866a45] dark:text-[#c6ad86]">
              {t('ways.eyebrow')}
            </p>
            <h2
              className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]"
              style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              {t('ways.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.6] text-[#6d675d] dark:text-[#aaa39a]">
              {t('ways.unifier')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChoiceCard
              accent="#a07649"
              eyebrow={t('ways.manualBadge')}
              title={t('ways.manualTitle')}
              desc={t('ways.manualDesc')}
              bullets={[t('ways.manualB1'), t('ways.manualB2'), t('ways.manualB3')]}
              metric={t('ways.manualMetric')}
              preview="manual"
            />
            <ChoiceCard
              accent="#e0a96d"
              eyebrow={t('ways.aiBadge')}
              title={t('ways.aiTitle')}
              desc={t('ways.aiDesc')}
              bullets={[t('ways.aiB1'), t('ways.aiB2'), t('ways.aiB3')]}
              metric={t('ways.aiProof')}
              preview="ai"
            />
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7f2ea] text-[#2d7a55] dark:bg-[#243329] dark:text-[#9ac4aa]">
              <Check size={17} strokeWidth={2.7} />
            </span>
            <p className="text-[15px] leading-[1.55] text-[#514d47] dark:text-[#bdb7ae]">
              <span className="font-semibold text-[#20201e] dark:text-[#f2eee7]">{t('ways.resultTitle')}</span>{' '}
              {t('ways.resultText')}
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────── 5. EXCEL vs SMENGO — BLUE ──────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#3b6fd4] px-4 py-16 text-white sm:px-6 sm:py-20"
        style={VS_THEME_LOCK_STYLE}
      >
        <ScheduleParallaxBackdrop tone="blue" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)' }}
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
              {t('vs.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-white" style={{ fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.08 }}>
              {t('vs.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.65] text-white/80">
              {t('vs.subtitle')}
            </p>
          </div>

          <MobileVsStack
            items={[
              { bad: t('vs.r1Excel'), good: t('vs.r1Smengo') },
              { bad: t('vs.r2Excel'), good: t('vs.r2Smengo') },
              { bad: t('vs.r4Excel'), good: t('vs.r4Smengo') },
            ]}
          />

          <div className="hidden overflow-hidden rounded-[28px] border border-white/20 bg-[#214fae]/50 shadow-[0_28px_80px_-36px_rgba(31,30,28,0.75)] md:block">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#1d4599]/80 px-6 py-5 text-center md:px-8 md:text-left">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/65">
                  <X size={14} strokeWidth={2.4} /> {t('vs.excelTitle')}
                </span>
                <p className="mt-2 text-[13px] leading-snug text-white/55">{t('vs.excelNote')}</p>
              </div>
              <div className="bg-[#101827] px-6 py-5 text-center text-white md:px-8 md:text-left">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2f9e6f]">
                  <Check size={14} strokeWidth={2.6} /> {t('vs.smengoTitle')}
                </span>
                <p className="mt-2 text-[13px] leading-snug text-white/60">{t('vs.smengoNote')}</p>
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

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[t('vs.pill1'), t('vs.pill2'), t('vs.pill3')].map((pill) => (
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
              <span className="font-semibold text-white">{t('vs.footerTitle')}</span>{' '}
              {t('vs.footerText')}
            </p>
          </div>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-[14.5px] font-semibold text-[#1f1e1c] shadow-[0_18px_48px_-28px_rgba(31,30,28,0.85)] transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              {t('vs.ctaStart')}
              <ArrowRight size={16} strokeWidth={2.5} className="ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/28 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              {t('vs.ctaPricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────── 6. WORKS WITH THE REST — CREAM ──────────────────────── */}
      <section className="relative overflow-hidden bg-[#f6f1e8] px-4 py-16 dark:bg-[#111317] sm:px-6 sm:py-20">
        <ScheduleParallaxBackdrop tone="green" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#866a45] dark:text-[#c6ad86]">
              {t('rest.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('rest.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#6d675d] dark:text-[#aaa39a]">
              {t('rest.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RestCard tone="blue" step="01" title={t('rest.c1Title')} desc={t('rest.c1Desc')} note={t('rest.c1Note')} href="/platform/telegram-bot" more={t('rest.more')} />
            <RestCard tone="violet" step="02" title={t('rest.c2Title')} desc={t('rest.c2Desc')} note={t('rest.c2Note')} href="/platform/ai-assistant" more={t('rest.more')} />
            <RestCard tone="green" step="03" title={t('rest.c3Title')} desc={t('rest.c3Desc')} note={t('rest.c3Note')} href="/platform/shift-swaps"  more={t('rest.more')} />
          </div>
        </div>
      </section>

      {/* ──────────────────────── 7. SOCIAL PROOF + STAT — WHITE ──────────────────────── */}
      <section className="relative overflow-hidden bg-[#fbfaf5] px-4 py-16 dark:bg-[#0f1114] sm:px-6 sm:py-20">
        <ScheduleParallaxBackdrop tone="light" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#61725d] dark:text-[#a9b99e]">
              {t('proof.eyebrow')}
            </p>
            <h2 className="font-serif font-semibold text-[#20201e] dark:text-[#f2eee7]" style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
              {t('proof.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-[1.6] text-[#6d675d] dark:text-[#aaa39a]">
              {t('proof.subtitle')}
            </p>
          </div>

          <ProofPaperPanel
            image={paperPreview}
            status={t('proof.smengoStatus')}
            items={[
              {
                title: t('proof.flow3Title'),
                text: t('proof.flow3Text'),
              },
              {
                title: t('proof.flow4Title'),
                text: t('proof.flow4Text'),
              },
            ]}
            signals={[t('proof.signal1'), t('proof.signal2'), t('proof.signal3')]}
            result={t('proof.resultLine')}
          />
        </div>
      </section>

      {/* ──────────────────────── 8. FINAL CTA — SAND ──────────────────────── */}
      <section className="relative overflow-hidden bg-[#e0a96d] px-4 py-24 sm:px-6 sm:py-28">
        <ScheduleParallaxBackdrop tone="sand" />
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

// ────────────────── Sub-components ──────────────────

function ScheduleParallaxBackdrop({ tone }: { tone: BackdropTone }) {
  const colors = BACKDROP_TONES[tone]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <ParallaxLayer
        speed={0.035}
        maxOffset={32}
        className="absolute inset-x-0 -inset-y-20"
      >
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

      <ParallaxLayer
        speed={-0.055}
        maxOffset={48}
        className="absolute inset-x-0 top-4 hidden h-[430px] md:block"
      >
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

/**
 * Stacked capability block: centered heading + description + a single row
 * of check-marked bullets on top, and a full-bleed (viewport-wide) visual
 * below. Used when the visual itself benefits from horizontal room
 * (e.g. the roles marquee).
 */
function CapStacked({
  accent, title, desc, bullets, visual,
}: {
  accent: string
  title: string
  desc: string
  bullets?: string[]
  visual: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto max-w-3xl text-center">
        <h3
          className="text-[22px] font-semibold text-foreground sm:text-[26px]"
          style={{ letterSpacing: '-0.018em', lineHeight: 1.18 }}
        >
          {title}
        </h3>
        <p className="mt-3 text-[15.5px] leading-[1.6] text-foreground/65">
          {desc}
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-[14.5px] leading-[1.4] text-foreground/80"
              >
                <Check
                  size={16}
                  strokeWidth={2.6}
                  className="shrink-0"
                  style={{ color: accent }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Full-bleed visual: break out of the parent max-w container. */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        {visual}
      </div>
    </div>
  )
}

function CapRow({
  side, accent, Icon, title, desc, visual, bullets, metric, hideIcon, callout, visualSize = 'default',
}: {
  side: 'left' | 'right'
  accent: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  desc: string
  visual?: React.ReactNode
  bullets?: string[]
  metric?: { value: string; label: string }
  hideIcon?: boolean
  callout?: string
  visualSize?: 'default' | 'large'
}) {
  const gridClassName = visualSize === 'large'
    ? side === 'right'
      ? 'grid min-w-0 items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.95fr)] md:gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.95fr)]'
      : 'grid min-w-0 items-center gap-7 md:grid-cols-[minmax(300px,0.95fr)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.08fr)]'
    : 'grid min-w-0 items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-14'

  return (
    <div className={gridClassName}>
      <div className={side === 'left' ? 'min-w-0 md:order-1' : 'min-w-0 md:order-2'}>
        {!hideIcon && (
          <span
            className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Icon size={26} strokeWidth={1.8} />
          </span>
        )}
        <h3 className="max-w-full text-balance break-words text-[21px] font-semibold text-foreground sm:text-[26px]" style={{ letterSpacing: '-0.018em', lineHeight: 1.18 }}>
          {title}
        </h3>
        <p className="mt-3 max-w-[460px] break-words text-[15px] leading-[1.6] text-foreground/65 sm:text-[15.5px]">
          {desc}
        </p>

        {bullets && bullets.length > 0 && (
          <ul className="mt-6 flex min-w-0 flex-col gap-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex min-w-0 items-start gap-2.5 text-[14px] leading-[1.5] text-foreground/80 sm:text-[14.5px]">
                <Check
                  size={16}
                  strokeWidth={2.6}
                  className="mt-0.5 shrink-0"
                  style={{ color: accent }}
                />
                <span className="min-w-0 break-words">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {metric && (
          <div
            className="mt-7 inline-flex items-baseline gap-2.5 rounded-2xl border px-4 py-3"
            style={{
              borderColor: `${accent}33`,
              backgroundColor: `${accent}0d`,
            }}
          >
            <span
              className="font-serif font-bold leading-none"
              style={{ fontSize: '40px', letterSpacing: '-0.03em', color: accent }}
            >
              {metric.value}
            </span>
            <span className="text-[13.5px] font-medium leading-[1.3] text-foreground/70">
              {metric.label}
            </span>
          </div>
        )}

        {callout && (
          <div className="mt-6 inline-flex w-full max-w-[34rem] items-start gap-2 rounded-xl border border-[#e0a96d]/35 bg-[#e0a96d]/10 px-3.5 py-2.5 text-[13px] leading-snug text-[#8a5515] dark:border-[#e0a96d]/25 dark:bg-[#e0a96d]/8 dark:text-[#d4924a]">
            {callout}
          </div>
        )}
      </div>

      <div className={side === 'left' ? 'min-w-0 md:order-2' : 'min-w-0 md:order-1'}>
        {visual ?? <MiniGridVisual accent={accent} />}
      </div>
    </div>
  )
}

function MiniGridVisual({ accent }: { accent: string }) {
  return (
    <div className="relative">
      <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-[#ded8cc] bg-[#fffdf8] p-4 dark:border-white/10 dark:bg-[#171a1f]">
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

function ChoiceCard({
  accent, eyebrow, title, desc, bullets, metric, preview,
}: {
  accent: string
  eyebrow: string
  title: string
  desc: string
  bullets: string[]
  metric: string
  preview: 'manual' | 'ai'
}) {
  const isAi = preview === 'ai'
  const panelStyle = {
    background: isAi ? '#1f1e1c' : '#eae6df',
    color: isAi ? '#f5f3ef' : '#1f1e1c',
  }

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-3xl p-8 sm:p-10" style={panelStyle}>
      <p
        className="mb-4"
        style={{
          color: isAi ? '#f5f3ef' : '#1f1e1c',
          fontFamily: 'var(--font-handwriting, cursive)',
          fontSize: 'clamp(22px, 2.2vw, 28px)',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {eyebrow}
      </p>

      <h3
        className="font-sans font-bold"
        style={{
          color: isAi ? '#f5f3ef' : '#1f1e1c',
          fontSize: 'clamp(22px, 2.2vw, 30px)',
          letterSpacing: '-0.02em',
          lineHeight: 1.16,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-4 text-[15px] leading-[1.6] sm:text-[16px]"
        style={{ color: isAi ? 'rgba(245,243,239,0.74)' : 'rgba(31,30,28,0.68)' }}
      >
        {desc}
      </p>

      <ul className="mt-7 flex flex-col gap-4" role="list">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{ background: isAi ? '#e0a96d' : '#1f1e1c' }}
            >
              <Check
                size={14}
                strokeWidth={3}
                style={{ color: isAi ? '#1f1e1c' : '#f5f3ef' }}
              />
            </span>
            <span
              className="text-[15px] leading-snug sm:text-[16px]"
              style={{ color: isAi ? '#f5f3ef' : '#1f1e1c' }}
            >
              {b}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[15px] font-semibold leading-snug sm:text-[16px]" style={{ color: accent }}>
        {metric}
      </p>

      <div className="-mx-7 -mb-7 mt-auto pt-8 sm:-mx-9 sm:-mb-9">
        <ChoicePreview variant={preview} />
      </div>
    </article>
  )
}

function ChoicePreview({ variant }: { variant: 'manual' | 'ai' }) {
  const image = variant === 'manual' ? DragAndDropPreview : AiPreview

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-[#f8f5ee] shadow-[0_18px_40px_-30px_rgba(31,30,28,0.45)]"
      style={{
        aspectRatio: '1512 / 1040',
        borderColor: variant === 'ai' ? 'rgba(255,255,255,0.16)' : '#d8d0c1',
      }}
      aria-hidden="true"
    >
      <Image
        src={image}
        alt=""
        className="h-full w-full object-cover"
        sizes="(min-width: 1024px) 42vw, 100vw"
      />
    </div>
  )
}

function ProofPaperPanel({
  image, status, items, signals, result,
}: {
  image: typeof PaperRuPreview
  status: string
  items: Array<{ title: string; text: string }>
  signals: string[]
  result: string
}) {
  return (
    <div>
      <div className="grid items-center gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-10 bottom-1 h-8 rounded-full bg-[#1f1e1c]/12 blur-2xl dark:bg-black/30"
          />
          <Image
            src={image}
            alt=""
            className="relative mx-auto h-auto w-full max-w-[560px] drop-shadow-[0_18px_26px_rgba(31,30,28,0.14)]"
            sizes="(min-width: 1024px) 44vw, 100vw"
            priority={false}
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#dfe4e9] bg-white text-[#1f2937] shadow-[0_22px_60px_-48px_rgba(31,30,28,0.5)] dark:border-white/12 dark:bg-[#171a1f] dark:text-[#f2eee7]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-4 py-4 dark:border-white/12 sm:px-6">
            <span
              className="text-[20px] font-semibold text-foreground sm:text-[21px]"
              style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.035em' }}
            >
              smengo
              <span
                className="ml-1 inline-block h-[5px] w-[5px] translate-y-[-2px] rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            </span>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f5ef] px-3 py-1.5 text-[12.5px] font-semibold text-[#2fa66f] dark:bg-[#1f332b] dark:text-[#7fd0a7] sm:text-[13.5px]">
              <span className="h-2 w-2 rounded-full bg-[#2fa66f] dark:bg-[#7fd0a7]" />
              {status}
            </div>
          </div>

          <div className="px-4 sm:px-6">
            {items.map((item, index) => (
              <div
                key={item.title}
                className={`py-4 ${index > 0 ? 'border-t border-[#e5e7eb] dark:border-white/12' : ''}`}
              >
                <h3 className="text-[17px] font-bold leading-tight text-[#1f2937] dark:text-[#f2eee7] sm:text-[18px]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.45] text-[#6b7280] dark:text-[#aaa39a] sm:text-[14.5px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e5e7eb] bg-[#fbfcfd] px-4 py-4 dark:border-white/12 dark:bg-[#111317] sm:px-6">
            <div className="grid gap-2.5">
              {signals.map((signal) => (
                <div key={signal} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug text-[#273241] dark:text-[#e1ddd5] sm:text-[14px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#31a872] text-white dark:bg-[#65c998]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] bg-[#172231] px-4 py-4 text-white shadow-[0_20px_56px_-46px_rgba(16,24,35,0.75)] dark:bg-[#202834] sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#31a872] text-white dark:bg-[#65c998] dark:text-[#101814]">
            <ArrowRight size={22} strokeWidth={2.4} className="-rotate-45" />
          </span>
          <p className="text-[16px] font-semibold leading-[1.35] sm:text-[18px]">
            {result}
          </p>
        </div>
      </div>
    </div>
  )
}

function MobileVsStack({ items }: { items: Array<{ bad: string; good: string }> }) {
  return (
    <div className="grid gap-3 md:hidden">
      {items.map((item) => (
        <div key={item.good} className="overflow-hidden rounded-2xl border border-white/22 bg-white/10 backdrop-blur-sm">
          <div className="flex items-start gap-2.5 border-b border-white/16 bg-[#1d4599]/80 px-4 py-3 text-[13px] leading-[1.4] text-white/65">
            <X size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 text-white/55" />
            <span className="line-through decoration-white/30">{item.bad}</span>
          </div>
          <div className="flex items-start gap-2.5 bg-[#101827] px-4 py-3 text-[13.5px] font-semibold leading-[1.4] text-white/90">
            <Check size={14} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#65d6a5]" />
            <span>{item.good}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function VsRow({ excel, smengo }: { excel: string; smengo: string }) {
  return (
    <>
      <div className="flex min-h-[86px] items-start gap-3 border-t border-white/15 bg-[#1e489c]/80 px-6 py-5 text-[14.5px] text-white/70 md:border-r md:border-white/15 md:px-8">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
          <X size={14} strokeWidth={2.4} />
        </span>
        <span className="pt-0.5 leading-[1.45] line-through decoration-white/30 decoration-[1.5px]">{excel}</span>
      </div>
      <div className="flex min-h-[86px] items-start gap-3 border-t border-white/10 bg-[#101827] px-6 py-5 text-[14.5px] font-medium text-white/90 md:px-8">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#43c08b]/15 text-[#65d6a5]">
          <Check size={14} strokeWidth={2.6} />
        </span>
        <span className="pt-0.5 leading-[1.45]">{smengo}</span>
      </div>
    </>
  )
}

type RestCardTone = 'blue' | 'violet' | 'green'

const REST_CARD_TONES: Record<
  RestCardTone,
  {
    card: string
    step: string
    desc: string
    note: string
    link: string
  }
> = {
  blue: {
    card: 'border-[#1f56bd] bg-[#2f68d8] text-white shadow-[0_22px_60px_-44px_rgba(47,104,216,0.8)] hover:border-[#1749a6] hover:bg-[#285fc9]',
    step: 'border-white/35 bg-white/16 text-white',
    desc: 'text-white/78',
    note: 'border-white/24 bg-white/13 text-white/84',
    link: 'text-white',
  },
  violet: {
    card: 'border-[#6647ad] bg-[#7a5bc7] text-white shadow-[0_22px_60px_-44px_rgba(122,91,199,0.78)] hover:border-[#593a9d] hover:bg-[#6f50bb]',
    step: 'border-white/35 bg-white/16 text-white',
    desc: 'text-white/78',
    note: 'border-white/24 bg-white/13 text-white/84',
    link: 'text-white',
  },
  green: {
    card: 'border-[#1c7654] bg-[#238860] text-white shadow-[0_22px_60px_-44px_rgba(35,136,96,0.76)] hover:border-[#166545] hover:bg-[#1f7b56]',
    step: 'border-white/35 bg-white/16 text-white',
    desc: 'text-white/78',
    note: 'border-white/24 bg-white/13 text-white/84',
    link: 'text-white',
  },
}

function RestCard({
  tone, step, title, desc, note, href, more,
}: {
  tone: RestCardTone
  step: string
  title: string
  desc: string
  note: string
  href: string
  more: string
}) {
  const colors = REST_CARD_TONES[tone]

  return (
    <Link
      href={href}
      className={`group flex min-h-[248px] flex-col rounded-none border p-6 transition-colors ${colors.card}`}
    >
      <span
        className={`mb-6 inline-flex h-10 w-10 items-center justify-center rounded-none border font-mono text-[12px] font-semibold tracking-[0.1em] ${colors.step}`}
      >
        {step}
      </span>
      <h3 className="text-[18px] font-semibold">{title}</h3>
      <p className={`mt-2 text-[14.5px] leading-[1.58] ${colors.desc}`}>{desc}</p>
      <div className={`mt-5 rounded-none border px-3 py-2.5 text-[12.5px] font-medium leading-snug ${colors.note}`}>
        {note}
      </div>
      <span
        className={`mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold transition-transform group-hover:translate-x-0.5 ${colors.link}`}
      >
        {more}
        <ArrowRight size={14} strokeWidth={2.4} />
      </span>
    </Link>
  )
}
