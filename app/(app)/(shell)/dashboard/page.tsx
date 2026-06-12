import { LayoutDashboard } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { EmptyState } from '@/components/app/empty-state'

export default async function DashboardPage() {
  const t = await getTranslations('app.dashboard')

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
      <EmptyState
        icon={<LayoutDashboard className="h-6 w-6" />}
        title={t('emptyTitle')}
        text={t('emptyText')}
        cta={{ href: '/schedule', label: t('cta') }}
      />
    </>
  )
}
