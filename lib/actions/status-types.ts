'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { toClientError } from '@/lib/actions/db-error'
import { StatusTypeSchema } from '@/lib/validation/schedule'

export type StatusTypeActionResult = { ok: true } | { ok: false; error: string }

const UUIDSchema = z.string().uuid()

export async function createStatusTypeAction(
  input: z.infer<typeof StatusTypeSchema>,
): Promise<StatusTypeActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'manage_status_types')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = StatusTypeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  // Compute sort_order = count_of_existing * 10 + 10 (so first custom = 10, next = 20…)
  const { count, error: countError } = await ctx.supabase
    .from('status_types')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', ctx.orgId)

  if (countError) return { ok: false, error: toClientError(countError) }
  const sortOrder = ((count ?? 0) + 1) * 10

  const { label, code, color, counts_as_present, start_time, end_time } = parsed.data

  const { error } = await ctx.supabase.from('status_types').insert({
    org_id: ctx.orgId,
    code,
    label: { ru: label, uk: label, en: label },
    color,
    counts_as_present,
    start_time: start_time ?? null,
    end_time: end_time ?? null,
    sort_order: sortOrder,
    is_system: false,
  })

  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function updateStatusTypeAction(
  id: string,
  input: z.infer<typeof StatusTypeSchema>,
): Promise<StatusTypeActionResult> {
  const idCheck = UUIDSchema.safeParse(id)
  if (!idCheck.success) return { ok: false, error: 'invalid_id' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'manage_status_types')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = StatusTypeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { label, code, color, counts_as_present, start_time, end_time } = parsed.data

  const { error } = await ctx.supabase
    .from('status_types')
    .update({
      code,
      label: { ru: label, uk: label, en: label },
      color,
      counts_as_present,
      start_time: start_time ?? null,
      end_time: end_time ?? null,
    })
    .eq('id', id)
    .eq('org_id', ctx.orgId)
    .eq('is_system', false)

  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function deleteStatusTypeAction(id: string): Promise<StatusTypeActionResult> {
  const idCheck = UUIDSchema.safeParse(id)
  if (!idCheck.success) return { ok: false, error: 'invalid_id' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'manage_status_types')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  // Guard: cannot delete if status is in use by any schedule entry
  const { count, error: usageError } = await ctx.supabase
    .from('schedule_entries')
    .select('id', { count: 'exact', head: true })
    .eq('status_id', id)
    .eq('org_id', ctx.orgId)

  if (usageError) return { ok: false, error: toClientError(usageError) }
  if ((count ?? 0) > 0) return { ok: false, error: 'status_in_use' }

  const { error } = await ctx.supabase
    .from('status_types')
    .delete()
    .eq('id', id)
    .eq('org_id', ctx.orgId)
    .eq('is_system', false)

  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}
