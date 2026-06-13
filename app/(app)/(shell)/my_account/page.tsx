import { getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/server'
import { AVATAR_SIGNED_URL_TTL_SECONDS } from '@/lib/schedule/avatar'
import { PROFILE_AVATAR_BUCKET } from '@/lib/app/avatars'
import { AccountForm } from '@/components/app/account-form'

export default async function MyAccountPage() {
  const ctx = await getAppContext()
  const t = await getTranslations('app.account')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', ctx.userId)
    .single()

  const avatarUrl = profile?.avatar_url
    ? (await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .createSignedUrl(profile.avatar_url, AVATAR_SIGNED_URL_TTL_SECONDS)).data?.signedUrl ?? null
    : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
      <AccountForm
        initialFullName={profile?.full_name ?? ''}
        email={ctx.userEmail}
        initialAvatarUrl={avatarUrl}
      />
    </div>
  )
}
