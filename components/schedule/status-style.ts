import type { StatusTypeRow } from '@/lib/schedule/types'

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
