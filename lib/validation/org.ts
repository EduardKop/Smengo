import { z } from 'zod'

export const CreateOrgSchema = z.object({
  name: z.string().min(2, { message: 'Минимум 2 символа' }).max(100).trim(),
  billing_email: z.string().email({ message: 'Введите корректный email' }),
  timezone: z.string().default('Europe/Kyiv'),
  locale: z.enum(['ru', 'uk', 'en']).default('ru'),
})
