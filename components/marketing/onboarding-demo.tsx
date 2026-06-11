'use client'

import { useState } from 'react'
import { Check, Sparkles, GraduationCap } from 'lucide-react'
import { Avatar } from './grid-preview'

export type OnboardingDemoLabels = {
  chrome: string
  newcomerName: string
  newcomerRole: string
  badgeTrainee: string
  badgeStaff: string
  mentorLabel: string
  mentorName: string
  progressLabel: string
  phaseDone: string
  completeTitle: string
  completeText: string
  owners: string[]
  phases: { title: string; tasks: { text: string; owner: number }[] }[]
}

const OWNER_COLORS = ['#d0773f', '#3b6fd4', '#2f9e6f']

export function OnboardingDemo({ labels }: { labels: OnboardingDemoLabels }) {
  const [done, setDone] = useState<boolean[][]>(() => labels.phases.map((phase, pi) =>
    // Первый этап уже закрыт — демо начинается «в процессе»
    phase.tasks.map(() => pi === 0),
  ))
  const [activePhase, setActivePhase] = useState(1)

  const totalTasks = labels.phases.reduce((sum, p) => sum + p.tasks.length, 0)
  const doneTasks = done.reduce((sum, p) => sum + p.filter(Boolean).length, 0)
  const progress = Math.round((doneTasks / totalTasks) * 100)
  const completed = progress === 100
  const phaseComplete = (pi: number) => done[pi].every(Boolean)

  function toggleTask(pi: number, ti: number) {
    setDone((prev) => prev.map((phase, i) => (
      i === pi ? phase.map((v, j) => (j === ti ? !v : v)) : phase
    )))
  }

  const phase = labels.phases[activePhase]

  return (
    <div
      style={{
        background: 'var(--grid-cell)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.10)',
      }}
    >
      {/* Window chrome */}
      <div
        className="hidden items-center gap-1.5 sm:flex"
        style={{ padding: '10px 14px', background: 'var(--grid-chrome)', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
          {labels.chrome}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        {/* Newcomer header */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-2xl border p-3.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <Avatar name="Kate Volkova" size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[15px] font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                {labels.newcomerName}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
                style={{
                  background: completed
                    ? 'color-mix(in oklab, var(--success) 15%, transparent)'
                    : 'color-mix(in oklab, #7c5cc4 14%, transparent)',
                  color: completed ? 'var(--success)' : '#7c5cc4',
                }}
              >
                {completed ? <Sparkles size={10} strokeWidth={2.4} /> : <GraduationCap size={10} strokeWidth={2.4} />}
                {completed ? labels.badgeStaff : labels.badgeTrainee}
              </span>
            </div>
            <div className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
              {labels.newcomerRole}
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}>
            <Avatar name="Mark Sidorov" size={24} />
            <div className="min-w-0">
              <div className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                {labels.mentorLabel}
              </div>
              <div className="truncate text-[11.5px] font-semibold" style={{ color: 'var(--foreground)' }}>
                {labels.mentorName}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-44">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span style={{ color: 'var(--muted-foreground)' }}>{labels.progressLabel}</span>
              <span className="tabular-nums" style={{ color: completed ? 'var(--success)' : 'var(--accent)' }}>{progress}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--grid-pill-bg)' }}>
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: completed ? 'var(--success)' : 'var(--accent)',
                  transition: 'width 420ms cubic-bezier(.22,1,.36,1), background 200ms ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Phase stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-0">
          {labels.phases.map((p, pi) => {
            const isDone = phaseComplete(pi)
            const isActive = pi === activePhase
            return (
              <div key={p.title} className="flex shrink-0 items-center sm:flex-1">
                <button
                  type="button"
                  onClick={() => setActivePhase(pi)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 transition-all sm:w-full"
                  style={{
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                    background: isActive ? 'var(--accent-soft)' : 'var(--surface)',
                    boxShadow: isActive ? '0 0 0 1px var(--accent)' : 'none',
                  }}
                >
                  <span
                    className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums transition-colors"
                    style={{
                      background: isDone ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--grid-pill-bg)',
                      color: isDone || isActive ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {isDone ? <Check size={11} strokeWidth={3} /> : pi + 1}
                  </span>
                  <span
                    className="truncate text-[11.5px] font-bold"
                    style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  >
                    {p.title}
                  </span>
                </button>
                {pi < labels.phases.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mx-1 hidden h-px w-4 shrink-0 sm:block sm:flex-1"
                    style={{ background: phaseComplete(pi) ? 'var(--success)' : 'var(--border)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Active phase checklist */}
        <div className="rounded-2xl border p-3.5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold" style={{ color: 'var(--foreground)' }}>{phase.title}</span>
            {phaseComplete(activePhase) && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: 'color-mix(in oklab, var(--success) 14%, transparent)', color: 'var(--success)' }}
              >
                <Check size={10} strokeWidth={3} />
                {labels.phaseDone}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {phase.tasks.map((task, ti) => {
              const isDone = done[activePhase][ti]
              const ownerColor = OWNER_COLORS[task.owner % OWNER_COLORS.length]
              return (
                <button
                  key={task.text}
                  type="button"
                  onClick={() => toggleTask(activePhase, ti)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/60"
                  style={{ background: 'transparent', border: 0 }}
                >
                  <span
                    className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor: isDone ? 'var(--success)' : 'var(--border)',
                      background: isDone ? 'var(--success)' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    {isDone && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span
                    className="min-w-0 flex-1 text-[13px] font-medium"
                    style={{
                      color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {task.text}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `color-mix(in oklab, ${ownerColor} 13%, transparent)`, color: ownerColor }}
                  >
                    {labels.owners[task.owner]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Completion banner */}
        {completed && (
          <div
            className="rounded-2xl border px-4 py-3.5 text-center"
            style={{
              borderColor: 'color-mix(in oklab, var(--success) 32%, transparent)',
              background: 'color-mix(in oklab, var(--success) 11%, transparent)',
              animation: 'smengo-toast-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="text-[14px] font-bold" style={{ color: 'var(--success)' }}>
              {labels.completeTitle}
            </div>
            <div className="mt-1 text-[12.5px]" style={{ color: 'var(--foreground)' }}>
              {labels.completeText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
