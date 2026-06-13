'use client'

/**
 * Попап редактора ячейки — разметка и стили скопированы из демо-грида
 * (grid-preview.tsx: cell-edit popover, ~строка 3331): .smengo-pop-панель
 * с заголовком «имя + дата-пилюля» и цветными чипами статусов 34px.
 * Пресеты смен и ручное время — продуктовая функциональность, оформлены
 * в том же языке (чипы workMeta, инпуты как badge-форма демо).
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Sun, Sunset, Moon } from 'lucide-react'
import type { ScheduleEntryRow, StatusTypeRow } from '@/lib/schedule/types'
import { statusLabel, demoCode, chipBg, chipFg, workShiftBg } from './status-style'
import { readableColorForHex } from './grid-visual'
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
  /** Имя сотрудника для заголовка попапа (как в демо) */
  employeeName: string
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

/** 'YYYY-MM-DD' → 'DD.MM' (дата-пилюля заголовка, как в демо) */
function toDayMonth(dateISO: string): string {
  return `${dateISO.slice(8, 10)}.${dateISO.slice(5, 7)}`
}

// Preset definitions: [start, end]
const PRESETS: Record<'morning' | 'evening' | 'night', [string, string]> = {
  morning: ['08:00', '16:00'],
  evening: ['16:00', '00:00'],
  night: ['00:00', '08:00'],
}

const PRESET_ICONS = { morning: Sun, evening: Sunset, night: Moon } as const

const PANEL_W = 272

// ── Component ────────────────────────────────────────────────────────

