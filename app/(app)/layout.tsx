import type { ReactNode } from 'react'
import PostHogProvider from '@/components/providers/posthog-provider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <PostHogProvider>{children}</PostHogProvider>
}
