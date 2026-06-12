'use client'

import { useCallback, useRef, useState } from 'react'
import { Palette, Pencil, Trash2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@/supabase/types'
import type { StatusTypeRow } from '@/lib/schedule/types'
import { can } from '@/lib/permissions'
import {
  createStatusTypeAction,
  updateStatusTypeAction,
  deleteStatusTypeAction,
} from '@/lib/actions/status-types'
import { statusLabel } from '../status-style'
import { scheduleKey } from '../use-schedule'

// ── Color presets (copied from grid-shared.tsx — not imported to avoid bundle bloat) ──
const PRESET_COLORS = [
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
]

// ── Types ──────────────────────────────────────────────────────────────

interface StatusManagerProps {
  orgId: string
  year: number
  month: number
  role: UserRole
  statusTypes: StatusTypeRow[]
}

interface FormState {
  label: string
  code: string
  color: string
  counts_as_present: boolean
  start_time: string
  end_time: string
}

const DEFAULT_FORM: FormState = {
  label: '',
  code: '',
  color: '#10b981',
  counts_as_present: true,
  start_time: '',
  end_time: '',
}

// ── Component ──────────────────────────────────────────────────────────

export function StatusManager({ orgId, year, month, role, statusTypes }: StatusManagerProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)


  const systemStatuses = statusTypes.filter((s) => s.org_id === null)
  const customStatuses = statusTypes.filter((s) => s.org_id !== null)

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (status: StatusTypeRow) => {
    const labels = status.label as Record<string, string> | null
    setForm({
      label: labels?.ru ?? labels?.en ?? status.code,
      code: status.code,
      color: status.color,
      counts_as_present: status.counts_as_present,
      start_time: status.start_time?.slice(0, 5) ?? '',
      end_time: status.end_time?.slice(0, 5) ?? '',
    })
    setEditingId(status.id)
    setError(null)
  }

  const handleSubmit = useCallback(async () => {
    setSaving(true)
    setError(null)

    const payload = {
      label: form.label.trim(),
      code: form.code.trim(),
      color: form.color,
      counts_as_present: form.counts_as_present,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    }

    const result = editingId
      ? await updateStatusTypeAction(editingId, payload)
      : await createStatusTypeAction(payload)

    setSaving(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    await qc.invalidateQueries({ queryKey: key })
    resetForm()
  }, [form, editingId, key, qc])

  const handleDelete = useCallback(
    async (id: string) => {
      setSaving(true)
      setError(null)

      const result = await deleteStatusTypeAction(id)
      setSaving(false)

      if (!result.ok) {
        setError(result.error)
        setConfirmDeleteId(null)
        return
      }

      await qc.invalidateQueries({ queryKey: key })
      setConfirmDeleteId(null)
    },
    [key, qc],
  )

  const resolveError = (code: string): string => {
    if (code === 'status_in_use') return t('errors.status_in_use')
    if (code === 'forbidden') return t('errors.forbidden')
    if (code === 'duplicate') return t('errors.duplicate')
    if (code === 'invalid_id') return t('errors.invalid_id')
    if (code === 'invalid_reference') return t('errors.invalid_reference')
    return t('errors.server_error')
  }

  if (!can(role, 'manage_status_types')) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('statusManagerLabel')}
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); resetForm() }}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Palette size={15} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            aria-hidden="true"
            onClick={() => { setOpen(false); resetForm() }}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('statusManagerLabel')}
            className="absolute right-0 top-10 z-40 w-80 rounded-lg border border-border bg-background p-4 shadow-lg"
          >
            <p className="mb-3 text-[12px] font-semibold text-foreground">
              {t('statusManagerLabel')}
            </p>

            {/* System statuses — read-only */}
            {systemStatuses.length > 0 && (
              <div className="mb-3">
                <ul className="space-y-1">
                  {systemStatuses.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="flex-1 truncate text-[12px] text-foreground">
                        {statusLabel(s, locale)}
                      </span>
                      <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {t('systemBadge')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Custom statuses */}
            {customStatuses.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 h-px bg-border" />
                <ul className="space-y-1">
                  {customStatuses.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="flex-1 min-w-0 truncate text-[12px] text-foreground">
                        {statusLabel(s, locale)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {s.code}
                      </span>
                      <button
                        type="button"
                        aria-label={t('editStatus')}
                        onClick={() => handleEdit(s)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={12} />
                      </button>
                      {confirmDeleteId === s.id ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleDelete(s.id)}
                          className="shrink-0 text-[10px] text-destructive hover:underline disabled:opacity-50"
                        >
                          {t('deleteStatusConfirm')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={t('deleteStatusConfirm')}
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Divider before form */}
            <div className="mb-3 h-px bg-border" />

            {/* Create / Edit form */}
            <p className="mb-2 text-[11px] font-medium text-foreground">
              {editingId ? t('editStatus') : t('addStatus')}
            </p>

            {/* Label */}
            <div className="mb-2">
              <label className="mb-0.5 block text-[11px] text-muted-foreground">
                {t('statusLabelField')}
              </label>
              <input
                type="text"
                value={form.label}
                maxLength={40}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="h-7 w-full rounded border border-border bg-background px-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Code — disabled on edit */}
            <div className="mb-2">
              <label className="mb-0.5 block text-[11px] text-muted-foreground">
                {t('statusCode')}
              </label>
              <input
                type="text"
                value={form.code}
                maxLength={20}
                disabled={!!editingId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))
                }
                className="h-7 w-full rounded border border-border bg-background px-2 font-mono text-[12px] focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Color */}
            <div className="mb-2">
              <label className="mb-0.5 block text-[11px] text-muted-foreground">
                {t('statusColor')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-7 w-9 cursor-pointer rounded border border-border bg-background p-0.5"
                />
                <div className="flex gap-1">
                  {PRESET_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={hex}
                      onClick={() => setForm((f) => ({ ...f, color: hex }))}
                      className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        background: hex,
                        borderColor: form.color === hex ? 'var(--foreground)' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* counts_as_present */}
            <div className="mb-2 flex items-center gap-2">
              <input
                id="cap-checkbox"
                type="checkbox"
                checked={form.counts_as_present}
                onChange={(e) => setForm((f) => ({ ...f, counts_as_present: e.target.checked }))}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <label htmlFor="cap-checkbox" className="cursor-pointer text-[11px] text-foreground">
                {t('countsAsPresent')}
              </label>
            </div>

            {/* Optional start/end time */}
            <div className="mb-3 flex items-center gap-2">
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="h-7 flex-1 rounded border border-border bg-background px-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={t('startTimeAriaLabel')}
              />
              <span className="text-[11px] text-muted-foreground">–</span>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="h-7 flex-1 rounded border border-border bg-background px-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={t('endTimeAriaLabel')}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mb-2 text-[11px] text-destructive">{resolveError(error)}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving || !form.label.trim() || !form.code.trim()}
                className="h-7 flex-1 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? '…' : editingId ? t('editStatus') : t('addStatus')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-7 rounded-md border border-border px-3 text-[12px] text-muted-foreground hover:bg-muted"
                >
                  {t('cancelEdit')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
