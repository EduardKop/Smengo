import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAppContext } from '@/lib/auth/context'
import { todayISOInTz } from '@/lib/schedule/month'
import { fetchMonthData } from '@/lib/schedule/fetch-month'
import { EmployeesView } from '@/components/schedule/employees-tab/employees-view'

export default async function EmployeesPage() {
  const ctx = await getAppContext()
  const t = await getTranslations('app.employees')
  const supabase = await createClient()

  // Текущий месяц организации — записи нужны для мини-календаря оверлея
  const today = todayISOInTz(ctx.org.timezone ?? 'Europe/Kyiv')
  const year = Number(today.slice(0, 4))
  const month = Number(today.slice(5, 7))
  const initialData = await fetchMonthData(supabase, year, month)

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
      <EmployeesView
        orgId={ctx.org.id}
        role={ctx.role}
        isReadOnly={ctx.isReadOnly}
        year={year}
        month={month}
        today={today}
        initialData={initialData}
      />
    </>
  )
}
