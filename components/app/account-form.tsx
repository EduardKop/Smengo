'use client'

/**
 * Форма /my_account: имя + фото профиля. Фото сжимается на клиенте
 * (тот же пайплайн, что фото сотрудников) и грузится server action'ом
 * в приватный бакет profile-avatars.
 */

import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Trash2, Upload } from 'lucide-react'
import {
  removeProfileAvatarAction,
  updateProfileAction,
  uploadProfileAvatarAction,
} from '@/lib/actions/profile'
import { compressAvatarImage } from '@/lib/schedule/avatar-compress'
import { UserAvatar } from '@/components/app/user-menu'

interface AccountFormProps {
  initialFullName: string
  email: string
  initialAvatarUrl: string | null
}

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }

export function AccountForm({ initialFullName, email, initialAvatarUrl }: AccountFormProps) {
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

  const inputCls =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring'

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6">
      {/* Фото */}
      <div className="flex items-center gap-4">
        <UserAvatar name={fullName || email} photoUrl={avatarUrl} size={64} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">{t('photo')}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {t('uploadPhoto')}
            </button>
            {avatarUrl && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleRemovePhoto}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('removePhoto')}
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

      {/* Имя */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">{t('fullName')}</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={120}
          className={inputCls}
        />
      </label>

      {/* Email (read-only) */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">{t('email')}</span>
        <input type="email" value={email} readOnly className={`${inputCls} cursor-default text-muted-foreground`} />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending || fullName.trim().length === 0}
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
