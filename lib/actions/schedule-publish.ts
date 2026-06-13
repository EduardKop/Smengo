'use server'

/**
 * Публикация графика (правка 7): запись в schedule_publications с выбором
 * нотификации. Реальная рассылка подключится отдельной правкой — выбор
 * уже сохраняется. Гейт edit_schedule (owner/admin/manager) + RLS pub_insert.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'

const PublishSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-01$/), // YYYY-MM-01 (первое число месяца)
  notify: z.boolean(),
})

export type PublishResult =
  | { ok: true; publishedAt: string }
  | { ok: false; error: string }

export async function publishScheduleAction(input: { month: string; notify: boolean }): Promise<PublishResult> {
  const parsed = PublishSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'edit_schedule')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { data, error } = await ctx.supabase
    .from('schedule_publications')
    .insert({
      org_id: ctx.orgId,
      month: parsed.data.month,
      notify: parsed.data.notify,
      published_by: ctx.userId,
    })
    .select('published_at')
    .single()
  if (error || !data) return { ok: false, error: 'publish_failed' }

  revalidatePath('/schedule')
  return { ok: true, publishedAt: data.published_at }
}
