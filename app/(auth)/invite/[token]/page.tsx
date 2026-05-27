import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InviteAcceptForm } from '@/components/auth/invite-accept-form'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = await createClient()

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

  const orgName =
    invitation.organizations && !Array.isArray(invitation.organizations)
      ? invitation.organizations.name
      : ''

  return (
    <InviteAcceptForm
      token={token}
      email={invitation.email}
      orgName={orgName}
    />
  )
}
