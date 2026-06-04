'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'
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
const headerChromeTransition =
  'max-width 300ms cubic-bezier(.4,0,.2,1), border-radius 300ms cubic-bezier(.4,0,.2,1), border-top-color 300ms cubic-bezier(.4,0,.2,1), border-right-color 300ms cubic-bezier(.4,0,.2,1), border-bottom-color 300ms cubic-bezier(.4,0,.2,1), border-left-color 300ms cubic-bezier(.4,0,.2,1), background-color 300ms cubic-bezier(.4,0,.2,1)'
const panelMotionTransition =
  'opacity 220ms cubic-bezier(.22,1,.36,1), transform 280ms cubic-bezier(.32,.72,0,1), clip-path 280ms cubic-bezier(.32,.72,0,1), -webkit-clip-path 280ms cubic-bezier(.32,.72,0,1)'
const panelSafariTransition =
  'opacity 200ms cubic-bezier(.22,1,.36,1), transform 260ms cubic-bezier(.32,.72,0,1)'

function panelMotionStyle(open: boolean, safariPerfMode: boolean): CSSProperties {
  if (safariPerfMode) {
    return {
      opacity: open ? 1 : 0,
      transform: open ? 'translate3d(0,0,0) scaleY(1)' : 'translate3d(0,-10px,0) scaleY(.96)',
      transformOrigin: 'top center',
      visibility: open ? 'visible' : 'hidden',
      transition: `${panelSafariTransition}, visibility 0ms linear ${open ? '0ms' : '260ms'}`,
      willChange: open ? 'opacity, transform' : undefined,
    }
  }

  const clipPath = open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)'

  return {
    opacity: open ? 1 : 0,
    transform: open ? 'translate3d(0,0,0) scaleY(1)' : 'translate3d(0,-8px,0) scaleY(.985)',
    transformOrigin: 'top center',
    clipPath,
    WebkitClipPath: clipPath,
    visibility: open ? 'visible' : 'hidden',
    transition: `${panelMotionTransition}, visibility 0ms linear ${open ? '0ms' : '280ms'}`,
    willChange: open ? 'opacity, transform, clip-path' : undefined,
  }
}

