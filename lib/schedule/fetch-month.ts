import { monthRange } from './month'
import type { MonthData } from './types'
import type { Database } from '@/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type AnySupabase = SupabaseClient<Database>

/** Единый месяц-фетчер для SSR и клиента: 5 параллельных запросов под RLS. */
export async function fetchMonthData(supabase: AnySupabase, year: number, month: number): Promise<MonthData> {
  const { from, to } = monthRange(year, month)
  const [employees, departments, statusTypes, entries, alertConfigs] = await Promise.all([
    supabase.from('employees').select('*').is('deleted_at', null).order('dept_id').order('sort_order'),
    supabase.from('departments').select('*').order('name'),
    supabase.from('status_types').select('*').order('sort_order'),
    supabase.from('schedule_entries').select('*').gte('entry_date', from).lte('entry_date', to),
    supabase.from('alert_configs').select('*'),
  ])
  return {
    employees: employees.data ?? [],
    departments: departments.data ?? [],
    statusTypes: statusTypes.data ?? [],
    entries: entries.data ?? [],
    alertConfigs: alertConfigs.data ?? [],
  }
}
