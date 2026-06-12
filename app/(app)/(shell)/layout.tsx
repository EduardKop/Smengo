import type { ReactNode } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { AppSidebar, type NavItem } from '@/components/app/sidebar'
import { QueryProvider } from '@/components/providers/query-provider'

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const ctx = await getAppContext()
  const t = await getTranslations('app')
  const tBilling = await getTranslations('billing')

  const navItems: NavItem[] = [
    { key: 'schedule', href: '/schedule', label: t('nav.schedule') },
    { key: 'employees', href: '/employees', label: t('nav.employees') },
    { key: 'dashboard', href: '/dashboard', label: t('nav.dashboard') },
  ]

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar
        items={navItems}
        orgName={ctx.org.name}
        roleLabel={t(`roles.${ctx.role}`)}
        userEmail={ctx.userEmail}
        memberships={ctx.memberships.map((m) => ({ orgId: m.orgId, orgName: m.orgName }))}
        activeOrgId={ctx.org.id}
        logoutLabel={t('sidebar.logout')}
        orgSwitcherLabel={t('sidebar.orgSwitcher')}
      />
      <div className="flex min-w-0 flex-1 flex-col pt-12 md:pt-0">
        {ctx.isReadOnly && (
          <div className="sticky top-0 z-50 w-full bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
            {tBilling('trialExpired')}{' '}
            <Link href="/settings/billing" className="underline">
              {tBilling('goToBilling')}
            </Link>
          </div>
        )}
        <main className="flex-1 px-4 py-6 sm:px-8">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </div>
    </div>
  )
}
