'use client'

/**
 * /settings/company (owner-only) — редакторская двухпанельная вёрстка (как
 * биллинг/аккаунт): слева тёмная панель с лого, названием организации и
 * превью сайдбар-чипа + «Загрузить»; справа заголовок + edit-инпуты (название,
 * таймзона моноширинным) + «Сохранить». Блок квадратный.
 */

import { useMemo, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, ChevronDown, Loader2, Trash2, Upload } from 'lucide-react'
import {
  removeOrgLogoAction,
  updateOrgSettingsAction,
  uploadOrgLogoAction,
} from '@/lib/actions/org-settings'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { OrgMark } from '@/components/app/org-chip'
import { ShimmerButton } from '@/components/app/shimmer-button'

interface CompanyFormProps {
  orgId: string
  initialName: string
  initialTimezone: string
  initialLogoUrl: string | null
}

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }

const editorialInput =
  'w-full border-0 border-b-2 border-border bg-transparent px-0 py-2 text-lg font-semibold text-foreground outline-none transition-colors focus:border-accent sm:text-xl'

export function CompanyForm({ orgId, initialName, initialTimezone, initialLogoUrl }: CompanyFormProps) {
  const t = useTranslations('app.company')
  const [name, setName] = useState(initialName)
  const [timezone, setTimezone] = useState(initialTimezone)
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement | null>(null)

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

  const sidebarPreviewGlyph = logoUrl ? (
    // Квадрат со скруглением (как OrgMark), не круг — rounded-md на 24px давал круг
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" aria-hidden="true" className="h-6 w-6 rounded-[7px] object-cover" />
  ) : (
    <OrgMark orgId={orgId} orgName={displayName} size={24} />
  )

  return (
    <div className="flex flex-col overflow-hidden border border-border md:flex-row">
      {/* LEFT — тёмная панель с брендом организации */}
      <div
        className="flex flex-col justify-between gap-8 p-6 sm:p-8 md:w-[40%]"
        style={{ background: 'var(--account-hero-bg)', color: 'var(--account-hero-fg)' }}
      >
        <div className="flex items-start justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          <span>{t('eyebrowWord')}</span>
          <span>№ 03</span>
        </div>

        <div className="flex flex-col items-center gap-5 py-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" aria-hidden="true" className="h-[136px] w-[136px] rounded-[30px] object-cover" />
          ) : (
            <OrgMark orgId={orgId} orgName={displayName} size={136} />
          )}
          <p className="max-w-full truncate text-2xl font-extrabold tracking-tight">{displayName}</p>
        </div>

        <div>
          <div
            className="mb-4 h-px"
            style={{ background: 'color-mix(in srgb, var(--account-hero-fg) 22%, transparent)' }}
          />
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide" style={{ opacity: 0.55 }}>
                {t('previewLabel')}
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3"
                style={{ border: '1px solid color-mix(in srgb, var(--account-hero-fg) 20%, transparent)' }}
              >
                {sidebarPreviewGlyph}
                <span className="max-w-[120px] truncate text-xs font-semibold">{displayName}</span>
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {t('uploadShort')}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRemoveLogo}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-100 disabled:opacity-50"
                  style={{ opacity: 0.55 }}
                >
                  <Trash2 className="h-3 w-3" />
                  {t('removeLogo')}
                </button>
              )}
            </div>
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
      </div>

      {/* RIGHT — заголовок + форма */}
      <div className="flex flex-1 flex-col gap-7 p-6 sm:p-8">
        <div>
          <h1 className="text-[clamp(30px,4.5vw,46px)] font-extrabold leading-[0.98] tracking-[-0.02em] text-foreground">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="co-name" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--subtle)]">
              {t('name')}
            </label>
            <input
              id="co-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className={editorialInput}
            />
          </div>
          <div>
            <label htmlFor="co-tz" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--subtle)]">
              {t('timezone')} · {t('timezoneHint')}
            </label>
            <div className="relative">
              <select
                id="co-tz"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={`${editorialInput} appearance-none pr-8`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replaceAll('/', ' / ').replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">{t('detailsDesc')}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-end gap-3 pt-2">
          <div className="min-h-[18px] text-[13px]">
            {status.kind === 'saved' && (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <Check className="h-4 w-4" /> {t('saved')}
              </span>
            )}
            {status.kind === 'error' && <span className="font-medium text-destructive">{status.message}</span>}
          </div>
          <ShimmerButton type="button" disabled={isPending || name.trim().length === 0} onClick={handleSave}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('save')}
            <Check className="h-4 w-4" />
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}
