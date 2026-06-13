'use client'

/**
 * Форма /settings/company (owner-only): логотип, название, таймзона.
 * Лого сжимается на клиенте и грузится в приватный бакет org-logos;
 * без лого чип организации показывает генеративный OrgMark.
 */

import { useMemo, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Building2, Check, Clock, Loader2, Trash2, Upload } from 'lucide-react'
import {
  removeOrgLogoAction,
  updateOrgSettingsAction,
  uploadOrgLogoAction,
} from '@/lib/actions/org-settings'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { OrgMark } from '@/components/app/org-chip'
import { SettingsCard, FieldLabel, appInputClass } from '@/components/app/settings-card'
import { ShimmerButton } from '@/components/app/shimmer-button'

interface CompanyFormProps {
  orgId: string
  initialName: string
  initialTimezone: string
  initialLogoUrl: string | null
}

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }

export function CompanyForm({ orgId, initialName, initialTimezone, initialLogoUrl }: CompanyFormProps) {
  const t = useTranslations('app.company')
  const [name, setName] = useState(initialName)
  const [timezone, setTimezone] = useState(initialTimezone)
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement | null>(null)

  // Полный список IANA-таймзон браузера; текущая всегда в списке
  const timezones = useMemo(() => {
    const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
    return all.includes(initialTimezone) ? all : [initialTimezone, ...all]
  }, [initialTimezone])

  function handleSave() {
    setStatus({ kind: 'idle' })
    startTransition(async () => {
      const res = await updateOrgSettingsAction({ name, timezone })
      setStatus(res.ok ? { kind: 'saved' } : { kind: 'error', message: t('errorSave') })
    })
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    setStatus({ kind: 'idle' })
    startTransition(async () => {
      try {
        const blob = await compressAvatarImage(file)
        const fd = new FormData()
        fd.set('file', new File([blob], 'logo.jpg', { type: 'image/jpeg' }))
        const res = await uploadOrgLogoAction(fd)
        if (res.ok) {
          setLogoUrl(res.url)
          setStatus({ kind: 'saved' })
        } else {
          setStatus({ kind: 'error', message: t('errorLogo') })
        }
      } catch {
        setStatus({ kind: 'error', message: t('errorLogo') })
      }
    })
  }

  function handleRemoveLogo() {
    setStatus({ kind: 'idle' })
    startTransition(async () => {
      const res = await removeOrgLogoAction()
      if (res.ok) {
        setLogoUrl(null)
        setStatus({ kind: 'saved' })
      } else {
        setStatus({ kind: 'error', message: t('errorLogo') })
      }
    })
  }

  const displayName = name.trim() || initialName

  // Превью «как лого выглядит в сайдбаре» — повторяет геометрию OrgChip
  const logoPreview = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" aria-hidden="true" className="h-7 w-7 rounded-lg object-cover" />
  ) : (
    <OrgMark orgId={orgId} orgName={displayName} size={28} />
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Логотип + живое превью чипа организации */}
      <SettingsCard icon={Building2} title={t('logo')} description={t('logoDesc')}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" aria-hidden="true" className="h-[72px] w-[72px] rounded-2xl object-cover" />
            ) : (
              <OrgMark orgId={orgId} orgName={displayName} size={72} />
            )}
            {/* Превью сайдбар-чипа */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--subtle)]">
                {t('previewLabel')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface)] py-1 pl-1 pr-3">
                {logoPreview}
                <span className="max-w-[160px] truncate text-sm font-semibold text-foreground">{displayName}</span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {t('uploadLogo')}
            </button>
            {logoUrl && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleRemoveLogo}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('removeLogo')}
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </SettingsCard>

      {/* Название + таймзона */}
      <SettingsCard
        icon={Clock}
        title={t('detailsTitle')}
        description={t('detailsDesc')}
        footer={
          <>
            <div className="min-h-[20px] text-sm">
              {status.kind === 'saved' && (
                <span className="inline-flex items-center gap-1.5 font-medium text-success">
                  <Check className="h-4 w-4" /> {t('saved')}
                </span>
              )}
              {status.kind === 'error' && (
                <span className="font-medium text-destructive">{status.message}</span>
              )}
            </div>
            <ShimmerButton
              type="button"
              disabled={isPending || name.trim().length === 0}
              onClick={handleSave}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('save')}
            </ShimmerButton>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="co-name">{t('name')}</FieldLabel>
            <input
              id="co-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className={appInputClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="co-tz" hint={t('timezoneHint')}>{t('timezone')}</FieldLabel>
            <select id="co-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={appInputClass}>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
