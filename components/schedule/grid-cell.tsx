'use client'

/**
 * Чипы статусов — разметка и стили скопированы дословно из демо-грида
 * (grid-preview.tsx: renderExtWorkCard / renderDetailWorkChip /
 * renderExtDayoffCard / leave-карточки / compact-чипы / CustomScheduleChip).
 */

import { memo } from 'react'
import { Sun, Sunset, Moon, TreePalm, Thermometer, CalendarDays, AlertCircle, AlarmClock } from 'lucide-react'
import type { ScheduleEntryRow, StatusTypeRow, GridMode } from '@/lib/schedule/types'
import type { CardVisual } from '@/lib/validation/grid-view'
import type { SiteTone } from '@/lib/schedule/card-visual'
import { CardVisualChip } from './card-visual-chip'
import { shiftDurationHours } from '@/lib/schedule/month'
import {
  type DemoStatusCode,
  statusLabel,
  shiftKind,
  workShiftBg,
  chipBg,
  chipFg,
  leaveIconColor,
  fmtTime,
  fmtShortWindow,
} from './status-style'
import { ShiftTimeStack, ScheduleLeaveLabelText, readableColorForHex } from './grid-visual'

// ── Лейблы, прокинутые из grid.tsx (без useTranslations на каждую ячейку) ──

export interface ChipLabels {
  shiftMorning: string
  shiftEvening: string
  shiftNight: string
  /** '?' — метка «не назначено» (demo statusUncovered) */
  unassigned: string
  vacShort: string
  sickShort: string
  offShort: string
  /** Короткая форма «Опоздание» для бейджа extended-карточки */
  lateShort: string
  hourSuffix: string
}

// ── Бейдж опоздания поверх рабочей карточки ─────────────────────────
// Опоздание — это рабочий день: ячейка рендерит обычную work-карточку
// со временем, а статус показывается бейджем (язык demo CellBadgePill).
// Цвета: фон var(--chip-l-fg) (слива/лаванда по теме), текст var(--grid-cell)
// — автоинверсия контраста в обеих темах.

const LATE_BADGE_SHADOW = '0 1px 2px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.14)'

/** Extended: текстовая пилюля в нижнем ряду карточки (точная геометрия demo CellBadgePill). */
function LateBadgePill({ short, full }: { short: string; full: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 0, maxWidth: '100%' }}>
      <span
        title={full}
        aria-label={full}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '2px 7px',
          borderRadius: 999,
          background: 'var(--chip-l-fg)',
          color: 'var(--grid-cell)',
          fontSize: 8.6,
          fontWeight: 750,
          lineHeight: 1.2,
          letterSpacing: '0.02em',
          boxShadow: LATE_BADGE_SHADOW,
        }}
      >
        {short}
      </span>
    </span>
  )
}

/** Detail: круглая икон-пилюля 14px в правом верхнем углу карточки. */
function LateCornerBadge({ full }: { full: string }) {
  return (
    <span
      title={full}
      aria-label={full}
      style={{
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--chip-l-fg)',
        color: 'var(--grid-cell)',
        boxShadow: LATE_BADGE_SHADOW,
      }}
    >
      <AlarmClock size={8.5} strokeWidth={2.6} />
    </span>
  )
}

/** Compact: минимальный маркер-точка в углу (тултип — на чипе целиком). */
function LateDotBadge() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 2.5,
        right: 2.5,
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: 'var(--chip-l-fg)',
        boxShadow: '0 0 0 1.5px var(--grid-cell)',
      }}
    />
  )
}

// ── Work-карточка: метаданные смены из времени записи ───────────────

interface WorkMeta {
  bg: string
  name: string
  hours: number | null
  start: string | null
  end: string | null
  kind: 'morning' | 'evening' | 'night'
}

function workMetaOf(entry: ScheduleEntryRow, status: StatusTypeRow, labels: ChipLabels): WorkMeta {
  const start = entry.start_time ?? status.start_time
  const end = entry.end_time ?? status.end_time
  const kind = shiftKind(start, end)
  const name = kind === 'morning' ? labels.shiftMorning : kind === 'evening' ? labels.shiftEvening : labels.shiftNight
  return {
    bg: workShiftBg(kind),
    name,
    hours: start && end ? shiftDurationHours(start, end) : null,
    start,
    end,
    kind,
  }
}

// ── «Не назначено» (demo код 'U'): пустая ячейка в проблемной колонке ──