export function CellEditor({
  anchor,
  entry,
  statusTypes,
  workStatus,
  employeeName,
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
  // transform-origin анимации smengo-pop-in: снизу от ячейки или сверху (flip)
  const [popOrigin, setPopOrigin] = useState<'top center' | 'bottom center'>('top center')

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !panelRef.current) return

    const panelW = PANEL_W
    const panelH = panelRef.current.offsetHeight || 320
    const containerRect = container.getBoundingClientRect()

    // Anchor rect is already relative to container scroll (top = offset from container top)
    // Демо центрирует попап под ячейкой (translateX(-50%)) — повторяем центровку
    let top = anchor.rect.top + anchor.rect.height + 6
    let left = anchor.rect.left + anchor.rect.width / 2 - panelW / 2
    let origin: 'top center' | 'bottom center' = 'top center'

    // Clamp so it doesn't overflow container
    const maxTop = container.scrollTop + container.clientHeight - panelH - 8
    const maxLeft = container.scrollLeft + container.clientWidth - panelW - 8

    // Flip up if overflows bottom
    if (top - container.scrollTop + panelH > container.clientHeight - 8) {
      top = anchor.rect.top - panelH - 6
      origin = 'bottom center'
    }
    top = Math.max(container.scrollTop + 4, Math.min(top, maxTop))
    left = Math.max(container.scrollLeft + 4, Math.min(left, maxLeft))

    // Convert to fixed positioning relative to viewport
    const fixedTop = containerRect.top + top - container.scrollTop
    const fixedLeft = containerRect.left + left - container.scrollLeft

    setPosition({ top: fixedTop, left: fixedLeft })
    setPopOrigin(origin)
  }, [anchor, containerRef])

  // ── Keyboard close ────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Close on container scroll or window resize ────────────────────

  useEffect(() => {
    const container = containerRef.current
    const close = () => onClose()
    container?.addEventListener('scroll', close, { passive: true, once: true })
    window.addEventListener('resize', close, { once: true })
    return () => {
      container?.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [onClose, containerRef])

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
      let st = toHHMM(status.start_time)
      let et = toHHMM(status.end_time)
      // «Опоздание» — это рабочий день с бейджем ПОВЕРХ карточки, а не отдельная
      // плашка «Опозд.». Поэтому при выборе сразу гарантируем время смены (так
      // карточка рисуется во всех режимах): текущее время ячейки → дефолт
      // work-статуса → утренний пресет. Один клик вместо двух (правка основателя).
      if (demoCode(status) === 'L' && (!st || !et)) {
        st = toHHMM(entry?.start_time) || toHHMM(workStatus?.start_time) || PRESETS.morning[0]
        et = toHHMM(entry?.end_time) || toHHMM(workStatus?.end_time) || PRESETS.morning[1]
      }
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
    [anchor, entry, workStatus, onUpsert, onClose],
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
    if (entry) onClear()
    onClose()
  }, [entry, onClear, onClose])

  // Sort status types by sort_order
  const sortedStatuses = [...statusTypes].sort((a, b) => a.sort_order - b.sort_order)

  // Show presets when active or current status counts_as_present
  const showPresets = (activeStatus ?? currentStatus)?.counts_as_present === true
    || (!entry && !!workStatus)

  const timeInputStyle: React.CSSProperties = {
    minWidth: 0,
    flex: 1,
    height: 28,
    borderRadius: 9,
    border: '1px solid var(--pop-border)',
    background: 'var(--grid-cell)',
    color: 'var(--foreground)',
    padding: '0 8px',
    fontSize: 11,
    fontWeight: 600,
    outline: 'none',
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('cellEditorAriaLabel')}
      className="smengo-pop p-2.5"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: PANEL_W,
        zIndex: 100,
        borderRadius: 14,
        ['--pop-origin' as string]: popOrigin,
      }}
    >
      {/* Header: employee name + date pill (как в демо) */}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="max-w-[180px] truncate text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>
          {employeeName}
        </span>
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
          style={{ background: 'var(--grid-pill-bg)', color: 'var(--muted-foreground)' }}
        >
          {toDayMonth(anchor.dateISO)}
        </span>
      </div>

      {/* Status chips (демо: 34px-чипы chipBg/chipFg, кастомные — цветом из БД) */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {sortedStatuses.map((status) => {
          const code = demoCode(status)
          const bg = code === 'CUSTOM' ? status.color : chipBg(code)
          const fg = code === 'CUSTOM' ? readableColorForHex(status.color) : chipFg(code)
          const label = statusLabel(status, locale)
          const isActive = activeStatus?.id === status.id || (!activeStatus && entry?.status_id === status.id)
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => handleStatusClick(status)}
              title={label}
              className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
              style={{
                minWidth: 44,
                maxWidth: 92,
                height: 34,
                border: 0,
                borderRadius: 10,
                background: bg,
                color: fg,
                padding: '0 7px',
                fontSize: 10.5,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                // Активный статус — кольцо в цвет чипа (паттерн свотчей демо)
                boxShadow: isActive
                  ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${bg}`
                  : '0 1px 2px rgba(0,0,0,0.12)',
              }}
            >
              {label}
            </button>
          )
        })}
        {/* «—» — очистка ячейки (демо-опция '-') */}
        <button
          type="button"
          onClick={handleClear}
          aria-label={t('clearCell')}
          title={t('clearCell')}
          className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
          style={{
            width: 44,
            height: 34,
            border: 0,
            borderRadius: 10,
            background: 'var(--muted)',
            color: 'var(--muted-foreground)',
            fontSize: 10.5,
            fontWeight: 700,
            boxShadow: 'none',
          }}
        >
          —
        </button>
      </div>

      {/* Presets: Утро / Вечер / Ночь — чипы в цветах смен workMeta */}
      {showPresets && (
        <div className="mt-2.5 flex gap-1.5" style={{ borderTop: '1px solid var(--pop-border)', paddingTop: 10 }}>
          {(['morning', 'evening', 'night'] as const).map((preset) => {
            const PresetIcon = PRESET_ICONS[preset]
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  height: 34,
                  border: 0,
                  borderRadius: 10,
                  background: workShiftBg(preset),
                  color: 'var(--st-work-fg)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                <PresetIcon size={11} strokeWidth={2.5} />
                {t(`preset${preset.charAt(0).toUpperCase() + preset.slice(1)}` as 'presetMorning' | 'presetEvening' | 'presetNight')}
              </button>
            )
          })}
        </div>
      )}

      {/* Manual time inputs — стиль badge-формы демо */}
      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="smengo-custom-input"
          style={timeInputStyle}
          aria-label={t('startTimeAriaLabel')}
        />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 11, flexShrink: 0 }}>–</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="smengo-custom-input"
          style={timeInputStyle}
          aria-label={t('endTimeAriaLabel')}
        />
        <button
          type="button"
          onClick={handleApplyTime}
          className="cursor-pointer transition-transform hover:-translate-y-px"
          style={{
            height: 28,
            flexShrink: 0,
            border: 0,
            borderRadius: 9,
            padding: '0 10px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 10.5,
            fontWeight: 750,
          }}
        >
          {t('applyTime')}
        </button>
      </div>
    </div>
  )
}
