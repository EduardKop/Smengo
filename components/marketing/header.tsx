'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { BuiltForMenu } from '@/components/marketing/built-for-menu'
import { INDUSTRY_GROUPS } from '@/components/marketing/built-for-icons'
import { PlatformMenu } from '@/components/marketing/platform-menu'
import { PLATFORM_GROUPS, type PlatformGroupKey } from '@/components/marketing/platform-groups'
import { Link, usePathname } from '@/i18n/routing'

const ALL_ITEMS = INDUSTRY_GROUPS.flatMap((g) => g.items)

export function MarketingHeader() {
  const t = useTranslations('marketing.nav')
  const tBuilt = useTranslations('marketing.builtFor')
  const tPlat = useTranslations('marketing.platform')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [builtForOpen, setBuiltForOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const platformCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 16) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on outside click or Escape
  useEffect(() => {
    if (!builtForOpen && !platformOpen) return
    function onDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setBuiltForOpen(false)
        setPlatformOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setBuiltForOpen(false); setPlatformOpen(false) }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [builtForOpen, platformOpen])

  function cancelClose() {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setBuiltForOpen(false), 150)
  }
  function openBuiltFor() { cancelClose(); setPlatformOpen(false); setBuiltForOpen(true) }

  function cancelPlatformClose() {
    if (platformCloseTimer.current) { clearTimeout(platformCloseTimer.current); platformCloseTimer.current = null }
  }
  function schedulePlatformClose() {
    if (platformCloseTimer.current) clearTimeout(platformCloseTimer.current)
    platformCloseTimer.current = setTimeout(() => setPlatformOpen(false), 150)
  }
  function openPlatform() { cancelPlatformClose(); setBuiltForOpen(false); setPlatformOpen(true) }

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
    const ease = (p: number) => p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, start + dist * ease(p))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // Border bottom: hide when any dropdown panel is open so it looks seamless
  const anyPanelOpen = builtForOpen || platformOpen
  const borderBottomColor = anyPanelOpen
    ? 'transparent'
    : scrolled
      ? 'color-mix(in srgb, var(--border) 70%, transparent)'
      : 'color-mix(in srgb, var(--border) 60%, transparent)'

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[padding] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
        scrolled ? 'px-2 pt-3 pb-2 sm:px-3' : 'px-0 pt-0 pb-0'
      }`}
    >
      {/* Animated bar — becomes an island when scrolled */}
      <div
        ref={barRef}
        className={`relative mx-auto flex w-full flex-col border backdrop-blur-sm ${
          scrolled
            ? 'max-w-6xl bg-background/80 shadow-[0_4px_24px_rgba(0,0,0,0.08)] supports-[backdrop-filter]:bg-background/70'
            : 'max-w-full rounded-none bg-background/90'
        }`}
        style={{
          transitionProperty: 'border-radius, border-top-color, border-right-color, border-bottom-color, border-left-color, background-color, box-shadow, max-width, padding',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
          // Flatten bottom corners when any dropdown panel is open so they share the same edge
          borderRadius: scrolled
            ? (anyPanelOpen ? '1rem 1rem 0 0' : '1rem')
            : 0,
          borderTopColor:    scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
          borderRightColor:  scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
          borderBottomColor,
          borderLeftColor:   scrolled ? 'color-mix(in srgb, var(--border) 70%, transparent)' : 'transparent',
        }}
      >
        {/* ── Top row: logo + nav + actions ── */}
        <div className={`flex w-full items-center justify-between ${
          scrolled ? 'px-4 py-3.5 sm:px-5' : 'px-4 py-4 sm:px-6'
        }`}>
          {/* Logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center" aria-label="Smengo">
              <img src="/lockup-light.svg" alt="Smengo" height={28} className="block h-7 w-auto dark:hidden" />
              <img src="/lockup-dark.svg"  alt="Smengo" height={28} className="hidden h-7 w-auto dark:block" />
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <PlatformMenu open={platformOpen} onOpen={openPlatform} onClose={schedulePlatformClose} />
              <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t('pricing')}
              </Link>
              <BuiltForMenu open={builtForOpen} onOpen={openBuiltFor} onClose={scheduleClose} />
              <Link href="/#how" onClick={(e) => smoothScroll(e, 'how')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t('how')}
              </Link>
              <Link href="/#features" onClick={(e) => smoothScroll(e, 'features')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t('feat')}
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

        {/* ── "Platform" expandable panel ── */}
        <div
          className="absolute z-10 hidden md:block"
          style={{
            top: '100%',
            left:  scrolled ? -1 : 0,
            right: scrolled ? -1 : 0,
          }}
          onMouseEnter={cancelPlatformClose}
          onMouseLeave={schedulePlatformClose}
        >
          <div
            className={`grid transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(.32,.72,0,1)] ${
              platformOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`bg-background ${
                  platformOpen ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}
                style={{
                  borderRadius: scrolled ? '0 0 1rem 1rem' : 0,
                  borderLeft:   scrolled ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)' : 'none',
                  borderRight:  scrolled ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)' : 'none',
                  borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                  boxShadow:    '0 24px 48px -20px rgba(31,30,28,0.22)',
                }}
              >
                <div className={`${scrolled ? 'p-5 sm:p-6' : 'p-6 sm:p-7'}`}>
                  {/* Tagline — bold sans, matches built-for pitchTitle style */}
                  <h3 className="mb-5 text-center text-[20px] font-bold leading-[1.15] tracking-tight text-foreground">
                    {tPlat('tagline')}
                  </h3>

                  {/* 4-column groups — first column is the hero */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
                    {PLATFORM_GROUPS.map((g, gi) => {
                      const groupKey = g.key as PlatformGroupKey
                      const isHero = gi === 0
                      return (
                        <div
                          key={g.key}
                          className="flex flex-col gap-2.5 rounded-xl p-3 transition-colors"
                          style={
                            isHero
                              ? { background: `color-mix(in srgb, var(${g.bgVar}) 55%, transparent)` }
                              : undefined
                          }
                        >
                          {/* Pill chip with verb */}
                          <div
                            className={`inline-flex w-fit items-center rounded-md px-2.5 ${isHero ? 'py-1 text-[12.5px]' : 'py-1 text-[12px]'} font-semibold`}
                            style={{
                              background: `var(${g.bgVar})`,
                              color: `var(${g.fgVar})`,
                            }}
                          >
                            {tPlat(`groups.${groupKey}.verb`)}
                          </div>

                          {/* Short one-line description */}
                          <p className="text-[12px] leading-snug text-muted-foreground">
                            {tPlat(`groups.${groupKey}.description`)}
                          </p>

                          {/* Items list — icon + label rows */}
                          <ul className="flex flex-col gap-0.5">
                            {g.items.map(({ key, href, Icon }) => (
                              <li key={key}>
                                <Link
                                  href={href}
                                  onClick={() => setPlatformOpen(false)}
                                  className="group/item flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors"
                                  style={{
                                    // Soft per-group hover wash
                                    ['--hover-bg' as string]: `color-mix(in srgb, var(${g.bgVar}) 75%, transparent)`,
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = `var(--hover-bg)` }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                >
                                  <Icon
                                    size={isHero ? 17 : 16}
                                    strokeWidth={1.75}
                                    style={{ color: `var(${g.fgVar})`, flexShrink: 0 }}
                                  />
                                  <span className="flex-1 leading-tight">{tPlat(`items.${key}`)}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── "Built for" expandable panel — absolute, never pushes page content ── */}
        <div
          className="absolute z-10 hidden md:block"
          style={{
            top: '100%',
            // Extend 1px past the bar's border box so the panel's side borders
            // sit at the exact same x-position as the bar's side borders.
            left:  scrolled ? -1 : 0,
            right: scrolled ? -1 : 0,
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div
            className={`grid transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(.32,.72,0,1)] ${
              builtForOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`bg-background ${
                  builtForOpen ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}
                style={{
                  // Bottom corners match the bar's top radius so together they form one rounded rectangle
                  borderRadius: scrolled ? '0 0 1rem 1rem' : 0,
                  // Side borders only when scrolled (island mode); unify color with bar borders
                  borderLeft:   scrolled ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)' : 'none',
                  borderRight:  scrolled ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)' : 'none',
                  borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                  boxShadow:    '0 24px 48px -20px rgba(31,30,28,0.22)',
                }}
              >
                {/* Two-column mega-menu: pitch panel + grouped industry list */}
                <div className={`grid gap-8 lg:grid-cols-[260px_1fr] ${scrolled ? 'p-5 sm:p-6' : 'p-6 sm:p-8'}`}>
                  {/* Left pitch column */}
                  <div className="hidden flex-col justify-between gap-6 border-r border-border/30 pr-8 lg:flex">
                    <div>
                      <h3 className="text-[20px] font-bold leading-[1.15] tracking-tight text-foreground">
                        {tBuilt('pitchTitle')}
                      </h3>
                      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                        {tBuilt('pitchBody')}
                      </p>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60">
                      {tBuilt('tagline')}
                    </p>
                  </div>

                  {/* Right: grouped industries */}
                  <div>
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                      {tBuilt('chooseIndustry')}
                    </p>
                    {INDUSTRY_GROUPS.map((group, gi) => (
                      <div key={group.groupKey} className={gi === 0 ? '' : 'mt-4'}>
                        <p className="mb-1.5 px-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
                          {tBuilt(`groups.${group.groupKey}` as 'groups.shiftBusiness')}
                        </p>
                        <ul className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2 xl:grid-cols-3">
                          {group.items.map(({ slug, Icon }) => (
                            <li key={slug}>
                              <Link
                                href={`/built-for/${slug}`}
                                onClick={() => setBuiltForOpen(false)}
                                className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                                  <Icon size={26} />
                                </span>
                                <span className="flex-1 text-[13.5px] font-medium text-foreground">
                                  {tBuilt(`items.${slug}`)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Mobile-only tagline (hidden on lg+ since pitch column shows it) */}
                    <p className="mt-4 px-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground/60 lg:hidden">
                      {tBuilt('tagline')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`border-t border-border bg-background px-4 pb-4 md:hidden ${
            scrolled ? 'mx-2 rounded-b-2xl sm:mx-3' : ''
          }`}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {/* Platform — mobile compact */}
            <div className="mt-1">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('platform')}
              </p>
              <div className="flex flex-col gap-3">
                {PLATFORM_GROUPS.map((g) => {
                  const groupKey = g.key as PlatformGroupKey
                  return (
                    <div key={g.key} className="flex flex-col gap-1.5">
                      <span
                        className="inline-flex w-fit items-center rounded-md px-2 py-1 text-[12px] font-semibold"
                        style={{
                          background: `var(${g.bgVar})`,
                          color: `var(${g.fgVar})`,
                        }}
                      >
                        {tPlat(`groups.${groupKey}.verb`)}
                      </span>
                      <div className="grid grid-cols-1 gap-0.5 pl-1">
                        {g.items.map(({ key, href, Icon }) => (
                          <Link
                            key={key}
                            href={href}
                            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-muted"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.75}
                              style={{ color: `var(${g.fgVar})`, flexShrink: 0 }}
                            />
                            <span className="truncate">{tPlat(`items.${key}`)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 border-t border-border pt-2" />

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

            {/* Built for — mobile compact 2-col grid */}
            <div className="mt-2 border-t border-border pt-3">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('builtFor')}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {ALL_ITEMS.map(({ slug, Icon }) => (
                  <Link
                    key={slug}
                    href={`/built-for/${slug}`}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="truncate">{tBuilt(`items.${slug}`)}</span>
                  </Link>
                ))}
              </div>
            </div>
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
