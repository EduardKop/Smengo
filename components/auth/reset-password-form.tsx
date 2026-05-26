'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import type { AuthMessages } from '@/lib/i18n'

interface Props {
  t: AuthMessages
}

const initialState = undefined

export function ResetPasswordForm({ t }: Props) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState)

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.resetPasswordTitle}</h1>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            {t.newPassword}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t.loading : t.resetPasswordButton}
        </Button>
      </form>
    </div>
  )
}
