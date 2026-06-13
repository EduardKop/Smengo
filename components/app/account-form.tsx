'use client'

/**
 * /my_account — редакторская двухпанельная вёрстка (по аналогии с биллингом):
 * слева тёмная панель с большим «Мой аккаунт» и идентичностью (аватар, имя,
 * email, роль), справа форма с edit-инпутами (нижняя граница), способ входа и
 * рабочая область + «Сохранить изменения». Блок квадратный, без скруглений.
 */

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Camera, Check, Loader2, Mail, Trash2 } from 'lucide-react'
import {
  removeProfileAvatarAction,
  updateProfileAction,
  uploadProfileAvatarAction,
} from '@/lib/actions/profile'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { UserAvatar } from '@/components/app/user-menu'
import { OrgMark } from '@/components/app/org-chip'
import { ShimmerButton } from '@/components/app/shimmer-button'

interface AccountFormProps {
  initialFullName: string
  email: string
  initialAvatarUrl: string | null
  roleLabel: string
  orgName: string
  orgId: string
  orgLogoUrl: string | null
  googleConnected: boolean
  canManageOrg: boolean
}

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }

/** Официальный знак Google (бренд-ассет — фирменные цвета) */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function SectionLabel({ marker, label }: { marker: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-extrabold text-accent">{marker}</span>
      <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

const editorialInput =
  'w-full border-0 border-b-2 border-border bg-transparent px-0 py-2 text-lg font-semibold text-foreground outline-none transition-colors focus:border-accent sm:text-xl'

export function AccountForm({
  initialFullName,
  email,
  initialAvatarUrl,
  roleLabel,
  orgName,
  orgId,
  orgLogoUrl,
  googleConnected,
  canManageOrg,
}: AccountFormProps) {
  const t = useTranslations('app.account')
  const [fullName, setFullName] = useState(initialFullName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleSave() {
    setStatus({ kind: 'idle' })
    startTransition(async () => {
      const res = await updateProfileAction({ full_name: fullName })
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
        fd.set('file', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
        const res = await uploadProfileAvatarAction(fd)
        if (res.ok) {
          setAvatarUrl(res.url)
          setStatus({ kind: 'saved' })
        } else {
          setStatus({ kind: 'error', message: t('errorPhoto') })
        }
      } catch {
        setStatus({ kind: 'error', message: t('errorPhoto') })
      }
    })
  }

  function handleRemovePhoto() {
    setStatus({ kind: 'idle' })
    startTransition(async () => {
      const res = await removeProfileAvatarAction()
      if (res.ok) {
        setAvatarUrl(null)
        setStatus({ kind: 'saved' })
      } else {
        setStatus({ kind: 'error', message: t('errorPhoto') })
      }
    })
  }

  const displayName = fullName.trim() || email

  const orgGlyph = orgLogoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={orgLogoUrl} alt="" aria-hidden="true" className="h-9 w-9 rounded-lg object-cover" />
  ) : (
    <OrgMark orgId={orgId} orgName={orgName} size={36} />
  )

  const orgRow = (
    <span className="flex min-w-0 items-center gap-3">
      {orgGlyph}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{orgName}</span>
        <span className="block text-xs text-muted-foreground">{t('orgLabel')}</span>
      </span>
    </span>
  )

  return (
    <div className="flex flex-col overflow-hidden border border-border md:flex-row">
      {/* LEFT — тёмная панель с идентичностью */}
      <div
        className="flex flex-col justify-between gap-10 p-6 sm:p-8 md:w-[40%]"
        style={{ background: 'var(--account-hero-bg)', color: 'var(--account-hero-fg)' }}
      >
        <div className="flex items-start justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          <span>SMENGO · {t('eyebrowWord')}</span>
          <span>№ 01</span>
        </div>

        <h1 className="text-[clamp(44px,7vw,72px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          {t('title')}
        </h1>

        <div>
          <div
            className="mb-4 h-px"
            style={{ background: 'color-mix(in srgb, var(--account-hero-fg) 22%, transparent)' }}
          />
          <div className="flex items-center gap-3">
            <UserAvatar name={displayName} photoUrl={avatarUrl} size={46} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs" style={{ opacity: 0.6 }}>{email}</p>
            </div>
            <span className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent-foreground">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT — форма (фон страницы) */}
      <div className="flex flex-1 flex-col gap-7 p-6 sm:p-8">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {t('changePhoto')}
          </button>
          {avatarUrl && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleRemovePhoto}
              className="inline-flex cursor-pointer items-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('removePhoto')}
            </button>
          )}
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

        {/* A — личные данные */}
        <section>
          <SectionLabel marker="A" label={t('detailsTitle')} />
          <div className="mt-5 flex flex-col gap-6">
            <div>
              <label htmlFor="acc-name" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--subtle)]">
                {t('fullName')}
              </label>
              <input
                id="acc-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                className={editorialInput}
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="acc-email" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--subtle)]">
                  {t('email')}
                </label>
                <span className="text-base text-accent" style={{ fontFamily: 'var(--font-handwriting)' }}>
                  {t('emailLocked')}
                </span>
              </div>
              <input
                id="acc-email"
                type="email"
                value={email}
                readOnly
                className={`${editorialInput} cursor-default text-muted-foreground`}
              />
            </div>
          </div>
        </section>

        {/* B — вход · рабочая область */}
        <section>
          <SectionLabel marker="B" label={t('sectionAccess')} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)]">
                {googleConnected ? <GoogleMark /> : <Mail className="h-5 w-5 text-muted-foreground" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {googleConnected ? 'Google' : t('emailSignin')}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t('loginLabel')}</p>
              </div>
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-success"
                title={t('statusActive')}
                aria-label={t('statusActive')}
              />
            </div>

            {canManageOrg ? (
              <Link
                href="/settings/company"
                className="flex items-center rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-foreground/25"
              >
                {orgRow}
              </Link>
            ) : (
              <div className="flex items-center rounded-xl border border-border bg-card p-3.5">{orgRow}</div>
            )}
          </div>
        </section>

        {/* Save */}
        <div className="mt-auto flex items-center justify-end gap-3 pt-2">
          <div className="min-h-[18px] text-[13px]">
            {status.kind === 'saved' && (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <Check className="h-4 w-4" /> {t('saved')}
              </span>
            )}
            {status.kind === 'error' && <span className="font-medium text-destructive">{status.message}</span>}
          </div>
          <ShimmerButton type="button" disabled={isPending || fullName.trim().length === 0} onClick={handleSave}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('saveChanges')}
            <ArrowRight className="h-4 w-4" />
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}