export function MarketingHeader() {
  const t = useTranslations('marketing.nav')
  const tBuilt = useTranslations('marketing.builtFor')
  const tPlat = useTranslations('marketing.platform')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [builtForOpen, setBuiltForOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [safariPerfMode, setSafariPerfMode] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const platformCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const mobileScrollY = useRef(0)

  useEffect(() => {
    const ua = navigator.userAgent
    const isAppleVendor = navigator.vendor === 'Apple Computer, Inc.'
    const isSafari =
      isAppleVendor && /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR/.test(ua)

    const frame = requestAnimationFrame(() => setSafariPerfMode(isSafari))

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (safariPerfMode) return

    let ticking = false
    let last = scrolled
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const next = window.scrollY > 16
        if (next !== last) {
          last = next
          setScrolled(next)
        }
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [safariPerfMode, scrolled])

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
      if (e.key === 'Escape') {
        setBuiltForOpen(false)
        setPlatformOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [builtForOpen, platformOpen])

  useEffect(() => {
    if (!mobileOpen) return

    const lockedScrollY = mobileScrollY.current || window.scrollY
    const previousBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.width = '100%'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousBodyStyle.overflow
      document.body.style.position = previousBodyStyle.position
      document.body.style.top = previousBodyStyle.top
      document.body.style.width = previousBodyStyle.width
      document.removeEventListener('keydown', onKey)
      window.scrollTo(0, lockedScrollY)
      mobileScrollY.current = 0
    }
  }, [mobileOpen])

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setBuiltForOpen(false), 150)
  }
  function openBuiltFor() {
    cancelClose()
    setPlatformOpen(false)
    setBuiltForOpen(true)
  }

  function cancelPlatformClose() {
    if (platformCloseTimer.current) {
      clearTimeout(platformCloseTimer.current)
      platformCloseTimer.current = null
    }
  }
  function schedulePlatformClose() {
    if (platformCloseTimer.current) clearTimeout(platformCloseTimer.current)
    platformCloseTimer.current = setTimeout(() => setPlatformOpen(false), 150)
  }
  function openPlatform() {
    cancelPlatformClose()
    setBuiltForOpen(false)
    setPlatformOpen(true)
  }

  function closeMobileMenu() {
    setMobileOpen(false)
  }

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
    const ease = (p: number) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p)
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, start + dist * ease(p))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // Border bottom: hide when any dropdown panel is open so it looks seamless
  const anyPanelOpen = builtForOpen || platformOpen
  const headerScrolled = !safariPerfMode && scrolled
  const borderBottomColor = anyPanelOpen
    ? 'transparent'
    : headerScrolled
      ? 'color-mix(in srgb, var(--border) 70%, transparent)'
      : 'color-mix(in srgb, var(--border) 60%, transparent)'

  return (
    <header
      className={`sticky top-0 z-[120] w-full transition-[padding] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
        headerScrolled ? 'px-2 pt-3 pb-2 sm:px-3' : 'px-0 pt-0 pb-0'
      }`}
    >
      {/*
        Safari perf: the animated island layer stays disabled in Safari.
        Its full-width bar still gets a static backdrop blur so content
        underneath is softened without scroll-driven layout animation.
      */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-3 right-2 bottom-2 left-2 mx-auto hidden max-w-6xl rounded-2xl sm:right-3 sm:left-3 md:block ${
          safariPerfMode ? 'bg-background/90' : 'backdrop-blur-sm'
        }`}
        style={{
          opacity: headerScrolled ? 1 : 0,
          transition: 'opacity 300ms cubic-bezier(.4,0,.2,1)',
          transform: 'translateZ(0)',
          willChange: 'opacity',
          contain: 'strict',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      />

      {/* Animated bar — becomes an island when scrolled */}
      <div
        ref={barRef}
        className={`relative mx-auto flex w-full flex-col border backdrop-blur-sm ${
          headerScrolled
            ? 'bg-background/80 supports-[backdrop-filter]:bg-background/70 max-w-6xl'
            : `${
                safariPerfMode
                  ? 'bg-background/[0.96] backdrop-blur-md'
                  : 'bg-background/90'
              } max-w-full rounded-none`
        }`}
        style={{
          transition: headerChromeTransition,
          isolation: 'isolate',
          willChange: 'max-width, border-radius',
          // Flatten bottom corners when any dropdown panel is open so they share the same edge
          borderRadius: headerScrolled ? (anyPanelOpen ? '1rem 1rem 0 0' : '1rem') : 0,
          borderTopColor: headerScrolled
            ? 'color-mix(in srgb, var(--border) 70%, transparent)'
            : 'transparent',
          borderRightColor: headerScrolled
            ? 'color-mix(in srgb, var(--border) 70%, transparent)'
            : 'transparent',
          borderBottomColor,
          borderLeftColor: headerScrolled
            ? 'color-mix(in srgb, var(--border) 70%, transparent)'
            : 'transparent',
        }}
      >
        {/* ── Top row: logo + nav + actions ── */}
        <div
          className={`flex w-full items-center justify-between transition-[padding] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            headerScrolled ? 'px-4 py-3.5 sm:px-5' : 'px-4 py-4 sm:px-6'
          }`}
        >
          {/* Logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center" aria-label="Smengo">
              <img
                src="/lockup-light.svg"
                alt="Smengo"
                height={28}
                className="block h-7 w-auto dark:hidden"
              />
              <img
                src="/lockup-dark.svg"
                alt="Smengo"
                height={28}
                className="hidden h-7 w-auto dark:block"
              />
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <PlatformMenu
                open={platformOpen}
                onOpen={openPlatform}
                onClose={schedulePlatformClose}
              />
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('pricing')}
              </Link>
              <BuiltForMenu open={builtForOpen} onOpen={openBuiltFor} onClose={scheduleClose} />
              <Link
                href="/#how"
                onClick={(e) => smoothScroll(e, 'how')}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('how')}
              </Link>
              <Link
                href="/#features"
                onClick={(e) => smoothScroll(e, 'features')}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t('feat')}
              </Link>
            </nav>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <LocaleSwitcher />
            <ThemeToggle />
            <NextLink
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('login')}
            </NextLink>
            <NextLink
              href="/register"
              className="bg-accent rounded-lg px-[18px] py-[9px] text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              {t('start')}
            </NextLink>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="h-10 w-10 rounded-full bg-transparent" />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              onClick={() => {
                setBuiltForOpen(false)
                setPlatformOpen(false)
                setMobileOpen((open) => {
                  if (!open) mobileScrollY.current = window.scrollY
                  return !open
                })
              }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── "Platform" expandable panel ── */}
        <div
          className="absolute z-10 hidden md:block"
          style={{
            top: '100%',
            left: headerScrolled ? -1 : 0,
            right: headerScrolled ? -1 : 0,
            pointerEvents: platformOpen ? 'auto' : 'none',
          }}
          onMouseEnter={cancelPlatformClose}
          onMouseLeave={schedulePlatformClose}
        >
          <div
            className="overflow-hidden"
            aria-hidden={!platformOpen}
            style={panelMotionStyle(platformOpen, safariPerfMode)}
          >
            <div
              className="bg-background"
              style={{
                borderRadius: headerScrolled ? '0 0 1rem 1rem' : 0,
                borderLeft: headerScrolled
                  ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)'
                  : 'none',
                borderRight: headerScrolled
                  ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)'
                  : 'none',
                borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                boxShadow: '0 24px 48px -20px rgba(31,30,28,0.22)',
              }}
            >
              <div className={`${headerScrolled ? 'p-5 sm:p-6' : 'p-6 sm:p-7'}`}>
                {/* Tagline — bold sans, matches built-for pitchTitle style */}
                <h3 className="text-foreground mb-5 text-center text-[20px] leading-[1.15] font-bold tracking-tight">
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
                        <p className="text-muted-foreground text-[12px] leading-snug">
                          {tPlat(`groups.${groupKey}.description`)}
                        </p>

                        {/* Items list — icon + label rows */}
                        <ul className="flex flex-col gap-0.5">
                          {g.items.map(({ key, href, Icon }) => (
                            <li key={key}>
                              <Link
                                href={href}
                                onClick={() => setPlatformOpen(false)}
                                className="group/item text-foreground flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                                style={{
                                  // Soft per-group hover wash
                                  ['--hover-bg' as string]: `color-mix(in srgb, var(${g.bgVar}) 75%, transparent)`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = `var(--hover-bg)`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                }}
                              >
                                <Icon
                                  size={isHero ? 17 : 16}
                                  strokeWidth={1.75}
                                  style={{ color: `var(${g.fgVar})`, flexShrink: 0 }}
                                />
                                <span className="flex-1 leading-tight">
                                  {tPlat(`items.${key}`)}
                                </span>
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

        {/* ── "Built for" expandable panel — absolute, never pushes page content ── */}
        <div
          className="absolute z-10 hidden md:block"
          style={{
            top: '100%',
            // Extend 1px past the bar's border box so the panel's side borders
            // sit at the exact same x-position as the bar's side borders.
            left: headerScrolled ? -1 : 0,
            right: headerScrolled ? -1 : 0,
            pointerEvents: builtForOpen ? 'auto' : 'none',
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div
            className="overflow-hidden"
            aria-hidden={!builtForOpen}
            style={panelMotionStyle(builtForOpen, safariPerfMode)}
          >
            <div
              className="bg-background"
              style={{
                // Bottom corners match the bar's top radius so together they form one rounded rectangle
                borderRadius: headerScrolled ? '0 0 1rem 1rem' : 0,
                // Side borders only when scrolled (island mode); unify color with bar borders
                borderLeft: headerScrolled
                  ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)'
                  : 'none',
                borderRight: headerScrolled
                  ? '1px solid color-mix(in srgb, var(--border) 70%, transparent)'
                  : 'none',
                borderBottom: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                boxShadow: '0 24px 48px -20px rgba(31,30,28,0.22)',
              }}
            >
              {/* Two-column mega-menu: pitch panel + grouped industry list */}
              <div
                className={`grid gap-8 lg:grid-cols-[260px_1fr] ${headerScrolled ? 'p-5 sm:p-6' : 'p-6 sm:p-8'}`}
              >
                {/* Left pitch column */}
                <div className="border-border/30 hidden flex-col justify-between gap-6 border-r pr-8 lg:flex">
                  <div>
                    <h3 className="text-foreground text-[20px] leading-[1.15] font-bold tracking-tight">
                      {tBuilt('pitchTitle')}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
                      {tBuilt('pitchBody')}
                    </p>
                  </div>
                  <p className="text-muted-foreground/60 text-[11px] tracking-[0.1em] uppercase">
                    {tBuilt('tagline')}
                  </p>
                </div>

                {/* Right: grouped industries */}
                <div>
                  <p className="text-muted-foreground/70 mb-2 px-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    {tBuilt('chooseIndustry')}
                  </p>
                  {INDUSTRY_GROUPS.map((group, gi) => (
                    <div key={group.groupKey} className={gi === 0 ? '' : 'mt-4'}>
                      <p className="text-muted-foreground/55 mb-1.5 px-2 text-[10.5px] font-semibold tracking-[0.12em] uppercase">
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
                              <span className="text-foreground flex-1 text-[13.5px] font-medium">
                                {tBuilt(`items.${slug}`)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Mobile-only tagline (hidden on lg+ since pitch column shows it) */}
                  <p className="text-muted-foreground/60 mt-4 px-2 text-[11px] tracking-[0.1em] uppercase lg:hidden">
                    {tBuilt('tagline')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[140] md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/55"
            onClick={closeMobileMenu}
          />
          <div className="bg-background text-foreground absolute inset-x-3 top-3 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[28px] border border-border shadow-[0_28px_90px_-42px_rgba(0,0,0,0.75)]">
            <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  aria-label="Smengo"
                  onClick={closeMobileMenu}
                >
                  <span
                    aria-hidden="true"
                    className="block h-8 w-8 rounded-[10px] bg-[url('/icon-light.png')] bg-cover bg-center dark:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="hidden h-8 w-8 rounded-[10px] bg-[url('/icon-dark.png')] bg-cover bg-center dark:block"
                  />
                  <span className="text-[15px] font-semibold tracking-[-0.02em]">smengo</span>
                </Link>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-1 px-4 pb-5 pt-4">
              {/* Platform — mobile compact */}
              <div>
                <p className="text-muted-foreground px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
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
                              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]"
                              onClick={closeMobileMenu}
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

              <div className="border-border mt-3 border-t pt-2" />

              <Link
                href="/#how"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm"
                onClick={(e) => {
                  smoothScroll(e, 'how')
                  closeMobileMenu()
                }}
              >
                {t('how')}
              </Link>
              <Link
                href="/#features"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm"
                onClick={(e) => {
                  smoothScroll(e, 'features')
                  closeMobileMenu()
                }}
              >
                {t('feat')}
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm"
                onClick={closeMobileMenu}
              >
                {t('pricing')}
              </Link>

              {/* Built for — mobile compact 2-col grid */}
              <div className="border-border mt-2 border-t pt-3">
                <p className="text-muted-foreground px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                  {t('builtFor')}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_ITEMS.map(({ slug, Icon }) => (
                    <Link
                      key={slug}
                      href={`/built-for/${slug}`}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-2 py-2 text-[13px]"
                      onClick={closeMobileMenu}
                    >
                      <Icon size={20} />
                      <span className="truncate">{tBuilt(`items.${slug}`)}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <NextLink
                href="/login"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm"
                onClick={closeMobileMenu}
              >
                {t('login')}
              </NextLink>
              <NextLink
                href="/register"
                className="bg-accent mt-1 rounded-[--radius-sm] px-3 py-2 text-center text-sm font-medium text-white"
                onClick={closeMobileMenu}
              >
                {t('start')}
              </NextLink>
            </nav>
            <div className="border-border flex items-center gap-3 border-t px-7 py-4">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
