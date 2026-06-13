import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Check } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { SmengoMark } from '@/components/app/sidebar'
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

  if (membership) redirect('/schedule')

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
    <main className="grid min-h-screen lg:grid-cols-[2fr_3fr]">
      {/* Левая фирменная панель (правка 7, референс 7shifts):
          честные value-props вместо тестимониалов — фейковый social proof снят с лендинга */}
      <aside className="hidden flex-col justify-between bg-background p-10 lg:flex">
        <div className="flex items-center gap-3">
          <SmengoMark size={36} />
          <span className="text-lg font-semibold tracking-[-0.02em] text-foreground">smengo</span>
        </div>
        <div className="max-w-sm">
          <p className="text-3xl font-bold leading-tight tracking-tight text-foreground">
            {t('panelHeadline')}
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {[t('vp1'), t('vp2'), t('vp3')].map((vp) => (
              <li key={vp} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
                </span>
                {vp}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">© Smengo</p>
      </aside>

      {/* Правая колонка: форма */}
      <div className="flex flex-col items-center justify-center bg-muted/40 p-4 py-10">
        <div className="w-full max-w-lg space-y-3">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('headline')}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t('subheadline')}</p>
          </div>
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
      </div>
    </main>
  )
}
