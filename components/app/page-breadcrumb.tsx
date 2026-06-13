'use client'

/**
 * Имя текущей страницы в шапке — через слеш после чипа организации
 * («АстроТест / Планирование»). На языке сайта (next-intl), обычным (не косым)
 * шрифтом, тусклым цветом. Заменяет крупные заголовки на /schedule, /dashboard,
 * /employees; на других страницах не отображается.
 */

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

function pageKey(pathname: string): 'schedule' | 'dashboard' | 'employees' | null {
  if (pathname.startsWith('/schedule')) return 'schedule'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/employees')) return 'employees'
  return null
}

export function PageBreadcrumb() {
  const pathname = usePathname()
  const t = useTranslations('app.pageNames')
  const key = pageKey(pathname)
  if (!key) return null

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="select-none text-lg font-light text-[var(--subtle)]">
        /
      </span>
      <span className="truncate text-[15px] font-medium text-muted-foreground">{t(key)}</span>
    </span>
  )
}
