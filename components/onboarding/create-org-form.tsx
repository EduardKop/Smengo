'use client'

import { useActionState, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Building2, Upload } from 'lucide-react'
import { createOrgAction } from '@/lib/actions/org'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { Button } from '@/components/ui/button'
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

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

export function CreateOrgForm({ userEmail, prefill }: Props) {
  const t = useTranslations('onboarding')
  const tAuth = useTranslations('auth')
  const [state, action, pending] = useActionState(createOrgAction, initialState)

  const [teamSize, setTeamSize] = useState<string>('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Сжимаем лого на клиенте и подменяем файл в input — обычный form submit
  // унесёт уже лёгкий JPEG (битый файл просто остаётся как есть: сервер
  // отбросит его по магическим байтам, онбординг не блокируется)
  async function handleLogoChange(input: HTMLInputElement) {
    const file = input.files?.[0]
    if (!file) return
    try {
      const blob = await compressAvatarImage(file)
      const dt = new DataTransfer()
      dt.items.add(new File([blob], 'logo.jpg', { type: 'image/jpeg' }))
      input.files = dt.files
    } catch {
      // оставляем оригинальный файл
    }
    const preview = input.files?.[0]
    if (preview) setLogoPreview(URL.createObjectURL(preview))
  }

  return (
    <div className="w-full space-y-4 rounded-xl border bg-card px-7 py-6 shadow-sm">
      <form action={action} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="first_name" className="text-sm font-medium">
              {tAuth('firstName')}
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              autoComplete="given-name"
              defaultValue={prefill.firstName}
              className={inputClass}
              placeholder={tAuth('firstNamePlaceholder')}
            />
            {state?.errors?.first_name && (
              <p className="text-xs text-destructive">{state.errors.first_name[0]}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="last_name" className="text-sm font-medium">
              {tAuth('lastName')}
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              autoComplete="family-name"
              defaultValue={prefill.lastName}
              className={inputClass}
              placeholder={tAuth('lastNamePlaceholder')}
            />
            {state?.errors?.last_name && (
              <p className="text-xs text-destructive">{state.errors.last_name[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t('orgName')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={prefill.companyName}
            className={inputClass}
            placeholder={t('orgNamePlaceholder')}
          />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Кол-во сотрудников — чипы (правка 7) */}
        <div className="space-y-1">
          <span className="text-sm font-medium">
            {t('teamSizeLabel')}{' '}
            <span className="font-normal text-muted-foreground">{tAuth('sourceOptional')}</span>
          </span>
          <input type="hidden" name="team_size" value={teamSize} />
          <div className="grid grid-cols-4 gap-2">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={teamSize === size}
                onClick={() => setTeamSize((cur) => (cur === size ? '' : size))}
                className={[
                  'cursor-pointer rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                  teamSize === size
                    ? 'border-accent bg-accent-soft text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-ring hover:text-foreground',
                ].join(' ')}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Лого компании (правка 7) */}
        <div className="space-y-1">
          <span className="text-sm font-medium">
            {t('logoLabel')}{' '}
            <span className="font-normal text-muted-foreground">{tAuth('sourceOptional')}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              )}
            </span>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              <Upload className="h-3.5 w-3.5" />
              {t('logoUpload')}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleLogoChange(e.target)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="billing_email" className="text-sm font-medium">
            {t('billingEmail')}
          </label>
          <input
            id="billing_email"
            name="billing_email"
            type="email"
            required
            defaultValue={userEmail}
            className={inputClass}
          />
          {state?.errors?.billing_email && (
            <p className="text-xs text-destructive">{state.errors.billing_email[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="timezone" className="text-sm font-medium">
            {t('timezone')}
          </label>
          <select id="timezone" name="timezone" defaultValue="Europe/Kyiv" className={inputClass}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="locale" className="text-sm font-medium">
            {t('language')}
          </label>
          <select id="locale" name="locale" defaultValue="ru" className={inputClass}>
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>

        {!prefill.source && (
          <div className="space-y-1">
            <label htmlFor="acquisition_source" className="text-sm font-medium">
              {tAuth('sourceLabel')}{' '}
              <span className="font-normal text-muted-foreground">{tAuth('sourceOptional')}</span>
            </label>
            <input
              id="acquisition_source"
              name="acquisition_source"
              type="text"
              maxLength={255}
              className={inputClass}
              placeholder={tAuth('sourcePlaceholder')}
            />
          </div>
        )}

        {!prefill.termsAccepted && (
          <div className="space-y-1">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 h-4 w-4 rounded border accent-primary"
              />
              <span>
                {tAuth.rich('termsAgree', {
                  terms: (chunks) => (
                    <LocaleLink
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {chunks}
                    </LocaleLink>
                  ),
                  privacy: (chunks) => (
                    <LocaleLink
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {chunks}
                    </LocaleLink>
                  ),
                })}
              </span>
            </label>
            {state?.errors?.terms && (
              <p className="text-xs text-destructive">{state.errors.terms[0]}</p>
            )}
          </div>
        )}

        {state?.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? '...' : t('createButton')}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{tAuth('noCard')}</p>
      </form>
    </div>
  )
}
