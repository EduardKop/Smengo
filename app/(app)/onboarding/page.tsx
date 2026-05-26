import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDict, getLocale } from '@/lib/i18n'
import { CreateOrgForm } from '@/components/onboarding/create-org-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If the user already belongs to an org, skip onboarding
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership) redirect('/dashboard')

  const locale = await getLocale()
  const dict = await getDict(locale)

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <CreateOrgForm t={dict.onboarding} userEmail={user.email ?? ''} />
    </main>
  )
}
