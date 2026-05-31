'use client'

import { useEffect, useRef } from 'react'

type CardColor = 'peach' | 'teal' | 'lavender' | 'pink' | 'amber' | 'slate' | 'slate-lines'

interface ShiftCard {
  allDay?: boolean
  time?: string
  role: string
  hours: string
  color: CardColor
  top?: string
  bottom?: string
  left?: string
  right?: string
  rotate: number
  delay: number
  w?: number
}

// ── Front layer ──────────────────────────────────────────────────────────────
const CARDS: ShiftCard[] = [
  { time: '10:00–16:00', role: 'Медработник', hours: '6ч',  color: 'peach',       top: '13%', left: '4%',   rotate: -5, delay: 0.0 },
  { time: '7:00–16:00',  role: 'Стоматолог',  hours: '9ч',  color: 'lavender',    top: '40%', left: '10%',  rotate:  4, delay: 0.6 },
  { allDay: true,         role: 'Выходной',    hours: '24ч', color: 'slate-lines', top: '64%', left: '4%',   rotate: -3, delay: 1.2 },
  { time: '14:00–22:00', role: 'Менеджер',    hours: '8ч',  color: 'amber',       top: '83%', left: '17%',  rotate:  6, delay: 1.8 },
  { time: '9:00–17:00',  role: 'Техник',      hours: '8ч',  color: 'pink',        top: '9%',  right: '5%',  rotate:  5, delay: 0.3 },
  { allDay: true,         role: 'Отпуск',      hours: '24ч', color: 'slate',       top: '37%', right: '4%',  rotate: -6, delay: 0.9 },
  { time: '10:00–14:00', role: 'Аналитик',    hours: '4ч',  color: 'teal',        top: '63%', right: '11%', rotate:  3, delay: 1.5 },
  { time: '8:00–20:00',  role: 'Охранник',    hours: '12ч', color: 'peach',       top: '84%', right: '5%',  rotate: -4, delay: 2.1 },
]

// ── Back blur layer ──────────────────────────────────────────────────────────
const BACK_CARDS: ShiftCard[] = [
  { time: '6:00–14:00',  role: 'Логист',      hours: '8ч',  color: 'teal',     top: '-3%',   left: '20%',  rotate:  14, delay: 0.2, w: 118 },
  { allDay: true,         role: 'Больничный',  hours: '24ч', color: 'lavender', top: '10%',   left: '36%',  rotate:  -9, delay: 0.7, w: 108 },
  { time: '22:00–6:00',  role: 'Ночной',      hours: '8ч',  color: 'slate',    top: '31%',   left: '-2%',  rotate:  19, delay: 0.4, w: 122 },
  { time: '11:00–17:00', role: 'Кассир',      hours: '6ч',  color: 'pink',     top: '53%',   left: '29%',  rotate: -14, delay: 1.1, w: 102 },
  { allDay: true,         role: 'Праздник',    hours: '24ч', color: 'amber',    top: '73%',   left: '-4%',  rotate:   9, delay: 0.6, w: 116 },
  { time: '8:00–16:00',  role: 'Повар',       hours: '8ч',  color: 'peach',    bottom: '2%', left: '24%',  rotate: -17, delay: 1.4, w: 110 },
  { time: '9:00–21:00',  role: 'Фармацевт',   hours: '12ч', color: 'teal',     top: '4%',    right: '21%', rotate: -12, delay: 0.3, w: 114 },
  { allDay: true,         role: 'Отгул',       hours: '24ч', color: 'lavender', top: '29%',   right: '19%', rotate:  13, delay: 0.9, w: 100 },
  { time: '15:00–23:00', role: 'Продавец',    hours: '8ч',  color: 'amber',    top: '57%',   right: '25%', rotate:  -8, delay: 0.5, w: 112 },
  { time: '7:00–15:00',  role: 'Водитель',    hours: '8ч',  color: 'pink',     top: '80%',   right: '-2%', rotate:  17, delay: 1.3, w: 124 },
]

// ── Color maps ────────────────────────────────────────────────────────────────
const BG: Record<CardColor, string> = {
  peach:        'bg-[#fde8d3] dark:bg-[#3d1808]',
  teal:         'bg-[#d0f0e9] dark:bg-[#082e25]',
  lavender:     'bg-[#e8e4f8] dark:bg-[#1a163a]',
  pink:         'bg-[#fce3ef] dark:bg-[#30101f]',
  amber:        'bg-[#fef0c0] dark:bg-[#2a1c00]',
  slate:        'bg-[#e8eaed] dark:bg-[#1c1e22]',
  'slate-lines':'bg-[#f0f1f3] dark:bg-[#1c1e22]',
}

