'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmailSchema, LoginSchema, RegisterSchema, PasswordSchema } from '@/lib/validation/auth'

export type AuthFormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { message: error.message }

  redirect('/dashboard')
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    company_name: formData.get('company_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    acquisition_source: formData.get('acquisition_source') ?? '',
    terms: formData.get('terms'),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { first_name, last_name, company_name, acquisition_source } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: `${first_name} ${last_name}`,
        first_name,
        last_name,
        company_name,
        acquisition_source: acquisition_source || null,
        terms_accepted_at: new Date().toISOString(),
      },
    },
  })
  if (error) return { message: error.message }

  return { message: 'check_email' }
}

export async function sendMagicLinkAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = EmailSchema.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { errors: { email: parsed.error.issues.map((e) => e.message) } }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  if (error) return { message: error.message }

  return { message: 'check_email' }
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = EmailSchema.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { errors: { email: parsed.error.issues.map((e) => e.message) } }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })
  if (error) return { message: error.message }

  return { message: 'sent' }
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = PasswordSchema.safeParse(formData.get('password'))
  if (!parsed.success) {
    return { errors: { password: parsed.error.issues.map((e) => e.message) } }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { message: error.message }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function loginWithGoogleAction(): Promise<void> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  if (data.url) redirect(data.url)
}
