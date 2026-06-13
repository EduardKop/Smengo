import { createClient } from '@/lib/supabase/server'
import { getAppContext } from '@/lib/auth/context'
import { todayISOInTz } from '@/lib/schedule/month'
import { fetchMonthData } from '@/lib/schedule/fetch-month'
import { GridViewSettingsSchema, type GridViewSettings } from '@/lib/validation/grid-view'
import { ScheduleGrid } from '@/components/schedule/grid'

interface PageProps {
  searchParams: Promise<{ m?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const ctx = await getAppContext()
  const supabase = await createClient()

  const { m } = await searchParams
  const today = todayISOInTz(ctx.org.timezone ?? 'Europe/Kyiv')
  const fallback = today.slice(0, 7)
  const mParam = /^\d{4}-(0[1-9]|1[0-2])$/.test(m ?? '') ? (m as string) : fallback
  const [yearStr, monthStr] = mParam.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  // Месяц + сохранённый «Вид» грида организации параллельно (оба под RLS).
  // org_id-фильтр обязателен: членство в нескольких организациях вернуло бы
  // чужую строку (мультитенантность).
  const [initialData, viewRow] = await Promise.all([
    fetchMonthData(supabase, year, month),
    supabase
      .from('grid_view_settings')
      .select('settings')
      .eq('org_id', ctx.org.id)
      .maybeSingle(),
  ])
  // Невалидный jsonb (старый формат и т.п.) → дефолтный вид, не падаем
  const parsedView = GridViewSettingsSchema.safeParse(viewRow.data?.settings ?? {})
  const initialView: GridViewSettings = parsedView.success ? parsedView.data : {}

  return (
    <>
      <ScheduleGrid
        orgId={ctx.org.id}
        role={ctx.role}
        isReadOnly={ctx.isReadOnly}
        year={year}
        month={month}
        today={today}
        initialData={initialData}
        initialView={initialView}
      />
    </>
  )
}
