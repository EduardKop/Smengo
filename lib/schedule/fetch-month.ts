import { monthRange } from './month'
import type { MonthData, ScheduleEntryRow } from './types'
import type { Database } from '@/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type AnySupabase = SupabaseClient<Database>

/**
 * PostgREST режет любой ответ серверным капом max_rows (по умолчанию 1000),
 * и .range() его НЕ обходит. Месяц на 300 сотрудников — до ~9 300 записей,
 * поэтому entries читаются страницами до неполной страницы.
 */
const PAGE = 1000
const MAX_PAGES = 32 // ~32k записей: потолок плана (300 сотр.) с запасом

async function fetchAllEntries(supabase: AnySupabase, from: string, to: string): Promise<ScheduleEntryRow[]> {
  const all: ScheduleEntryRow[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data } = await supabase
      .from('schedule_entries')
      .select('*')
      .gte('entry_date', from)
      .lte('entry_date', to)
      .order('entry_date')
      .order('employee_id')
      .range(page * PAGE, page * PAGE + PAGE - 1)
    const rows = data ?? []
    all.push(...rows)
    if (rows.length < PAGE) break
  }
  return all
}

/** Единый месяц-фетчер для SSR и клиента: 5 параллельных запросов под RLS. */
export async function fetchMonthData(supabase: AnySupabase, year: number, month: number): Promise<MonthData> {
  const { from, to } = monthRange(year, month)
  const [employees, departments, statusTypes, entries, alertConfigs] = await Promise.all([
    supabase.from('employees').select('*').is('deleted_at', null).order('dept_id').order('sort_order'),
    supabase.from('departments').select('*').order('name'),
    supabase.from('status_types').select('*').order('sort_order'),
    fetchAllEntries(supabase, from, to),
    supabase.from('alert_configs').select('*'),
  ])
  return {
    employees: employees.data ?? [],
    departments: departments.data ?? [],
    statusTypes: statusTypes.data ?? [],
    entries,
    alertConfigs: alertConfigs.data ?? [],
  }
}
