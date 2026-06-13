import { getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import { AVATAR_SIGNED_URL_TTL_SECONDS } from '@/lib/schedule/avatar'
import { ORG_LOGO_BUCKET, PROFILE_AVATAR_BUCKET } from '@/lib/app/avatars'
import { AccountForm } from '@/components/app/account-form'
import { PageHeader } from '@/components/app/page-header'

export default async function MyAccountPage() {
  const ctx = await getAppContext()
  const t = await getTranslations('app.account')
  const tRoles = await getTranslations('app.roles')

  const supabase = await createClient()
  const [{ data: profile }, { data: org }, { data: userRes }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', ctx.userId).single(),
    supabase.from('organizations').select('logo_url').eq('id', ctx.org.id).single(),
    supabase.auth.getUser(),
  ])

  const [avatarUrl, orgLogoUrl] = await Promise.all([
    profile?.avatar_url
      ? supabase.storage
          .from(PROFILE_AVATAR_BUCKET)
          .createSignedUrl(profile.avatar_url, AVATAR_SIGNED_URL_TTL_SECONDS)
          .then((r) => r.data?.signedUrl ?? null)
      : Promise.resolve(null),
    org?.logo_url
      ? supabase.storage
          .from(ORG_LOGO_BUCKET)
          .createSignedUrl(org.logo_url, AVATAR_SIGNED_URL_TTL_SECONDS)
          .then((r) => r.data?.signedUrl ?? null)
      : Promise.resolve(null),
  ])

  // Способ входа: providers из app_metadata (массив) либо одиночный provider
  const meta = userRes.user?.app_metadata as { provider?: string; providers?: string[] } | undefined
  const providers = meta?.providers ?? (meta?.provider ? [meta.provider] : [])
  const googleConnected = providers.includes('google')

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <AccountForm
        initialFullName={profile?.full_name ?? ''}
        email={ctx.userEmail}
        initialAvatarUrl={avatarUrl}
        roleLabel={tRoles(ctx.role)}
        orgName={ctx.org.name}
        orgId={ctx.org.id}
        orgLogoUrl={orgLogoUrl}
        googleConnected={googleConnected}
        canManageOrg={can(ctx.role, 'manage_org')}
      />
    </div>
  )
}
