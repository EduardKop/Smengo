import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function MarketingFooter() {
  const t = await getTranslations('marketing.footer')
  const tNav = await getTranslations('marketing.nav')
  const tCommon = await getTranslations('common')

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
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
            <p className="mt-2 text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-10">
            {/* Product */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tNav('product')}
              </span>
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                {t('productFeatures')}
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                {t('productPricing')}
              </Link>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('company')}
              </span>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                {t('companyAbout')}
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                {t('companyBlog')}
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                {t('companyContact')}
              </Link>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('legal')}
              </span>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                {t('terms')}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {tCommon('appName')}. {t('rights')}
        </div>
      </div>
    </footer>
  )
}
