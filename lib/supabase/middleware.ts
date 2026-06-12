import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/supabase/types'

/** App paths that require authentication (but not necessarily an org). Single source of truth — root middleware.ts imports this list too. */
export const APP_PREFIXES = ['/dashboard', '/onboarding', '/settings', '/employees', '/departments', '/schedule', '/billing']

function isApp(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: do not add any logic between createClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Unauthenticated user trying to access app routes → /login
  if (!user && isApp(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user on login/register → /dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // For authenticated app routes (excluding /onboarding): ensure active_org_id cookie.
  // Only query the DB when the cookie is missing — RLS guards actual data access.
  if (user && isApp(pathname) && !pathname.startsWith('/onboarding')) {
    const hasOrgCookie = Boolean(request.cookies.get('active_org_id')?.value)

    if (!hasOrgCookie) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) {
        // New user with no org → onboarding
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }

      supabaseResponse.cookies.set('active_org_id', membership.org_id, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
  }

  return supabaseResponse
}
