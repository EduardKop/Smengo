'use client'

import { useActionState } from 'react'
import { createOrgAction } from '@/lib/actions/org'
import { Button } from '@/components/ui/button'
import type { OnboardingMessages } from '@/lib/i18n'

interface Props {
  t: OnboardingMessages
  userEmail: string
}

const initialState = undefined

const TIMEZONES = [
  'Europe/Kyiv',
  'Europe/Moscow',
  'Asia/Almaty',
  'Asia/Tashkent',
  'Asia/Bishkek',
  'Asia/Baku',
  'Asia/Yerevan',
  'Asia/Tbilisi',
  'Europe/Minsk',
  'Europe/Riga',
  'Europe/Vilnius',
  'Europe/Tallinn',
]

export function CreateOrgForm({ t, userEmail }: Props) {
  const [state, action, pending] = useActionState(createOrgAction, initialState)

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t.orgName}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t.orgNamePlaceholder}
          />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="billing_email" className="text-sm font-medium">
            {t.billingEmail}
          </label>
          <input
            id="billing_email"
            name="billing_email"
            type="email"
            required
            defaultValue={userEmail}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {state?.errors?.billing_email && (
            <p className="text-xs text-destructive">{state.errors.billing_email[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="timezone" className="text-sm font-medium">
            {t.timezone}
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue="Europe/Kyiv"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="locale" className="text-sm font-medium">
            {t.language}
          </label>
          <select
            id="locale"
            name="locale"
            defaultValue="ru"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>

        {state?.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? '...' : t.createButton}
        </Button>
      </form>
    </div>
  )
}
