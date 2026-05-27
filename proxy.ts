import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const LOCALES = ['ru', 'uk', 'en'] as const
const DEFAULT_LOCALE = 'ru'

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && (LOCALES as ReadonlyArray<string>).includes(cookie)) return cookie

  const accept = request.headers.get('accept-language') ?? ''
  if (accept.startsWith('uk') || accept.includes(',uk') || accept.includes('uk-')) return 'uk'
  if (accept.startsWith('ru') || accept.includes(',ru') || accept.includes('ru-')) return 'ru'
  if (accept.startsWith('en') || accept.includes(',en') || accept.includes('en-')) return 'en'

  // @ts-expect-error — geo is available on Vercel edge runtime
  const country: string = request.geo?.country ?? ''
  if (country === 'UA') return 'uk'
  if (['RU', 'BY', 'KZ'].includes(country)) return 'ru'

  return DEFAULT_LOCALE
}

export async function proxy(request: NextRequest) {
  const locale = detectLocale(request)
  const response = await updateSession(request)
  response.headers.set('x-locale', locale)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, and common static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
