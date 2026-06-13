'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react'
import { createOrgAction } from '@/lib/actions/org'
import { ShimmerButton } from '@/components/app/shimmer-button'
import { Link as LocaleLink } from '@/i18n/routing'

/** Чипы кол-ва сотрудников (правка 7) — под позиционирование 15–300 */
const TEAM_SIZES = ['1-15', '16-50', '51-150', '150+'] as const

export interface OnboardingPrefill {
  firstName: string
  lastName: string
  companyName: string
  source: string
  termsAccepted: boolean
}

interface Props {
  userEmail: string
  prefill: OnboardingPrefill
}

const initialState = undefined

const TIMEZONES = [
  'Europe/Kyiv',
  'Europe/Warsaw',
  'Europe/Bucharest',
  'Europe/Sofia',
  'Europe/Belgrade',
  'Europe/Prague',
  'Europe/Vilnius',
  'Europe/Riga',
  'Europe/Tallinn',
  'Europe/Chisinau',
  'Europe/Berlin',
  'Europe/London',
  'UTC',
]

const fieldClass =
  'w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/55 focus:border-accent focus:ring-2 focus:ring-accent/20'
const labelClass = 'mb-2 block text-sm font-semibold text-foreground'

export function CreateOrgForm({ userEmail, prefill }: Props) {
  const t = useTranslations('onboarding')
  const tAuth = useTranslations('auth')
  const [state, action, pending] = useActionState(createOrgAction, initialState)

  const [teamSize, setTeamSize] = useState<string>('')

  return (
    <form action={action} className="space-y-5">
      {/* Имя / Фамилия */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className={labelClass}>{tAuth('firstName')}</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            autoComplete="given-name"
            defaultValue={prefill.firstName}
            className={fieldClass}
            placeholder={tAuth('firstNamePlaceholder')}
          />
          {state?.errors?.first_name && <p className="mt-1 text-xs text-destructive">{state.errors.first_name[0]}</p>}
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>{tAuth('lastName')}</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            autoComplete="family-name"
            defaultValue={prefill.lastName}
            className={fieldClass}
            placeholder={tAuth('lastNamePlaceholder')}
          />
          {state?.errors?.last_name && <p className="mt-1 text-xs text-destructive">{state.errors.last_name[0]}</p>}
        </div>
      </div>

      {/* Название компании */}
      <div>
        <label htmlFor="name" className={labelClass}>{t('orgName')}</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={prefill.companyName}
          className={fieldClass}
          placeholder={t('orgNamePlaceholder')}
        />
        {state?.errors?.name && <p className="mt-1 text-xs text-destructive">{state.errors.name[0]}</p>}
      </div>

      {/* Кол-во сотрудников — чипы */}
      <div>
        <span className={labelClass}>
          {t('teamSizeLabel')}{' '}
          <span className="font-normal text-muted-foreground">{tAuth('sourceOptional')}</span>
        </span>
        <input type="hidden" name="team_size" value={teamSize} />
        <div className="grid grid-cols-4 gap-2">
          {TEAM_SIZES.map((size) => {
            const active = teamSize === size
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => setTeamSize((cur) => (cur === size ? '' : size))}
                className={`cursor-pointer rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border bg-[var(--surface)] text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {/* Часовой пояс / Язык */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="timezone" className={labelClass}>{t('timezone')}</label>
          <div className="relative">
            <select
              id="timezone"
              name="timezone"
              defaultValue="Europe/Kyiv"
              className={`${fieldClass} appearance-none pr-9`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replaceAll('/', ' / ')}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div>
          <label htmlFor="locale" className={labelClass}>{t('language')}</label>
          <div className="relative">
            <select id="locale" name="locale" defaultValue="ru" className={`${fieldClass} appearance-none pr-9`}>
              <option value="ru">Русский</option>
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Email для счетов */}
      <div>
        <label htmlFor="billing_email" className={labelClass}>{t('billingEmail')}</label>
        <input
          id="billing_email"
          name="billing_email"
          type="email"
          required
          defaultValue={userEmail}
          className={fieldClass}
        />
        {state?.errors?.billing_email && <p className="mt-1 text-xs text-destructive">{state.errors.billing_email[0]}</p>}
      </div>

      {/* Источник (только для OAuth без метаданных) */}
      {!prefill.source && (
        <div>
          <label htmlFor="acquisition_source" className={labelClass}>
            {tAuth('sourceLabel')}{' '}
            <span className="font-normal text-muted-foreground">{tAuth('sourceOptional')}</span>
          </label>
          <input
            id="acquisition_source"
            name="acquisition_source"
            type="text"
            maxLength={255}
            className={fieldClass}
            placeholder={tAuth('sourcePlaceholder')}
          />
        </div>
      )}

      {/* Условия */}
      {!prefill.termsAccepted && (
        <div>
          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <input type="checkbox" name="terms" required className="mt-0.5 h-4 w-4 rounded border accent-[var(--accent)]" />
            <span>
              {tAuth.rich('termsAgree', {
                terms: (chunks) => (
                  <LocaleLink href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">
                    {chunks}
                  </LocaleLink>
                ),
                privacy: (chunks) => (
                  <LocaleLink href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">
                    {chunks}
                  </LocaleLink>
                ),
              })}
            </span>
          </label>
          {state?.errors?.terms && <p className="mt-1 text-xs text-destructive">{state.errors.terms[0]}</p>}
        </div>
      )}

      {state?.message && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}

      <ShimmerButton type="submit" disabled={pending} className="w-full justify-center py-3.5 text-[15px]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t('createButton')}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </ShimmerButton>
      <p className="text-center text-xs text-muted-foreground">{tAuth('noCard')}</p>
    </form>
  )
}
