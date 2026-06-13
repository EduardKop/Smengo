'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

// Хелперы экспортируются для меню пользователя (user-menu.tsx) —
// единая логика темы: localStorage + кука + класс dark на html.
export type Theme = 'light' | 'dark'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getCookieTheme(): Theme | null {
  if (typeof document === 'undefined') return null
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith('theme='))
    ?.split('=')[1]

  return value === 'light' || value === 'dark' ? value : null
}

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Ignore unavailable storage and fall back to cookie/system preference.
  }
  const cookieTheme = getCookieTheme()
  if (cookieTheme) return cookieTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function hasStoredTheme() {
  try {
    return localStorage.getItem('theme') === 'light' || localStorage.getItem('theme') === 'dark'
  } catch {
    return false
  }
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Ignore unavailable storage; the cookie still keeps SSR in sync.
  }
  document.cookie = `theme=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  // Disable all transitions for one frame so the switch is instant
  root.style.setProperty('--transition-override', 'none')
  const sheet = document.createElement('style')
  sheet.textContent = '*{transition:none!important}'
  document.head.appendChild(sheet)

  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.style.colorScheme = theme

  requestAnimationFrame(() => {
    document.head.removeChild(sheet)
  })
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = getInitialTheme()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage unavailable in SSR; must hydrate after mount
    setTheme(t)
    applyTheme(t)
    if (hasStoredTheme() || getCookieTheme()) persistTheme(t)
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    persistTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground ${className}`}
    >
      {mounted && theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
