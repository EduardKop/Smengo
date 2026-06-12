import { describe, it, expect } from 'vitest'
import { EmailSchema, LoginSchema, RegisterSchema, PasswordSchema } from '../validation/auth'

describe('EmailSchema', () => {
  it('accepts valid emails', () => {
    expect(EmailSchema.safeParse('test@example.com').success).toBe(true)
    expect(EmailSchema.safeParse('user+tag@sub.domain.org').success).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(EmailSchema.safeParse('notanemail').success).toBe(false)
    expect(EmailSchema.safeParse('@missing.com').success).toBe(false)
    expect(EmailSchema.safeParse('').success).toBe(false)
  })

  it('returns correct error message', () => {
    const result = EmailSchema.safeParse('bad')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Введите корректный email')
    }
  })
})

describe('LoginSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      LoginSchema.safeParse({ email: 'user@test.com', password: 'pass12' }).success,
    ).toBe(true)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = LoginSchema.safeParse({ email: 'user@test.com', password: '12345' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined()
    }
  })

  it('rejects invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'bad', password: 'validpass' })
    expect(result.success).toBe(false)
  })
})

describe('RegisterSchema', () => {
  const valid = {
    first_name: 'John',
    last_name: 'Doe',
    company_name: 'Acme Coffee',
    email: 'john@test.com',
    password: 'Secure1pass',
    acquisition_source: '',
    terms: 'on',
  }

  it('accepts valid registration data', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true)
  })

  it('trims first_name whitespace', () => {
    const result = RegisterSchema.safeParse({ ...valid, first_name: '  Jo  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.first_name).toBe('Jo')
    }
  })

  it('rejects first_name shorter than 2 chars', () => {
    const result = RegisterSchema.safeParse({ ...valid, first_name: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects missing company_name', () => {
    const result = RegisterSchema.safeParse({ ...valid, company_name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects unchecked terms', () => {
    const result = RegisterSchema.safeParse({ ...valid, terms: null })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.terms).toBeDefined()
    }
  })

  it('accepts empty acquisition_source and caps it at 255 chars', () => {
    expect(RegisterSchema.safeParse({ ...valid, acquisition_source: undefined }).success).toBe(true)
    expect(
      RegisterSchema.safeParse({ ...valid, acquisition_source: 'x'.repeat(256) }).success,
    ).toBe(false)
  })

  it('rejects password without a letter', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: '12345678' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten().fieldErrors.password ?? []
      expect(msgs.some((m) => m.includes('букву'))).toBe(true)
    }
  })

  it('rejects password without a digit', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: 'NoDigitsHere' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten().fieldErrors.password ?? []
      expect(msgs.some((m) => m.includes('цифру'))).toBe(true)
    }
  })

  it('rejects password shorter than 8 chars', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: 'Ab1' })
    expect(result.success).toBe(false)
  })
})

describe('PasswordSchema (reset password)', () => {
  it('accepts strong password', () => {
    expect(PasswordSchema.safeParse('NewPass9').success).toBe(true)
  })

  it('rejects short password', () => {
    expect(PasswordSchema.safeParse('Ab1').success).toBe(false)
  })

  it('rejects letters-only password', () => {
    expect(PasswordSchema.safeParse('NoDigitsHere').success).toBe(false)
  })

  it('rejects digits-only password', () => {
    expect(PasswordSchema.safeParse('12345678').success).toBe(false)
  })
})
