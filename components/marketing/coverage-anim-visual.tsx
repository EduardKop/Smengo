'use client'

import { useEffect, useState } from 'react'

type Shift = 'day' | 'night' | 'off' | 'unassigned'

export type CoverageLabels = {
  days:       string[]      // length 5
  dayShift:   string
  nightShift: string
  dayOff:     string
  unassigned: string
}

// Wednesday (col 2) is unassigned in row 1 only — one coverage gap
const ROWS: Shift[][] = [
  ['day',   'day',   'day',        'day',   'night'],
  ['night', 'day',   'unassigned', 'off',   'day'  ],
  ['day',   'off',   'night',      'day',   'day'  ],
  ['off',   'day',   'day',        'night', 'off'  ],
]

const CELLS = ROWS.flat()

const HOLD_MS = 2600
const FADE_MS = 450

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

export function CoverageAnimVisual({ labels }: { labels: CoverageLabels }) {
  const [showLabels, setShowLabels] = useState(false)
  const dark = useDark()

  useEffect(() => {
    const id = window.setTimeout(() => setShowLabels((v) => !v), HOLD_MS)
    return () => window.clearTimeout(id)
  }, [showLabels])

  const c = {
    cardBg:         dark ? '#161a22'                 : '#ffffff',
    cardBorder:     dark ? 'rgba(255,255,255,0.10)'  : 'rgba(31,30,28,0.10)',
    hdrText:        dark ? 'rgba(255,255,255,0.38)'  : '#9ca3af',
    offBg:          dark ? '#1a2030'                 : '#f5f3ef',
    offText:        dark ? 'rgba(255,255,255,0.28)'  : '#b0a898',
    nightBg:        dark ? '#263044'                 : '#ccd3de',
    nightText:      dark ? '#9aaabf'                 : '#374355',
    unassignedBg:   dark ? 'rgba(245,158,11,0.07)'  : '#fffbf0',
    unassignedText: dark ? '#fbbf24'                 : '#b45309',
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(60% 60% at 50% 50%, #2f9e6f44, transparent 70%)' }}
      />

      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-2xl"
        style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}
      >
        {/* Day header */}
        <div
          className="grid px-3 pt-2.5"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
          }}
        >
          {labels.days.map((d, idx) => (
            <div
              key={d}
              className="pb-2 text-center text-[10px] font-bold uppercase tracking-widest"
              style={{ color: idx === 2 ? '#d97706' : c.hdrText }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div
          className="grid p-3"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}
        >
          {CELLS.map((shift, i) => {
            if (shift === 'unassigned') {
              return (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-lg"
                  style={{ background: c.unassignedBg, border: '2px dashed #f59e0b' }}
                >
                  <span
                    className="text-center text-[11px] font-semibold leading-[1.35]"
                    style={{ color: c.unassignedText, whiteSpace: 'pre-line' }}
                  >
                    {labels.unassigned}
                  </span>
                </div>
              )
            }

            if (shift === 'off') {
              return (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-lg"
                  style={{ background: c.offBg }}
                >
                  <span
                    className="text-center text-[11px] font-medium"
                    style={{ color: c.offText }}
                  >
                    {labels.dayOff}
                  </span>
                </div>
              )
            }

            const isDay     = shift === 'day'
            const bg        = isDay ? '#2f9e6f' : c.nightBg
            const textColor = isDay ? 'rgba(255,255,255,0.93)' : c.nightText

            return (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg"
                style={{ background: bg }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center p-1.5 text-center font-mono font-bold"
                  style={{
                    color: textColor,
                    fontSize: '11px',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                    opacity: showLabels ? 0 : 1,
                    transition: `opacity ${FADE_MS}ms ease`,
                  }}
                >
                  {isDay ? '09:00\n–19:00' : '19:00\n–08:00'}
                </span>

                <span
                  className="absolute inset-0 flex items-center justify-center p-1.5 text-center font-semibold"
                  style={{
                    color: textColor,
                    fontSize: '11px',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                    opacity: showLabels ? 1 : 0,
                    transition: `opacity ${FADE_MS}ms ease`,
                  }}
                >
                  {isDay ? labels.dayShift : labels.nightShift}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