const TEXT: Record<CardColor, string> = {
  peach:        'text-[#c45d3d] dark:text-[#f4a261]',
  teal:         'text-[#1a7a68] dark:text-[#5abcaa]',
  lavender:     'text-[#5248a0] dark:text-[#a89ee8]',
  pink:         'text-[#b5407a] dark:text-[#e891c0]',
  amber:        'text-[#8a6010] dark:text-[#f4c842]',
  slate:        'text-[#4b5563] dark:text-[#9ca3af]',
  'slate-lines':'text-[#6b7280] dark:text-[#9ca3af]',
}

const MUTED: Record<CardColor, string> = {
  peach:        'text-[#c45d3d]/70 dark:text-[#f4a261]/60',
  teal:         'text-[#1a7a68]/70 dark:text-[#5abcaa]/60',
  lavender:     'text-[#5248a0]/70 dark:text-[#a89ee8]/60',
  pink:         'text-[#b5407a]/70 dark:text-[#e891c0]/60',
  amber:        'text-[#8a6010]/70 dark:text-[#f4c842]/60',
  slate:        'text-[#4b5563]/60 dark:text-[#9ca3af]/50',
  'slate-lines':'text-[#6b7280]/60 dark:text-[#9ca3af]/50',
}

function DiagonalLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{
        backgroundImage:
          'repeating-linear-gradient(-45deg, transparent 0px, transparent 5px, rgba(100,100,100,0.10) 5px, rgba(100,100,100,0.10) 6px)',
      }}
    />
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4.5V7l1.5 1.5" strokeLinecap="round" />
    </svg>
  )
}

function CardBody({ card }: { card: ShiftCard }) {
  return (
    <div className="relative">
      {card.allDay ? (
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${TEXT[card.color]}`}>
          Весь день
        </p>
      ) : (
        <p className={`text-[11.5px] font-bold tabular-nums ${TEXT[card.color]}`}>{card.time}</p>
      )}
      <p className={`mt-0.5 truncate text-[11px] font-medium ${MUTED[card.color]}`}>{card.role}</p>
      <div className={`mt-3 flex items-center gap-1 ${MUTED[card.color]}`}>
        <ClockIcon className="h-3 w-3 shrink-0" />
        <span className="text-[11px] font-medium">{card.hours}</span>
      </div>
    </div>
  )
}

export function AuthFloatingCards() {
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0
    let animId: number

    function onMove(e: MouseEvent) {
      targetX = e.clientX / window.innerWidth  - 0.5
      targetY = e.clientY / window.innerHeight - 0.5
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function tick() {
      currentX = lerp(currentX, targetX, 0.07)
      currentY = lerp(currentY, targetY, 0.07)

      // Front moves more, back moves less — same direction = true parallax depth
      if (frontRef.current) {
        frontRef.current.style.transform =
          `translateX(${currentX * 24}px) translateY(${currentY * 16}px)`
      }
      if (backRef.current) {
        backRef.current.style.transform =
          `translateX(${currentX * 9}px) translateY(${currentY * 6}px)`
      }
      animId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    animId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes auth-float {
          from { transform: translateY(0px);  }
          to   { transform: translateY(-10px); }
        }
        @keyframes auth-float-back {
          from { transform: translateY(0px); }
          to   { transform: translateY(-7px); }
        }
      `}</style>

      {/* ── Back blur layer — moves with mouse, slower ── */}
      <div
        ref={backRef}
        className="pointer-events-none fixed inset-0 z-0 hidden md:block"
        aria-hidden
      >
        {BACK_CARDS.map((card, i) => (
          <div
            key={i}
            className={`absolute rounded-xl p-3 opacity-60 ${BG[card.color]}`}
            style={{
              width: card.w ?? 120,
              top: card.top,
              bottom: card.bottom,
              left: card.left,
              right: card.right,
              rotate: `${card.rotate}deg`,
              filter: 'blur(8px)',
              animation: `auth-float-back 5.5s ease-in-out infinite alternate`,
              animationDelay: `${card.delay}s`,
            }}
          >
            <CardBody card={card} />
          </div>
        ))}
      </div>

      {/* ── Front layer — moves with mouse ── */}
      <div
        ref={frontRef}
        className="pointer-events-none fixed inset-0 z-0 hidden md:block"
        aria-hidden
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`absolute w-[132px] rounded-xl p-3 shadow-md opacity-80 ${BG[card.color]}`}
            style={{
              top: card.top,
              bottom: card.bottom,
              left: card.left,
              right: card.right,
              rotate: `${card.rotate}deg`,
              animation: `auth-float 4s ease-in-out infinite alternate`,
              animationDelay: `${card.delay}s`,
            }}
          >
            {card.color === 'slate-lines' && <DiagonalLines />}
            <CardBody card={card} />
          </div>
        ))}
      </div>
    </>
  )
}
