'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { assertCan } from '@/lib/permissions'
import { checkPlanLimit } from '@/lib/billing/limits'
import type { UserRole } from '@/supabase/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export type InviteFormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'viewer']),
})

/** Map RAISE EXCEPTION codes from the DB functions to stable app messages. */
function dbErrorCode(message: string): string {
  for (const code of [
    'already_member',
    'cannot_invite_owner',
    'invalid_or_expired',
    'email_mismatch',
    'last_owner',
    'forbidden',
    'unauthorized',
  ]) {
    if (message.includes(code)) return code
  }
  return message
}

export async function createInvitationAction(
  orgId: string,
  _prev: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'unauthorized' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { message: 'unauthorized' }
  assertCan(membership.role as UserRole, 'invite_users')

  const parsed = InviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Plan limit: managers are a billed resource (final check happens server-side here)
  if (parsed.data.role === 'manager') {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', orgId)
      .single()
    const limit = await checkPlanLimit(supabase, orgId, org?.plan ?? 'start', 'managers')
    if (!limit.allowed) return { message: 'plan_limit_managers' }
  }

  // SECURITY DEFINER RPC: validates role server-side, replaces pending invites,
  // generates the token. Direct INSERT is blocked by RLS by design.
  const { data: token, error } = await supabase.rpc('create_invitation', {
    p_org_id: orgId,
    p_email: parsed.data.email,
    p_role: parsed.data.role as UserRole,
  })
  if (error || !token) return { message: dbErrorCode(error?.message ?? 'error') }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: parsed.data.email,
    subject: 'Приглашение в Smengo',
    html: `<p>Вас пригласили в команду Smengo.</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}">Принять приглашение</a></p>
           <p>Ссылка действительна 7 дней.</p>`,
  })

  return { message: 'sent' }
}

const AcceptSchema = z.object({
  token: z.string().min(1),
})

export async function acceptInvitationAction(
  _prev: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const parsed = AcceptSchema.safeParse({ token: formData.get('token') })
  if (!parsed.success) return { message: 'invalid_token' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'unauthorized' }

  // SECURITY DEFINER RPC: validates token + expiry, enforces that the
  // authenticated email matches the invited email, creates the membership.
  const { error } = await supabase.rpc('accept_invitation', {
    p_token: parsed.data.token,
  })
  if (error) return { message: dbErrorCode(error.message) }

  redirect('/schedule')
}

export async function revokeInvitationAction(
  orgId: string,
  invitationId: string,
): Promise<InviteFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'unauthorized' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { message: 'unauthorized' }
  assertCan(membership.role as UserRole, 'invite_users')

  // RLS inv_delete policy: owner/admin of the org
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('org_id', orgId)
  if (error) return { message: error.message }

  return { message: 'revoked' }
}
