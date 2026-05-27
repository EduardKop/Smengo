import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function MarketingFooter() {
  const t = await getTranslations('marketing.footer')
  const tCommon = await getTranslations('common')

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="font-serif text-xl font-semibold text-foreground">
              <span className="text-accent">S</span>mengo
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {tCommon('appName')} — {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('product')}
              </span>
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                {t('product')}
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                {t('pricing')}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
