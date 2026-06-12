import { z } from 'zod'

const DateISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Формат даты: YYYY-MM-DD' })
const TimeHM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Формат времени: HH:MM' })

export const UpsertEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
  status_id: z.string().uuid(),
  start_time: TimeHM.nullable().optional(),
  end_time: TimeHM.nullable().optional(),
  note: z.string().max(500).trim().optional().or(z.literal('')),
})

export const ClearEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
})

export const DepartmentSchema = z.object({
  name: z.string().min(1, { message: 'Укажите название' }).max(80).trim(),
})

export const EmployeeSchema = z.object({
  full_name: z.string().min(2, { message: 'Минимум 2 символа' }).max(120).trim(),
  position: z.string().max(80).trim().optional().or(z.literal('')),
  dept_id: z.string().uuid().nullable().optional(),
  employment_kind: z.enum(['staff', 'trainee']).default('staff'),
  phone: z.string().max(30).trim().optional().or(z.literal('')),
  telegram: z.string().max(60).trim().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  birth_date: DateISO.nullable().optional(),
  hired_on: DateISO.nullable().optional(),
})

export const ReorderSchema = z.object({
  dept_id: z.string().uuid().nullable(),
  ordered_ids: z.array(z.string().uuid()).min(1).max(500),
})
