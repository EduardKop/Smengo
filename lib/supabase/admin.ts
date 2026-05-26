import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/types'

/**
 * Service-role Supabase client — bypasses RLS.
 *
 * ⚠️  RULES:
 * 1. Never import this in browser/client code.
 * 2. Always filter by org_id manually — RLS is NOT active.
 * 3. Only use in: webhook handlers, background jobs, scheduled tasks.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
