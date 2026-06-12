import { z } from 'zod'

export const EmailSchema = z.string().email({ message: 'Введите корректный email' })

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, { message: 'Минимум 6 символов' }),
})

export const NameSchema = z.string().min(2, { message: 'Минимум 2 символа' }).max(60).trim()

/** Free-form «откуда вы о нас узнали» — optional, capped at 255 chars. */
export const AcquisitionSourceSchema = z
  .string()
  .max(255, { message: 'Максимум 255 символов' })
  .trim()
  .optional()
  .or(z.literal(''))

/** Checkbox value: present ('on') only when checked. */
export const TermsSchema = z.literal('on', {
  message: 'Нужно принять условия использования',
})

export const RegisterSchema = z.object({
  first_name: NameSchema,
  last_name: NameSchema,
  company_name: z.string().min(2, { message: 'Минимум 2 символа' }).max(100).trim(),
  email: EmailSchema,
  password: z
    .string()
    .min(8, { message: 'Минимум 8 символов' })
    .regex(/[A-Za-z]/, { message: 'Должен содержать букву' })
    .regex(/[0-9]/, { message: 'Должен содержать цифру' }),
  acquisition_source: AcquisitionSourceSchema,
  terms: TermsSchema,
})

export const PasswordSchema = z
  .string()
  .min(8, { message: 'Минимум 8 символов' })
  .regex(/[A-Za-z]/, { message: 'Должен содержать букву' })
  .regex(/[0-9]/, { message: 'Должен содержать цифру' })
