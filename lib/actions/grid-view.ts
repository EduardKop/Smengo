'use server'

import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { toClientError } from '@/lib/actions/db-error'
import { GridViewSettingsSchema, type GridViewSettings } from '@/lib/validation/grid-view'

export type GridViewActionResult = { ok: true } | { ok: false; error: string }

export async function saveGridViewAction(input: GridViewSettings): Promise<GridViewActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res

  try {
    assertCan(ctx.role, 'customize_view')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = GridViewSettingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { error } = await ctx.supabase.from('grid_view_settings').upsert(
    {
      org_id: ctx.orgId,
      settings: parsed.data,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'org_id' },
  )
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}
