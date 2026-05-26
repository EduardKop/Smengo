'use client'

import { useActionState, useState } from 'react'
import { loginAction, sendMagicLinkAction, loginWithGoogleAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { AuthMessages } from '@/lib/i18n'

interface Props {
  t: AuthMessages
  urlError?: string
}

const initialState = undefined

export function LoginForm({ t, urlError }: Props) {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [passwordState, passwordAction, passwordPending] = useActionState(loginAction, initialState)
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLinkAction, initialState)

  if (magicState?.message === 'check_email') {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-8 shadow-sm text-center">
        <h2 className="text-xl font-semibold">{t.magicLinkSent}</h2>
        <p className="text-sm text-muted-foreground">{t.magicLinkSentHint}</p>
        <button
          onClick={() => setMode('password')}
          className="text-sm text-foreground underline underline-offset-4"
        >
          {t.backToLogin}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.loginTitle}</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg border p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'password'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.passwordTab}
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'magic'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.magicLinkTab}
        </button>
      </div>

      {/* URL error (e.g. Google provider not enabled) */}
      {urlError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{urlError}</p>
      )}

      {mode === 'password' ? (
        <form action={passwordAction} className="space-y-4">
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
            {passwordState?.errors?.email && (
              <p className="text-xs text-destructive">{passwordState.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                {t.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t.forgotPassword}
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {passwordState?.errors?.password && (
              <p className="text-xs text-destructive">{passwordState.errors.password[0]}</p>
            )}
          </div>

          {passwordState?.message && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {passwordState.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={passwordPending}>
            {passwordPending ? t.loading : t.loginButton}
          </Button>
        </form>
      ) : (
        <form action={magicAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="magic-email" className="text-sm font-medium">
              {t.email}
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@company.com"
            />
            <p className="text-xs text-muted-foreground">{t.magicLinkHint}</p>
            {magicState?.errors?.email && (
              <p className="text-xs text-destructive">{magicState.errors.email[0]}</p>
            )}
          </div>

          {magicState?.message && magicState.message !== 'check_email' && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {magicState.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={magicPending}>
            {magicPending ? t.loading : t.magicLinkButton}
          </Button>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t.orContinueWith}</span>
        </div>
      </div>

      <form action={loginWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full gap-2">
          <GoogleIcon />
          {t.googleButton}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.noAccount}{' '}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          {t.registerLink}
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
