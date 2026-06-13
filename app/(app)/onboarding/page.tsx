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
    <main className="grid min-h-screen lg:grid-cols-[38fr_62fr]">
      {/* Левая тёмная фирменная панель (редакторский стиль): знак, value-props.
          Честные обещания вместо фейковых тестимониалов. */}
      <aside
        className="relative hidden flex-col px-10 py-6 lg:flex xl:px-12"
        style={{ background: 'var(--account-hero-bg)', color: 'var(--account-hero-fg)' }}
      >
        <div className="flex items-center gap-2.5">
          <SmengoMark size={34} variant="onDark" />
          <span className="text-lg font-semibold tracking-[-0.02em]">smengo</span>
        </div>

        {/* Контент вертикально по центру (правка основателя) */}
        <div className="flex flex-1 items-center">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{t('trialBadge')}</p>
            <p className="mt-5 text-[clamp(32px,3.2vw,48px)] font-extrabold leading-[1.03] tracking-[-0.02em]">
              {t('panelHeadline')}
            </p>
            <ul className="mt-8 flex flex-col gap-3.5">
              {[t('vp1'), t('vp2'), t('vp3')].map((vp) => (
                <li key={vp} className="flex items-center gap-3 text-[15px] font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {vp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ opacity: 0.45 }}>
          SMENGO · SHIFT SCHEDULING
        </p>
      </aside>

      {/* Правая колонка: форма на фоне страницы */}
      <div className="flex flex-col justify-center bg-[var(--background)] px-5 py-6 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-xl">
          {/* Надзаголовок: шаг настройки + раздел */}
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="text-accent">{t('setupStep')}</span>
            <span className="h-px w-8 bg-border" />
            <span className="text-muted-foreground">{t('setupSection')}</span>
          </div>
          <h1 className="mb-6 mt-3 text-[clamp(26px,2.8vw,36px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('headline')}
          </h1>

          <CreateOrgForm userEmail={user.email ?? ''} prefill={prefill} />

          <form action={logoutAction} className="mt-6 text-sm text-muted-foreground">
            {t('signedInAs')} <span className="font-medium text-foreground">{user.email}</span>
            {' · '}
            {t('wrongAccount')}{' '}
            <button type="submit" className="cursor-pointer font-medium text-foreground underline underline-offset-4">
              {t('signOut')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
