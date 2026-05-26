'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { paddleProvider } from '@/lib/billing/paddle'
import type { PlanTier } from '@/supabase/types'
import { PLAN_LIMITS } from '@/lib/billing/types'

// ─── Create Paddle Checkout ───────────────────────────────────────────────────

export async function createCheckoutAction(plan: PlanTier) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value
  if (!orgId) redirect('/onboarding')

  // Only owner can manage billing
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: 'Только владелец организации может управлять тарифом.' }
  }

  try {
    const { url } = await paddleProvider.createCheckout(orgId, plan)
    return { url }
  } catch (err) {
    console.error('[createCheckoutAction]', err)
    return { error: 'Не удалось открыть страницу оплаты. Попробуйте ещё раз.' }
  }
}

// ─── Cancel Subscription ──────────────────────────────────────────────────────

export async function cancelSubscriptionAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value
  if (!orgId) redirect('/onboarding')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: 'Только владелец организации может управлять тарифом.' }
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paddle_subscription_id')
    .eq('org_id', orgId)
    .maybeSingle()

  if (!sub?.paddle_subscription_id) {
    return { error: 'Активная подписка не найдена.' }
  }

  try {
    await paddleProvider.cancelSubscription(sub.paddle_subscription_id)
    return { success: true }
  } catch (err) {
    console.error('[cancelSubscriptionAction]', err)
    return { error: 'Не удалось отменить подписку. Попробуйте ещё раз.' }
  }
}

// ─── Get current billing info (used in billing page) ─────────────────────────

export async function getBillingInfoAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value
  if (!orgId) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, trial_ends_at')
    .eq('id', orgId)
    .single()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('org_id', orgId)
    .maybeSingle()

  return {
    plan: org?.plan ?? 'start',
    trialEndsAt: org?.trial_ends_at ?? null,
    subscription: sub ?? null,
    limits: PLAN_LIMITS[org?.plan ?? 'start'],
  }
}
