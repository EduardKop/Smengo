import { z } from 'zod'

export const EmailSchema = z.string().email({ message: 'Введите корректный email' })

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, { message: 'Минимум 6 символов' }),
})

export const RegisterSchema = z.object({
  full_name: z.string().min(2, { message: 'Минимум 2 символа' }).trim(),
  email: EmailSchema,
  password: z
    .string()
    .min(8, { message: 'Минимум 8 символов' })
    .regex(/[A-Za-z]/, { message: 'Должен содержать букву' })
    .regex(/[0-9]/, { message: 'Должен содержать цифру' }),
})

export const PasswordSchema = z
  .string()
  .min(8, { message: 'Минимум 8 символов' })
  .regex(/[A-Za-z]/, { message: 'Должен содержать букву' })
  .regex(/[0-9]/, { message: 'Должен содержать цифру' })
