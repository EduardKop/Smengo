import { z } from 'zod'

const DateISO = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, { message: 'Формат даты: YYYY-MM-DD' })
export const TimeHM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Формат времени: HH:MM' })

export const StatusTypeSchema = z.object({
  code: z.string().trim().regex(/^[a-z0-9_]{2,20}$/, { message: 'Код: 2-20 символов, a-z, 0-9, _' }),
  label: z.string().trim().min(1, { message: 'Укажите название' }).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Цвет в формате #RRGGBB' }),
  counts_as_present: z.boolean(),
  start_time: TimeHM.nullable().optional(),
  end_time: TimeHM.nullable().optional(),
})

export const UpsertEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
  status_id: z.string().uuid(),
  start_time: TimeHM.nullable().optional(),
  end_time: TimeHM.nullable().optional(),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})

export const ClearEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
})

export const DepartmentSchema = z.object({
  name: z.string().trim().min(1, { message: 'Укажите название' }).max(80),
})

export const EmployeeSchema = z.object({
  full_name: z.string().trim().min(2, { message: 'Минимум 2 символа' }).max(120),
  position: z.string().trim().max(80).optional().or(z.literal('')),
  dept_id: z.string().uuid().nullable().optional(),
  employment_kind: z.enum(['staff', 'trainee']).default('staff'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  telegram: z.string().trim().regex(/^@?[A-Za-z0-9_]{3,32}$/, { message: 'Некорректный Telegram-юзернейм' }).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')), // literal('') последним: пустая строка проходит после отказа email()
  birth_date: DateISO.nullable().optional(),
  hired_on: DateISO.nullable().optional(),
})

/** Транспорт: JSON-аргумент server action (FormData не сериализует массивы). */
export const ReorderSchema = z.object({
  dept_id: z.string().uuid().nullable(),
  ordered_ids: z.array(z.string().uuid()).min(1).max(500),
})