export function UnassignedChip({ mode, label }: { mode: GridMode; label: string }) {
  if (mode === 'extended') {
    return (
      <div
        className="smengo-schedule-chip"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          width: '100%',
          minHeight: 46,
          background: 'transparent',
          color: 'var(--st-uncovered)',
          border: '1.5px dashed var(--st-uncovered)',
          padding: '5px 7px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1,
          textAlign: 'center',
          boxShadow: 'none',
        }}
      >
        <AlertCircle size={11} strokeWidth={2.4} color="var(--st-uncovered)" />
        <span>{label}</span>
      </div>
    )
  }
  if (mode === 'detail') {
    return (
      <div
        className="smengo-schedule-chip"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2,
          background: 'transparent',
          color: 'var(--st-uncovered)',
          border: '1.5px dashed var(--st-uncovered)',
          width: 'calc(100% - 4px)',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '1px 5px', borderRadius: 3,
          minWidth: 0,
          minHeight: 36,
          fontSize: 12,
          fontWeight: 500, whiteSpace: 'nowrap',
        }}
      >
        <AlertCircle size={11} color="var(--st-uncovered)" />
        {label}
      </div>
    )
  }
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        minWidth: 0,
        background: 'transparent',
        color: 'var(--st-uncovered)',
        border: '1px dashed var(--st-uncovered)',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 600,
        padding: '3px 2px',
        lineHeight: 1.15,
        minHeight: 34,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {label}
    </div>
  )
}

/** Пустая ячейка: «—» 9px --grid-empty-fg (демо). */
export function EmptyCellMark() {
  return <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)', textAlign: 'center' }}>—</span>
}

// ── Кастомный статус: одиночный сектор CustomScheduleChip из демо ───

function CustomStatusChip({
  status,
  locale,
  compact,
  minHeight,
}: {
  status: StatusTypeRow
  locale: string
  compact: boolean
  minHeight: number
}) {
  const color = status.color
  const textColor = readableColorForHex(color)
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        minHeight,
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: '1fr',
        overflow: 'hidden',
        borderRadius: compact ? 4 : 8,
        background: color,
        color: textColor,
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 2 : 4,
          padding: compact ? '1px 2px' : '5px 4px',
          background: color,
          color: textColor,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: textColor,
            fontSize: compact ? 8.2 : 11,
            fontWeight: 650,
            lineHeight: 1.05,
          }}
        >
          {statusLabel(status, locale)}
        </span>
      </div>
    </div>
  )
}

// ── Extended-режим ──────────────────────────────────────────────────

function ExtWorkCard({ entry, status, showTimes, labels, lateFull }: { entry: ScheduleEntryRow; status: StatusTypeRow; showTimes: boolean; labels: ChipLabels; lateFull?: string }) {
  const wm = workMetaOf(entry, status, labels)
  const ShiftIcon = wm.kind === 'night' ? Moon : Sun
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: wm.bg,
        color: 'var(--st-work-fg)',
        padding: '5px 6px 6px',
        borderRadius: 8,
        minHeight: 46,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <span style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
          style={{ width: 16, height: 16 }}
        >
          <ShiftIcon size={10} strokeWidth={2.5} color="var(--st-work-fg)" />
        </span>
        {wm.hours !== null && (
          <span
            style={{
              padding: '2.5px 6px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.15)',
              fontSize: 8,
              fontWeight: 750,
              lineHeight: 1,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {wm.hours}{labels.hourSuffix}
          </span>
        )}
      </span>
      <span
        style={{
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--st-work-fg)',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.02,
          whiteSpace: 'nowrap',
        }}
      >
        {showTimes && wm.start && wm.end ? (
          <>
            <span>{fmtTime(wm.start)}</span>
            <span>{fmtTime(wm.end)}</span>
          </>
        ) : wm.name}
      </span>
      {lateFull && <LateBadgePill short={labels.lateShort} full={lateFull} />}
    </div>
  )
}

