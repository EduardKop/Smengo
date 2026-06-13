'use client'

/**
 * Имя текущей страницы в шапке — через шеврон после плажки организации
 * («АстроТест › КОМПАНИЯ»): заглавными, в разрядку, тусклым цветом (как на
 * макете). Названия nav-страниц совпадают с меню; для настроек — короткие.
 */

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'

/** pathname-префикс → ключ в неймспейсе app */
const ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['/schedule', 'nav.schedule'],
  ['/dashboard', 'nav.dashboard'],
  ['/employees', 'nav.employees'],
  ['/my_account', 'pageShort.account'],
  ['/settings/billing', 'pageShort.billing'],
  ['/settings/company', 'pageShort.company'],
]

export function PageBreadcrumb() {
  const pathname = usePathname()
  const t = useTranslations('app')
  const match = ROUTES.find(([prefix]) => pathname.startsWith(prefix))
  if (!match) return null

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--subtle)]" />
      <span className="truncate text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t(match[1])}
      </span>
    </span>
  )
}
