import { describe, it, expect, beforeEach, vi } from 'vitest'
import { verifyPaddleSignature, mapPriceToPlan } from './paddle'
import { PLAN_LIMITS } from './types'
import { createHmac } from 'crypto'

// ─── PLAN_LIMITS ──────────────────────────────────────────────────────────────

describe('PLAN_LIMITS', () => {
  it('start plan has correct limits', () => {
    expect(PLAN_LIMITS.start).toEqual({ employees: 25, departments: 2, managers: 1 })
  })

  it('team plan has infinite departments', () => {
    expect(PLAN_LIMITS.team.departments).toBe(Infinity)
    expect(PLAN_LIMITS.team.employees).toBe(100)
    expect(PLAN_LIMITS.team.managers).toBe(3)
  })

  it('business plan has correct limits', () => {
    expect(PLAN_LIMITS.business).toEqual({ employees: 300, departments: Infinity, managers: 10 })
  })
})

// ─── verifyPaddleSignature ────────────────────────────────────────────────────

describe('verifyPaddleSignature', () => {
  const secret = 'test-secret'
  const body = '{"event_type":"subscription.created"}'
  const ts = '1700000000'

  function makeSignature(ts: string, body: string, sec: string) {
    const hmac = createHmac('sha256', sec).update(`${ts}:${body}`).digest('hex')
    return `ts=${ts};h1=${hmac}`
  }

  it('returns true for valid signature', () => {
    const sig = makeSignature(ts, body, secret)
    expect(verifyPaddleSignature(body, sig, secret)).toBe(true)
  })

  it('returns false for wrong secret', () => {
    const sig = makeSignature(ts, body, 'wrong-secret')
    expect(verifyPaddleSignature(body, sig, secret)).toBe(false)
  })

  it('returns false for tampered body', () => {
    const sig = makeSignature(ts, body, secret)
    expect(verifyPaddleSignature('{"tampered":true}', sig, secret)).toBe(false)
  })

  it('returns false when signature is null', () => {
    expect(verifyPaddleSignature(body, null as unknown as string, secret)).toBe(false)
  })

  it('returns false for malformed signature header', () => {
    expect(verifyPaddleSignature(body, 'not-a-valid-header', secret)).toBe(false)
  })
})

// ─── mapPriceToPlan ───────────────────────────────────────────────────────────

describe('mapPriceToPlan', () => {
  beforeEach(() => {
    vi.stubEnv('PADDLE_PRICE_START', 'pri_start_123')
    vi.stubEnv('PADDLE_PRICE_TEAM', 'pri_team_456')
    vi.stubEnv('PADDLE_PRICE_BUSINESS', 'pri_biz_789')
  })

  it('maps start price ID to start plan', () => {
    expect(mapPriceToPlan('pri_start_123')).toBe('start')
  })

  it('maps team price ID to team plan', () => {
    expect(mapPriceToPlan('pri_team_456')).toBe('team')
  })

  it('maps business price ID to business plan', () => {
    expect(mapPriceToPlan('pri_biz_789')).toBe('business')
  })

  it('defaults to start for unknown price ID', () => {
    expect(mapPriceToPlan('pri_unknown')).toBe('start')
  })
})
