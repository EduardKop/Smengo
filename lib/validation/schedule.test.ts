import { describe, it, expect } from 'vitest'
import { UpsertEntrySchema, ClearEntrySchema, DepartmentSchema, EmployeeSchema, ReorderSchema } from './schedule'

describe('UpsertEntrySchema', () => {
  const valid = {
    employee_id: '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001',
    entry_date: '2026-06-15',
    status_id: '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0002',
    start_time: '22:00',
    end_time: '06:00',
    note: '',
  }
  it('accepts night shift (end < start)', () => {
    expect(UpsertEntrySchema.safeParse(valid).success).toBe(true)
  })
  it('rejects bad date and bad time', () => {
    expect(UpsertEntrySchema.safeParse({ ...valid, entry_date: '15.06.2026' }).success).toBe(false)
    expect(UpsertEntrySchema.safeParse({ ...valid, start_time: '25:00' }).success).toBe(false)
  })
  it('allows null times', () => {
    expect(UpsertEntrySchema.safeParse({ ...valid, start_time: null, end_time: null }).success).toBe(true)
  })
})

describe('ClearEntrySchema', () => {
  const validUuid = '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001'
  it('accepts valid employee_id and entry_date', () => {
    expect(
      ClearEntrySchema.safeParse({ employee_id: validUuid, entry_date: '2026-06-15' }).success,
    ).toBe(true)
  })
  it('rejects bad uuid and bad date', () => {
    expect(
      ClearEntrySchema.safeParse({ employee_id: 'not-a-uuid', entry_date: '2026-06-15' }).success,
    ).toBe(false)
    expect(
      ClearEntrySchema.safeParse({ employee_id: validUuid, entry_date: '15/06/2026' }).success,
    ).toBe(false)
  })
})

describe('EmployeeSchema', () => {
  it('requires full_name >= 2, validates employment_kind', () => {
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'trainee' }).success).toBe(true)
    expect(EmployeeSchema.safeParse({ full_name: 'A', employment_kind: 'staff' }).success).toBe(false)
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'boss' }).success).toBe(false)
  })
})

describe('DepartmentSchema / ReorderSchema', () => {
  it('validates name and uuid list', () => {
    expect(DepartmentSchema.safeParse({ name: 'Кухня' }).success).toBe(true)
    expect(DepartmentSchema.safeParse({ name: '' }).success).toBe(false)
    expect(ReorderSchema.safeParse({ dept_id: null, ordered_ids: ['0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001'] }).success).toBe(true)
  })
  it('rejects whitespace-only names', () => {
    expect(DepartmentSchema.safeParse({ name: '   ' }).success).toBe(false)
    expect(EmployeeSchema.safeParse({ full_name: '  ', employment_kind: 'staff' }).success).toBe(false)
  })
  it('rejects impossible calendar dates', () => {
    expect(ClearEntrySchema.safeParse({ employee_id: '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001', entry_date: '2026-13-45' }).success).toBe(false)
  })
  it('validates telegram handle format', () => {
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'staff', telegram: '@anna_kim' }).success).toBe(true)
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'staff', telegram: 'http://evil.com' }).success).toBe(false)
  })
})
