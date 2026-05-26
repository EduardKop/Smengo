import { createHmac, timingSafeEqual } from 'crypto'
import type { PlanTier } from '@/supabase/types'
import type { BillingEvent, BillingProvider } from './types'
import { PLAN_LIMITS } from './types'

// ─── Price ID → PlanTier mapping ─────────────────────────────────────────────

export function mapPriceToPlan(priceId: string): PlanTier {
  const map: Record<string, PlanTier> = {
    [process.env.PADDLE_PRICE_START    ?? '']: 'start',
    [process.env.PADDLE_PRICE_TEAM     ?? '']: 'team',
    [process.env.PADDLE_PRICE_BUSINESS ?? '']: 'business',
  }
  return map[priceId] ?? 'start'
}

// ─── HMAC signature verification ─────────────────────────────────────────────
// Paddle sends: Paddle-Signature: ts=<timestamp>;h1=<hmac>
// We recompute: HMAC-SHA256(secret, ts:body) and compare.

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(';').map((p) => p.split('=')),
    )
    const ts = parts['ts']
    const h1 = parts['h1']
    if (!ts || !h1) return false

    const signed = `${ts}:${rawBody}`
    const expected = createHmac('sha256', secret).update(signed).digest('hex')

    return timingSafeEqual(Buffer.from(h1), Buffer.from(expected))
  } catch {
    return false
  }
}

// ─── PaddleProvider ───────────────────────────────────────────────────────────

export class PaddleProvider implements BillingProvider {
  private readonly apiKey: string
  private readonly webhookSecret: string
  private readonly clientToken: string
  private readonly baseUrl = 'https://api.paddle.com'

  constructor() {
    this.apiKey = process.env.PADDLE_API_KEY ?? ''
    this.webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? ''
    this.clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
  }

  async createCheckout(orgId: string, plan: PlanTier): Promise<{ url: string }> {
    const priceMap: Record<PlanTier, string> = {
      start:    process.env.PADDLE_PRICE_START    ?? '',
      team:     process.env.PADDLE_PRICE_TEAM     ?? '',
      business: process.env.PADDLE_PRICE_BUSINESS ?? '',
    }
    const priceId = priceMap[plan]
    if (!priceId) throw new Error(`No Paddle price ID configured for plan: ${plan}`)

    const res = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        custom_data: { org_id: orgId },
        // Paddle Billing v2: checkout URL returned in response
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Paddle createCheckout failed: ${err}`)
    }

    const data = await res.json()
    const url: string = data?.data?.checkout?.url
    if (!url) throw new Error('Paddle returned no checkout URL')
    return { url }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ effective_from: 'next_billing_period' }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Paddle cancelSubscription failed: ${err}`)
    }
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return verifyPaddleSignature(rawBody, signature, this.webhookSecret)
  }

  parseEvent(rawBody: string): BillingEvent {
    const event = JSON.parse(rawBody)
    const data = event.data ?? {}
    const priceId: string = data.items?.[0]?.price?.id ?? ''

    return {
      id: event.event_id ?? event.id,
      type: event.event_type ?? event.type,
      orgId: data.custom_data?.org_id ?? null,
      subscriptionId: data.id ?? null,
      customerId: data.customer_id ?? null,
      plan: priceId ? mapPriceToPlan(priceId) : null,
      status: data.status ?? null,
      currentPeriodEnd: data.current_billing_period?.ends_at ?? null,
      cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
      raw: event,
    }
  }
}

// Singleton — import this everywhere instead of `new PaddleProvider()`
export const paddleProvider: BillingProvider = new PaddleProvider()

// Re-export for convenience
export { PLAN_LIMITS }
