import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAppContext } from '@/lib/auth/context'
import { monthRange, todayISOInTz } from '@/lib/schedule/month'
import { ScheduleGrid } from '@/components/schedule/grid'
import type { MonthData } from '@/lib/schedule/types'

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
  const { from, to } = monthRange(year, month)

  const [employees, departments, statusTypes, entries] = await Promise.all([
    supabase.from('employees').select('*').is('deleted_at', null)
      .order('dept_id').order('sort_order'),
    supabase.from('departments').select('*').order('name'),
    supabase.from('status_types').select('*').order('sort_order'),
    supabase.from('schedule_entries').select('*')
      .gte('entry_date', from).lte('entry_date', to),
  ])

  const initialData: MonthData = {
    employees: employees.data ?? [],
    departments: departments.data ?? [],
    statusTypes: statusTypes.data ?? [],
    entries: entries.data ?? [],
  }

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
