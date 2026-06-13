import { z } from 'zod'

/**
 * Bulk-добавление сотрудников (модалка-таблица, правка 7).
 * Пустые строки таблицы фильтрует клиент; сюда приходят только строки
 * с именем. Пустые опциональные поля приводим к null.
 */

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)

export const BulkEmployeeRowSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  dept_id: z.preprocess(emptyToNull, z.string().uuid().nullable()),
  position: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(255).nullable()),
  phone: z.preprocess(emptyToNull, z.string().trim().max(32).nullable()),
  // Уровень доступа: при наличии email сотруднику отправляется приглашение
  // в систему с этой ролью (owner назначить нельзя — только админ приглашает).
  // Опционально: строки без доступа — просто строки графика.
  access_role: z.preprocess(emptyToNull, z.enum(['admin', 'manager', 'viewer']).nullable().optional()),
})

export const BulkEmployeesSchema = z.object({
  rows: z.array(BulkEmployeeRowSchema).min(1).max(100),
})

export type BulkEmployeeRow = z.infer<typeof BulkEmployeeRowSchema>
export type BulkEmployeesInput = z.infer<typeof BulkEmployeesSchema>
