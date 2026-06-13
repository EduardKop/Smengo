import { LayoutDashboard } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { EmptyState } from '@/components/app/empty-state'

export default async function DashboardPage() {
  const t = await getTranslations('app.dashboard')

  return (
    <>
      <EmptyState
        icon={<LayoutDashboard className="h-6 w-6" />}
        title={t('emptyTitle')}
        text={t('emptyText')}
        cta={{ href: '/schedule', label: t('cta') }}
      />
    </>
  )
}
