'use client'

/**
 * Сайдбар продукт-зоны (правка 4, референс — 7shifts + минимализм sona.ai):
 * рейка 64px со значками в потоке (контент — во всю ширину), при hover или
 * клавиатурном фокусе панель 240px плавно выезжает ПОВЕРХ контента.
 * Свёрнуто — только логотип-знак; раскрыто — знак + «Smengo».
 * Название организации живёт не здесь, а в OrgChip (левый верх контента).
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, LayoutDashboard, LogOut, Users, type LucideIcon } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export interface NavItem {
  key: 'schedule' | 'employees' | 'dashboard'
  href: string
  label: string
}

const ICONS: Record<NavItem['key'], LucideIcon> = {
  schedule: CalendarDays,
  employees: Users,
  dashboard: LayoutDashboard,
}

interface AppSidebarProps {
  items: NavItem[]
  roleLabel: string
  userEmail: string
  logoutLabel: string
}

export function AppSidebar({ items, roleLabel, userEmail, logoutLabel }: AppSidebarProps) {
  const pathname = usePathname()

  // Подпись, которая плавно проявляется при выезде панели (collapsed → текст
  // скрыт, панель 64px показывает только иконки). has-[:focus-visible] вместо
  // focus-within: раскрытие для клавиатуры, без залипания после клика мышью.
  const expandedText = 'min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sb:opacity-100 group-has-[:focus-visible]/sb:opacity-100'

  const nav = (
    <nav className="flex flex-col gap-1 md:flex-1">
      {items.map((item) => {
        const Icon = ICONS[item.key]
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.key}
            href={item.href}
            title={item.label}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors duration-150',
              isActive
                ? 'bg-muted font-semibold text-foreground'
                : 'font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className={cn(expandedText, 'truncate')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar: рейка 64px в потоке, панель — оверлей при hover/фокусе */}
      <aside className="sticky top-0 z-40 hidden h-screen w-16 shrink-0 md:block">
        {/* transition-all вместо transition-[width,box-shadow]: arbitrary-значение
            с запятой не генерируется Tailwind v4 (проверено в живом превью) */}
        <div className="group/sb absolute inset-y-0 left-0 flex w-16 flex-col overflow-hidden border-r border-border bg-background px-3 py-5 transition-all duration-300 ease-out hover:w-60 hover:shadow-xl has-[:focus-visible]:w-60 has-[:focus-visible]:shadow-xl">
          {/* Лого: свёрнуто — только знак; раскрыто — знак + «Smengo» */}
          <div className="mb-8 flex items-center gap-2.5 px-0.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-base font-bold text-accent-foreground"
            >
              S
            </span>
            <p className={cn(expandedText, 'text-[17px] font-bold tracking-tight text-foreground')}>Smengo</p>
          </div>

          {nav}

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            <div className={cn(expandedText, 'flex items-center gap-2')}>
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
            <div className={cn(expandedText, 'min-w-0')}>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              <p className="text-xs font-medium text-foreground">{roleLabel}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title={logoutLabel}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-destructive"
              >
                <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className={cn(expandedText, 'truncate')}>{logoutLabel}</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground"
          >
            S
          </span>
          <p className="text-base font-bold tracking-tight text-foreground">Smengo</p>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const Icon = ICONS[item.key]
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </Link>
            )
          })}
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label={logoutLabel}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </header>
    </>
  )
}
