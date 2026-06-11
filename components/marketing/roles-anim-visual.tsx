'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Avatar } from '@/components/marketing/grid-preview'

export type RolesLabels = {
  /** Unused in this layout, kept for backwards compat with caller. */
  days:  string[]
  /** Pool of role strings, each prefixed with emoji + space (e.g. "🍳 Кухар"). */
  roles: string[]
}

/**
 * Horizontal role-pill marquee.
 *
 * 5 rows scroll in alternating directions (→ ← → ← →) at slightly different
 * speeds. The track is split into two identical halves; the animation translates
 * by exactly one half + one gap, giving a mathematically seamless loop with no
 * visible jump. `prefers-reduced-motion` disables motion; hover pauses all rows.
 *
 * Roles are curated to match the target customer industries: HoReCa, retail,
 * services, medical, logistics, production/security, sales, IT/digital,
 * arbitrage. Off-topic roles from the locale pool (gardener, librarian, etc.)
 * are intentionally excluded.
 */

type Tone = { bg: string; border: string; text: string; bgDark: string; borderDark: string; textDark: string }

const TONES: Tone[] = [
  // 0 — Purple (brand)
  { bg: 'rgba(124,92,196,0.95)',  border: 'rgba(124,92,196,1)',     text: '#ffffff',
    bgDark: 'rgba(140,108,212,0.95)', borderDark: 'rgba(168,140,232,0.9)', textDark: '#ffffff' },
  // 1 — Blue
  { bg: 'rgba(59,111,212,0.95)',  border: 'rgba(59,111,212,1)',     text: '#ffffff',
    bgDark: 'rgba(80,135,235,0.92)',  borderDark: 'rgba(120,165,240,0.9)', textDark: '#ffffff' },
  // 2 — Green
  { bg: 'rgba(47,158,111,0.95)',  border: 'rgba(47,158,111,1)',     text: '#ffffff',
    bgDark: 'rgba(60,180,128,0.92)',  borderDark: 'rgba(100,210,160,0.9)', textDark: '#ffffff' },
  // 3 — Amber
  { bg: 'rgba(214,150,68,0.97)',  border: 'rgba(214,150,68,1)',     text: '#ffffff',
    bgDark: 'rgba(224,169,109,0.95)', borderDark: 'rgba(240,190,140,0.9)', textDark: '#1a1614' },
  // 4 — Pink
  { bg: 'rgba(236,72,153,0.95)',  border: 'rgba(236,72,153,1)',     text: '#ffffff',
    bgDark: 'rgba(244,114,182,0.92)', borderDark: 'rgba(248,150,200,0.9)', textDark: '#ffffff' },
  // 5 — Cyan
  { bg: 'rgba(14,160,184,0.95)',  border: 'rgba(14,160,184,1)',     text: '#ffffff',
    bgDark: 'rgba(34,190,214,0.92)',  borderDark: 'rgba(90,215,232,0.9)',  textDark: '#ffffff' },
]

const SHIFT_TIMES = ['9:00–18:00', '10:00–22:00', '14:00–22:00', '8:00–16:00', '7:00–15:00', '20:00–8:00']

// Inter-pill and inter-group gap (must match Tailwind `gap-2.5` = 10px).
const GAP_PX = 10

type PillSpec = { r: number; c: number; t: boolean }
type RowSpec = { pills: PillSpec[]; dir: 'left' | 'right'; durationS: number }

