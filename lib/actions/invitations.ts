'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Resend } from 'resend'
import { assertCan } from '@/lib/permissions'
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

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('invitations').insert({
    org_id: orgId,
    email: parsed.data.email,
    role: parsed.data.role as UserRole,
    token,
    expires_at: expiresAt,
  })
  if (error) return { message: error.message }

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

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', parsed.data.token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invitation) return { message: 'invalid_or_expired' }

  const { error } = await supabase.from('memberships').upsert({
    org_id: invitation.org_id,
    user_id: user.id,
    role: invitation.role,
  })
  if (error) return { message: error.message }

  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', parsed.data.token)

  redirect('/dashboard')
}
