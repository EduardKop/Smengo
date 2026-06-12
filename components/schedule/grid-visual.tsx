'use client'

/**
 * Визуальные примитивы продуктового грида, скопированные ДОСЛОВНО из
 * демо-грида лендинга (components/marketing/grid-preview.tsx, вариант standard).
 * Демо — первоисточник дизайна: размеры, шрифты, цвета и тени не менять
 * без синхронного изменения демо.
 *
 * Отличие от демо (утверждено основателем): Avatar рендерит только градиент,
 * без стоковых фото — поля фото у сотрудников пока нет.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import type { GridMode } from '@/lib/schedule/types'

// ── Avatar (градиент по stableHash имени; фото в продукте не используем) ──

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #d8f0a7 0%, #89e8b6 48%, #f6d879 100%)',
  'linear-gradient(135deg, #f0d36b 0%, #18c973 52%, #2475dd 100%)',
  'linear-gradient(135deg, #9aa7ff 0%, #e9c6ee 52%, #f0ede5 100%)',
  'linear-gradient(135deg, #10d468 0%, #0ca8dd 45%, #322bc7 100%)',
  'linear-gradient(135deg, #e13bd9 0%, #ef7b42 56%, #f2d356 100%)',
  'linear-gradient(135deg, #7cc9ff 0%, #68e1a5 44%, #ffe08a 100%)',
  'linear-gradient(135deg, #ff8fa3 0%, #a971ff 50%, #39d6c2 100%)',
  'linear-gradient(135deg, #b6e880 0%, #3bb6a6 46%, #4961dd 100%)',
]

export function stableHash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({ name, size = 18 }: { name: string; size?: number }) {
  const h = stableHash(name)
  const bg = AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
  return (
    <span
      aria-label={name}
      title={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        backgroundImage: bg,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.10)',
      }}
    />
  )
}

// ── Цвет отдела ─────────────────────────────────────────────────────
// В демо цвета отделов берутся из фиксированной палитры (grid-shared SOLID_COLORS).
// У departments нет поля цвета — выбираем детерминированно по stableHash(id).

export const DEPT_PALETTE = [
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
] as const

export function deptColor(deptId: string | null): string {
  if (!deptId) return 'var(--muted-foreground)'
  return DEPT_PALETTE[stableHash(deptId) % DEPT_PALETTE.length]
}

// Цвет должности — как demo getSpecialtyColor: фиксированный fallback-набор по хэшу.
const SPECIALTY_FALLBACK_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6']

export function positionColor(position: string | null): string {
  if (!position) return 'var(--muted-foreground)'
  return SPECIALTY_FALLBACK_COLORS[stableHash(position) % SPECIALTY_FALLBACK_COLORS.length]
}

/** Цвет Телеграм-акцента из демо (DepartmentPositionCard accent="#3884de"). */
export const TELEGRAM_ACCENT = '#3884de'

// ── DepartmentDot ───────────────────────────────────────────────────

export function DepartmentDot({
  color,
  outer = 12,
  inner = 7,
  marginRight,
}: {
  color: string
  outer?: number
  inner?: number
  marginRight?: number
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: outer,
        height: outer,
        flexShrink: 0,
        borderRadius: '50%',
        background: `color-mix(in oklab, ${color} 22%, transparent)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight,
        verticalAlign: 'middle',
      }}
    >
      <span
        style={{
          width: inner,
          height: inner,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 18%, transparent)`,
        }}
      />
    </span>
  )
}

// ── DepartmentPositionCard ──────────────────────────────────────────

function compactDepartmentLabel(label: string): string {
  const normalized = label
    .replace(/^(відділ|отдел|department)\s+/i, '')
    .replace(/\s+department$/i, '')
    .trim()
  return normalized.toLocaleUpperCase('uk-UA')
}

