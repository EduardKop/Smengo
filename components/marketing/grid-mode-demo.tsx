'use client'

import { useEffect, useState } from 'react'

// Labels kept for backwards-compat with the page that still passes them in.
type Mode = 'compact' | 'detail' | 'extended'
export type GridModeDemoLabels = Record<Mode, string>

// Fixed extended-mode dimensions.
const ROW_H       = 58
const DAY_COUNT   = 8
const NAME_W      = 92
const CONTAINER_H = 600

// Door-flip timing.
const FLIP_MS    = 700   // CSS transition duration
const HOLD_MS    = 2400  // how long the back side stays visible
const PICK_EVERY = 850   // how often a new cell is picked
const MAX_FLIPS  = 3     // simultaneously flipped cells (visual density)

const PALETTE = [
  '#3b9b7f', '#e8a04c', '#3b6fd4', '#d4604a',
  '#9b85c4', '#5da38c', '#c77dc0', '#6b8cae',
]

type Shift = { start: number; end: number }
type Cell  = Shift | null

function shift(arr: number[], start: number, end: number): Cell[] {
  return arr.map((v) => (v ? { start, end } : null))
}

const EMPS: {
  name: string
  role: string
  emoji: string
  color: number
  pattern: Cell[]
}[] = [
  { name: 'Anna',  role: 'Кухар',    emoji: '👩‍🍳', color: 0, pattern: shift([1,1,0,1,1,1,0, 1,1,0,1,1,0,0, 1,1,1,1,1,0,0, 1,1,0,1,1,1,0],  9, 17) },
  { name: 'Mark',  role: 'Менеджер', emoji: '💼',   color: 1, pattern: shift([1,1,1,0,1,1,1, 1,1,1,0,0,1,0, 1,1,1,0,1,0,0, 1,1,1,0,1,1,1], 10, 19) },
  { name: 'Kate',  role: 'Касир',    emoji: '💳',   color: 2, pattern: shift([0,1,1,1,1,0,0, 0,1,1,1,1,0,0, 0,1,1,1,1,0,0, 0,1,1,1,1,0,0],  8, 16) },
  { name: 'Ivan',  role: 'Бариста',  emoji: '☕',   color: 3, pattern: shift([1,0,0,1,1,0,1, 1,1,0,0,1,0,0, 1,0,0,1,1,0,0, 1,0,0,1,1,0,1], 12, 22) },
  { name: 'Daria', role: 'Адмін',    emoji: '🗂️',   color: 4, pattern: shift([1,1,0,0,1,0,0, 1,1,1,0,0,0,0, 1,1,0,0,1,0,0, 1,1,0,0,1,0,0],  9, 18) },
  { name: 'Olga',  role: 'Офіціант', emoji: '🍽️',   color: 5, pattern: shift([1,1,1,1,0,1,0, 1,1,1,1,0,0,0, 1,1,1,1,0,0,0, 1,1,1,1,0,1,0], 14, 22) },
  { name: 'Pavel', role: 'Кур\u02bcєр', emoji: '🛵', color: 6, pattern: shift([0,0,1,1,1,1,1, 0,1,1,1,1,0,0, 0,0,1,1,1,0,0, 0,0,1,1,1,1,1], 11, 20) },
  { name: 'Yulia', role: 'Хостес',   emoji: '🎀',   color: 7, pattern: shift([1,0,1,0,1,0,1, 0,1,0,1,0,0,0, 1,0,1,0,1,0,0, 1,0,1,0,1,0,1], 16, 23) },
]

const fmtShort = (s: Shift) => `${s.start}–${s.end}`
const fmtHours = (s: Shift) => `${s.end - s.start}год`

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

// Pre-compute the list of ON cell keys so the picker doesn't re-scan every tick.
const ON_KEYS: string[] = (() => {
  const out: string[] = []
  EMPS.forEach((emp, ei) => {
    emp.pattern.slice(0, DAY_COUNT).forEach((c, ci) => {
      if (c) out.push(`${ei}-${ci}`)
    })
  })
  return out
})()

