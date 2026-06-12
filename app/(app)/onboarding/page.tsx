import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { logoutAction } from '@/lib/actions/auth'
import { CreateOrgForm, type OnboardingPrefill } from '@/components/onboarding/create-org-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership) redirect('/dashboard')

  // Email sign-ups carry these in metadata; Google OAuth gives full_name only,
  // so the form collects whatever is missing.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const [guessedFirst = '', ...rest] = fullName.split(/\s+/)

  const prefill: OnboardingPrefill = {
    firstName: typeof meta.first_name === 'string' ? meta.first_name : guessedFirst,
    lastName: typeof meta.last_name === 'string' ? meta.last_name : rest.join(' '),
    companyName: typeof meta.company_name === 'string' ? meta.company_name : '',
    source: typeof meta.acquisition_source === 'string' ? meta.acquisition_source : '',
    termsAccepted: Boolean(meta.terms_accepted_at),
  }

  const t = await getTranslations('onboarding')

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-3">
        <CreateOrgForm userEmail={user.email ?? ''} prefill={prefill} />
        <form action={logoutAction} className="text-center text-sm text-muted-foreground">
          {t('signedInAs')} <span className="font-medium text-foreground">{user.email}</span>
          {' · '}
          {t('wrongAccount')}{' '}
          <button type="submit" className="font-medium text-foreground underline underline-offset-4">
            {t('signOut')}
          </button>
        </form>
      </div>
    </main>
  )
}
