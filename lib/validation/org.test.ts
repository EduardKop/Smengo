import { describe, it, expect } from 'vitest'
import { CreateOrgSchema } from '../validation/org'

describe('CreateOrgSchema', () => {
  const valid = {
    name: 'Моя Компания',
    billing_email: 'billing@company.com',
    timezone: 'Europe/Kyiv',
    locale: 'ru' as const,
  }

  it('accepts valid org data', () => {
    expect(CreateOrgSchema.safeParse(valid).success).toBe(true)
  })

  it('trims name whitespace', () => {
    const result = CreateOrgSchema.safeParse({ ...valid, name: '  Моя Компания  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Моя Компания')
    }
  })

  it('rejects name shorter than 2 chars', () => {
    expect(CreateOrgSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false)
  })

  it('rejects name longer than 100 chars', () => {
    expect(CreateOrgSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects invalid billing_email', () => {
    expect(CreateOrgSchema.safeParse({ ...valid, billing_email: 'notanemail' }).success).toBe(false)
  })

  it('defaults timezone to Europe/Kyiv when not provided', () => {
    const result = CreateOrgSchema.safeParse({ name: valid.name, billing_email: valid.billing_email })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.timezone).toBe('Europe/Kyiv')
    }
  })

  it('defaults locale to ru when not provided', () => {
    const result = CreateOrgSchema.safeParse({ name: valid.name, billing_email: valid.billing_email })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.locale).toBe('ru')
    }
  })

  it('accepts all valid locales', () => {
    for (const locale of ['ru', 'uk', 'en'] as const) {
      expect(CreateOrgSchema.safeParse({ ...valid, locale }).success).toBe(true)
    }
  })

  it('rejects invalid locale', () => {
    expect(CreateOrgSchema.safeParse({ ...valid, locale: 'fr' }).success).toBe(false)
  })
})
