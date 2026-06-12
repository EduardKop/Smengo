import { monthRange } from './month'
import { AVATAR_BUCKET, AVATAR_SIGNED_URL_TTL_SECONDS } from './avatar'
import type { EmployeeRow, MonthData, ScheduleEntryRow } from './types'
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

/**
 * В БД employees.avatar_url — путь в приватном бакете; рендеру нужен URL.
 * Один batch-запрос подписывает все пути сразу (RLS select по членству);
 * не подписавшийся путь (файл удалён, нет доступа) превращается в null —
 * Avatar откатывается на инициалы.
 */
async function withSignedAvatarUrls(supabase: AnySupabase, employees: EmployeeRow[]): Promise<EmployeeRow[]> {
  const paths = [...new Set(employees.flatMap((e) => (e.avatar_url ? [e.avatar_url] : [])))]
  if (paths.length === 0) return employees

  const { data } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrls(paths, AVATAR_SIGNED_URL_TTL_SECONDS)
  const urlByPath = new Map(data?.map((item) => [item.path, item.error ? null : item.signedUrl]) ?? [])

  return employees.map((e) =>
    e.avatar_url ? { ...e, avatar_url: urlByPath.get(e.avatar_url) ?? null } : e,
  )
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
    employees: await withSignedAvatarUrls(supabase, employees.data ?? []),
    departments: departments.data ?? [],
    statusTypes: statusTypes.data ?? [],
    entries,
    alertConfigs: alertConfigs.data ?? [],
  }
}
