'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import type { ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import { statusStyle, statusLabel } from './status-style'
import type { UpsertInput } from './use-schedule'

// ── Types ────────────────────────────────────────────────────────────

export interface CellEditorAnchor {
  employeeId: string
  dateISO: string
  /** Cell element rect relative to scroll container */
  rect: { top: number; left: number; width: number; height: number }
}

export interface CellEditorProps {
  anchor: CellEditorAnchor
  entry: ScheduleEntryRow | undefined
  statusTypes: StatusTypeRow[]
  /** System "work" status for empty cell presets */
  workStatus: StatusTypeRow | undefined
  onUpsert: (input: UpsertInput) => void
  onClear: () => void
  onClose: () => void
  /** Scroll container ref — for positioning */
  containerRef: React.RefObject<HTMLDivElement | null>
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Trim HH:MM:SS to HH:MM */
function toHHMM(t: string | null | undefined): string {
  if (!t) return ''
  return t.slice(0, 5)
}

// Preset definitions: [start, end]
const PRESETS: Record<'morning' | 'evening' | 'night', [string, string]> = {
  morning: ['08:00', '16:00'],
  evening: ['16:00', '00:00'],
  night: ['00:00', '08:00'],
}

// ── Component ────────────────────────────────────────────────────────

export function CellEditor({
  anchor,
  entry,
  statusTypes,
  workStatus,
  onUpsert,
  onClear,
  onClose,
  containerRef,
}: CellEditorProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()

  // Current status from existing entry; fallback to workStatus for presets
  const currentStatus = entry
    ? statusTypes.find((s) => s.id === entry.status_id)
    : undefined

  const [startTime, setStartTime] = useState<string>(toHHMM(entry?.start_time ?? currentStatus?.start_time))
  const [endTime, setEndTime] = useState<string>(toHHMM(entry?.end_time ?? currentStatus?.end_time))

  // Track which status is "active" in the editor (for showing presets)
  const [activeStatus, setActiveStatus] = useState<StatusTypeRow | undefined>(currentStatus)

  const panelRef = useRef<HTMLDivElement>(null)

  // ── Position calculation ──────────────────────────────────────────

  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container || !panelRef.current) return

    const panelW = 240
    const panelH = panelRef.current.offsetHeight || 320
    const containerRect = container.getBoundingClientRect()

    // Anchor rect is already relative to container scroll (top = offset from container top)
    let top = anchor.rect.top + anchor.rect.height + 4
    let left = anchor.rect.left

    // Clamp so it doesn't overflow container
    const maxTop = container.scrollTop + container.clientHeight - panelH - 8
    const maxLeft = container.scrollLeft + container.clientWidth - panelW - 8

    // Flip up if overflows bottom
    if (top - container.scrollTop + panelH > container.clientHeight - 8) {
      top = anchor.rect.top - panelH - 4
    }
    top = Math.max(container.scrollTop + 4, Math.min(top, maxTop))
    left = Math.max(container.scrollLeft + 4, Math.min(left, maxLeft))

    // Convert to fixed positioning relative to viewport
    const fixedTop = containerRect.top + top - container.scrollTop
    const fixedLeft = containerRect.left + left - container.scrollLeft

    setPosition({ top: fixedTop, left: fixedLeft })
  }, [anchor, containerRef])

  // ── Keyboard close ────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Click outside ─────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Slight delay so the opening cell click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  // ── Handlers ─────────────────────────────────────────────────────

  const handleStatusClick = useCallback(
    (status: StatusTypeRow) => {
      setActiveStatus(status)
      // Use status defaults unless user has already customised times
      const st = toHHMM(status.start_time)
      const et = toHHMM(status.end_time)
      setStartTime(st)
      setEndTime(et)
      onUpsert({
        employee_id: anchor.employeeId,
        entry_date: anchor.dateISO,
        status_id: status.id,
        start_time: st || null,
        end_time: et || null,
        note: entry?.note ?? undefined,
      })
      onClose()
    },
    [anchor, entry, onUpsert, onClose],
  )

  const handlePreset = useCallback(
    (preset: 'morning' | 'evening' | 'night') => {
      const statusToUse = activeStatus ?? workStatus
      if (!statusToUse) return
      const [st, et] = PRESETS[preset]
      setStartTime(st)
      setEndTime(et)
      onUpsert({
        employee_id: anchor.employeeId,
        entry_date: anchor.dateISO,
        status_id: statusToUse.id,
        start_time: st,
        end_time: et,
        note: entry?.note ?? undefined,
      })
      onClose()
    },
    [anchor, entry, activeStatus, workStatus, onUpsert, onClose],
  )

  const handleApplyTime = useCallback(() => {
    const statusToUse = activeStatus ?? workStatus
    if (!statusToUse) return
    onUpsert({
      employee_id: anchor.employeeId,
      entry_date: anchor.dateISO,
      status_id: statusToUse.id,
      start_time: startTime || null,
      end_time: endTime || null,
      note: entry?.note ?? undefined,
    })
    onClose()
  }, [anchor, entry, activeStatus, workStatus, startTime, endTime, onUpsert, onClose])

  const handleClear = useCallback(() => {
    onClear()
    onClose()
  }, [onClear, onClose])

  // Sort status types by sort_order
  const sortedStatuses = [...statusTypes].sort((a, b) => a.sort_order - b.sort_order)

  // Show presets when active or current status counts_as_present
  const showPresets = (activeStatus ?? currentStatus)?.counts_as_present === true
    || (!entry && !!workStatus)

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('cellEditorAriaLabel')}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: 240,
        zIndex: 100,
      }}
      className="rounded-lg border border-border bg-popover shadow-md p-2 flex flex-col gap-1"
    >
      {/* Status list */}
      <div className="flex flex-col gap-0.5">
        {sortedStatuses.map((status) => {
          const style = statusStyle(status)
          const label = statusLabel(status, locale)
          const isActive = activeStatus?.id === status.id || (!activeStatus && entry?.status_id === status.id)
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => handleStatusClick(status)}
              className={[
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors',
                isActive ? 'bg-muted' : 'hover:bg-muted/60',
              ].join(' ')}
            >
              {/* Color dot */}
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: style.solid,
                  flexShrink: 0,
                }}
              />
              {/* Color chip */}
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none"
                style={{ background: style.bg, color: style.fg }}
              >
                {status.code}
              </span>
              <span className="flex-1 truncate text-foreground">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-0.5" />

      {/* Presets */}
      {showPresets && (
        <>
          <div className="flex gap-1">
            {(['morning', 'evening', 'night'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className="flex-1 rounded-md border border-border px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {t(`preset${preset.charAt(0).toUpperCase() + preset.slice(1)}` as 'presetMorning' | 'presetEvening' | 'presetNight')}
              </button>
            ))}
          </div>
          <div className="h-px bg-border my-0.5" />
        </>
      )}

      {/* Manual time inputs */}
      <div className="flex items-center gap-1">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={t('startTimeAriaLabel')}
        />
        <span className="text-muted-foreground text-xs">–</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={t('endTimeAriaLabel')}
        />
        <button
          type="button"
          onClick={handleApplyTime}
          className="shrink-0 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t('applyTime')}
        </button>
      </div>

      {/* Clear button — only when entry exists */}
      {entry && (
        <>
          <div className="h-px bg-border my-0.5" />
          <button
            type="button"
            onClick={handleClear}
            className="w-full rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            {t('clearCell')}
          </button>
        </>
      )}
    </div>
  )
}
