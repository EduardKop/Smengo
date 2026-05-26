import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/types'
import type { PlanTier } from '@/supabase/types'
import { PLAN_LIMITS } from './types'

type LimitResource = 'employees' | 'departments' | 'managers'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  plan: PlanTier
}

/**
 * Server-side plan limit check.
 * Call this inside Server Actions BEFORE any INSERT operation.
 *
 * @param supabase - authenticated Supabase client (uses RLS — caller's context)
 * @param orgId    - active organisation
 * @param plan     - current plan tier
 * @param resource - which resource to count
 */
export async function checkPlanLimit(
  supabase: SupabaseClient<Database>,
  orgId: string,
  plan: PlanTier,
  resource: LimitResource,
): Promise<LimitCheckResult> {
  const limits = PLAN_LIMITS[plan]
  const limit = limits[resource]

  // Infinity = no limit (team/business for departments)
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit: Infinity, plan }
  }

  let current = 0

  if (resource === 'employees') {
    const { count } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .is('deleted_at', null)
    current = count ?? 0
  } else if (resource === 'departments') {
    const { count } = await supabase
      .from('departments')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
    current = count ?? 0
  } else if (resource === 'managers') {
    // Count memberships with role = 'manager'
    const { count } = await supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'manager')
    current = count ?? 0
  }

  return {
    allowed: current < limit,
    current,
    limit,
    plan,
  }
}
