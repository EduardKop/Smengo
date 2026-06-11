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

  // SECURITY DEFINER RPC: the invited user is not an org member yet, so a
  // direct SELECT on invitations is (correctly) blocked by RLS.
  const { data } = await supabase.rpc('get_invitation', { p_token: token })
  const invitation = data?.[0]

  if (!invitation || invitation.accepted_at) {
    redirect('/login?error=invalid_invite')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    redirect('/login?error=expired_invite')
  }

  return (
    <InviteAcceptForm
      token={token}
      email={invitation.email}
      orgName={invitation.org_name}
    />
  )
}
