'use client'

/**
 * Меню пользователя в правом верхнем углу контента (язык 7shifts):
 * аватар (фото или инициалы на градиенте) → дропдаун:
 * My Account · Plans & Pricing (owner) · Company Settings (owner) ·
 * Тема: светлая/тёмная · Выйти.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CreditCard, LogOut, Moon, Settings2, Sun, UserRound } from 'lucide-react'
import type { UserRole } from '@/supabase/types'
import { logoutAction } from '@/lib/actions/auth'
import { can } from '@/lib/permissions'
import {
  applyTheme,
  getInitialTheme,
  persistTheme,
  type Theme,
} from '@/components/theme-toggle'

// Палитра — AVATAR_GRADIENTS грида (декоративный набор, прецедент демо)
const USER_AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #d8f0a7 0%, #89e8b6 48%, #f6d879 100%)',
  'linear-gradient(135deg, #f0d36b 0%, #18c973 52%, #2475dd 100%)',
  'linear-gradient(135deg, #9aa7ff 0%, #e9c6ee 52%, #f0ede5 100%)',
  'linear-gradient(135deg, #10d468 0%, #0ca8dd 45%, #322bc7 100%)',
  'linear-gradient(135deg, #e13bd9 0%, #ef7b42 56%, #f2d356 100%)',
  'linear-gradient(135deg, #7cc9ff 0%, #68e1a5 44%, #ffe08a 100%)',
  'linear-gradient(135deg, #ff8fa3 0%, #a971ff 50%, #39d6c2 100%)',
  'linear-gradient(135deg, #b6e880 0%, #3bb6a6 46%, #4961dd 100%)',
]

function stableHash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function UserAvatar({ name, photoUrl, size = 32 }: { name: string; photoUrl: string | null; size?: number }) {
  const bg = USER_AVATAR_GRADIENTS[stableHash(name) % USER_AVATAR_GRADIENTS.length]
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        backgroundImage: photoUrl ? `url("${photoUrl}"), ${bg}` : bg,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.10)',
        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
        fontSize: Math.max(Math.round(size * 0.38), 8),
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {photoUrl ? null : initialsOf(name)}
    </span>
  )
}

export interface UserMenuLabels {
  menuLabel: string
  myAccount: string
  plans: string
  companySettings: string
  theme: string
  themeLight: string
  themeDark: string
  logout: string
}

interface UserMenuProps {
  userName: string
  userEmail: string
  avatarUrl: string | null
  role: UserRole
  labels: UserMenuLabels
}

export function UserMenu({ userName, userEmail, avatarUrl, role, labels }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- тема живёт в localStorage/куке, доступна только после маунта
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

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

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    persistTheme(next)
  }

  const itemCls =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/70'

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labels.menuLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center rounded-full transition-shadow hover:shadow-md"
      >
        <UserAvatar name={userName} photoUrl={avatarUrl} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="mb-1 border-b border-border px-3 pb-2 pt-1.5">
            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>

          <Link role="menuitem" href="/my_account" className={itemCls} onClick={() => setOpen(false)}>
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            {labels.myAccount}
          </Link>

          {can(role, 'billing') && (
            <Link role="menuitem" href="/settings/billing" className={itemCls} onClick={() => setOpen(false)}>
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {labels.plans}
            </Link>
          )}

          {can(role, 'manage_org') && (
            <Link role="menuitem" href="/settings/company" className={itemCls} onClick={() => setOpen(false)}>
              <Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {labels.companySettings}
            </Link>
          )}

          <div className="my-1 border-t border-border" />

          <button role="menuitem" type="button" onClick={toggleTheme} className={itemCls}>
            {mounted && theme === 'dark' ? (
              <Moon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            ) : (
              <Sun className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            )}
            {labels.theme}: {mounted && theme === 'dark' ? labels.themeDark : labels.themeLight}
          </button>

          <form action={logoutAction}>
            <button role="menuitem" type="submit" className={`${itemCls} hover:text-destructive`}>
              <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {labels.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
