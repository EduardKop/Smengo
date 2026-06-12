'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────

export interface Toast {
  id: string
  message: string
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const push = useCallback((message: string) => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { id, message }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, push, dismiss }
}

// ── Component ─────────────────────────────────────────────────────────

interface ToastViewportProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-border bg-popover px-4 py-3 shadow-md text-sm text-popover-foreground"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-1"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
