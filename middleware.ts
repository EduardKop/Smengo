import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ─── Supported locales ────────────────────────────────────────────────────────

const LOCALES = ['ru', 'uk', 'en'] as const
const DEFAULT_LOCALE = 'ru'

function detectLocale(request: NextRequest): string {
  // 1. Cookie (user's explicit choice — highest priority)
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && (LOCALES as ReadonlyArray<string>).includes(cookie)) return cookie

  // 2. Accept-Language header
  const accept = request.headers.get('accept-language') ?? ''
  if (accept.startsWith('uk') || accept.includes(',uk') || accept.includes('uk-')) return 'uk'
  if (accept.startsWith('ru') || accept.includes(',ru') || accept.includes('ru-')) return 'ru'
  if (accept.startsWith('en') || accept.includes(',en') || accept.includes('en-')) return 'en'

  // 3. Vercel geo fallback
  // @ts-expect-error — geo is available on Vercel edge runtime
  const country: string = request.geo?.country ?? ''
  if (country === 'UA') return 'uk'
  if (['RU', 'BY', 'KZ'].includes(country)) return 'ru'

  // 4. Default
  return DEFAULT_LOCALE
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const locale = detectLocale(request)

  // Run Supabase auth middleware (refreshes session, guards routes)
  const response = await updateSession(request)

  // Forward locale to Server Components via header.
  // next-intl reads this in i18n/request.ts.
  response.headers.set('x-locale', locale)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
