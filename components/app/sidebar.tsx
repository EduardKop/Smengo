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

/**
 * Фирменный знак (геометрия public/lockup-{light,dark}.svg 1:1): плитка
 * с тремя «строками графика». Светлая тема — тёмная плитка, тёмная —
 * кремовая, как в шапке лендинга. Инлайн-SVG вместо icon-*.png: PNG-плитки
 * названы по цвету плитки и на кремовом фоне сайдбара сливаются.
 */
export function SmengoMark({ size = 36, variant = 'auto' }: { size?: number; variant?: 'auto' | 'onLight' | 'onDark' }) {
  const tile = (fill: string, topBar: string) => (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={fill} />
      <rect x="14" y="18" width="30" height="9" rx="4.5" fill={topBar} />
      <rect x="22" y="29.5" width="30" height="9" rx="4.5" fill="#e0a96d" />
      <rect x="14" y="41" width="30" height="9" rx="4.5" fill="#9b8b73" />
    </svg>
  )
  const onLight = tile('#1f1e1c', '#f5f3ef') // тёмная плитка — для светлого фона
  const onDark = tile('#f5f3ef', '#1f1e1c') // кремовая плитка — для тёмного фона
  // Фиксированный вариант (напр. всегда тёмная панель онбординга, вне зависимости от темы)
  if (variant === 'onLight') return <span role="img" aria-label="Smengo" className="shrink-0">{onLight}</span>
  if (variant === 'onDark') return <span role="img" aria-label="Smengo" className="shrink-0">{onDark}</span>
  return (
    <span role="img" aria-label="Smengo" className="shrink-0">
      <span className="block dark:hidden">{onLight}</span>
      <span className="hidden dark:block">{onDark}</span>
    </span>
  )
}

interface AppSidebarProps {
  items: NavItem[]
  /** Только для мобильной шапки (десктоп-выход — в меню профиля) */
  logoutLabel: string
}

export function AppSidebar({ items, logoutLabel }: AppSidebarProps) {
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
        <div className="group/sb absolute inset-y-0 left-0 flex w-16 flex-col overflow-hidden border-r border-border bg-background px-3 py-4 transition-all duration-300 ease-out hover:w-60 hover:shadow-xl has-[:focus-visible]:w-60 has-[:focus-visible]:shadow-xl">
          {/* Лого: свёрнуто — только фирменный знак; раскрыто — знак + wordmark.
              Бокс w-10 h-8 + py-4 панели: центр знака (32,32) — горизонтально
              на оси иконок навигации, вертикально на оси шапки контента (h-16) */}
          <div className="mb-8 flex h-8 items-center gap-2">
            <span className="flex h-8 w-10 shrink-0 items-center justify-center">
              <SmengoMark size={30} />
            </span>
            <p className={cn(expandedText, 'text-[17px] font-semibold tracking-[-0.02em] text-foreground')}>smengo</p>
          </div>

          {nav}

          {/* Низ (правка 7): профиль/тема/выход переехали в меню профиля
              справа сверху — остаётся только переключатель языка */}
          <div className="mt-auto border-t border-border pt-4">
            <div className={cn(expandedText, 'flex items-center px-1.5')}>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <SmengoMark size={24} />
          <p className="text-base font-semibold tracking-[-0.02em] text-foreground">smengo</p>
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
