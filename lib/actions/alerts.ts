'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { toClientError } from '@/lib/actions/db-error'

export type AlertActionResult = { ok: true } | { ok: false; error: string }

const UUIDSchema = z.string().uuid()

const UpsertAlertSchema = z.object({
  department_id: z.string().uuid(),
  min_present: z.number().int().min(0).max(500),
})

export async function upsertAlertConfigAction(input: {
  department_id: string
  min_present: number
}): Promise<AlertActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'manage_alerts')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = UpsertAlertSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { error } = await ctx.supabase
    .from('alert_configs')
    .upsert(
      {
        org_id: ctx.orgId,
        department_id: parsed.data.department_id,
        min_present: parsed.data.min_present,
      },
      { onConflict: 'org_id,department_id' },
    )
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function deleteAlertConfigAction(department_id: string): Promise<AlertActionResult> {
  const idCheck = UUIDSchema.safeParse(department_id)
  if (!idCheck.success) return { ok: false, error: 'invalid_id' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'manage_alerts')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { error } = await ctx.supabase
    .from('alert_configs')
    .delete()
    .eq('department_id', department_id)
    .eq('org_id', ctx.orgId)
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}
