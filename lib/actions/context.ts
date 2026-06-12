import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/supabase/types'

export interface ActionContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  orgId: string
  role: UserRole
}

export type ActionContextResult =
  | { ok: true; ctx: ActionContext }
  | { ok: false; error: 'unauthorized' | 'no_org' }

/** Аутентификация + активная организация + роль. RLS остаётся финальной защитой. */
export async function getActionContext(): Promise<ActionContextResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value
  if (!orgId) return { ok: false, error: 'no_org' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return { ok: false, error: 'unauthorized' }

  return { ok: true, ctx: { supabase, userId: user.id, orgId, role: membership.role } }
}
