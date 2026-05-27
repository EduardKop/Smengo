'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { acceptInvitationAction } from '@/lib/actions/invitations'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  token: string
  email: string
  orgName: string
}

const initialState = undefined

export function InviteAcceptForm({ token, email, orgName }: Props) {
  const t = useTranslations('auth')
  const [state, action, pending] = useActionState(acceptInvitationAction, initialState)

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('inviteTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('inviteDescription', { org: orgName })}
        </p>
        <p className="mt-1 text-sm font-medium">{email}</p>
      </div>

      {state?.message && state.message !== 'check_email' && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <form action={action}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t('loading') : t('acceptInvite')}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href={`/register?invite=${token}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t('registerLink')}
        </Link>
      </p>
    </div>
  )
}
