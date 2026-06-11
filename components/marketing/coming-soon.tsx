import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import NextLink from 'next/link'
import { PlatformBackdrop, CTA_PRIMARY, CTA_SECONDARY_ADAPTIVE } from './platform-sales-sections'

/**
 * Localized placeholder for platform / industry pages that are not built yet.
 * Instead of a dead end it routes visitors to the live feature pages and the trial.
 */

// Feature pages that already have full landings — shown as "available now" links.
const LIVE_FEATURES = [
  { slug: 'schedule-grid', itemKey: 'scheduleGrid' },
  { slug: 'employee-database', itemKey: 'employeeDatabase' },
  { slug: 'hr-dashboard', itemKey: 'hrDashboard' },
  { slug: 'hr-management', itemKey: 'hrManagement' },
  { slug: 'onboarding', itemKey: 'onboarding' },
] as const

export async function ComingSoon({
  locale,
  label,
  icon,
  variant,
}: {
  locale: Locale
  label: string
  icon: React.ReactNode
  variant: 'platform' | 'industry'
}) {
  const t = await getTranslations({ locale, namespace: 'marketing.comingSoon' })
  const tItems = await getTranslations({ locale, namespace: 'marketing.platform.items' })

  return (
    <section className="relative overflow-hidden">
      <PlatformBackdrop tone="light" />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-[560px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-foreground">
            {icon}
          </div>
          <p className="mb-4 inline-flex items-center rounded-full border border-[#e0a96d]/40 bg-[#e0a96d]/12 px-3 py-1 text-[12px] font-semibold text-[#8a5515] dark:text-[#d4924a]">
            {t('badge')}
          </p>
          <h1
            className="font-serif font-semibold text-foreground"
            style={{ fontSize: 'clamp(30px, 4.4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}
          >
            {label}
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.6] text-foreground/65">
            {variant === 'platform' ? t('subtitlePlatform') : t('subtitleIndustry')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NextLink href="/register" className={`${CTA_PRIMARY} w-full max-w-[328px] sm:w-auto`}>
              {t('ctaStart')}
            </NextLink>
            <Link href="/" className={`${CTA_SECONDARY_ADAPTIVE} w-full max-w-[328px] sm:w-auto`}>
              {t('ctaHome')}
            </Link>
          </div>
          <p className="mt-3 text-[12.5px] text-foreground/50">{t('hint')}</p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">
            {t('availableTitle')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LIVE_FEATURES.map(({ slug, itemKey }) => (
              <Link
                key={slug}
                href={`/platform/${slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-foreground/25"
              >
                <span className="min-w-0 text-[13.5px] font-medium leading-snug text-foreground">
                  {tItems(itemKey)}
                </span>
                <ArrowRight
                  size={15}
                  strokeWidth={2.4}
                  className="shrink-0 text-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/70"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