function ExtLeaveCard({ code, span, full, short }: { code: 'V' | 'S'; span: number; full: string; short: string }) {
  const LeaveIcon = code === 'S' ? Thermometer : TreePalm
  const isWideRun = span > 1
  return (
    <div
      className="smengo-schedule-chip smengo-leave-chip"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: isWideRun ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isWideRun ? 0 : 3,
        width: '100%',
        minHeight: 46,
        background: chipBg(code),
        color: chipFg(code),
        padding: isWideRun ? '5px 26px' : '5px 7px',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
        style={isWideRun
          ? { position: 'absolute', top: '50%', left: 7, transform: 'translateY(-50%)', width: 16, height: 16 }
          : { width: 16, height: 16 }}
      >
        <LeaveIcon size={10} strokeWidth={2.5} color={leaveIconColor(code)} />
      </span>
      <span
        style={{
          color: chipFg(code),
          fontSize: 11.5,
          fontWeight: 750,
          lineHeight: 1.05,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <ScheduleLeaveLabelText full={full} short={short} />
      </span>
    </div>
  )
}

function ExtDayoffCard({ label }: { label: string }) {
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        width: '100%',
        minHeight: 46,
        background: chipBg('D'),
        color: chipFg('D'),
        padding: '5px 7px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 750,
        lineHeight: 1.05,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
        style={{ width: 16, height: 16 }}
      >
        <CalendarDays size={10} strokeWidth={2.4} color={chipFg('D')} />
      </span>
      <span style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

/** Late ('L'): в демо нет — карточка по структуре dayoff, палитра --chip-l-*. */
function ExtLateCard({ label }: { label: string }) {
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        width: '100%',
        minHeight: 46,
        background: chipBg('L'),
        color: chipFg('L'),
        padding: '5px 7px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 750,
        lineHeight: 1.05,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <span style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

// ── Detail-режим ────────────────────────────────────────────────────

function DetailWorkChip({ entry, status, showTimes, labels, lateFull }: { entry: ScheduleEntryRow; status: StatusTypeRow; showTimes: boolean; labels: ChipLabels; lateFull?: string }) {
  const wm = workMetaOf(entry, status, labels)
  const WIcon = wm.kind === 'morning' ? Sun : wm.kind === 'evening' ? Sunset : Moon
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: wm.bg,
        color: 'var(--st-work-fg)',
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '4px 3px',
        borderRadius: 6,
        minWidth: 0,
        minHeight: 36,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5, fontSize: 10.5, fontWeight: 750, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        <WIcon size={10} strokeWidth={2.4} color="var(--st-work-fg)" />
        {showTimes && wm.start && wm.end ? fmtShortWindow(wm.start, wm.end) : wm.name}
      </span>
      {wm.hours !== null && (
        <span style={{ fontSize: 8.2, fontWeight: 650, lineHeight: 1, opacity: 0.78, letterSpacing: '0.02em' }}>
          {wm.hours}{labels.hourSuffix}{showTimes ? ` · ${wm.name}` : ''}
        </span>
      )}
      {lateFull && <LateCornerBadge full={lateFull} />}
    </div>
  )
}

function DetailFlatChip({
  code,
  isRun,
  showTimes,
  children,
}: {
  code: Exclude<DemoStatusCode, 'CUSTOM' | 'W'>
  isRun: boolean
  showTimes: boolean
  children: React.ReactNode
}) {
  const isLeave = code === 'V' || code === 'S'
  return (
    <div
      className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`}
      style={{
        display: isRun ? 'flex' : 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isRun ? undefined : 2,
        background: chipBg(code),
        color: chipFg(code),
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '1px 5px',
        borderRadius: 3,
        minWidth: 0,
        minHeight: 36,
        fontSize: code === 'S' && showTimes ? 11.2 : 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

// ── Compact-режим ───────────────────────────────────────────────────

function CompactChip({
  code,
  entry,
  status,
  isRun,
  showTimes,
  labels,
  full,
  short,
  lateFull,
}: {
  code: Exclude<DemoStatusCode, 'CUSTOM'>
  entry: ScheduleEntryRow
  status: StatusTypeRow
  isRun: boolean
  showTimes: boolean
  labels: ChipLabels
  full: string
  short: string
  /** Опоздание поверх work-чипа: маркер-точка + тултип полного лейбла */
  lateFull?: string
}) {
  const wm = code === 'W' ? workMetaOf(entry, status, labels) : null
  const shiftParts = code === 'W' && showTimes && wm?.start && wm?.end
    ? [fmtTime(wm.start), fmtTime(wm.end)] as const
    : null
  const isLeave = code === 'V' || code === 'S'
  // Run-чипы в демо красятся chipBg(code); одиночные work — фоном смены.
  const bg = !isRun && code === 'W' && wm ? wm.bg : chipBg(code)
  return (
    <div
      className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`}
      title={lateFull}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        minWidth: 0,
        background: bg,
        color: chipFg(code),
        borderRadius: 4,
        fontSize: isRun
          ? (shiftParts ? 8.2 : (code === 'S' && showTimes ? 7.5 : 9))
          : (shiftParts ? 8.5 : ((code === 'W' || code === 'S') && showTimes ? 9 : 10.5)),
        fontWeight: 600,
        padding: shiftParts ? '4px 2px' : '3px 2px',
        lineHeight: isRun ? 1.1 : 1.15,
        textAlign: 'center',
        minHeight: 34,
        whiteSpace: shiftParts ? 'normal' : 'nowrap',
        overflow: 'hidden',
      }}
    >
      {shiftParts ? (
        <ShiftTimeStack start={shiftParts[0]} end={shiftParts[1]} fontSize={isRun ? 8.2 : 8.5} />
      ) : isLeave ? (
        <ScheduleLeaveLabelText full={full} short={short} />
      ) : null}
      {lateFull && <LateDotBadge />}
    </div>
  )
}

