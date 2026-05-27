'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: Theme) {
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
    const t = getInitial()
    setTheme(t)
    apply(t)
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    apply(next)
    localStorage.setItem('theme', next)
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

/** Inline script — sets `dark` class before paint to avoid flash. */
export const themeInitScript = `
(function(){try{var s=localStorage.getItem('theme');var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=t;}catch(e){}})();
`
