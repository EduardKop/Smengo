'use client'

/**
 * Страница /my_account: профиль-герой (декоративная панель + аватар, имя, email,
 * роль, организация) + 2 колонки: «Личные данные» (форма) слева, «Вход и
 * безопасность» (способ входа) и «Рабочая область» (организация) справа.
 * Фото сжимается на клиенте и грузится в приватный бакет profile-avatars.
 */

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Camera, Check, ChevronRight, Loader2, Mail, Trash2 } from 'lucide-react'
import {
  removeProfileAvatarAction,
  updateProfileAction,
  uploadProfileAvatarAction,
} from '@/lib/actions/profile'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { UserAvatar } from '@/components/app/user-menu'
import { OrgMark } from '@/components/app/org-chip'
import { SettingsCard, FieldLabel, appInputClass } from '@/components/app/settings-card'
import { ShimmerButton } from '@/components/app/shimmer-button'

interface AccountFormProps {
  initialFullName: string
  email: string
  initialAvatarUrl: string | null
  roleLabel: string
  orgName: string
  orgId: string
  orgLogoUrl: string | null
  /** Вход через Google (иначе — email) */
  googleConnected: boolean
  /** Может ли открыть настройки организации (чип «Рабочая область» кликабелен) */
  canManageOrg: boolean
}

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }

/** Официальный знак Google (бренд-ассет — фирменные цвета, не токены) */
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

  const workspaceRow = (
    <span className="flex items-center gap-3">
      {orgGlyph}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{orgName}</span>
        <span className="block text-xs text-muted-foreground">{t('currentOrg')}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
    </span>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Профиль-герой */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)] sm:flex-row">
        {/* Декоративная панель */}
        <div className="relative hidden w-44 shrink-0 overflow-hidden border-r border-border bg-accent-soft/50 sm:block">
          <span className="absolute left-5 top-5 z-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent/80">
            PROFILE
          </span>
          <div
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage: 'radial-gradient(var(--accent) 0.8px, transparent 0.8px)',
              backgroundSize: '14px 14px',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Идентичность + управление фото */}
        <div className="flex flex-1 flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar name={displayName} photoUrl={avatarUrl} size={72} />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold leading-tight text-foreground">{displayName}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  {roleLabel}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {orgName}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{t('profileNote')}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
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
                className="inline-flex cursor-pointer items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                {t('removePhoto')}
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
      </div>

      {/* 2 колонки */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Личные данные */}
        <SettingsCard eyebrow={t('detailsTitle')} dotColor="var(--success)" description={t('detailsDesc')}>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="acc-full_name">{t('fullName')}</FieldLabel>
              <input
                id="acc-full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                className={appInputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="acc-email" hint={t('emailLocked')}>{t('email')}</FieldLabel>
              <input
                id="acc-email"
                type="email"
                value={email}
                readOnly
                className={`${appInputClass} cursor-default text-muted-foreground`}
              />
            </div>
            <ShimmerButton
              type="button"
              disabled={isPending || fullName.trim().length === 0}
              onClick={handleSave}
              className="mt-1 w-full"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t('saveChanges')}
            </ShimmerButton>
            <div className="min-h-[18px] text-center text-[13px]">
              {status.kind === 'saved' && <span className="font-medium text-success">{t('saved')}</span>}
              {status.kind === 'error' && <span className="font-medium text-destructive">{status.message}</span>}
            </div>
          </div>
        </SettingsCard>

        {/* Правая колонка */}
        <div className="flex flex-col gap-5">
          {/* Вход и безопасность */}
          <SettingsCard eyebrow={t('securityTitle')} dotColor="var(--info)" description={t('securityDesc')} headerChevron>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-[var(--surface)] p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card">
                {googleConnected ? <GoogleMark /> : <Mail className="h-5 w-5 text-muted-foreground" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {googleConnected ? t('googleConnected') : t('emailSignin')}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t('signinDesc')}</p>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                {t('statusActive')}
              </span>
            </div>
          </SettingsCard>

          {/* Рабочая область */}
          <SettingsCard eyebrow={t('workspaceTitle')} dotColor="var(--success)" description={t('workspaceDesc')}>
            {canManageOrg ? (
              <Link
                href="/settings/company"
                className="block rounded-xl border border-border bg-[var(--surface)] p-3.5 transition-colors hover:bg-muted/50"
              >
                {workspaceRow}
              </Link>
            ) : (
              <div className="rounded-xl border border-border bg-[var(--surface)] p-3.5">{workspaceRow}</div>
            )}
          </SettingsCard>
        </div>
      </div>
    </div>
  )
}
