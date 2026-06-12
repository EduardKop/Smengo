'use client'

import { useCallback, useRef, useState } from 'react'
import { Tags, Pencil, Trash2 } from 'lucide-react'
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
  /**
   * Куда раскрывать панель. Кнопка живёт в топбаре карточки грида с
   * overflow:hidden: когда тулбар переносится и кнопка оказывается слева,
   * right-0-панель уезжает за левый край карточки и срезается.
   */
  const [alignLeft, setAlignLeft] = useState(false)
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

  // Инпуты формы — паттерн редактора ячейки (h28, r9, --pop-border/--grid-cell)
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 28,
    borderRadius: 9,
    border: '1px solid var(--pop-border)',
    background: 'var(--grid-cell)',
    color: 'var(--foreground)',
    padding: '0 8px',
    fontSize: 11,
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
  }

  // Микро-лейблы полей — демо-язык секционных подписей (9px/700 uppercase)
  const fieldLabelStyle: React.CSSProperties = {
    display: 'block',
    padding: '0 1px 3px',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--muted-foreground)',
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('statusManagerLabel')}
        aria-expanded={open}
        onClick={(e) => {
          // Не хватает места слева от кнопки (панель 320px) — раскрываем вправо
          const btnRect = e.currentTarget.getBoundingClientRect()
          const card = e.currentTarget.closest('[data-grid-topbar]')?.parentElement
          const boundary = card ? card.getBoundingClientRect().left : 0
          setAlignLeft(btnRect.right - 320 < boundary + 8)
          setOpen((v) => !v)
          resetForm()
        }}
        className="smengo-tool smengo-tool--icon"
      >
        {/* Палитра ушла кнопке «Визуал» (visual-editor) — статусы теперь Tags */}
        <Tags size={15} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            aria-hidden="true"
            onClick={() => { setOpen(false); resetForm() }}
          />

          {/* Panel — демо-язык: .smengo-pop + .smengo-pop-label + инпуты h28/r9 */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('statusManagerLabel')}
            className={`smengo-pop absolute top-10 z-40 w-80 p-2.5 ${alignLeft ? 'left-0' : 'right-0'}`}
            style={{ ['--pop-origin' as string]: alignLeft ? 'top left' : 'top right' }}
          >
            <div className="smengo-pop-label">{t('statusManagerLabel')}</div>

            {/* System statuses — read-only */}
            {systemStatuses.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {systemStatuses.map((s) => (
                  <li key={s.id} className="flex items-center gap-2" style={{ padding: '3px 4px', borderRadius: 9 }}>
                    <span
                      className="shrink-0 rounded-full"
                      style={{
                        width: 10,
                        height: 10,
                        background: s.color,
                        boxShadow: `0 0 0 2.5px color-mix(in oklab, ${s.color} 18%, transparent)`,
                      }}
                    />
                    <span className="flex-1 truncate" style={{ fontSize: 12, fontWeight: 550, color: 'var(--foreground)' }}>
                      {statusLabel(s, locale)}
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        background: 'var(--grid-pill-bg)',
                        color: 'var(--muted-foreground)',
                        padding: '2px 7px',
                        fontSize: 9.5,
                        fontWeight: 650,
                      }}
                    >
                      {t('systemBadge')}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Custom statuses */}
            {customStatuses.length > 0 && (
              <>
                <div className="smengo-pop-sep" />
                <ul className="flex flex-col gap-0.5">
                  {customStatuses.map((s) => (
                    <li key={s.id} className="flex items-center gap-2" style={{ padding: '3px 4px', borderRadius: 9 }}>
                      <span
                        className="shrink-0 rounded-full"
                        style={{
                          width: 10,
                          height: 10,
                          background: s.color,
                          boxShadow: `0 0 0 2.5px color-mix(in oklab, ${s.color} 18%, transparent)`,
                        }}
                      />
                      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, fontWeight: 550, color: 'var(--foreground)' }}>
                        {statusLabel(s, locale)}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
                        {s.code}
                      </span>
                      <button
                        type="button"
                        aria-label={t('editStatus')}
                        onClick={() => handleEdit(s)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        style={{ background: 'transparent', border: 0 }}
                      >
                        <Pencil size={12} />
                      </button>
                      {confirmDeleteId === s.id ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleDelete(s.id)}
                          className="shrink-0 hover:underline disabled:opacity-50"
                          style={{ fontSize: 10, fontWeight: 650, color: 'var(--destructive)', background: 'transparent', border: 0 }}
                      >
                          {t('deleteStatusConfirm')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={t('deleteStatusConfirm')}
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                          style={{ background: 'transparent', border: 0 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Divider before form */}
            <div className="smengo-pop-sep" />

            {/* Create / Edit form */}
            <div className="smengo-pop-label">
              {editingId ? t('editStatus') : t('addStatus')}
            </div>

            <div className="flex flex-col gap-2 px-1">
              {/* Label */}
              <div>
                <label style={fieldLabelStyle}>
                  {t('statusLabelField')}
                </label>
                <input
                  type="text"
                  value={form.label}
                  maxLength={40}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="smengo-custom-input"
                  style={inputStyle}
                />
              </div>

              {/* Code — disabled on edit */}
              <div>
                <label style={fieldLabelStyle}>
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
                  className="smengo-custom-input font-mono"
                  style={{ ...inputStyle, opacity: editingId ? 0.5 : 1 }}
                />
              </div>

              {/* Color — свотчи 18px с кольцом выбора (как в демо) */}
              <div>
                <label style={fieldLabelStyle}>
                  {t('statusColor')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="cursor-pointer"
                    style={{
                      width: 36,
                      height: 28,
                      borderRadius: 9,
                      border: '1px solid var(--pop-border)',
                      background: 'var(--grid-cell)',
                      padding: 3,
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={hex}
                        aria-pressed={form.color === hex}
                        onClick={() => setForm((f) => ({ ...f, color: hex }))}
                        className="cursor-pointer transition-transform hover:scale-110"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: 0,
                          padding: 0,
                          background: hex,
                          // Кольцо выбора — паттерн свотчей демо / активного чипа cell-editor
                          boxShadow: form.color === hex
                            ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${hex}`
                            : 'inset 0 0 0 1px rgba(0,0,0,0.16)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* counts_as_present — тумблер .smengo-switch (демо SettingRow) */}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, counts_as_present: !f.counts_as_present }))}
                aria-pressed={form.counts_as_present}
                className="smengo-pop-item justify-between"
                style={{ padding: '6px 4px', fontSize: 12 }}
              >
                <span className="min-w-0 truncate">{t('countsAsPresent')}</span>
                <span className="smengo-switch" aria-pressed={form.counts_as_present} aria-hidden="true" />
              </button>

              {/* Optional start/end time */}
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="smengo-custom-input"
                  style={{ ...inputStyle, width: undefined, minWidth: 0, flex: 1 }}
                  aria-label={t('startTimeAriaLabel')}
                />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, flexShrink: 0 }}>–</span>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="smengo-custom-input"
                  style={{ ...inputStyle, width: undefined, minWidth: 0, flex: 1 }}
                  aria-label={t('endTimeAriaLabel')}
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: 11, color: 'var(--destructive)' }}>{resolveError(error)}</p>
              )}

              {/* Actions — кнопки smengo-tool */}
              <div className="flex gap-2 pb-0.5">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={saving || !form.label.trim() || !form.code.trim()}
                  className="smengo-tool smengo-tool--primary flex-1 disabled:cursor-default disabled:opacity-50"
                >
                  {saving ? '…' : editingId ? t('editStatus') : t('addStatus')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="smengo-tool"
                  >
                    {t('cancelEdit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
