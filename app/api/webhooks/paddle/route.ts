import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { paddleProvider } from '@/lib/billing/paddle'
import type { Json } from '@/supabase/types'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''

  // ── 1. Verify HMAC signature ──────────────────────────────────────────────
  if (!paddleProvider.verifyWebhook(rawBody, signature)) {
    return new NextResponse('invalid signature', { status: 401 })
  }

  // ── 2. Parse into normalised event ───────────────────────────────────────
  let event: ReturnType<typeof paddleProvider.parseEvent>
  try {
    event = paddleProvider.parseEvent(rawBody)
  } catch {
    return new NextResponse('malformed payload', { status: 400 })
  }

  const admin = createAdminClient()

  // ── 3. Idempotency: skip if already processed ─────────────────────────────
  const { data: seen } = await admin
    .from('webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()

  if (seen) {
    return new NextResponse('ok', { status: 200 })
  }

  // ── 4. Handle event ───────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const { orgId, plan, status, subscriptionId, customerId, currentPeriodEnd, cancelAtPeriodEnd } = event
        if (!orgId || !subscriptionId) break

        // One subscription row per org (unique org_id): the trialing row created
        // at org creation gets overwritten by the first real Paddle subscription.
        await admin.from('subscriptions').upsert(
          {
            org_id: orgId,
            plan: plan ?? 'start',
            status: status ?? 'active',
            paddle_customer_id: customerId,
            paddle_subscription_id: subscriptionId,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
          },
          { onConflict: 'org_id' },
        )

        // Sync plan on organizations — ⚠️ must filter by org_id (no RLS)
        if (plan) {
          await admin.from('organizations').update({ plan }).eq('id', orgId)
        }
        break
      }

      case 'subscription.canceled': {
        const { subscriptionId } = event
        if (!subscriptionId) break

        await admin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('paddle_subscription_id', subscriptionId)
        // Plan stays until current_period_end — do NOT reset organizations.plan here
        break
      }

      case 'transaction.payment_failed': {
        const { subscriptionId } = event
        if (!subscriptionId) break

        await admin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('paddle_subscription_id', subscriptionId)
        // TODO: send payment-failed email via Resend
        break
      }

      default:
        // Unhandled event type — still record it below
        break
    }
  } catch (err) {
    console.error('[paddle-webhook] handler error:', err)
    // Return 500 so Paddle retries
    return new NextResponse('internal error', { status: 500 })
  }

  // ── 5. Mark event as processed (idempotency store) ────────────────────────
  await admin.from('webhook_events').insert({
    id: event.id,
    type: event.type,
    payload: event.raw as Json,
    processed_at: new Date().toISOString(),
  })

  return new NextResponse('ok', { status: 200 })
}
