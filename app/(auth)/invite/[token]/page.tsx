import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDict, getLocale } from '@/lib/i18n'
import { InviteAcceptForm } from '@/components/auth/invite-accept-form'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = await createClient()

  // Validate that the invitation exists and is not expired/accepted
  const { data: invitation } = await supabase
    .from('invitations')
    .select('email, role, expires_at, accepted_at, organizations(name)')
    .eq('token', token)
    .single()

  if (!invitation || invitation.accepted_at) {
    redirect('/login?error=invalid_invite')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    redirect('/login?error=expired_invite')
  }

  const locale = await getLocale()
  const dict = await getDict(locale)
  const orgName =
    invitation.organizations && !Array.isArray(invitation.organizations)
      ? invitation.organizations.name
      : ''

  return (
    <InviteAcceptForm
      t={dict.auth}
      token={token}
      email={invitation.email}
      orgName={orgName}
    />
  )
}
