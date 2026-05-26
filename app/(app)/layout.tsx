import type { ReactNode } from 'react'
import PostHogProvider from '@/components/providers/posthog-provider'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Trial / paywall check — readable by all org members via org_select RLS
  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value

  let isReadOnly = false
  if (orgId) {
    const { data: org } = await supabase
      .from('organizations')
      .select('trial_ends_at, plan')
      .eq('id', orgId)
      .single()

    const trialExpired = org?.trial_ends_at
      ? new Date(org.trial_ends_at) < new Date()
      : false
    // TODO (billing): also check subscriptions.status once Paddle is integrated
    isReadOnly = trialExpired && org?.plan === 'start'
  }

  return (
    <PostHogProvider>
      {isReadOnly && (
        <div className="sticky top-0 z-50 w-full bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
          Пробный период завершён. Обновите план для редактирования.{' '}
          <a href="/settings/billing" className="underline">
            Перейти к тарифам
          </a>
        </div>
      )}
      {children}
    </PostHogProvider>
  )
}