/*
 * Curated role indices from messages.caps.i3Roles (uk.json shape).
 * Industries covered:
 *   0  Кухар        — HoReCa
 *   1  Менеджер     — sales / corp
 *   2  Frontend     — IT
 *   3  Офіціант     — HoReCa
 *   4  Охоронець    — security
 *   5  Логіст       — logistics
 *   6  Фармацевт    — medical
 *   7  Медик        — medical
 *   8  Оператор     — sales / call centre
 *   9  Дизайнер     — IT / digital
 *  10  Маркетолог   — digital / arbitrage
 *  11  Касир        — retail / HoReCa
 *  12  Кур'єр       — logistics
 *  15  Адміністратор— services / medical
 *  16  Технік       — production
 *  17  Бармен       — HoReCa
 *  18  Су-шеф       — HoReCa
 *  19  Аналітик     — IT / sales
 *  20  Продавець    — retail
 *  22  Санітар      — medical
 *  23  Водій        — logistics
 *  24  SMM          — digital / arbitrage
 *  27  Ревізор      — retail / production
 *  31  Слюсар       — production
 *  32  Електрик     — production
 *  33  Лаборант     — medical
 *  36  HR           — corp / arbitrage
 *  37  Фінансист    — sales / corp
 *  38  DevOps       — IT
 *  39  QA           — IT
 *  40  Баріста      — HoReCa
 *  42  Промоутер    — arbitrage
 *  46  Медсестра    — medical
 * Excluded as off-topic for our customer base:
 *   13 Прораб, 14 Прибиральник, 21 Аніматор, 25 Тренер, 26 Викладач,
 *   28 Оператор ПК, 29 Фотограф, 30 Садівник, 34 Редактор, 35 Ведучий,
 *   41 Банщик, 43 Бібліотекар, 44 Діловод, 45 Консьєрж, 47 Рятувальник,
 *   48 Дилер, 49 Перекладач.
 */
const ROWS: RowSpec[] = [
  {
    dir: 'right', durationS: 48,
    pills: [
      { r: 3,  c: 0, t: true  }, // Офіціант
      { r: 6,  c: 2, t: false }, // Фармацевт
      { r: 9,  c: 1, t: false }, // Дизайнер
      { r: 17, c: 3, t: true  }, // Бармен
      { r: 38, c: 5, t: false }, // DevOps
      { r: 11, c: 0, t: false }, // Касир
      { r: 23, c: 2, t: true  }, // Водій
      { r: 39, c: 4, t: false }, // QA
      { r: 36, c: 1, t: false }, // HR
      { r: 12, c: 3, t: true  }, // Кур'єр
      { r: 22, c: 5, t: false }, // Санітар
      { r: 33, c: 0, t: false }, // Лаборант
    ],
  },
  {
    dir: 'left', durationS: 54,
    pills: [
      { r: 0,  c: 1, t: false }, // Кухар
      { r: 20, c: 3, t: true  }, // Продавець
      { r: 1,  c: 0, t: false }, // Менеджер
      { r: 7,  c: 2, t: true  }, // Медик
      { r: 5,  c: 4, t: false }, // Логіст
      { r: 40, c: 0, t: true  }, // Баріста
      { r: 24, c: 5, t: false }, // SMM
      { r: 18, c: 1, t: false }, // Су-шеф
      { r: 42, c: 3, t: true  }, // Промоутер
      { r: 16, c: 2, t: false }, // Технік
      { r: 27, c: 4, t: false }, // Ревізор
      { r: 31, c: 5, t: true  }, // Слюсар
    ],
  },
  {
    dir: 'right', durationS: 46,
    pills: [
      { r: 8,  c: 5, t: false }, // Оператор
      { r: 15, c: 0, t: true  }, // Адміністратор
      { r: 19, c: 1, t: false }, // Аналітик
      { r: 4,  c: 3, t: true  }, // Охоронець
      { r: 2,  c: 5, t: false }, // Frontend
      { r: 10, c: 0, t: false }, // Маркетолог
      { r: 37, c: 2, t: true  }, // Фінансист
      { r: 32, c: 4, t: false }, // Електрик
      { r: 46, c: 1, t: false }, // Медсестра
      { r: 11, c: 3, t: true  }, // Касир
      { r: 17, c: 5, t: false }, // Бармен
      { r: 39, c: 2, t: false }, // QA
    ],
  },
]

