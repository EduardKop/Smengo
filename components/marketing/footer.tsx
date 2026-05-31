import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ScrollLink } from '@/components/marketing/scroll-link'
import { Link } from '@/i18n/routing'

export async function MarketingFooter() {
  const t = await getTranslations('marketing.footer')
  const tNav = await getTranslations('marketing.nav')
  const tCommon = await getTranslations('common')

  const colLabel =
    'text-[11px] font-semibold uppercase'
  const colLink =
    'text-[13.5px] text-muted-foreground hover:text-foreground transition-colors'

  return (
    <footer className="border-t border-border" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-10 sm:[grid-template-columns:1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 max-w-[260px] sm:col-span-1">
            <Link
              href="/"
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.035em' }}
            >
              smengo
              <span
                className="ml-1 inline-block h-[5px] w-[5px] translate-y-[-2px] rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            </Link>
            <p
              className="mt-2 text-[13px] leading-[1.6]"
              style={{ color: 'var(--subtle)' }}
            >
              {t('tagline')}
            </p>
            <div className="mt-5">
              <LocaleSwitcher />
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-2">
            <span className={colLabel} style={{ letterSpacing: '0.08em', color: 'var(--subtle)' }}>
              {tNav('product')}
            </span>
            <ScrollLink id="features" className={colLink}>{t('productFeatures')}</ScrollLink>
            <Link href="/pricing" className={colLink}>{t('productPricing')}</Link>
            <Link href="/changelog" className={colLink}>{t('productChangelog')}</Link>
            <Link href="/roadmap" className={colLink}>{t('productRoadmap')}</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2">
            <span className={colLabel} style={{ letterSpacing: '0.08em', color: 'var(--subtle)' }}>
              {t('company')}
            </span>
            <Link href="/about" className={colLink}>{t('companyAbout')}</Link>
            <Link href="/blog" className={colLink}>{t('companyBlog')}</Link>
            <Link href="/contact" className={colLink}>{t('companyContact')}</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <span className={colLabel} style={{ letterSpacing: '0.08em', color: 'var(--subtle)' }}>
              {t('legal')}
            </span>
            <Link href="/terms" className={colLink}>{t('terms')}</Link>
            <Link href="/privacy" className={colLink}>{t('privacy')}</Link>
            <Link href="/refund" className={colLink}>{t('legalRefund')}</Link>
          </div>
        </div>

        <div
          className="mt-12 border-t border-border pt-6 text-[12px]"
          style={{ color: 'var(--subtle)' }}
        >
          © {new Date().getFullYear()} {tCommon('appName')}. {t('rights')}
        </div>
      </div>
    </footer>
  )
}
