'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { upsertEntryAction, clearEntryAction } from '@/lib/actions/schedule'
import { monthRange, monthKey } from '@/lib/schedule/month'
import type { MonthData, ScheduleEntryRow } from '@/lib/schedule/types'

export function scheduleKey(orgId: string, year: number, month: number) {
  return ['schedule', orgId, monthKey(year, month)] as const
}

export function useScheduleData(orgId: string, year: number, month: number, initialData: MonthData) {
  return useQuery({
    queryKey: scheduleKey(orgId, year, month),
    initialData,
    queryFn: async (): Promise<MonthData> => {
      const supabase = createClient()
      const { from, to } = monthRange(year, month)
      const [employees, departments, statusTypes, entries] = await Promise.all([
        supabase.from('employees').select('*').is('deleted_at', null).order('dept_id').order('sort_order'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('status_types').select('*').order('sort_order'),
        supabase.from('schedule_entries').select('*').gte('entry_date', from).lte('entry_date', to),
      ])
      return {
        employees: employees.data ?? [],
        departments: departments.data ?? [],
        statusTypes: statusTypes.data ?? [],
        entries: entries.data ?? [],
      }
    },
  })
}

export interface UpsertInput {
  employee_id: string
  entry_date: string
  status_id: string
  start_time?: string | null
  end_time?: string | null
  note?: string
}

export function useUpsertEntry(orgId: string, year: number, month: number) {
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)

  return useMutation({
    mutationFn: async (input: UpsertInput) => {
      const res = await upsertEntryAction(input)
      if (!res.ok) throw new Error(res.error)
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MonthData>(key)
      if (prev) {
        const existing = prev.entries.find(
          (e) => e.employee_id === input.employee_id && e.entry_date === input.entry_date,
        )
        const optimistic: ScheduleEntryRow = {
          ...(existing ?? ({
            id: `optimistic-${input.employee_id}-${input.entry_date}`,
            org_id: orgId, note: null, created_by: null, updated_by: null,
            created_at: '', updated_at: '',
          } as ScheduleEntryRow)),
          employee_id: input.employee_id,
          entry_date: input.entry_date,
          status_id: input.status_id,
          start_time: input.start_time ?? null,
          end_time: input.end_time ?? null,
          note: input.note || null,
        }
        qc.setQueryData<MonthData>(key, {
          ...prev,
          entries: [
            ...prev.entries.filter(
              (e) => !(e.employee_id === input.employee_id && e.entry_date === input.entry_date),
            ),
            optimistic,
          ],
        })
      }
      return { prev }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useClearEntry(orgId: string, year: number, month: number) {
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)
  return useMutation({
    mutationFn: async (input: { employee_id: string; entry_date: string }) => {
      const res = await clearEntryAction(input)
      if (!res.ok) throw new Error(res.error)
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MonthData>(key)
      if (prev) {
        qc.setQueryData<MonthData>(key, {
          ...prev,
          entries: prev.entries.filter(
            (e) => !(e.employee_id === input.employee_id && e.entry_date === input.entry_date),
          ),
        })
      }
      return { prev }
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
