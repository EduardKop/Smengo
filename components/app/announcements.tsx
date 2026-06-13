'use client'

/**
 * Анонсы (правка 6): рупор в шапке → панель выезжает справа поверх
 * контента (зеркало левого сайдбара, но по клику). Функционал на паузе —
 * пока пустое состояние; концепция в README («Анонсы — на паузе»):
 * owner/manager публикуют новости, видит вся организация.
 */

import { useEffect, useRef, useState } from 'react'
import { Megaphone, X } from 'lucide-react'

export interface AnnouncementsLabels {
  buttonLabel: string
  title: string
  pausedTitle: string
  pausedDescription: string
  close: string
}

export function Announcements({ labels }: { labels: AnnouncementsLabels }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label={labels.buttonLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
      >
        <Megaphone className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {/* Подложка: клик мимо панели закрывает */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Панель: выезжает справа поверх контента (зеркало левого сайдбара) */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className={`fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <p className="text-sm font-semibold tracking-tight text-foreground">{labels.title}</p>
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Пустое состояние: функционал на паузе */}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Megaphone className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold text-foreground">{labels.pausedTitle}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{labels.pausedDescription}</p>
        </div>
      </div>
    </>
  )
}
