import type { Database } from '@/supabase/types'

export type EmployeeRow = Database['public']['Tables']['employees']['Row']
export type DepartmentRow = Database['public']['Tables']['departments']['Row']
export type StatusTypeRow = Database['public']['Tables']['status_types']['Row']
export type ScheduleEntryRow = Database['public']['Tables']['schedule_entries']['Row']

export type GridMode = 'compact' | 'detail' | 'extended'

/** employeeId -> dateISO (YYYY-MM-DD) -> entry */
export type ScheduleMap = Map<string, Map<string, ScheduleEntryRow>>

/** Сырые результаты запросов месяца; entries конвертируются в ScheduleMap перед рендером грида. */
export interface MonthData {
  employees: EmployeeRow[]
  departments: DepartmentRow[]
  statusTypes: StatusTypeRow[]
  entries: ScheduleEntryRow[]
}
