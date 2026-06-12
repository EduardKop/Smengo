'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { createEmployeeAction, updateEmployeeAction, softDeleteEmployeeAction } from '@/lib/actions/employees'
import type { EmployeeRow, DepartmentRow } from '@/lib/schedule/types'

// ── Modal state shapes ──────────────────────────────────────────────

export type EmployeeModalState =
  | { mode: 'create'; deptId?: string | null }
  | { mode: 'edit'; employee: EmployeeRow }

interface EmployeeModalProps {
  state: EmployeeModalState
  orgId: string
  departments: DepartmentRow[]
  /** Current employee count — shown next to heading in create mode */
  currentCount: number
  onClose: () => void
  onError: (code: string) => void
}

// ── Component ───────────────────────────────────────────────────────

export function EmployeeModal({
  state,
  orgId,
  departments,
  currentCount,
  onClose,
  onError,
}: EmployeeModalProps) {
  const t = useTranslations('app.schedule')
  const tc = useTranslations('common')
  const qc = useQueryClient()

  const [isPending, setIsPending] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const isEdit = state.mode === 'edit'
  const employee = isEdit ? state.employee : null

  // Focus first input on open
  useEffect(() => {
    const id = setTimeout(() => firstInputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) setShowDeleteConfirm(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, showDeleteConfirm])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['schedule', orgId] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setIsPending(true)
    try {
      const fd = new FormData(formRef.current)
      let result
      if (isEdit && employee) {
        result = await updateEmployeeAction(employee.id, fd)
      } else {
        result = await createEmployeeAction(fd)
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
    if (!employee) return
    setIsPending(true)
    try {
      const result = await softDeleteEmployeeAction(employee.id)
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

  const title = isEdit ? t('employeeModalTitleEdit') : t('employeeModalTitleCreate')

  // Default dept_id: in create mode, use the deptId prop; in edit mode, use employee's dept_id
  const defaultDeptId = isEdit ? (employee?.dept_id ?? '') : (state.mode === 'create' ? (state.deptId ?? '') : '')
  const defaultKind = isEdit ? (employee?.employment_kind ?? 'staff') : 'staff'

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Card */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {!isEdit && (
              <span className="text-xs text-muted-foreground">{currentCount}</span>
            )}
          </div>
          {isEdit && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
            >
              {t('deleteEmployee')}
            </button>
          )}
        </div>

        {/* Delete confirm sub-panel */}
        {showDeleteConfirm ? (
          <div className="px-6 py-5">
            <p className="mb-1 text-sm font-medium text-foreground">{t('deleteEmployee')}?</p>
            <p className="mb-6 text-sm text-muted-foreground">{t('deleteEmployeeConfirm')}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
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
          </div>
        ) : (
          /* Main form */
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                {/* full_name */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-full_name">
                    {t('fieldFullName')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="emp-full_name"
                    name="full_name"
                    type="text"
                    required
                    defaultValue={employee?.full_name ?? ''}
                    maxLength={200}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* position */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-position">
                    {t('fieldPosition')}
                  </label>
                  <input
                    id="emp-position"
                    name="position"
                    type="text"
                    defaultValue={employee?.position ?? ''}
                    maxLength={200}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* dept_id */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-dept_id">
                    {t('fieldDept')}
                  </label>
                  <select
                    id="emp-dept_id"
                    name="dept_id"
                    defaultValue={defaultDeptId}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">{t('noDept')}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* employment_kind — radio */}
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-foreground">
                    {/* no dedicated label key — use kind labels as group */}
                  </span>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="employment_kind"
                        value="staff"
                        defaultChecked={defaultKind === 'staff'}
                        className="accent-primary"
                      />
                      {t('kindStaff')}
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name="employment_kind"
                        value="trainee"
                        defaultChecked={defaultKind === 'trainee'}
                        className="accent-primary"
                      />
                      {t('kindTrainee')}
                    </label>
                  </div>
                </div>

                {/* phone */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-phone">
                    {t('fieldPhone')}
                  </label>
                  <input
                    id="emp-phone"
                    name="phone"
                    type="tel"
                    defaultValue={employee?.phone ?? ''}
                    maxLength={50}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* telegram */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-telegram">
                    {t('fieldTelegram')}
                  </label>
                  <input
                    id="emp-telegram"
                    name="telegram"
                    type="text"
                    defaultValue={employee?.telegram ?? ''}
                    maxLength={100}
                    placeholder="@username"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* email */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-email">
                    {t('fieldEmail')}
                  </label>
                  <input
                    id="emp-email"
                    name="email"
                    type="email"
                    defaultValue={employee?.email ?? ''}
                    maxLength={200}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* birth_date */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-birth_date">
                    {t('fieldBirthDate')}
                  </label>
                  <input
                    id="emp-birth_date"
                    name="birth_date"
                    type="date"
                    defaultValue={employee?.birth_date ?? ''}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* hired_on */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground" htmlFor="emp-hired_on">
                    {t('fieldHiredOn')}
                  </label>
                  <input
                    id="emp-hired_on"
                    name="hired_on"
                    type="date"
                    defaultValue={employee?.hired_on ?? ''}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
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
