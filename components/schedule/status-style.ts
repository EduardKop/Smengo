import type { StatusTypeRow } from '@/lib/schedule/types'
import { isNightShift } from '@/lib/schedule/month'

export interface StatusStyle {
  bg: string
  fg: string
  /** для бейджей/чипов */
  solid: string
}

/**
 * Цвет статуса: системные сидированы теми же HEX, что демо;
 * кастомные несут свой color из БД.
 *
 * Пропорция alpha-mix взята из demo statusColor():
 *   - обычный статус: 22% (W, V, S, кастомные)
 *   - dayoff/weekend:  14% (более приглушённый фон)
 */
export function statusStyle(status: StatusTypeRow, isWeekend = false): StatusStyle {
  const base = status.color
  // Dayoff (и выходные) используют более слабый альфа-микс как в демо
  const alpha = !status.counts_as_present && isWeekend ? '14%' : '22%'
  return {
    bg: `color-mix(in oklab, ${base} ${alpha}, transparent)`,
    fg: base,
    solid: base,
  }
}

/** Лейбл статуса в нужной локали с фолбэком на en, затем на code. */
export function statusLabel(status: StatusTypeRow, locale: string): string {
  const labels = status.label as Record<string, string> | null
  return labels?.[locale] ?? labels?.en ?? status.code
}

// ── Маппинг статусов продукта на коды демо ──────────────────────────
// Системные коды БД: work/vacation/sick/dayoff/late ↔ демо W/V/S/D/L.
// Кастомные статусы организации рендерятся CustomScheduleChip-разметкой.

export type DemoStatusCode = 'W' | 'V' | 'S' | 'D' | 'L' | 'CUSTOM'

const SYSTEM_CODE_MAP: Record<string, DemoStatusCode> = {
  work: 'W',
  vacation: 'V',
  sick: 'S',
  dayoff: 'D',
  late: 'L',
}

export function demoCode(status: StatusTypeRow): DemoStatusCode {
  if (status.org_id !== null) return 'CUSTOM'
  return SYSTEM_CODE_MAP[status.code] ?? 'CUSTOM'
}

/** Статусы, которые сливаются в merge-прогоны по умолчанию (demo isDefaultMergedLeaveStatus). */
export function isDefaultMergedLeaveStatus(code: DemoStatusCode | undefined): code is 'V' | 'S' {
  return code === 'V' || code === 'S'
}

// ── Тип смены work-ячейки из start_time (окна workMeta демо) ────────
// morning 09–17 · evening 14–22 · night 22–08

export type ShiftKind = 'morning' | 'evening' | 'night'

export function shiftKind(start: string | null | undefined, end: string | null | undefined): ShiftKind {
  if (!start) return 'morning'
  if (end && isNightShift(start, end)) return 'night'
  const h = Number(start.slice(0, 2))
  if (h >= 22 || h < 6) return 'night'
  if (h >= 14) return 'evening'
  return 'morning'
}

/** Фон work-карточки по типу смены (demo workMeta().bg, contrast=true — дефолт демо). */
export function workShiftBg(kind: ShiftKind): string {
  if (kind === 'morning') return 'var(--st-work-morning)'
  if (kind === 'evening') return 'var(--st-work-evening)'
  return 'var(--st-work-night)'
}

// ── Палитра чипов (demo chipBg/chipFg при contrast=true) ────────────

export function chipBg(code: Exclude<DemoStatusCode, 'CUSTOM'>): string {
  if (code === 'D') return 'var(--chip-d-bg)'
  if (code === 'L') return 'var(--chip-l-bg)'
  const map: Record<'W' | 'V' | 'S', string> = {
    W: 'var(--st-work)',
    V: 'var(--st-vacation)',
    S: 'var(--st-sick)',
  }
  return map[code]
}

/** Текст чипа: W/V/S — белый на сплошном фоне (demo visualColors), D/L — токены чипов. */
export function chipFg(code: Exclude<DemoStatusCode, 'CUSTOM'>): string {
  if (code === 'D') return 'var(--chip-d-fg)'
  if (code === 'L') return 'var(--chip-l-fg)'
  if (code === 'W') return 'var(--st-work-fg)'
  return '#fff'
}

/** Цвет иконки V/S-карточек (demo visualColors.vacation/sick.icon, токены light/dark). */
export function leaveIconColor(code: 'V' | 'S'): string {
  return code === 'V' ? 'var(--grid-icon-vacation)' : 'var(--grid-icon-sick)'
}

// ── Форматирование времени ──────────────────────────────────────────

/** 'HH:MM:SS' | 'HH:MM' → 'HH:MM' (для стеков времени в карточках). */
export function fmtTime(t: string): string {
  return t.slice(0, 5)
}

/** Короткое окно смены для узких ячеек (demo compactShiftWindow: '9–17', '22–8'). */
export function fmtShortWindow(start: string, end: string): string {
  const short = (t: string) => {
    const h = String(Number(t.slice(0, 2)))
    const m = t.slice(3, 5)
    return m === '00' ? h : `${h}:${m}`
  }
  return `${short(start)}–${short(end)}`
}
