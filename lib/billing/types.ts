import type { PlanTier } from '@/supabase/types'

// ─── Plan limits ──────────────────────────────────────────────────────────────

export interface PlanLimits {
  employees: number
  departments: number
  managers: number
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  start:    { employees: 25,  departments: 2,        managers: 1  },
  team:     { employees: 100, departments: Infinity,  managers: 3  },
  business: { employees: 300, departments: Infinity,  managers: 10 },
}

// ─── BillingProvider abstraction (§4.5) ──────────────────────────────────────

export interface BillingEvent {
  id: string
  type: 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'transaction.completed' | 'transaction.payment_failed' | string
  orgId: string | null
  subscriptionId: string | null
  customerId: string | null
  plan: PlanTier | null
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  raw: unknown
}

export interface BillingProvider {
  /** Generate a checkout URL for the given plan. */
  createCheckout(orgId: string, plan: PlanTier): Promise<{ url: string }>
  /** Cancel a subscription by its provider-side ID. */
  cancelSubscription(subscriptionId: string): Promise<void>
  /** Verify the webhook signature. Returns false if invalid. */
  verifyWebhook(rawBody: string, signature: string): boolean
  /** Parse a raw webhook payload into a normalised BillingEvent. */
  parseEvent(rawBody: string): BillingEvent
}
