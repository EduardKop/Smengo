'use client'

import type { UserRole } from '@/supabase/types'
import type { MonthData } from '@/lib/schedule/types'
import { useScheduleData } from './use-schedule'

export interface ScheduleGridProps {
  orgId: string
  role: UserRole
  isReadOnly: boolean
  year: number
  month: number
  /** YYYY-MM-DD в таймзоне организации */
  today: string
  initialData: MonthData
}

export function ScheduleGrid(props: ScheduleGridProps) {
  const { data } = useScheduleData(props.orgId, props.year, props.month, props.initialData)
  return (
    <div data-testid="schedule-grid-placeholder" className="rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
      grid: {data.employees.length} employees, {data.entries.length} entries — full UI in Task 11
    </div>
  )
}
