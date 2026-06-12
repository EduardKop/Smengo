import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PlanTier, UserRole } from '@/supabase/types'

export interface MembershipSummary {
  orgId: string
  orgName: string
  role: UserRole
}

export interface AppContext {
  userId: string
  userEmail: string
  org: {
    id: string
    name: string
    plan: PlanTier
    trialEndsAt: string | null
  }
  role: UserRole
  memberships: MembershipSummary[]
  /** Trial expired and no active subscription — UI must block mutations. */
  isReadOnly: boolean
}

/**
 * Resolve the authenticated user, their active org (via active_org_id cookie)
 * and role in it. Redirects to /login or /onboarding when prerequisites are
 * missing. Call from Server Components / Server Actions inside the app zone.
 */
export async function getAppContext(): Promise<AppContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('memberships')
    .select('role, org_id, organizations(id, name, plan, trial_ends_at)')
    .eq('user_id', user.id)

  if (!rows || rows.length === 0) redirect('/onboarding')

  const memberships: MembershipSummary[] = rows
    .filter((r) => r.organizations !== null)
    .map((r) => ({
      orgId: r.org_id,
      orgName: r.organizations!.name,
      role: r.role,
    }))

  const cookieStore = await cookies()
  const cookieOrgId = cookieStore.get('active_org_id')?.value
  const active =
    rows.find((r) => r.org_id === cookieOrgId && r.organizations) ??
    rows.find((r) => r.organizations)

  if (!active?.organizations) redirect('/onboarding')

  const org = active.organizations

  const trialExpired = org.trial_ends_at
    ? new Date(org.trial_ends_at) < new Date()
    : false

  let isReadOnly = false
  if (trialExpired) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('org_id', org.id)
      .maybeSingle()

    isReadOnly = !(sub?.status === 'active' || sub?.status === 'trialing')
  }

  return {
    userId: user.id,
    userEmail: user.email ?? '',
    org: {
      id: org.id,
      name: org.name,
      plan: org.plan,
      trialEndsAt: org.trial_ends_at,
    },
    role: active.role,
    memberships,
    isReadOnly,
  }
}
