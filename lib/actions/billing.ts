'use server'

import { redirect } from 'next/navigation'
import { getActionContext } from '@/lib/actions/context'
import { can } from '@/lib/permissions'
import { paddleProvider } from '@/lib/billing/paddle'
import type { PlanTier } from '@/supabase/types'
import { PLAN_LIMITS } from '@/lib/billing/types'

// ─── Create Paddle Checkout ───────────────────────────────────────────────────

export async function createCheckoutAction(plan: PlanTier) {
  const res = await getActionContext()
  if (!res.ok) redirect(res.error === 'unauthorized' ? '/login' : '/onboarding')
  const { ctx } = res

  if (!can(ctx.role, 'billing')) {
    return { error: 'Только владелец организации может управлять тарифом.' }
  }

  try {
    const { url } = await paddleProvider.createCheckout(ctx.orgId, plan)
    return { url }
  } catch (err) {
    console.error('[createCheckoutAction]', err)
    return { error: 'Не удалось открыть страницу оплаты. Попробуйте ещё раз.' }
  }
}

// ─── Cancel Subscription ──────────────────────────────────────────────────────

export async function cancelSubscriptionAction() {
  const res = await getActionContext()
  if (!res.ok) redirect(res.error === 'unauthorized' ? '/login' : '/onboarding')
  const { ctx } = res

  if (!can(ctx.role, 'billing')) {
    return { error: 'Только владелец организации может управлять тарифом.' }
  }

  const { data: sub } = await ctx.supabase
    .from('subscriptions')
    .select('paddle_subscription_id')
    .eq('org_id', ctx.orgId)
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
  const res = await getActionContext()
  if (!res.ok) {
    if (res.error === 'unauthorized') redirect('/login')
    return null
  }
  const { ctx } = res

  const { data: org } = await ctx.supabase
    .from('organizations')
    .select('plan, trial_ends_at')
    .eq('id', ctx.orgId)
    .single()

  const { data: sub } = await ctx.supabase
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('org_id', ctx.orgId)
    .maybeSingle()

  return {
    plan: org?.plan ?? 'start',
    trialEndsAt: org?.trial_ends_at ?? null,
    subscription: sub ?? null,
    limits: PLAN_LIMITS[org?.plan ?? 'start'],
  }
}
