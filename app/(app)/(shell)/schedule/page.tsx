import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAppContext } from '@/lib/auth/context'
import { todayISOInTz } from '@/lib/schedule/month'
import { fetchMonthData } from '@/lib/schedule/fetch-month'
import { ScheduleGrid } from '@/components/schedule/grid'

interface PageProps {
  searchParams: Promise<{ m?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const ctx = await getAppContext()
  const t = await getTranslations('app.schedule')
  const supabase = await createClient()

  const { m } = await searchParams
  const today = todayISOInTz(ctx.org.timezone ?? 'Europe/Kyiv')
  const fallback = today.slice(0, 7)
  const mParam = /^\d{4}-(0[1-9]|1[0-2])$/.test(m ?? '') ? (m as string) : fallback
  const [yearStr, monthStr] = mParam.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const initialData = await fetchMonthData(supabase, year, month)

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">{t('title')}</h1>
      <ScheduleGrid
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