// ── Главный компонент чипа статуса ──────────────────────────────────

export interface StatusChipProps {
  mode: GridMode
  code: DemoStatusCode
  status: StatusTypeRow
  entry: ScheduleEntryRow
  /** длина merge-прогона (1 = одиночная ячейка) */
  span: number
  isRun: boolean
  showTimes: boolean
  locale: string
  labels: ChipLabels
  /** Сохранённый «Визуал» карточки этого статуса (грид-вид организации) */
  cardVisual?: CardVisual
  /** Текущая тема сайта — для рендера cardVisual */
  tone: SiteTone
}

export const StatusChip = memo(function StatusChip({
  mode,
  code,
  status,
  entry,
  span,
  isRun,
  showTimes,
  locale,
  labels,
  cardVisual,
  tone,
}: StatusChipProps) {
  const full = statusLabel(status, locale)
  const short = code === 'V' ? labels.vacShort : code === 'S' ? labels.sickShort : full

  // Приоритет (правило основателя): если у ЗАПИСИ задано время смены —
  // рендерится карточка времени (Утро/Вечер/Ночь как в демо), а кастомный
  // «Визуал» игнорируется. Кастом применяется только к записям без времени.
  // «Опоздание» со временем — тоже рабочая карточка (с бейджем опоздания).
  const hasEntryTime = Boolean(entry.start_time && entry.end_time)
  const rendersShiftTimeCard = (code === 'W' || code === 'L') && hasEntryTime
  // Опоздание со временем: рабочая карточка + бейдж (визуальный слой,
  // статус записи в БД остаётся late). Без времени — статусная карточка.
  const lateFull = code === 'L' && hasEntryTime ? full : undefined

  // Кастомизированный вид статуса перекрывает остальной дефолтный рендер;
  // minHeight по режимам — как у существующих кастомных чипов (46/36/34)
  if (cardVisual && !rendersShiftTimeCard) {
    return (
      <CardVisualChip
        config={cardVisual}
        tone={tone}
        compact={mode !== 'extended'}
        minHeight={mode === 'extended' ? 46 : mode === 'detail' ? 36 : 34}
      />
    )
  }

  if (code === 'CUSTOM') {
    return (
      <CustomStatusChip
        status={status}
        locale={locale}
        compact={mode !== 'extended'}
        minHeight={mode === 'extended' ? 46 : mode === 'detail' ? 36 : 34}
      />
    )
  }

  if (mode === 'extended') {
    if (code === 'W') return <ExtWorkCard entry={entry} status={status} showTimes={showTimes} labels={labels} />
    if (code === 'D') return <ExtDayoffCard label={full} />
    if (code === 'L') {
      return lateFull
        ? <ExtWorkCard entry={entry} status={status} showTimes={showTimes} labels={labels} lateFull={lateFull} />
        : <ExtLateCard label={full} />
    }
    if (code === 'V' || code === 'S') return <ExtLeaveCard code={code} span={span} full={full} short={short} />
    return null
  }

  if (mode === 'detail') {
    if (code === 'W') return <DetailWorkChip entry={entry} status={status} showTimes={showTimes} labels={labels} />
    if (code === 'L' && lateFull) {
      return <DetailWorkChip entry={entry} status={status} showTimes={showTimes} labels={labels} lateFull={lateFull} />
    }
    if (code === 'V' || code === 'S') {
      const StIcon = code === 'V' ? TreePalm : Thermometer
      return (
        <DetailFlatChip code={code} isRun={isRun} showTimes={showTimes}>
          {isRun ? (
            <ScheduleLeaveLabelText full={full} short={short} />
          ) : (
            <>
              <StIcon size={11} color={leaveIconColor(code)} />
              <ScheduleLeaveLabelText full={full} short={short} />
            </>
          )}
        </DetailFlatChip>
      )
    }
    // D — короткая метка как в демо (chipLbl), L — полный лейбл статуса
    return (
      <DetailFlatChip code={code} isRun={isRun} showTimes={showTimes}>
        {code === 'D' ? labels.offShort : full}
      </DetailFlatChip>
    )
  }

  return (
    <CompactChip
      // Опоздание со временем в компакте — обычный work-чип + маркер-точка
      code={lateFull ? 'W' : code}
      entry={entry}
      status={status}
      isRun={isRun}
      showTimes={showTimes}
      labels={labels}
      full={full}
      short={short}
      lateFull={lateFull}
    />
  )
})