// ─── Hover card helpers ─────────────────────────────────────────────────────
const CARD_W = 290
const CAL_DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const FIRST_N = ['Олена','Максим','Аліна','Вадим','Ірина','Дмитро','Наталія','Артем','Юлія','Павло','Катерина','Андрій','Тетяна','Сергій','Оксана','Роман','Вікторія','Євген','Марина','Антон']
const LAST_N  = ['Ковальчук','Шевченко','Бондаренко','Ткаченко','Кравченко','Мельник','Сидоренко','Захаренко','Романенко','Гриценко','Мороз','Лисенко','Пономаренко','Даниленко','Чорна','Кириленко','Савченко','Голубенко','Петренко','Черненко']
function fakeName(ri: number) {
  return `${FIRST_N[ri % FIRST_N.length]} ${LAST_N[(ri * 7 + 3) % LAST_N.length]}`
}
type DayCell = 'W' | 'D' | 'V' | null
function genCalendar(seed: number): DayCell[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon = 0
  const cells: DayCell[] = Array.from({ length: firstDow }, () => null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (firstDow + d - 1) % 7
    if (dow >= 5) { cells.push('D'); continue }
    const p = (d + seed) % 11
    cells.push(p === 9 ? 'V' : p === 10 ? 'D' : 'W')
  }
  return cells
}
type HoveredInfo = {
  name: string; emoji: string; role: string
  tone: number; roleIdx: number; rect: DOMRect; shiftTime: string | null
}
// ─────────────────────────────────────────────────────────────────────────────

