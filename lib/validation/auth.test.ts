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
  const valid = { full_name: 'John Doe', email: 'john@test.com', password: 'Secure1pass' }

  it('accepts valid registration data', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true)
  })

  it('trims full_name whitespace', () => {
    const result = RegisterSchema.safeParse({ ...valid, full_name: '  Jo  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.full_name).toBe('Jo')
    }
  })

  it('rejects full_name shorter than 2 chars', () => {
    const result = RegisterSchema.safeParse({ ...valid, full_name: 'J' })
    expect(result.success).toBe(false)
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