export function GridModeDemo(_props: { labels?: GridModeDemoLabels }) {
  void _props
  const reduced = usePrefersReducedMotion()
  const [flipped, setFlipped] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (reduced) return
    const timeouts: number[] = []

    const interval = window.setInterval(() => {
      setFlipped((prev) => {
        if (prev.size >= MAX_FLIPS) return prev
        // pick a random ON cell that isn't already flipped
        let pick: string | null = null
        for (let i = 0; i < 8; i++) {
          const candidate = ON_KEYS[Math.floor(Math.random() * ON_KEYS.length)]
          if (!prev.has(candidate)) { pick = candidate; break }
        }
        if (!pick) return prev
        const next = new Set(prev)
        next.add(pick)
        const t = window.setTimeout(() => {
          setFlipped((p) => {
            if (!p.has(pick!)) return p
            const n = new Set(p)
            n.delete(pick!)
            return n
          })
        }, HOLD_MS)
        timeouts.push(t)
        return next
      })
    }, PICK_EVERY)

    return () => {
      window.clearInterval(interval)
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [reduced])

  const days = Array.from({ length: DAY_COUNT }, (_, i) => i + 1)

  return (
    <div className="relative" aria-hidden="true">
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          height: CONTAINER_H,
          background:  'var(--grid-chrome)',
          borderColor: 'var(--border)',
          boxShadow:   '0 4px 32px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="flex h-full flex-col"
          style={{ paddingTop: 22, paddingBottom: 22, paddingLeft: 18, paddingRight: 18 }}
        >
          {/* Grid centers in remaining space */}
          <div className="flex flex-1 flex-col justify-center">
            {/* Day-number header */}
            <div className="mb-1.5 flex items-center gap-[3px]">
              <div className="shrink-0" style={{ width: NAME_W }} />
              {days.map((d, i) => (
                <div
                  key={d}
                  className="flex-1 text-center font-semibold"
                  style={{
                    fontSize: 10,
                    color: i % 7 >= 5 ? '#d97757' : 'var(--grid-dept-fg)',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Employee rows */}
            <div className="flex flex-col gap-[3px]">
              {EMPS.map((emp, ei) => {
                const fill = PALETTE[emp.color]
                return (
                  <div key={emp.name} className="flex items-center gap-[3px]">
                    {/* Name label */}
                    <div
                      className="flex shrink-0 items-center gap-1.5"
                      style={{ width: NAME_W }}
                    >
                      <span
                        className="shrink-0 rounded-full"
                        style={{ width: 7, height: 7, background: fill }}
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div
                          className="truncate font-medium"
                          style={{ fontSize: 11, color: 'var(--grid-dept-fg)' }}
                        >
                          {emp.name}
                        </div>
                        <div
                          className="truncate"
                          style={{ fontSize: 9, color: 'var(--grid-dept-fg)', opacity: 0.55 }}
                        >
                          {emp.role}
                        </div>
                      </div>
                    </div>

                    {/* Cells */}
                    {emp.pattern.slice(0, DAY_COUNT).map((cell, ci) => {
                      const on = cell !== null
                      const isWeekend = ci % 7 >= 5
                      const key = `${ei}-${ci}`
                      const isFlipped = on && flipped.has(key)

                      if (!on) {
                        return (
                          <div
                            key={ci}
                            className="flex-1 rounded-[5px]"
                            style={{
                              height: ROW_H,
                              background: isWeekend ? 'var(--grid-weekend)' : 'var(--grid-cell)',
                              boxShadow: 'inset 0 0 0 1px var(--grid-row-divider)',
                            }}
                          />
                        )
                      }

                      return (
                        <div
                          key={ci}
                          className="flex-1"
                          style={{ height: ROW_H, perspective: 700 }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '100%',
                              transformStyle: 'preserve-3d',
                              transition: `transform ${FLIP_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            }}
                          >
                            {/* FRONT — shift info */}
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 5,
                                background: fill,
                                boxShadow: 'inset 0 -1.5px 0 rgba(0,0,0,0.12)',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.1,
                                padding: '0 4px',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                overflow: 'hidden',
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 600 }}>{fmtShort(cell)}</div>
                              <div style={{ fontSize: 9, opacity: 0.85, marginTop: 1 }}>
                                {fmtHours(cell)}
                              </div>
                            </div>

                            {/* BACK — role + emoji */}
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 5,
                                background: '#fff',
                                boxShadow: `inset 0 0 0 1.5px ${fill}, 0 2px 6px rgba(0,0,0,0.08)`,
                                color: fill,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1.05,
                                padding: '0 3px',
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                overflow: 'hidden',
                              }}
                            >
                              <div style={{ fontSize: 20, lineHeight: 1 }}>{emp.emoji}</div>
                              <div
                                style={{
                                  marginTop: 3,
                                  fontSize: 8.5,
                                  fontWeight: 700,
                                  letterSpacing: '0.01em',
                                  textAlign: 'center',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {emp.role}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
