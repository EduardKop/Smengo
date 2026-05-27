'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link, usePathname } from '@/i18n/routing'

export function MarketingHeader() {
  const t = useTranslations('marketing.nav')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (pathname !== '/') return
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const start = window.scrollY
    const end = el.getBoundingClientRect().top + window.scrollY - 72
    const dist = end - start
    const duration = 380
    const t0 = performance.now()
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, start + dist * ease(p))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[padding] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
        scrolled ? 'px-2 pt-3 pb-2 sm:px-3' : 'px-0 pt-0 pb-0'
      }`}
    >
      {/* Single animated bar — full-width → island */}
      <div
        className={`relative mx-auto flex w-full items-center justify-between border backdrop-blur-sm ${
          scrolled
            ? 'max-w-6xl rounded-2xl bg-background/80 px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:px-5 supports-[backdrop-filter]:bg-background/70'
            : 'max-w-full rounded-none bg-background/90 px-4 py-4 sm:px-6'
        }`}
        style={{
          transitionProperty: 'border-radius, border-top-color, border-right-color, border-bottom-color, border-left-color, background-color, box-shadow, max-width, padding',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
          borderTopColor:    scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
          borderRightColor:  scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
          borderBottomColor: scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'color-mix(in srgb, var(--border) 60%, transparent)',
          borderLeftColor:   scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
        }}
      >
        {/* Logo + Desktop nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.035em' }}
          >
            smengo
            <span className="h-[5px] w-[5px] rounded-full" style={{ background: 'var(--accent)' }} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/#how" onClick={(e) => smoothScroll(e, 'how')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('how')}
            </Link>
            <Link href="/#features" onClick={(e) => smoothScroll(e, 'features')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('feat')}
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('pricing')}
            </Link>
          </nav>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <NextLink href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {t('login')}
          </NextLink>
          <NextLink
            href="/register"
            className="rounded-lg bg-accent px-[18px] py-[9px] text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            {t('start')}
          </NextLink>
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
        <div
          className={`border-t border-border bg-background px-4 pb-4 md:hidden ${
            scrolled ? 'mx-2 rounded-b-2xl sm:mx-3' : ''
          }`}
        >
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              href="/#how"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => { smoothScroll(e, 'how'); setMobileOpen(false) }}
            >
              {t('how')}
            </Link>
            <Link
              href="/#features"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => { smoothScroll(e, 'features'); setMobileOpen(false) }}
            >
              {t('feat')}
            </Link>
            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('pricing')}
            </Link>
            <NextLink
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('login')}
            </NextLink>
            <NextLink
              href="/register"
              className="mt-1 rounded-[--radius-sm] bg-accent px-3 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              {t('start')}
            </NextLink>
          </nav>
          <div className="mt-3 flex items-center gap-3 px-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