export function DepartmentPositionCard({
  department,
  position,
  accent,
  departmentAccent,
  compact = false,
  variant = 'default',
  textScale = 1,
  showDepartment = true,
  showPosition = true,
  showDot,
  onClick,
}: {
  department: string
  position: string
  accent: string
  departmentAccent?: string
  compact?: boolean
  variant?: 'default' | 'compactSchedule'
  textScale?: number
  showDepartment?: boolean
  showPosition?: boolean
  showDot?: boolean
  onClick?: () => void
}) {
  const isCompactSchedule = variant === 'compactSchedule'
  const shouldShowDepartment = showDepartment
  const shouldShowPosition = showPosition && position !== ''
  const shouldShowDot = showDot ?? isCompactSchedule
  const hasText = shouldShowDepartment || shouldShowPosition
  const dotAccent = departmentAccent ?? accent

  if (!hasText && !shouldShowDot) return null

  const compactContent = (
    <>
      {shouldShowDot && <DepartmentDot color={dotAccent} />}
      {shouldShowDepartment && (
        <>
          <span
            style={{
              flexShrink: 0,
              color: 'var(--muted-foreground)',
              fontSize: 10 * textScale,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}
          >
            {compactDepartmentLabel(department)}
          </span>
          {shouldShowPosition && (
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                color: 'var(--muted-foreground)',
                fontSize: 15 * textScale,
                fontWeight: 500,
                lineHeight: 0.8,
                opacity: 0.78,
              }}
            >
              ›
            </span>
          )}
        </>
      )}
      {shouldShowPosition && (
        <span
          style={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            color: 'var(--foreground)',
            fontSize: 13.5 * textScale,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {position}
        </span>
      )}
    </>
  )

  const accentTextStyle = (color?: string): React.CSSProperties => (color ? { color } : {})

  const content = (
    <>
      {shouldShowDot && (
        <span style={{ marginLeft: hasText ? (compact ? 5 : 6) : 0, display: 'inline-flex' }}>
          <DepartmentDot color={dotAccent} />
        </span>
      )}
      {shouldShowDepartment && (
        <>
          <span
            style={{
              minWidth: 'max-content',
              color: departmentAccent ? undefined : 'var(--muted-foreground)',
              padding: compact ? '1px 6px' : '2px 7px',
              ...accentTextStyle(departmentAccent),
            }}
          >
            {department}
          </span>
          {shouldShowPosition && (
            <span
              aria-hidden="true"
              style={{
                alignSelf: 'stretch',
                width: 1,
                background: 'var(--border)',
                opacity: 0.85,
              }}
            />
          )}
        </>
      )}
      {shouldShowPosition && (
        <span
          style={{
            minWidth: 'max-content',
            padding: compact ? '1px 6px' : '2px 7px',
            fontWeight: 750,
            ...accentTextStyle(accent),
          }}
        >
          {position}
        </span>
      )}
    </>
  )

  // compactSchedule renders as a small badge pill: dot + department › role.
  const style: React.CSSProperties = isCompactSchedule ? {
    maxWidth: 'none',
    minWidth: 'max-content',
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    flexShrink: 0,
    border: '1px solid color-mix(in oklab, var(--border) 82%, transparent)',
    borderRadius: 999,
    background: 'color-mix(in oklab, var(--grid-pill-bg) 88%, var(--surface) 12%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    padding: hasText ? '2.5px 8px 2.5px 6px' : 3,
    fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
    whiteSpace: 'nowrap',
  } : {
    maxWidth: 'none',
    minWidth: 'max-content',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    border: '1px solid var(--border)',
    borderRadius: compact ? 5 : 6,
    background: 'color-mix(in oklab, var(--grid-pill-bg) 86%, var(--surface) 14%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    fontSize: compact ? 8.5 : 10,
    fontWeight: 650,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${department} ${position}`.trim()}
        className="cursor-pointer transition-opacity hover:opacity-85"
        style={{
          ...style,
          ...(isCompactSchedule ? {} : { padding: 0 }),
        }}
      >
        {isCompactSchedule ? compactContent : content}
      </button>
    )
  }

  return <span style={style}>{isCompactSchedule ? compactContent : content}</span>
}

// ── «НА СМЕНЕ»: счётчик и пикер охвата ──────────────────────────────

function onShiftCountColor(count: number, total: number) {
  if (total <= 0) return 'var(--muted-foreground)'
  if (count >= total) return 'var(--success)'
  if (count >= Math.max(1, total - 2)) return 'var(--warning)'
  return 'var(--st-alert)'
}

export function OnShiftCountCell({ count, total, compact = false }: { count: number; total: number; compact?: boolean }) {
  const color = onShiftCountColor(count, total)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: compact ? 14 : 16,
        paddingBottom: 2,
        borderBottom: `2px solid color-mix(in oklab, ${color} 54%, transparent)`,
        color,
        fontSize: compact ? 9.5 : 11,
        fontWeight: 800,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {count}
    </span>
  )
}

const ON_SHIFT_MENU_WIDTH = 196

export interface OnShiftScopeOption {
  key: string
  name: string
}

export function OnShiftScopePicker({
  allLabel,
  options,
  value,
  onChange,
}: {
  allLabel: string
  /** отделы (без «все» — добавляется внутри) */
  options: OnShiftScopeOption[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const selected = options.find((o) => o.key === value)
  const buttonLabel = selected?.name ?? allLabel
  const items: OnShiftScopeOption[] = [{ key: 'all', name: allLabel }, ...options]

  useEffect(() => {
    if (!open) return

    const updateMenuPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      const estimatedHeight = items.length * 28 + 10
      const maxLeft = Math.max(8, window.innerWidth - ON_SHIFT_MENU_WIDTH - 8)
      const maxTop = Math.max(8, window.innerHeight - estimatedHeight - 8)
      const topAbove = rect.top - estimatedHeight - 6
      const top = topAbove >= 8 ? topAbove : Math.min(maxTop, rect.bottom + 6)

      setMenuPos({
        left: Math.min(maxLeft, Math.max(8, rect.right - ON_SHIFT_MENU_WIDTH)),
        top: Math.max(8, top),
      })
    }

    updateMenuPosition()

    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, items.length])

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  const menu = open && menuPos && typeof document !== 'undefined'
    ? createPortal(
      <div
        ref={menuRef}
        className="smengo-pop"
        style={{
          position: 'fixed',
          left: menuPos.left,
          top: menuPos.top,
          zIndex: 5000,
          width: ON_SHIFT_MENU_WIDTH,
          padding: 5,
          textTransform: 'none',
          ['--pop-origin' as string]: 'bottom right',
        }}
      >
        {items.map((item) => {
          const active = item.key === (selected ? value : 'all')
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => pick(item.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                border: 0,
                borderRadius: 6,
                background: active ? 'color-mix(in oklab, var(--accent) 13%, var(--grid-cell))' : 'transparent',
                color: 'var(--foreground)',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: active ? 700 : 550,
                lineHeight: 1.1,
                textAlign: 'left',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              {active && <Check style={{ width: 12, height: 12, color: 'var(--accent)', flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>,
      document.body,
    )
    : null

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          height: 20,
          maxWidth: 104,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          border: '1px solid var(--border)',
          borderRadius: 999,
          background: 'var(--grid-pill-bg)',
          color: 'var(--muted-foreground)',
          padding: '0 7px',
          cursor: 'pointer',
          fontSize: 9.5,
          fontWeight: 650,
          lineHeight: 1,
          letterSpacing: 0,
          textTransform: 'none',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buttonLabel}</span>
        <ChevronDown style={{ width: 10, height: 10, flexShrink: 0 }} />
      </button>
      {menu}
    </div>
  )
}

// ── ShiftTimeStack (компактный режим: время столбиком) ──────────────

export function ShiftTimeStack({
  start,
  end,
  fontSize = 8.5,
  dividerWidth = '70%',
}: {
  start: string
  end: string
  fontSize?: number
  dividerWidth?: number | string
}) {
  return (
    <span
      style={{
        minWidth: 0,
        maxWidth: '100%',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: 'inherit',
        fontSize,
        fontWeight: 750,
        lineHeight: 1,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>{start}</span>
      <span
        aria-hidden="true"
        style={{
          width: dividerWidth,
          minWidth: 18,
          height: 1,
          background: 'currentColor',
          opacity: 0.42,
        }}
      />
      <span>{end}</span>
    </span>
  )
}

// ── Лейбл отпуска/больничного: полная и короткая форма ──────────────
// (CSS-классы smengo-leave-label* в globals.css переключают форму по ширине)

export function ScheduleLeaveLabelText({ full, short }: { full: string; short: string }) {
  const dotted = short.endsWith('.') ? short : `${short}.`
  return (
    <span className="smengo-leave-label" aria-label={full}>
      <span className="smengo-leave-label-full">{full}</span>
      <span className="smengo-leave-label-short">{dotted}</span>
    </span>
  )
}

// ── Контраст текста для кастомных статусов (demo readableColorForHex) ──

export function readableColorForHex(hex: string): '#111827' | '#ffffff' {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#ffffff'
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance > 170 ? '#111827' : '#ffffff'
}

// ── Ширина колонки сотрудника (формулы из демо) ─────────────────────

function clampPx(min: number, vwFraction: number, max: number, viewportW: number): number {
  if (viewportW <= 0) return min
  return Math.round(Math.min(max, Math.max(min, vwFraction * viewportW)))
}

export interface NameColumnOptions {
  showEmployeeRole: boolean
  showEmployeeDepartment: boolean
  showEmployeeDot: boolean
  showTelegram: boolean
}

/** Копия compactEmployeeNameColumnWidth из демо (sticky=true). */
export function compactNameColumnWidth(opts: NameColumnOptions): number {
  if (opts.showTelegram) return 280
  const count = Number(opts.showEmployeeDepartment) + Number(opts.showEmployeeRole)
  if (count === 0) return opts.showEmployeeDot ? 212 : 198
  if (count === 1) return opts.showEmployeeRole ? 248 : 236
  return opts.showEmployeeDot ? 254 : 246
}

/** Копия detailEmployeeNameColumnWidth из демо (sticky=true), clamp → px. */
export function detailNameColumnWidth(mode: GridMode, opts: NameColumnOptions, viewportW: number): number {
  const isExt = mode === 'extended'
  if (opts.showTelegram) {
    return isExt ? clampPx(280, 0.28, 350, viewportW) : clampPx(250, 0.25, 300, viewportW)
  }
  const count = Number(opts.showEmployeeDepartment) + Number(opts.showEmployeeRole)
  if (count === 0) {
    return opts.showEmployeeDot
      ? clampPx(230, 0.23, 280, viewportW)
      : (isExt ? clampPx(215, 0.22, 255, viewportW) : clampPx(220, 0.22, 260, viewportW))
  }
  if (count === 1) {
    if (opts.showEmployeeRole) return isExt ? clampPx(260, 0.27, 330, viewportW) : clampPx(250, 0.25, 300, viewportW)
    return isExt ? clampPx(245, 0.26, 310, viewportW) : clampPx(240, 0.24, 290, viewportW)
  }
  return isExt
    ? clampPx(260, 0.30, 370, viewportW)
    : clampPx(260, 0.27, 320, viewportW)
}

export function nameColumnWidth(mode: GridMode, opts: NameColumnOptions, viewportW: number): number {
  return mode === 'compact' ? compactNameColumnWidth(opts) : detailNameColumnWidth(mode, opts, viewportW)
}

/** Ширина вьюпорта для clamp-формул демо (vw). 0 до маунта → min из clamp. */
export function useViewportWidth(): number {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return width
}

// ── macOS-style overlay-скроллбар (demo AppleHScrollbar) ────────────

export function AppleHScrollbar({
  scrollerRef,
  size = 'md',
  style,
}: {
  scrollerRef: { current: HTMLElement | null }
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number } | null>(null)

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    let raf = 0
    const tick = () => {
      const el = scrollerRef.current
      if (el && el.isConnected) {
        const sw = el.scrollWidth
        const cw = el.clientWidth
        const need = sw > cw + 2
        if (track.dataset.active !== String(need)) track.dataset.active = String(need)
        if (need) {
          const tw = track.clientWidth
          const w = Math.max(40, Math.round((cw / sw) * tw))
          const max = sw - cw
          const x = max > 0 ? (el.scrollLeft / max) * (tw - w) : 0
          if (thumb.style.width !== `${w}px`) thumb.style.width = `${w}px`
          thumb.style.transform = `translate3d(${x}px, 0, 0)`
        }
      } else if (track.dataset.active !== 'false') {
        track.dataset.active = 'false'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollerRef])

  function scrollFromDrag(clientX: number) {
    const drag = dragRef.current
    const el = scrollerRef.current
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!drag || !el || !track || !thumb) return
    const span = track.clientWidth - thumb.clientWidth
    if (span <= 0) return
    const max = el.scrollWidth - el.clientWidth
    el.scrollLeft = drag.startScroll + (clientX - drag.startX) * (max / span)
  }

  return (
    <div
      ref={trackRef}
      className={`smengo-hscroll smengo-hscroll--${size}`}
      data-active="false"
      style={style}
      onPointerDown={(e) => {
        const el = scrollerRef.current
        const track = trackRef.current
        const thumb = thumbRef.current
        if (!el || !track || !thumb) return
        e.preventDefault()
        track.setPointerCapture(e.pointerId)
        track.setAttribute('data-dragging', 'true')
        if (e.target !== thumb) {
          // Jump so the thumb centers on the pointer, then drag from there.
          const rect = track.getBoundingClientRect()
          const span = track.clientWidth - thumb.clientWidth
          const max = el.scrollWidth - el.clientWidth
          if (span > 0) {
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left - thumb.clientWidth / 2) / span))
            el.scrollLeft = ratio * max
          }
        }
        dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startScroll: el.scrollLeft }
      }}
      onPointerMove={(e) => {
        if (dragRef.current && e.pointerId === dragRef.current.pointerId) scrollFromDrag(e.clientX)
      }}
      onPointerUp={(e) => {
        if (dragRef.current?.pointerId === e.pointerId) {
          dragRef.current = null
          trackRef.current?.removeAttribute('data-dragging')
        }
      }}
      onPointerCancel={() => {
        dragRef.current = null
        trackRef.current?.removeAttribute('data-dragging')
      }}
    >
      <div ref={thumbRef} className="smengo-hscroll-thumb" />
    </div>
  )
}

// ── Клик-таргетинг по merge-прогону (demo scheduleRunClickTarget) ───

export function scheduleRunClickTarget(e: React.MouseEvent<HTMLElement>, indices: number[]) {
  const rect = e.currentTarget.getBoundingClientRect()
  const count = Math.max(indices.length, 1)
  const ratio = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0
  const offset = Math.max(0, Math.min(count - 1, Math.floor(ratio * count)))

  return {
    dayIdx: indices[offset] ?? indices[0] ?? 0,
    subRect: {
      top: rect.top,
      left: rect.left + (offset * rect.width) / count,
      width: rect.width / count,
      height: rect.height,
    },
  }
}
