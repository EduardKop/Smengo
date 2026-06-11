import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Calendar, Send, Sparkles,
  FolderClosed, GraduationCap,
  LayoutDashboard, Users,
  ArrowLeftRight, Heart, Zap,
  type LucideIcon,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { ComingSoon } from '@/components/marketing/coming-soon'

export const revalidate = 3600

// slug ↔ translation key in `platform.items.*`
const SLUG_TO_KEY = {
  'schedule-grid':     'scheduleGrid',
  'telegram-bot':      'telegramBot',
  'ai-assistant':      'aiAssistant',
  'employee-database': 'employeeDatabase',
  'onboarding':        'onboarding',
  'hr-dashboard':      'hrDashboard',
  'hr-management':     'hrManagement',
  'shift-swaps':       'shiftSwaps',
  'team-motivation':   'teamMotivation',
  'fast-ui':           'fastUi',
} as const

type PlatformSlug = keyof typeof SLUG_TO_KEY

const ICON_FOR: Record<PlatformSlug, LucideIcon> = {
  'schedule-grid':     Calendar,
  'telegram-bot':      Send,
  'ai-assistant':      Sparkles,
  'employee-database': FolderClosed,
  'onboarding':        GraduationCap,
  'hr-dashboard':      LayoutDashboard,
  'hr-management':     Users,
  'shift-swaps':       ArrowLeftRight,
  'team-motivation':   Heart,
  'fast-ui':           Zap,
}

const VALID_SLUGS = Object.keys(SLUG_TO_KEY) as PlatformSlug[]

export async function generateStaticParams() {
  const params: { locale: Locale; slug: PlatformSlug }[] = []
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
  if (!VALID_SLUGS.includes(slug as PlatformSlug)) return {}
  const t = await getTranslations({ locale, namespace: 'marketing.platform.items' })
  const itemKey = SLUG_TO_KEY[slug as PlatformSlug]
  return {
    title: `Smengo · ${t(itemKey as Parameters<typeof t>[0])}`,
  }
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  if (!VALID_SLUGS.includes(slug as PlatformSlug)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'marketing.platform.items' })
  const itemKey = SLUG_TO_KEY[slug as PlatformSlug]
  const label = t(itemKey as Parameters<typeof t>[0])
  const Icon = ICON_FOR[slug as PlatformSlug]

  return (
    <ComingSoon
      locale={locale}
      label={label}
      icon={<Icon size={30} strokeWidth={1.75} />}
      variant="platform"
    />
  )
}
