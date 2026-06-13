'use client'

/**
 * «Опубликовать график» (правка 7, референс — 7shifts Publish schedule):
 * кнопка видна owner/admin/manager, когда в месяце есть неопубликованные
 * правки (серверная метка schedule_change_marks vs последняя публикация,
 * плюс мгновенно после локальной мутации). По клику — поповер с выбором
 * «Уведомить всех / Не уведомлять» (выбор сохраняется в БД; сама рассылка
 * подключится отдельной правкой).
 */

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Send } from 'lucide-react'
import { publishScheduleAction } from '@/lib/actions/schedule-publish'

interface PublishButtonProps {
  year: number
  month: number
  canEdit: boolean
  /** Серверное состояние: метка правок месяца новее последней публикации */
  serverDirty: boolean
  /** Счётчик локальных мутаций ячеек за сессию (растёт при каждой правке) */
  dirtySignal: number
  onToast: (message: string) => void
}

export function PublishButton({ year, month, canEdit, serverDirty, dirtySignal, onToast }: PublishButtonProps) {
  const t = useTranslations('app.schedule.publish')
  const [open, setOpen] = useState(false)
  const [notify, setNotify] = useState(true)
  const [isPending, setIsPending] = useState(false)
  /** Значение dirtySignal в момент последней публикации этой сессии */
  const [publishedAtSignal, setPublishedAtSignal] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // После публикации кнопка гаснет до следующей локальной правки;
  // до первой публикации сессии работает серверное dirty-состояние.
  const dirty = publishedAtSignal === null
    ? serverDirty || dirtySignal > 0
    : dirtySignal > publishedAtSignal

  if (!canEdit || !dirty) return null

  async function handlePublish() {
    setIsPending(true)
    const monthISO = `${year}-${String(month).padStart(2, '0')}-01`
    const res = await publishScheduleAction({ month: monthISO, notify })
    setIsPending(false)
    if (res.ok) {
      setPublishedAtSignal(dirtySignal)
      setOpen(false)
      onToast(t('success'))
    } else {
      onToast(t('error'))
    }
  }

  return (
    /* Плавающая «плажка» внизу справа поверх сайта (правка основателя):
       появляется анимированно после первой правки, нажать можно в любой момент */
    <div ref={wrapperRef} className="animate-publish-in fixed bottom-6 right-6 z-50">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="smengo-tool smengo-tool--primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 16px',
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        <Send size={14} strokeWidth={2.2} />
        {t('button')}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('dialogTitle')}
          className="absolute bottom-full right-0 z-50 mb-2 w-72 rounded-xl border border-border bg-background p-4 shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
        >
          <p className="mb-3 text-sm font-semibold text-foreground">{t('dialogTitle')}</p>
          <div className="mb-4 flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="radio"
                name="publish-notify"
                checked={notify}
                onChange={() => setNotify(true)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t('notifyAll')}
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="radio"
                name="publish-notify"
                checked={!notify}
                onChange={() => setNotify(false)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t('notifyNone')}
            </label>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handlePublish}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('publishNow')}
          </button>
        </div>
      )}
    </div>
  )
}
