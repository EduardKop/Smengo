'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LocaleSwitcher } from '@/components/locale-switcher'

export function MarketingHeader() {
  const t = useTranslations('marketing.nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.035em' }}>
          smengo
          <span className="h-[5px] w-[5px] rounded-full" style={{ background: 'var(--accent)' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#how"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('how')}
          </Link>
          <Link
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('product')}
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('pricing')}
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="rounded-[--radius-sm] bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {t('start')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              href="/#how"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('how')}
            </Link>
            <Link
              href="/#features"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('product')}
            </Link>
            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('pricing')}
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              className="mt-1 rounded-[--radius-sm] bg-accent px-3 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              {t('start')}
            </Link>
          </nav>
          <div className="mt-3 px-3">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}
