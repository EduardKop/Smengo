import { Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { EmptyState } from '@/components/app/empty-state'

export default async function EmployeesPage() {
  const t = await getTranslations('app.employees')

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">{t('title')}</h1>
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title={t('emptyTitle')}
        text={t('emptyText')}
      />
    </>
  )
}
