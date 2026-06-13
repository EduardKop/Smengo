import { describe, expect, it } from 'vitest'
import { BulkEmployeesSchema } from './bulk-employees'

describe('BulkEmployeesSchema', () => {
  it('принимает строки с именем, приводя пустые поля к null', () => {
    const res = BulkEmployeesSchema.safeParse({
      rows: [
        { full_name: ' Анна Ковальчук ', dept_id: null, position: '', email: '', phone: '' },
      ],
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.rows[0].full_name).toBe('Анна Ковальчук')
      expect(res.data.rows[0].email).toBeNull()
      expect(res.data.rows[0].position).toBeNull()
    }
  })

  it('отклоняет пустое имя', () => {
    const res = BulkEmployeesSchema.safeParse({
      rows: [{ full_name: '  ', dept_id: null, position: '', email: '', phone: '' }],
    })
    expect(res.success).toBe(false)
  })

  it('отклоняет кривой email', () => {
    const res = BulkEmployeesSchema.safeParse({
      rows: [{ full_name: 'Ок', dept_id: null, position: '', email: 'не-почта', phone: '' }],
    })
    expect(res.success).toBe(false)
  })

  it('отклоняет не-uuid отдела', () => {
    const res = BulkEmployeesSchema.safeParse({
      rows: [{ full_name: 'Ок', dept_id: 'kitchen', position: '', email: '', phone: '' }],
    })
    expect(res.success).toBe(false)
  })

  it('принимает уровень доступа и пустой приводит к null', () => {
    const ok = BulkEmployeesSchema.safeParse({
      rows: [
        { full_name: 'Менеджер', dept_id: null, position: '', email: 'm@x.io', phone: '', access_role: 'manager' },
        { full_name: 'Без доступа', dept_id: null, position: '', email: '', phone: '', access_role: '' },
      ],
    })
    expect(ok.success).toBe(true)
    if (ok.success) {
      expect(ok.data.rows[0].access_role).toBe('manager')
      expect(ok.data.rows[1].access_role).toBeNull()
    }
  })

  it('отклоняет недопустимый уровень доступа', () => {
    const res = BulkEmployeesSchema.safeParse({
      rows: [{ full_name: 'Ок', dept_id: null, position: '', email: 'a@b.io', phone: '', access_role: 'owner' }],
    })
    expect(res.success).toBe(false)
  })

  it('отклоняет пустой массив и больше 100 строк', () => {
    expect(BulkEmployeesSchema.safeParse({ rows: [] }).success).toBe(false)
    const rows = Array.from({ length: 101 }, () => ({
      full_name: 'X', dept_id: null, position: '', email: '', phone: '',
    }))
    expect(BulkEmployeesSchema.safeParse({ rows }).success).toBe(false)
  })
})
