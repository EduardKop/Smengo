import type { ReactNode } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/server'
import { AVATAR_SIGNED_URL_TTL_SECONDS } from '@/lib/schedule/avatar'
import { ORG_LOGO_BUCKET, PROFILE_AVATAR_BUCKET } from '@/lib/app/avatars'
import { AppSidebar, type NavItem } from '@/components/app/sidebar'
import { OrgChip } from '@/components/app/org-chip'
import { PageBreadcrumb } from '@/components/app/page-breadcrumb'
import { UserMenu } from '@/components/app/user-menu'
import { Announcements } from '@/components/app/announcements'
import { QueryProvider } from '@/components/providers/query-provider'

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const ctx = await getAppContext()
  const t = await getTranslations('app')
  const tBilling = await getTranslations('billing')

  // Профиль пользователя + лого организации (пути в приватных бакетах → signed URLs)
  const supabase = await createClient()
  const [profileRes, orgRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', ctx.userId).single(),
    supabase.from('organizations').select('logo_url').eq('id', ctx.org.id).single(),
  ])

  const [userAvatarUrl, orgLogoUrl] = await Promise.all([
    profileRes.data?.avatar_url
      ? supabase.storage
          .from(PROFILE_AVATAR_BUCKET)
          .createSignedUrl(profileRes.data.avatar_url, AVATAR_SIGNED_URL_TTL_SECONDS)
          .then((r) => r.data?.signedUrl ?? null)
      : Promise.resolve(null),
    orgRes.data?.logo_url
      ? supabase.storage
          .from(ORG_LOGO_BUCKET)
          .createSignedUrl(orgRes.data.logo_url, AVATAR_SIGNED_URL_TTL_SECONDS)
          .then((r) => r.data?.signedUrl ?? null)
      : Promise.resolve(null),
  ])

  const userName = profileRes.data?.full_name?.trim() || ctx.userEmail

  // Порядок (правка 7): Дашборд → График → Сотрудники
  const navItems: NavItem[] = [
    { key: 'dashboard', href: '/dashboard', label: t('nav.dashboard') },
    { key: 'schedule', href: '/schedule', label: t('nav.schedule') },
    { key: 'employees', href: '/employees', label: t('nav.employees') },
  ]

  return (
    <div className="flex min-h-screen bg-muted/40 font-app">
      <AppSidebar items={navItems} logoutLabel={t('sidebar.logout')} />
      <div className="flex min-w-0 flex-1 flex-col pt-12 md:pt-0">
        {ctx.isReadOnly && (
          <div className="sticky top-0 z-50 w-full bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
            {tBilling('trialExpired')}{' '}
            <Link href="/settings/billing" className="underline">
              {tBilling('goToBilling')}
            </Link>
          </div>
        )}
        {/* Шапка контента (как в 7shifts): слева чип организации, справа
            анонсы + меню пользователя. Выезжающая панель сайдбара накрывает
            чип, не сдвигая. h-16 — вертикальная ось знака в рейке (y=32). */}
        <header className="hidden h-16 shrink-0 items-center justify-between gap-4 px-6 md:flex">
          <div className="flex min-w-0 items-center gap-2">
            <OrgChip
              orgName={ctx.org.name}
              memberships={ctx.memberships.map((m) => ({ orgId: m.orgId, orgName: m.orgName }))}
              activeOrgId={ctx.org.id}
              switcherLabel={t('sidebar.orgSwitcher')}
              logoUrl={orgLogoUrl}
            />
            <PageBreadcrumb />
          </div>
          <div className="flex items-center gap-1.5">
            <Announcements
              labels={{
                buttonLabel: t('header.announcements'),
                title: t('header.announcements'),
                pausedTitle: t('header.announcementsPausedTitle'),
                pausedDescription: t('header.announcementsPausedDescription'),
                close: t('header.close'),
              }}
            />
            <UserMenu
              userName={userName}
              userEmail={ctx.userEmail}
              avatarUrl={userAvatarUrl}
              role={ctx.role}
              labels={{
                menuLabel: t('header.userMenu'),
                myAccount: t('userMenu.myAccount'),
                plans: t('userMenu.plans'),
                companySettings: t('userMenu.companySettings'),
                theme: t('userMenu.theme'),
                themeLight: t('userMenu.themeLight'),
                themeDark: t('userMenu.themeDark'),
                logout: t('sidebar.logout'),
              }}
            />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 md:pt-1">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </div>
    </div>
  )
}
