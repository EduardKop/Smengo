import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/invite', '/auth/']
const APP_PREFIXES = ['/dashboard', '/onboarding', '/settings', '/employees', '/departments', '/billing']

function startsWithAny(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect locale-prefixed auth routes to plain routes, preserving locale in cookie.
  // e.g. /en/login → /login (NEXT_LOCALE=en), /uk/register → /register (NEXT_LOCALE=uk)
  const localePrefix = (routing.locales as readonly string[]).find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (localePrefix) {
    const stripped = pathname.slice(`/${localePrefix}`.length) || '/'
    if (startsWithAny(stripped, AUTH_PREFIXES)) {
      const url = request.nextUrl.clone()
      url.pathname = stripped
      const response = NextResponse.redirect(url)
      response.cookies.set('NEXT_LOCALE', localePrefix, { path: '/', sameSite: 'lax' })
      return response
    }
  }

  // Auth & private app routes: cookie-based locale, no URL prefix.
  // Run Supabase session refresh; forward locale via x-locale header for next-intl.
  if (startsWithAny(pathname, AUTH_PREFIXES) || startsWithAny(pathname, APP_PREFIXES)) {
    const response = await updateSession(request)
    const cookie = request.cookies.get('NEXT_LOCALE')?.value
    const locale = (routing.locales as readonly string[]).includes(cookie ?? '')
      ? (cookie as string)
      : routing.defaultLocale
    response.headers.set('X-NEXT-INTL-LOCALE', locale)
    return response
  }

  // Public marketing routes: use next-intl middleware (handles localePrefix: 'as-needed').
  const intlResponse = intlMiddleware(request)
  // Pass through Supabase auth refresh in parallel — only if not a redirect.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse
  }
  const supabaseResponse = await updateSession(request)
  // Merge intl cookies/headers onto supabase response so both auth + locale survive.
  intlResponse.cookies.getAll().forEach((c) => supabaseResponse.cookies.set(c.name, c.value, c))
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-') || key.toLowerCase() === 'link') {
      supabaseResponse.headers.set(key, value)
    }
  })
  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip static assets, API routes, and Next internals
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?|ttf|map)$).*)',
  ],
}
