'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { z } from 'zod'
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
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    acquisition_source: formData.get('acquisition_source') ?? '',
    terms: formData.get('terms') ?? undefined,
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Email sign-ups accept terms on the register form; OAuth users must
  // accept them here — the checkbox is rendered only for them.
  const termsAcceptedAt = user.user_metadata?.terms_accepted_at as string | undefined
  if (!termsAcceptedAt && parsed.data.terms !== 'on') {
    return { errors: { terms: ['Нужно принять условия использования'] } }
  }

  const { first_name, last_name } = parsed.data
  const fullName = `${first_name} ${last_name}`
  const source =
    parsed.data.acquisition_source ||
    ((user.user_metadata?.acquisition_source as string | undefined) ?? '')

  const slug = `${slugify(parsed.data.name)}-${nanoid(6)}`

  // RPC calls the security-definer PG function — transactional, bypasses RLS
  const { error } = await supabase.rpc('create_organization', {
    p_name: parsed.data.name,
    p_slug: slug,
    p_billing_email: parsed.data.billing_email,
    p_timezone: parsed.data.timezone,
    p_locale: parsed.data.locale,
    p_acquisition_source: source || undefined,
  })

  if (error) return { message: error.message }

  // Persist identity details; profile row exists via handle_new_user trigger
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      first_name,
      last_name,
      acquisition_source: source || null,
      terms_accepted_at: termsAcceptedAt ?? new Date().toISOString(),
    },
  })
  await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)

  redirect('/dashboard')
}

export async function switchOrgAction(formData: FormData): Promise<void> {
  const parsed = z.string().uuid().safeParse(formData.get('org_id'))
  if (!parsed.success) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS scopes memberships to the current user, but verify explicitly anyway
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('org_id', parsed.data)
    .maybeSingle()

  if (!membership) return

  const cookieStore = await cookies()
  cookieStore.set('active_org_id', membership.org_id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  revalidatePath('/', 'layout')
}
