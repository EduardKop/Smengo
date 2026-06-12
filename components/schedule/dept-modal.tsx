'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { createDepartmentAction, renameDepartmentAction, deleteDepartmentAction } from '@/lib/actions/departments'
import type { DepartmentRow } from '@/lib/schedule/types'

// ── Modal state shapes ──────────────────────────────────────────────

export type DeptModalState =
  | { mode: 'create' }
  | { mode: 'rename'; dept: DepartmentRow }
  | { mode: 'delete'; dept: DepartmentRow }

interface DeptModalProps {
  state: DeptModalState
  orgId: string
  onClose: () => void
  onError: (code: string) => void
}

// ── Component ───────────────────────────────────────────────────────

export function DeptModal({ state, orgId, onClose, onError }: DeptModalProps) {
  const t = useTranslations('app.schedule')
  const tc = useTranslations('common')
  const qc = useQueryClient()

  const [isPending, setIsPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Focus first input on open
  useEffect(() => {
    if (state.mode !== 'delete') {
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [state.mode])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Invalidate schedule queries after success
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['schedule', orgId] })
  }

  const handleCreateOrRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setIsPending(true)
    try {
      const fd = new FormData(formRef.current)
      let result
      if (state.mode === 'create') {
        result = await createDepartmentAction(fd)
      } else if (state.mode === 'rename') {
        result = await renameDepartmentAction(state.dept.id, fd)
      } else {
        return
      }
      if (!result.ok) {
        onError(result.error)
      } else {
        invalidate()
        onClose()
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (state.mode !== 'delete') return
    setIsPending(true)
    try {
      const result = await deleteDepartmentAction(state.dept.id)
      if (!result.ok) {
        onError(result.error)
      } else {
        invalidate()
        onClose()
      }
    } finally {
      setIsPending(false)
    }
  }

  // ── Title ─────────────────────────────────────────────────────────
  const title =
    state.mode === 'create'
      ? t('deptModalTitleCreate')
      : state.mode === 'rename'
        ? t('deptModalTitleRename')
        : t('deptModalTitleDelete')

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Card */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>

        {/* DELETE mode */}
        {state.mode === 'delete' ? (
          <>
            <p className="mb-1 text-sm text-foreground">
              {tc('delete')} <span className="font-medium">«{state.dept.name}»</span>?
            </p>
            <p className="mb-6 text-sm text-muted-foreground">{t('deptDeleteWarning')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {isPending ? '…' : tc('delete')}
              </button>
            </div>
          </>
        ) : (
          /* CREATE / RENAME mode */
          <form ref={formRef} onSubmit={handleCreateOrRename} noValidate>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="dept-name">
                {t('deptNameLabel')}
              </label>
              <input
                ref={inputRef}
                id="dept-name"
                name="name"
                type="text"
                required
                defaultValue={state.mode === 'rename' ? state.dept.name : ''}
                maxLength={100}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {tc('cancel')}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? '…' : tc('save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
