'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const LOCALES = ['ru', 'uk', 'en'] as const
type Locale = (typeof LOCALES)[number]

function isLocale(v: string): v is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(v)
}

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return

  // Persist locale in cookie (read by middleware on next request)
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  // If logged in, also save preference to profile (§5.1 priority 2)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ locale }).eq('id', user.id)
  }
}
