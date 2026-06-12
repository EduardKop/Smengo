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

/**
 * Аутентификация + активная организация + роль. RLS остаётся финальной защитой.
 *
 * Кука active_org_id может протухнуть (организация удалена, вход под другим
 * аккаунтом в том же браузере): тогда, как и getAppContext у страниц, берём
 * первое членство пользователя и чиним куку. Молчаливых отказов из-за стейл-куки
 * быть не должно — это ломало мутации при живой видимой странице.
 */
export async function getActionContext(): Promise<ActionContextResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const { data: memberships } = await supabase
    .from('memberships')
    .select('org_id, role')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) {
    console.error('[action-context] no memberships for user', user.id)
    return { ok: false, error: 'no_org' }
  }

  const cookieStore = await cookies()
  const cookieOrgId = cookieStore.get('active_org_id')?.value
  const active = memberships.find((m) => m.org_id === cookieOrgId) ?? memberships[0]

  if (active.org_id !== cookieOrgId) {
    console.error('[action-context] stale active_org_id cookie, healing', {
      cookieOrgId,
      healedTo: active.org_id,
      userId: user.id,
    })
    cookieStore.set('active_org_id', active.org_id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return {
    ok: true,
    ctx: { supabase, userId: user.id, orgId: active.org_id, role: active.role },
  }
}
