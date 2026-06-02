'use client'

import { useEffect, useState } from 'react'

type Mode = 'compact' | 'detail' | 'extended'
const MODES: Mode[] = ['compact', 'detail', 'extended']

export type GridModeDemoLabels = Record<Mode, string>

const MODE_HOLD_MS = 2800

const ROW_H: Record<Mode, number> = { compact: 14, detail: 28, extended: 44 }
const DAY_COUNT: Record<Mode, number> = { compact: 21, detail: 12, extended: 7 }

// Same shift palette as the real GridPreview — readable on both themes
const PALETTE = [
  '#3b9b7f', // green
  '#e8a04c', // amber
  '#3b6fd4', // blue
  '#d4604a', // red
  '#9b85c4', // purple
  '#5da38c', // teal
  '#c77dc0', // pink
  '#6b8cae', // steel
]

const EMPS: { name: string; color: number; pattern: number[] }[] = [
  { name: 'Anna',  color: 0, pattern: [1,1,0,1,1,1,0, 1,1,0,1,1,0,0, 1,1,1,1,1,0,0] },
  { name: 'Mark',  color: 1, pattern: [1,1,1,0,1,1,1, 1,1,1,0,0,1,0, 1,1,1,0,1,0,0] },
  { name: 'Kate',  color: 2, pattern: [0,1,1,1,1,0,0, 0,1,1,1,1,0,0, 0,1,1,1,1,0,0] },
  { name: 'Ivan',  color: 3, pattern: [1,0,0,1,1,0,1, 1,1,0,0,1,0,0, 1,0,0,1,1,0,0] },
  { name: 'Daria', color: 4, pattern: [1,1,0,0,1,0,0, 1,1,1,0,0,0,0, 1,1,0,0,1,0,0] },
  { name: 'Olga',  color: 5, pattern: [1,1,1,1,0,1,0, 1,1,1,1,0,0,0, 1,1,1,1,0,0,0] },
  { name: 'Pavel', color: 6, pattern: [0,0,1,1,1,1,1, 0,1,1,1,1,0,0, 0,0,1,1,1,0,0] },
  { name: 'Yulia', color: 7, pattern: [1,0,1,0,1,0,1, 0,1,0,1,0,0,0, 1,0,1,0,1,0,0] },
]

const ALL_DAYS = Array.from({ length: 21 }, (_, i) => i + 1)

export function GridModeDemo({ labels }: { labels: GridModeDemoLabels }) {
  const [step, setStep] = useState(0)
  const mode  = MODES[step]
  const rowH  = ROW_H[mode]
  const count = DAY_COUNT[mode]
  const days  = ALL_DAYS.slice(0, count)

  useEffect(() => {
    const id = window.setTimeout(() => setStep((s) => (s + 1) % 3), MODE_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [step])

  return (
    /* Card uses the exact same chrome/border tokens as the real GridPreview */
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        height: 460,
        background:   'var(--grid-chrome)',
        borderColor:  'var(--border)',
        boxShadow:    '0 4px 32px rgba(0,0,0,0.06)',
      }}
      aria-hidden="true"
    >
      <div className="flex h-full flex-col justify-center px-5 py-5">

        {/* Mode pills */}
        <div className="mb-4 flex items-center justify-center">
          <div
            className="inline-flex items-center gap-1 rounded-full border p-1"
            style={{
              background:  'var(--grid-pill-bg)',
              borderColor: 'var(--border)',
            }}
          >
            {MODES.map((m) => {
              const active = m === mode
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setStep(MODES.indexOf(m))}
                  className="rounded-full px-3.5 py-1 text-[11px] font-semibold transition-colors duration-200"
                  style={{
                    background: active ? '#d97757' : 'transparent',
                    color:      active ? '#fff'    : 'var(--grid-dept-fg)',
                  }}
                >
                  {labels[m]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day-number header */}
        <div className="mb-1.5 flex items-center gap-[3px]">
          <div className="shrink-0" style={{ width: 70 }} />
          {days.map((d, i) => (
            <div
              key={d}
              className="flex-1 text-center font-semibold"
              style={{
                fontSize: 9,
                color: i % 7 >= 5 ? '#d97757' : 'var(--grid-dept-fg)',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Employee rows */}
        <div className="flex flex-col gap-[3px]">
          {EMPS.map((emp) => {
            const fill = PALETTE[emp.color]
            return (
              <div key={emp.name} className="flex items-center gap-[3px]">
                {/* Name label */}
                <div className="flex shrink-0 items-center gap-1.5" style={{ width: 70 }}>
                  <span
                    className="shrink-0 rounded-full"
                    style={{ width: 7, height: 7, background: fill }}
                  />
                  <span
                    className="truncate text-[10px] font-medium"
                    style={{ color: 'var(--grid-dept-fg)' }}
                  >
                    {emp.name}
                  </span>
                </div>

                {/* Cells */}
                {emp.pattern.slice(0, count).map((on, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[5px]"
                    style={{
                      height: rowH,
                      transition: 'height 480ms cubic-bezier(0.32, 0.72, 0, 1)',
                      background: on
                        ? fill
                        : i % 7 >= 5
                          ? 'var(--grid-weekend)'
                          : 'var(--grid-cell)',
                      boxShadow: on
                        ? 'inset 0 -1.5px 0 rgba(0,0,0,0.12)'
                        : 'inset 0 0 0 1px var(--grid-row-divider)',
                    }}
                  />
                ))}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
