'use client'

/**
 * Bulk-добавление сотрудников таблицей (правка 7, референс — 7shifts
 * «Add your employees»): строки Имя* · Отдел · Должность · Email · Телефон,
 * новая строка добавляется сама при вводе имени в последней. Вся пачка
 * вставляется одним server action'ом (лимит плана — на сервере).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'
import { bulkCreateEmployeesAction } from '@/lib/actions/employees'
import type { DepartmentRow } from '@/lib/schedule/types'

interface RowDraft {
  full_name: string
  dept_id: string
  position: string
  email: string
  phone: string
}

const emptyRow = (deptId: string): RowDraft => ({
  full_name: '',
  dept_id: deptId,
  position: '',
  email: '',
  phone: '',
})

interface BulkEmployeeModalProps {
  orgId: string
  departments: DepartmentRow[]
  /** Предвыбранный отдел (ghost-плашка пустого отдела) */
  preselectedDeptId?: string | null
  onClose: () => void
}

export function BulkEmployeeModal({ orgId, departments, preselectedDeptId, onClose }: BulkEmployeeModalProps) {
  const t = useTranslations('app.schedule.bulkAdd')
  const tc = useTranslations('common')
  const qc = useQueryClient()

  const initialDept = preselectedDeptId ?? ''
  const [rows, setRows] = useState<RowDraft[]>(() => [emptyRow(initialDept), emptyRow(initialDept), emptyRow(initialDept)])
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = setTimeout(() => firstInputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const filledCount = useMemo(() => rows.filter((r) => r.full_name.trim() !== '').length, [rows])

  function setField(idx: number, field: keyof RowDraft, value: string) {
    setRows((prev) => {
      const next = prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
      // Автострока: имя появилось в последней строке → добавить пустую
      if (field === 'full_name' && idx === prev.length - 1 && value.trim() !== '') {
        next.push(emptyRow(initialDept))
      }
      return next
    })
  }

  function removeRow(idx: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))
  }

  async function handleSubmit() {
    const payload = rows
      .filter((r) => r.full_name.trim() !== '')
      .map((r) => ({
        full_name: r.full_name,
        dept_id: r.dept_id || null,
        position: r.position,
        email: r.email,
        phone: r.phone,
      }))
    if (payload.length === 0) return
    setIsPending(true)
    setError(null)
    const res = await bulkCreateEmployeesAction({ rows: payload })
    setIsPending(false)
    if (res.ok) {
      qc.invalidateQueries({ queryKey: ['schedule', orgId] })
      onClose()
    } else {
      setError(
        res.error === 'plan_limit_employees'
          ? t('errorLimit')
          : res.error === 'invalid_input'
            ? t('errorInvalid')
            : t('errorGeneric'),
      )
    }
  }

  const cellInput =
    'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-ring'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <button
            type="button"
            aria-label={tc('close')}
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
          <table className="w-full border-separate" style={{ borderSpacing: '0 6px' }}>
            <thead>
              <tr className="text-left text-xs font-semibold text-muted-foreground">
                <th className="pb-1 pr-2">{t('colName')} *</th>
                <th className="pb-1 pr-2">{t('colDept')}</th>
                <th className="pb-1 pr-2">{t('colPosition')}</th>
                <th className="pb-1 pr-2">{t('colEmail')}</th>
                <th className="pb-1 pr-2">{t('colPhone')}</th>
                <th className="pb-1 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="pr-2" style={{ minWidth: 160 }}>
                    <input
                      ref={idx === 0 ? firstInputRef : undefined}
                      type="text"
                      value={row.full_name}
                      placeholder={t('namePlaceholder')}
                      maxLength={120}
                      onChange={(e) => setField(idx, 'full_name', e.target.value)}
                      className={cellInput}
                    />
                  </td>
                  <td className="pr-2" style={{ minWidth: 130 }}>
                    <select
                      value={row.dept_id}
                      onChange={(e) => setField(idx, 'dept_id', e.target.value)}
                      className={cellInput}
                    >
                      <option value="">{t('noDept')}</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="pr-2" style={{ minWidth: 120 }}>
                    <input
                      type="text"
                      value={row.position}
                      maxLength={120}
                      onChange={(e) => setField(idx, 'position', e.target.value)}
                      className={cellInput}
                    />
                  </td>
                  <td className="pr-2" style={{ minWidth: 150 }}>
                    <input
                      type="email"
                      value={row.email}
                      maxLength={255}
                      onChange={(e) => setField(idx, 'email', e.target.value)}
                      className={cellInput}
                    />
                  </td>
                  <td className="pr-2" style={{ minWidth: 110 }}>
                    <input
                      type="tel"
                      value={row.phone}
                      maxLength={32}
                      onChange={(e) => setField(idx, 'phone', e.target.value)}
                      className={cellInput}
                    />
                  </td>
                  <td className="w-8">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        aria-label={t('removeRow')}
                        onClick={() => removeRow(idx)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <p className="min-w-0 truncate text-sm font-medium text-destructive">{error}</p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              {tc('cancel')}
            </button>
            <button
              type="button"
              disabled={isPending || filledCount === 0}
              onClick={handleSubmit}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {t('addN', { count: filledCount })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
