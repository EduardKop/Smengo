'use client'

/**
 * Форма /settings/company (owner-only): название, таймзона, лого.
 * Лого сжимается на клиенте и грузится в приватный бакет org-logos;
 * без лого чип организации показывает генеративный OrgMark.
 */

import { useMemo, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Trash2, Upload } from 'lucide-react'
import {
  removeOrgLogoAction,
  updateOrgSettingsAction,
  uploadOrgLogoAction,
} from '@/lib/actions/org-settings'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { OrgMark } from '@/components/app/org-chip'

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

  const inputCls =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring'

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6">
      {/* Лого */}
      <div className="flex items-center gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" aria-hidden="true" className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <OrgMark orgId={orgId} orgName={name || initialName} size={64} />
        )}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">{t('logo')}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {t('uploadLogo')}
            </button>
            {logoUrl && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleRemoveLogo}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('removeLogo')}
              </button>
            )}
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
        </div>
      </div>

      {/* Название */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">{t('name')}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className={inputCls}
        />
      </label>

      {/* Таймзона */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">{t('timezone')}</span>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending || name.trim().length === 0}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('save')}
        </button>
        {status.kind === 'saved' && <span className="text-sm font-medium text-success">{t('saved')}</span>}
        {status.kind === 'error' && <span className="text-sm font-medium text-destructive">{status.message}</span>}
      </div>
    </div>
  )
}
