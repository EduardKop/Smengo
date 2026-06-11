'use client'

import { useState } from 'react'
import { ArrowRight, Check, Inbox, MessagesSquare, FileSignature, GraduationCap, Sparkles } from 'lucide-react'
import { Avatar } from './grid-preview'

export type HrManagementDemoLabels = {
  chrome: string
  boardTitle: string
  boardSubtitle: string
  stageApplied: string
  stageInterview: string
  stageOffer: string
  stageOnboarding: string
  advance: string
  hire: string
  hired: string
  daysShort: string
  emptyStage: string
  selectHint: string
  candidates: { name: string; role: string; source: string }[]
  journeyTitle: string
  journeySubtitle: string
  journeyProgress: string
  journeyMentor: string
  journeyMentorName: string
  steps: string[]
  statConversion: string
  statTime: string
  statDays: string
}

type Stage = 'applied' | 'interview' | 'offer' | 'onboarding' | 'hired'

const STAGE_ORDER: Exclude<Stage, 'hired'>[] = ['applied', 'interview', 'offer', 'onboarding']

const STAGE_META: Record<Exclude<Stage, 'hired'>, { color: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> = {
  applied: { color: '#3b6fd4', Icon: Inbox },
  interview: { color: '#e0b53a', Icon: MessagesSquare },
  offer: { color: '#7c5cc4', Icon: FileSignature },
  onboarding: { color: '#2f9e6f', Icon: GraduationCap },
}

// Avatar photos reuse the demo set from grid-preview (stable name → photo map).
const CANDIDATE_AVATARS = ['Kate Volkova', 'Pavel Yurov', 'Lera Tarasova', 'Alex Novikov', 'Anna Petrov']
const INITIAL_STAGES: Stage[] = ['applied', 'applied', 'interview', 'interview', 'offer']
const WAIT_DAYS = [2, 1, 4, 6, 3]

type Candidate = {
  id: number
  stage: Stage
  checklist: boolean[]
}

export function HrManagementDemo({ labels }: { labels: HrManagementDemoLabels }) {
  const stepCount = labels.steps.length
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    INITIAL_STAGES.map((stage, id) => ({ id, stage, checklist: Array(stepCount).fill(false) })),
  )
  const [selectedId, setSelectedId] = useState<number>(4)

  const stageLabels: Record<Exclude<Stage, 'hired'>, string> = {
    applied: labels.stageApplied,
    interview: labels.stageInterview,
    offer: labels.stageOffer,
    onboarding: labels.stageOnboarding,
  }

  const selected = candidates.find((c) => c.id === selectedId) ?? null
  const selectedInfo = selected ? labels.candidates[selected.id % labels.candidates.length] : null
  const doneSteps = selected ? selected.checklist.filter(Boolean).length : 0
  const progress = selected ? Math.round((doneSteps / stepCount) * 100) : 0

  function advance(id: number) {
    setCandidates((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const idx = STAGE_ORDER.indexOf(c.stage as Exclude<Stage, 'hired'>)
      if (c.stage === 'onboarding') {
        return { ...c, stage: 'hired', checklist: c.checklist.map(() => true) }
      }
      if (idx < 0) return c
      return { ...c, stage: STAGE_ORDER[idx + 1] ?? c.stage }
    }))
    setSelectedId(id)
  }

  function toggleStep(id: number, stepIdx: number) {
    setCandidates((prev) => prev.map((c) => (
      c.id === id ? { ...c, checklist: c.checklist.map((v, i) => (i === stepIdx ? !v : v)) } : c
    )))
  }

  const hiredCount = candidates.filter((c) => c.stage === 'hired').length

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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
              {labels.boardTitle}
            </div>
            <div className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
              {labels.boardSubtitle}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <HeaderStat label={labels.statConversion} value={`${38 + hiredCount * 6}%`} />
            <HeaderStat label={labels.statTime} value={`9 ${labels.statDays}`} />
          </div>
        </div>

        {/* Pipeline board */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="grid min-w-[640px] grid-cols-4 gap-2.5">
            {STAGE_ORDER.map((stage) => {
              const meta = STAGE_META[stage]
              const StageIcon = meta.Icon
              const inStage = candidates.filter((c) => c.stage === stage || (stage === 'onboarding' && c.stage === 'hired'))
              return (
                <div
                  key={stage}
                  className="flex min-w-0 flex-col gap-2 rounded-2xl border p-2.5"
                  style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
                >
                  <div className="flex items-center justify-between gap-1 px-1">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                      <StageIcon size={12} strokeWidth={2.4} />
                      <span className="truncate">{stageLabels[stage]}</span>
                    </span>
                    <span
                      className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums"
                      style={{ background: `color-mix(in oklab, ${meta.color} 16%, transparent)`, color: meta.color }}
                    >
                      {inStage.length}
                    </span>
                  </div>

                  {inStage.length === 0 && (
                    <div
                      className="rounded-xl border border-dashed px-2 py-4 text-center text-[10.5px]"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                    >
                      {labels.emptyStage}
                    </div>
                  )}

                  {inStage.map((c) => {
                    const info = labels.candidates[c.id % labels.candidates.length]
                    const isSelected = c.id === selectedId
                    const isHired = c.stage === 'hired'
                    const checkDone = c.checklist.filter(Boolean).length
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="cursor-pointer rounded-xl border p-2.5 text-left transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          background: 'var(--surface)',
                          boxShadow: isSelected
                            ? '0 0 0 1px var(--accent), 0 8px 22px -12px rgba(0,0,0,0.35)'
                            : '0 1px 2px rgba(0,0,0,0.05)',
                          animation: 'smengo-toast-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={CANDIDATE_AVATARS[c.id % CANDIDATE_AVATARS.length]} size={24} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
                              {info.name}
                            </div>
                            <div className="truncate text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>
                              {info.role} · {info.source}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-1.5">
                          {isHired ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: 'color-mix(in oklab, var(--success) 15%, transparent)', color: 'var(--success)' }}
                            >
                              <Sparkles size={10} strokeWidth={2.4} />
                              {labels.hired}
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                                {stage === 'onboarding'
                                  ? `${checkDone}/${stepCount}`
                                  : `${WAIT_DAYS[c.id % WAIT_DAYS.length]} ${labels.daysShort}`}
                              </span>
                              <span
                                role="button"
                                tabIndex={-1}
                                onClick={(e) => { e.stopPropagation(); advance(c.id) }}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition-transform hover:scale-105"
                                style={{
                                  background: stage === 'onboarding' ? 'var(--success)' : 'var(--accent)',
                                  color: '#fff',
                                }}
                              >
                                {stage === 'onboarding' ? labels.hire : labels.advance}
                                <ArrowRight size={10} strokeWidth={2.6} />
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Employee journey panel */}
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {!selected || !selectedInfo ? (
            <div className="py-4 text-center text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>
              {labels.selectHint}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                  {labels.journeyTitle}
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <Avatar name={CANDIDATE_AVATARS[selected.id % CANDIDATE_AVATARS.length]} size={42} />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-bold" style={{ color: 'var(--foreground)' }}>
                      {selectedInfo.name}
                    </div>
                    <div className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                      {selectedInfo.role} · {selected.stage === 'hired' ? labels.hired : stageLabels[selected.stage as Exclude<Stage, 'hired'>]}
                    </div>
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span style={{ color: 'var(--muted-foreground)' }}>{labels.journeyProgress}</span>
                    <span className="tabular-nums" style={{ color: 'var(--accent)' }}>{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--grid-pill-bg)' }}>
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: progress === 100 ? 'var(--success)' : 'var(--accent)',
                        transition: 'width 420ms cubic-bezier(.22,1,.36,1), background 200ms ease',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}>
                  <Avatar name="Mark Sidorov" size={26} />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                      {labels.journeyMentor}
                    </div>
                    <div className="truncate text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>
                      {labels.journeyMentorName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                  {labels.journeySubtitle}
                </div>
                <div className="mt-2.5 flex flex-col gap-1">
                  {labels.steps.map((step, i) => {
                    const done = selected.checklist[i]
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => toggleStep(selected.id, i)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
                        style={{ background: 'transparent', border: 0 }}
                      >
                        <span
                          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors"
                          style={{
                            borderColor: done ? 'var(--success)' : 'var(--border)',
                            background: done ? 'var(--success)' : 'transparent',
                            color: '#fff',
                          }}
                        >
                          {done && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span
                          className="min-w-0 flex-1 text-[12.5px] font-medium"
                          style={{
                            color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {step}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1.5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <span className="font-serif text-[15px] font-bold leading-none tabular-nums" style={{ color: 'var(--accent)' }}>
        {value}
      </span>
      <span className="text-[10.5px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
    </span>
  )
}
