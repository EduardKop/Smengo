import { z } from 'zod'
import { AcquisitionSourceSchema, NameSchema } from '@/lib/validation/auth'

export const CreateOrgSchema = z.object({
  name: z.string().min(2, { message: 'Минимум 2 символа' }).max(100).trim(),
  billing_email: z.string().email({ message: 'Введите корректный email' }),
  timezone: z.string().default('Europe/Kyiv'),
  locale: z.enum(['ru', 'uk', 'en']).default('ru'),
  first_name: NameSchema,
  last_name: NameSchema,
  acquisition_source: AcquisitionSourceSchema,
  // Terms are validated in the action: required only when the user
  // has not accepted them earlier (e.g. Google OAuth sign-up).
  terms: z.string().optional(),
})
