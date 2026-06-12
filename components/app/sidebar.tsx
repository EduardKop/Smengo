'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, LayoutDashboard, LogOut, Users, type LucideIcon } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { switchOrgAction } from '@/lib/actions/org'
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
  orgName: string
  roleLabel: string
  userEmail: string
  memberships: { orgId: string; orgName: string }[]
  activeOrgId: string
  logoutLabel: string
  orgSwitcherLabel: string
}

export function AppSidebar({
  items,
  orgName,
  roleLabel,
  userEmail,
  memberships,
  activeOrgId,
  logoutLabel,
  orgSwitcherLabel,
}: AppSidebarProps) {
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function handleOrgChange(orgId: string) {
    if (orgId === activeOrgId) return
    const formData = new FormData()
    formData.set('org_id', orgId)
    startTransition(() => switchOrgAction(formData))
  }

  // Подпись, которая плавно проявляется при выезде панели (collapsed → текст
  // скрыт, панель 64px показывает только иконки).
  // has-[:focus-visible] вместо focus-within: панель раскрывается для
  // клавиатурной навигации, но не залипает открытой после клика мышью.
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
              'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className={cn(expandedText, 'truncate')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar: рейка 64px в потоке (контент — во всю ширину);
          панель выезжает поверх контента при hover/фокусе */}
      <aside className="sticky top-0 z-40 hidden h-screen w-16 shrink-0 md:block">
        {/* transition-all вместо transition-[width,box-shadow]: arbitrary-значение
            с запятой не генерируется Tailwind v4 (проверено в живом превью) */}
        <div className="group/sb absolute inset-y-0 left-0 flex w-16 flex-col overflow-hidden border-r border-border bg-background px-3 py-4 transition-all duration-300 ease-out hover:w-60 hover:shadow-xl has-[:focus-visible]:w-60 has-[:focus-visible]:shadow-xl">
          <div className="mb-6">
            <div className="flex items-center gap-2.5 px-0.5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-base font-bold text-accent-foreground"
              >
                S
              </span>
              <p className={cn(expandedText, 'text-lg font-semibold tracking-tight text-foreground')}>Smengo</p>
            </div>
            {memberships.length > 1 ? (
              <label className={cn(expandedText, 'mt-2 block')}>
                <span className="sr-only">{orgSwitcherLabel}</span>
                <select
                  value={activeOrgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                >
                  {memberships.map((m) => (
                    <option key={m.orgId} value={m.orgId}>
                      {m.orgName}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className={cn(expandedText, 'mt-1 truncate text-sm text-muted-foreground')}>{orgName}</p>
            )}
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
                className="flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className={cn(expandedText, 'truncate')}>{logoutLabel}</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 md:hidden">
        <p className="text-base font-semibold text-foreground">Smengo</p>
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
                  'rounded-md p-2 transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label={logoutLabel}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>
    </>
  )
}
