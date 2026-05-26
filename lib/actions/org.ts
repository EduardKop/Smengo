'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { CreateOrgSchema } from '@/lib/validation/org'
import { slugify } from '@/lib/utils'

export type OrgFormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

export async function createOrgAction(
  _prev: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const parsed = CreateOrgSchema.safeParse({
    name: formData.get('name'),
    billing_email: formData.get('billing_email'),
    timezone: formData.get('timezone') ?? 'Europe/Kyiv',
    locale: formData.get('locale') ?? 'ru',
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const slug = `${slugify(parsed.data.name)}-${nanoid(6)}`
  const supabase = await createClient()

  // RPC calls the security-definer PG function — transactional, bypasses RLS
  const { error } = await supabase.rpc('create_organization', {
    p_name: parsed.data.name,
    p_slug: slug,
    p_billing_email: parsed.data.billing_email,
    p_timezone: parsed.data.timezone,
    p_locale: parsed.data.locale,
  })

  if (error) return { message: error.message }

  redirect('/dashboard')
}
