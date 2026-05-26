'use client'

import { useActionState } from 'react'
import { forgotPasswordAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { AuthMessages } from '@/lib/i18n'

interface Props {
  t: AuthMessages
}

const initialState = undefined

export function ForgotPasswordForm({ t }: Props) {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState)

  if (state?.message === 'sent') {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h2 className="text-xl font-semibold">{t.forgotPasswordSent}</h2>
        <p className="text-sm text-muted-foreground">{t.forgotPasswordSentHint}</p>
        <Link href="/login" className="block text-sm text-foreground underline underline-offset-4">
          {t.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.forgotPasswordTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.forgotPasswordHint}</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@company.com"
          />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        {state?.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t.loading : t.forgotPasswordButton}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
          {t.backToLogin}
        </Link>
      </p>
    </div>
  )
}
