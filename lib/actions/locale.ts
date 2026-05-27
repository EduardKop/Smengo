'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const LOCALES = ['ru', 'uk', 'en'] as const
type Locale = (typeof LOCALES)[number]

function isLocale(v: string): v is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(v)
}

/**
 * Persist locale preference: cookie (1 year) + profile row if signed in.
 * Does NOT navigate — caller handles navigation (URL switch via next-intl router).
 */
export async function setLocaleCookieAction(locale: string) {
  if (!isLocale(locale)) return

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ locale }).eq('id', user.id)
  }
}
