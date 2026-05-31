'use client'

import { useLocale } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import { usePathname, getPathname, routing, type Locale } from '@/i18n/routing'
import { setLocaleCookieAction } from '@/lib/actions/locale'

const LABELS: Record<Locale, string> = {
  ru: 'RU',
  uk: 'UA',
  en: 'EN',
}

const FULL_NAMES: Record<Locale, string> = {
  ru: 'Русский',
  uk: 'Українська',
  en: 'English',
}

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const switchingRef = useRef(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom
      setDropUp(spaceBelow < 180)
    }
    setOpen((v) => !v)
  }

  const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/invite', '/auth']
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  function switchTo(next: Locale) {
    setOpen(false)
    if (switchingRef.current || next === locale) return
    switchingRef.current = true
    startTransition(async () => {
      try {
        await setLocaleCookieAction(next)
      } finally {
        if (isAuthPage) {
          window.location.reload()
        } else {
          window.location.assign(getPathname({ href: pathname, locale: next }))
        }
      }
    })
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        disabled={isPending}
        onClick={openMenu}
        className={[
          'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] font-medium tracking-wide transition-colors',
          'text-muted-foreground hover:text-foreground',
          isPending ? 'opacity-60' : '',
        ].join(' ')}
      >
        {LABELS[locale]}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute right-0 z-50 min-w-[150px] overflow-hidden rounded-lg border border-border bg-background py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          style={{
            animation: `${dropUp ? 'locale-pop-up' : 'locale-pop'} 140ms cubic-bezier(.4,0,.2,1)`,
          }}
        >
          {routing.locales.map((code) => {
            const active = code === locale
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => switchTo(code)}
                className={[
                  'flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                <span>{FULL_NAMES[code]}</span>
                <span
                  className={`ml-3 text-[11px] tracking-wide ${active ? 'text-foreground' : 'text-muted-foreground/70'}`}
                >
                  {LABELS[code]}
                </span>
              </button>
            )
          })}
        </div>
      )}
      <style jsx>{`
        @keyframes locale-pop {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes locale-pop-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
