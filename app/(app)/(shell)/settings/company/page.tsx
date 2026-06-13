import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import { AVATAR_SIGNED_URL_TTL_SECONDS } from '@/lib/schedule/avatar'
import { ORG_LOGO_BUCKET } from '@/lib/app/avatars'
import { CompanyForm } from '@/components/app/company-form'
import { PageHeader } from '@/components/app/page-header'

export default async function CompanySettingsPage() {
  const ctx = await getAppContext()
  // Настройки организации — owner-only (RLS org_update); остальным — на дашборд
  if (!can(ctx.role, 'manage_org')) redirect('/dashboard')

  const t = await getTranslations('app.company')

  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, timezone, logo_url')
    .eq('id', ctx.org.id)
    .single()

  const logoUrl = org?.logo_url
    ? (await supabase.storage
        .from(ORG_LOGO_BUCKET)
        .createSignedUrl(org.logo_url, AVATAR_SIGNED_URL_TTL_SECONDS)).data?.signedUrl ?? null
    : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <CompanyForm
        orgId={ctx.org.id}
        initialName={org?.name ?? ctx.org.name}
        initialTimezone={org?.timezone ?? 'Europe/Kyiv'}
        initialLogoUrl={logoUrl}
      />
    </div>
  )
}