function useDark() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const check = () => setDark(root.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

export function RolesAnimVisual({ labels }: { labels: RolesLabels }) {
  const dark = useDark()
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<HoveredInfo | null>(null)
  const [clicked, setClicked] = useState<HoveredInfo | null>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const animsRef = useRef<Animation[]>([])
  const speedRef = useRef(1)
  const rafRef   = useRef<number | null>(null)

  // Lazily capture running CSS animations from all .rv-track elements.
  const ensureAnims = () => {
    if (animsRef.current.length === 0 && wrapRef.current) {
      const tracks = wrapRef.current.querySelectorAll<HTMLElement>('.rv-track')
      animsRef.current = Array.from(tracks).flatMap(t => Array.from(t.getAnimations()))
    }
  }

  const animateSpeed = (target: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    // Decelerate slower (0.05 per frame) than accelerate (0.09 per frame)
    const factor = target > speedRef.current ? 0.09 : 0.05
    const tick = () => {
      speedRef.current += (target - speedRef.current) * factor
      const close = Math.abs(speedRef.current - target) < 0.004
      const s = close ? target : speedRef.current
      animsRef.current.forEach(a => { try { a.playbackRate = s } catch {} })
      speedRef.current = s
      if (!close) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const handleWrapEnter = () => { ensureAnims(); animateSpeed(0) }
  const handleWrapLeave = () => { setHovered(null); animateSpeed(1) }

  const handlePillEnter = (e: MouseEvent<HTMLSpanElement>, item: Resolved) => {
    setHovered({
      name: fakeName(item.roleIdx), emoji: item.emoji, role: item.label,
      tone: item.tone, roleIdx: item.roleIdx,
      rect: e.currentTarget.getBoundingClientRect(), shiftTime: item.time,
    })
  }
  const handlePillLeave = () => setHovered(null)

  const handlePillClick = (e: MouseEvent<HTMLSpanElement>, item: Resolved) => {
    e.stopPropagation()
    setClicked({
      name: fakeName(item.roleIdx), emoji: item.emoji, role: item.label,
      tone: item.tone, roleIdx: item.roleIdx,
      rect: e.currentTarget.getBoundingClientRect(), shiftTime: item.time,
    })
  }

  // Close modal on scroll or Escape
  useEffect(() => {
    const close = () => setClicked(null)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const resolved = useMemo(() => {
    return ROWS.map((row, ri) => row.pills.map((p, ci) => {
      const role = labels.roles[p.r % labels.roles.length] ?? ''
      const spaceIdx = role.indexOf(' ')
      const emoji = spaceIdx > 0 ? role.slice(0, spaceIdx) : ''
      const label = spaceIdx > 0 ? role.slice(spaceIdx + 1) : role
      const time = p.t ? SHIFT_TIMES[(ri * 7 + ci * 3) % SHIFT_TIMES.length] : null
      return { key: `${ri}-${ci}`, emoji, label, time, tone: p.c, roleIdx: p.r }
    }))
  }, [labels.roles])

  return (
    <div
      ref={wrapRef}
      className={"rv-wrap relative" + (hovered ? " rv-has-hover" : "")}
      onMouseEnter={handleWrapEnter}
      onMouseLeave={handleWrapLeave}
    >
      <div className="flex flex-col gap-3">
        {ROWS.map((row, ri) => {
          const items = resolved[ri]
          return (
            <div
              key={ri}
              className="rv-row relative"
              style={{ overflowX: 'clip', overflowY: 'visible', paddingTop: 6, paddingBottom: 6 }}
            >
              <div
                className="rv-track flex w-max items-center"
                style={{
                  gap: GAP_PX,
                  // Marquee is two identical groups separated by one gap.
                  // Translating by exactly (groupWidth + gap) per iteration places
                  // group B at group A's starting position → perfectly seamless.
                  // groupWidth + gap === 50% of the wrapper (which holds both
                  // groups + the inter-group gap), so `calc(-50% - gap/2)`
                  // does the trick.
                  animationName: reduced
                    ? undefined
                    : (row.dir === 'left' ? 'rvScrollLeft' : 'rvScrollRight'),
                  animationDuration: reduced ? undefined : `${row.durationS}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  willChange: 'transform',
                }}
              >
                <PillGroup items={items} dark={dark} onPillEnter={handlePillEnter} onPillLeave={handlePillLeave} onPillClick={handlePillClick} />
                {/* Group B — a duplicate that scrolls in to replace A seamlessly. Also clickable. */}
                <PillGroup items={items} dark={dark} ariaHidden onPillEnter={handlePillEnter} onPillLeave={handlePillLeave} onPillClick={handlePillClick} />
              </div>
            </div>
          )
        })}
      </div>

      {clicked && (
        <PillCard info={clicked} dark={dark} onClose={() => setClicked(null)} />
      )}

      <style jsx global>{`
        @keyframes rvScrollLeft {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-50% - ${GAP_PX / 2}px), 0, 0); }
        }
        @keyframes rvScrollRight {
          from { transform: translate3d(calc(-50% - ${GAP_PX / 2}px), 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
        .rv-pill {
          cursor: pointer;
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease, filter 160ms ease, opacity 160ms ease;
        }
        .rv-pill:hover {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 14px 30px -8px rgba(31, 30, 28, 0.32);
          z-index: 5;
        }
        .rv-wrap.rv-has-hover .rv-pill:not(:hover) {
          opacity: 0.45;
        }
        .rv-wrap.rv-has-hover .rv-pill:hover {
          opacity: 1;
          transform: translateY(-4px) scale(1.12);
          box-shadow: 0 18px 36px -8px rgba(31, 30, 28, 0.38);
        }
      `}</style>
    </div>
  )
}

type Resolved = { key: string; emoji: string; label: string; time: string | null; tone: number; roleIdx: number }

function PillGroup({ items, dark, ariaHidden, onPillEnter, onPillLeave, onPillClick }: {
  items: Resolved[]
  dark: boolean
  ariaHidden?: boolean
  onPillEnter?: (e: MouseEvent<HTMLSpanElement>, item: Resolved) => void
  onPillLeave?: () => void
  onPillClick?: (e: MouseEvent<HTMLSpanElement>, item: Resolved) => void
}) {
  return (
    <div
      className="flex shrink-0 items-center"
      style={{ gap: GAP_PX }}
      aria-hidden={ariaHidden}
    >
      {items.map((item) => {
        const tone = TONES[item.tone % TONES.length]
        const bg     = dark ? tone.bgDark     : tone.bg
        const border = dark ? tone.borderDark : tone.border
        const text   = dark ? tone.textDark   : tone.text
        // Shadow tinted to match the pill color
        const shadowColor =
          item.tone === 0 ? 'rgba(124,92,196,0.45)'  :
          item.tone === 1 ? 'rgba(59,111,212,0.40)'  :
          item.tone === 2 ? 'rgba(47,158,111,0.40)'  :
          item.tone === 3 ? 'rgba(214,150,68,0.42)'  :
          item.tone === 4 ? 'rgba(236,72,153,0.40)'  :
                            'rgba(14,160,184,0.40)'
        return (
          <span
            key={item.key}
            className="rv-pill inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full"
            onMouseEnter={onPillEnter ? (e) => onPillEnter(e, item) : undefined}
            onMouseLeave={onPillLeave ? onPillLeave : undefined}
            onClick={onPillClick ? (e) => onPillClick(e, item) : undefined}
            style={{
              padding: '7px 14px',
              background: bg,
              border: `1px solid ${border}`,
              color: text,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              boxShadow: `0 6px 16px -8px ${shadowColor}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{item.emoji}</span>
            <span>{item.label}</span>
            {item.time && (
              <>
                <span style={{ opacity: 0.55, padding: '0 1px' }}>·</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{item.time}</span>
              </>
            )}
          </span>
        )
      })}
    </div>
  )
}

// ─── Click modal card ─────────────────────────────────────────────────────────
function PillCard({
  info, dark, onClose,
}: {
  info: HoveredInfo
  dark: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const schedule = useMemo(() => genCalendar(info.roleIdx), [info.roleIdx])
  // Flatter, more neutral role chip (subtle tint of the pill tone, no harsh border)
  const roleTint =
    info.tone === 0 ? (dark ? 'rgba(168,140,232,0.18)' : 'rgba(124,92,196,0.12)')  :
    info.tone === 1 ? (dark ? 'rgba(120,165,240,0.18)' : 'rgba(59,111,212,0.12)')  :
    info.tone === 2 ? (dark ? 'rgba(100,210,160,0.18)' : 'rgba(47,158,111,0.12)')  :
    info.tone === 3 ? (dark ? 'rgba(240,190,140,0.20)' : 'rgba(214,150,68,0.14)')  :
    info.tone === 4 ? (dark ? 'rgba(248,150,200,0.18)' : 'rgba(236,72,153,0.12)')  :
                      (dark ? 'rgba(90,215,232,0.18)'  : 'rgba(14,160,184,0.12)')
  const roleAccent =
    info.tone === 0 ? (dark ? '#c4aef0' : '#6e4eb3')  :
    info.tone === 1 ? (dark ? '#a8c4f5' : '#2557b3')  :
    info.tone === 2 ? (dark ? '#7ddbac' : '#1e7a55')  :
    info.tone === 3 ? (dark ? '#f0c890' : '#8a5515')  :
    info.tone === 4 ? (dark ? '#f7a8d0' : '#b6256e')  :
                      (dark ? '#7fe0ee' : '#0e7a90')

  const workDays = schedule.filter(s => s === 'W').length
  const offDays  = schedule.filter(s => s === 'D').length
  const hours    = workDays * 8

  const vp   = typeof window !== 'undefined' ? window.innerWidth : 1200
  const left = Math.max(8, Math.min(info.rect.left + info.rect.width / 2 - CARD_W / 2, vp - CARD_W - 8))
  const above = info.rect.top > 260
  const top   = above ? info.rect.top - 12 : info.rect.bottom + 12
  const tf    = above ? 'translateY(-100%)' : 'translateY(0)'

  // Flat modern surface — no gradient, no muddy tones
  const surface = dark ? '#1c1b19' : '#fbfaf8'
  const bdr     = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const shadow  = dark
    ? '0 24px 64px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)'
    : '0 20px 48px -16px rgba(20,18,30,0.18), 0 2px 6px -2px rgba(0,0,0,0.05)'
  const sub  = dark ? 'rgba(245,242,238,0.42)' : 'rgba(20,18,16,0.45)'
  const fg   = dark ? '#f5f2ee' : '#16151a'

  // Unified stat chip background (neutral, no per-chip border color)
  const chipBg = dark ? 'rgba(255,255,255,0.04)'  : 'rgba(20,18,16,0.035)'

  const cardTf = mounted
    ? tf
    : above ? 'translateY(calc(-100% + 10px))' : 'translateY(10px)'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: mounted ? (dark ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.12)') : 'transparent',
          backdropFilter: mounted ? 'blur(2px)' : 'none',
          transition: 'background 220ms ease, backdrop-filter 220ms ease',
        }}
      />
      {/* Card */}
      <div
        style={{
          position: 'fixed', left, top, zIndex: 9999,
          transform: cardTf,
          opacity: mounted ? 1 : 0,
          width: CARD_W,
          background: surface,
          border: `1px solid ${bdr}`,
          borderRadius: 14,
          boxShadow: shadow,
          pointerEvents: 'auto',
          userSelect: 'none',
          transition: 'transform 240ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar name={info.name} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 650, color: fg, lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info.name}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '2.5px 9px', borderRadius: 999,
                background: roleTint, color: roleAccent,
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '-0.005em',
              }}>
                <span style={{ fontSize: 12 }}>{info.emoji}</span>
                {info.role}
              </span>
              {info.shiftTime && (
                <span style={{ fontSize: 11, color: sub, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>{info.shiftTime}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.045)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, transition: 'background 140ms ease' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Stats — unified neutral chips, only numbers carry accent color */}
        <div style={{ padding: '0 14px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { value: workDays, label: 'Змін',     c: dark ? '#7ddbac' : '#1e8855' },
            { value: offDays,  label: 'Вихідних', c: fg },
            { value: hours,    label: 'Годин',    c: dark ? '#f5cc5e' : '#9a6800' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '8px 8px 7px',
              borderRadius: 10,
              background: chipBg,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: s.c, letterSpacing: '-0.02em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: sub, marginTop: 2, letterSpacing: '-0.005em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mini calendar */}
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {CAL_DOW.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 600, color: sub, letterSpacing: '0.04em', padding: '2px 0', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {schedule.map((s, i) => {
              if (!s) return <div key={i} style={{ aspectRatio: '1/1' }} />
              // Day-of-month: first non-null is day 1
              const firstFilled = schedule.findIndex(x => x !== null)
              const dayNum = i - firstFilled + 1
              let bg2: string, fg2: string
              // W — calm green tint, V — clean amber/gold, D — subtle neutral. NO borders.
              if (s === 'W')      { bg2 = dark ? 'rgba(94,200,150,0.22)' : 'rgba(60,170,120,0.16)'; fg2 = dark ? '#9fe6c2' : '#1e7a55' }
              else if (s === 'V') { bg2 = dark ? 'rgba(245,197,66,0.26)' : 'rgba(230,170,40,0.22)';  fg2 = dark ? '#f7d77a' : '#8a5500' }
              else                { bg2 = dark ? 'rgba(255,255,255,0.045)' : 'rgba(20,18,16,0.04)'; fg2 = dark ? 'rgba(245,242,238,0.55)' : 'rgba(20,18,16,0.50)' }
              return (
                <div key={i} style={{
                  aspectRatio: '1/1', borderRadius: 7, background: bg2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10.5, fontWeight: 600, color: fg2, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
                }}>
                  {dayNum}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, fontSize: 10.5, color: sub, flexWrap: 'wrap', letterSpacing: '-0.005em' }}>
            {[
              { label: 'Сміна',    dot: dark ? '#5ec896' : '#3caa78' },
              { label: 'Відпустка',dot: dark ? '#f5c542' : '#e6aa28' },
              { label: 'Вихідний',dot: dark ? 'rgba(245,242,238,0.30)' : 'rgba(20,18,16,0.25)' },
            ].map(l => (
              <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
