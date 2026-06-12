'use server'

import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { UpsertEntrySchema, ClearEntrySchema } from '@/lib/validation/schedule'
import { toClientError } from '@/lib/actions/db-error'

export type EntryActionResult = { ok: true } | { ok: false; error: string }

// NOTE: revalidatePath не вызываем — клиент работает через TanStack Query
// (optimistic update + invalidate). Серверный рефетч страницы на каждый клик не нужен.
// NOTE: upsert шлёт ПОЛНУЮ запись — вызывающий (редактор ячейки) обязан передавать текущий note, иначе он затрётся в null.
export async function upsertEntryAction(input: {
  employee_id: string
  entry_date: string
  status_id: string
  start_time?: string | null
  end_time?: string | null
  note?: string
}): Promise<EntryActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'edit_schedule')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = UpsertEntrySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const d = parsed.data
  // Уникальность (employee_id, entry_date) — в БД; RLS дорежет чужие отделы/org
  const { error } = await ctx.supabase
    .from('schedule_entries')
    .upsert(
      {
        org_id: ctx.orgId,
        employee_id: d.employee_id,
        entry_date: d.entry_date,
        status_id: d.status_id,
        start_time: d.start_time ?? null,
        end_time: d.end_time ?? null,
        note: d.note || null,
      },
      { onConflict: 'employee_id,entry_date' },
    )
  if (error) return { ok: false, error: toClientError(error) }
  return { ok: true }
}

export async function clearEntryAction(input: { employee_id: string; entry_date: string }): Promise<EntryActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'edit_schedule')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = ClearEntrySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { error } = await ctx.supabase
    .from('schedule_entries')
    .delete()
    .eq('org_id', ctx.orgId)
    .eq('employee_id', parsed.data.employee_id)
    .eq('entry_date', parsed.data.entry_date)
  if (error) return { ok: false, error: toClientError(error) }
  return { ok: true }
}
