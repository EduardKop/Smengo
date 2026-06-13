'use client'

/**
 * Имя текущей страницы в шапке — через слеш после чипа организации
 * («АстроТест / Расписание»). Названия совпадают с пунктами меню (nav +
 * меню профиля), на языке сайта, обычным шрифтом, тусклым цветом.
 */

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

/** pathname-префикс → ключ в неймспейсе app (совпадает с названием меню) */
const ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['/schedule', 'nav.schedule'],
  ['/dashboard', 'nav.dashboard'],
  ['/employees', 'nav.employees'],
  ['/my_account', 'userMenu.myAccount'],
  ['/settings/billing', 'userMenu.plans'],
  ['/settings/company', 'userMenu.companySettings'],
]

export function PageBreadcrumb() {
  const pathname = usePathname()
  const t = useTranslations('app')
  const match = ROUTES.find(([prefix]) => pathname.startsWith(prefix))
  if (!match) return null

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="select-none text-lg font-light text-[var(--subtle)]">
        /
      </span>
      <span className="truncate text-[15px] font-medium text-muted-foreground">{t(match[1])}</span>
    </span>
  )
}
