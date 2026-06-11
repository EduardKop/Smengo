'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Users, UserCheck, Inbox, BriefcaseBusiness,
  TrendingUp, TrendingDown, CalendarDays, MapPin, Clock3, Check,
} from 'lucide-react'
import { Avatar } from './grid-preview'

export type HrDashboardDemoLabels = {
  chrome: string
  greeting: string
  greetingNote: string
  dateLabel: string
  kpiEmployees: string
  kpiOnShift: string
  kpiApplicants: string
  kpiOpenRoles: string
  kpiVsPrev: string
  chartTitle: string
  chartMonthly: string
  chartWeekly: string
  chartPlanned: string
  chartActual: string
  hourSuffix: string
  chartMonths: string[]
  chartWeekdays: string[]
  statusTitle: string
  statusPermanent: string
  statusContract: string
  statusTrainee: string
  perfTitle: string
  perfTasks: string
  perfPresence: string
  perfMeetings: string
  calTitle: string
  calMonth: string
  today: string
  tabMeetings: string
  tabEvents: string
  meetings: { title: string; time: string; place: string }[]
  events: { title: string; time: string; place: string }[]
  leaveTitle: string
  leaveAnnual: string
  leaveSick: string
  notesTitle: string
  notes: { text: string; tag: string }[]
  perfNames: string[]
}

// Demo dataset — fictional team, anchored to the same May 2026 the grid uses.
const KPIS = [
  { key: 'employees', value: 24, delta: +2, icon: Users },
  { key: 'onShift', value: 9, delta: +1, icon: UserCheck },
  { key: 'applicants', value: 132, delta: +18, icon: Inbox },
  { key: 'openRoles', value: 3, delta: -1, icon: BriefcaseBusiness },
] as const

const MONTHLY_PLANNED = [168, 160, 176, 168, 176, 168, 176, 176, 168, 176, 168, 176]
const MONTHLY_ACTUAL  = [171, 158, 183, 165, 181, 172, 0, 0, 0, 0, 0, 0]
const WEEKLY_PLANNED  = [38, 38, 38, 38, 38, 22, 12]
const WEEKLY_ACTUAL   = [39, 37, 41, 38, 40, 24, 11]
const MONTHLY_VISIBLE = 6 // months with actuals so far

const STATUS_SPLIT = [
  { key: 'permanent', value: 17, color: 'var(--accent)' },
  { key: 'contract', value: 4, color: '#3b6fd4' },
  { key: 'trainee', value: 3, color: '#2f9e6f' },
] as const

const PERF_AVATARS = ['Anna Petrov', 'Mark Sidorov', 'Daria Kos', 'Yulia Lebed']
const PERF_ROWS = [
  { tasks: 46, presence: 32, meetings: 18 },
  { tasks: 38, presence: 30, meetings: 26 },
  { tasks: 52, presence: 28, meetings: 12 },
  { tasks: 34, presence: 33, meetings: 22 },
]
const PERF_COLORS = { tasks: 'var(--accent)', presence: '#e0b53a', meetings: '#7c5cc4' }

// May 2026 mini-calendar: 31 days, May 1 = Friday (mon0 dow = 4)
const CAL_FIRST_DOW = 4
const CAL_DAYS = 31
const CAL_TODAY = 14
const CAL_MARKED = [5, 14, 22, 30] // days with events

function useCountUp(target: number, run: boolean, durationMs = 900): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, durationMs])
  return value
}

export function HrDashboardDemo({ labels }: { labels: HrDashboardDemoLabels }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [calTab, setCalTab] = useState<'meetings' | 'events'>('meetings')
  const [selectedDay, setSelectedDay] = useState(CAL_TODAY)
  const [doneNotes, setDoneNotes] = useState<boolean[]>(() => labels.notes.map((_, i) => i === 0))
  const [hoverStatus, setHoverStatus] = useState<string | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const kpiLabels: Record<(typeof KPIS)[number]['key'], string> = {
    employees: labels.kpiEmployees,
    onShift: labels.kpiOnShift,
    applicants: labels.kpiApplicants,
    openRoles: labels.kpiOpenRoles,
  }

  const planned = period === 'monthly' ? MONTHLY_PLANNED.slice(0, MONTHLY_VISIBLE) : WEEKLY_PLANNED
  const actual = period === 'monthly' ? MONTHLY_ACTUAL.slice(0, MONTHLY_VISIBLE) : WEEKLY_ACTUAL
  const axis = period === 'monthly' ? labels.chartMonths.slice(0, MONTHLY_VISIBLE) : labels.chartWeekdays
  const statusTotal = STATUS_SPLIT.reduce((sum, s) => sum + s.value, 0)
  const statusLabels: Record<(typeof STATUS_SPLIT)[number]['key'], string> = {
    permanent: labels.statusPermanent,
    contract: labels.statusContract,
    trainee: labels.statusTrainee,
  }
  const calItems = calTab === 'meetings' ? labels.meetings : labels.events
  const perfLegend = [
    { key: 'tasks', label: labels.perfTasks, color: PERF_COLORS.tasks },
    { key: 'presence', label: labels.perfPresence, color: PERF_COLORS.presence },
    { key: 'meetings', label: labels.perfMeetings, color: PERF_COLORS.meetings },
  ]

  return (
    <div
      ref={rootRef}
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
        {/* Greeting row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name="Olga Romanenko" size={38} />
            <div className="min-w-0">
              <div className="truncate text-[16px] font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                {labels.greeting}
              </div>
              <div className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                {labels.greetingNote}
              </div>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <CalendarDays size={13} strokeWidth={2.2} />
            {labels.dateLabel}
          </span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpiLabels[kpi.key]}
              value={kpi.value}
              delta={kpi.delta}
              vsPrev={labels.kpiVsPrev}
              Icon={kpi.icon}
              run={visible}
            />
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="flex min-w-0 flex-col gap-3">
            {/* Hours chart */}
            <DemoCard
              title={labels.chartTitle}
              action={(
                <div
                  className="inline-flex items-center gap-0.5 rounded-full border p-0.5"
                  style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
                >
                  {(['monthly', 'weekly'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPeriod(p); setHoverIdx(null) }}
                      className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      style={{
                        background: period === p ? 'var(--accent)' : 'transparent',
                        color: period === p ? '#fff' : 'var(--muted-foreground)',
                      }}
                    >
                      {p === 'monthly' ? labels.chartMonthly : labels.chartWeekly}
                    </button>
                  ))}
                </div>
              )}
            >
              <HoursChart
                planned={planned}
                actual={actual}
                axis={axis}
                hourSuffix={labels.hourSuffix}
                plannedLabel={labels.chartPlanned}
                actualLabel={labels.chartActual}
                hoverIdx={hoverIdx}
                onHover={setHoverIdx}
              />
            </DemoCard>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Employment status */}
              <DemoCard title={labels.statusTitle}>
                <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--grid-pill-bg)' }}>
                  {STATUS_SPLIT.map((s) => (
                    <span
                      key={s.key}
                      onMouseEnter={() => setHoverStatus(s.key)}
                      onMouseLeave={() => setHoverStatus(null)}
                      style={{
                        width: `${(s.value / statusTotal) * 100}%`,
                        background: s.color,
                        opacity: hoverStatus && hoverStatus !== s.key ? 0.35 : 1,
                        transition: 'opacity 160ms ease',
                      }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {STATUS_SPLIT.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onMouseEnter={() => setHoverStatus(s.key)}
                      onMouseLeave={() => setHoverStatus(null)}
                      className="flex cursor-default items-center justify-between gap-2 text-left"
                      style={{ opacity: hoverStatus && hoverStatus !== s.key ? 0.45 : 1, transition: 'opacity 160ms ease', background: 'transparent', border: 0, padding: 0 }}
                    >
                      <span className="inline-flex items-center gap-2 text-[12px]" style={{ color: 'var(--foreground)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                        {statusLabels[s.key]}
                      </span>
                      <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                        {s.value}
                        <span className="ml-1.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          {Math.round((s.value / statusTotal) * 100)}%
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </DemoCard>

              {/* Performance */}
              <DemoCard title={labels.perfTitle}>
                <div className="flex flex-col gap-2.5">
                  {labels.perfNames.map((name, i) => {
                    const row = PERF_ROWS[i % PERF_ROWS.length]
                    const total = row.tasks + row.presence + row.meetings
                    return (
                      <div key={name} className="flex items-center gap-2.5">
                        <Avatar name={PERF_AVATARS[i % PERF_AVATARS.length]} size={22} />
                        <span className="w-12 truncate text-[11.5px] font-semibold" style={{ color: 'var(--foreground)' }}>
                          {name}
                        </span>
                        <div className="flex h-2.5 min-w-0 flex-1 gap-0.5">
                          {(['tasks', 'presence', 'meetings'] as const).map((k) => (
                            <span
                              key={k}
                              title={`${perfLegend.find((l) => l.key === k)?.label}: ${row[k]}`}
                              className="rounded-full"
                              style={{
                                width: visible ? `${(row[k] / total) * 100}%` : '0%',
                                background: PERF_COLORS[k],
                                transition: `width 700ms cubic-bezier(.22,1,.36,1) ${i * 90}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {perfLegend.map((l) => (
                    <span key={l.key} className="inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </DemoCard>
            </div>

            {/* Notes / HR tasks */}
            <DemoCard title={labels.notesTitle}>
              <div className="flex flex-col gap-1.5">
                {labels.notes.map((note, i) => {
                  const done = doneNotes[i]
                  return (
                    <button
                      key={note.text}
                      type="button"
                      onClick={() => setDoneNotes((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
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
                        className="min-w-0 flex-1 truncate text-[12.5px] font-medium"
                        style={{
                          color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >
                        {note.text}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        {note.tag}
                      </span>
                    </button>
                  )
                })}
              </div>
            </DemoCard>
          </div>

          {/* Right column */}
          <div className="flex min-w-0 flex-col gap-3">
            {/* Calendar + meetings */}
            <DemoCard title={labels.calTitle} subtitle={labels.calMonth}>
              <div className="grid grid-cols-7 gap-1">
                {labels.chartWeekdays.map((d) => (
                  <span key={d} className="text-center text-[9px] font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    {d.slice(0, 2)}
                  </span>
                ))}
                {Array.from({ length: CAL_FIRST_DOW }).map((_, i) => <span key={`pad-${i}`} />)}
                {Array.from({ length: CAL_DAYS }, (_, i) => i + 1).map((day) => {
                  const isToday = day === CAL_TODAY
                  const isSelected = day === selectedDay
                  const marked = CAL_MARKED.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      title={isToday ? labels.today : undefined}
                      className="relative mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
                      style={{
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--foreground)',
                        border: isToday && !isSelected ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                        padding: 0,
                      }}
                    >
                      {day}
                      {marked && !isSelected && (
                        <span
                          className="absolute bottom-0.5 h-1 w-1 rounded-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              <div
                className="mt-3 inline-flex w-full items-center gap-0.5 rounded-full border p-0.5"
                style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
              >
                {(['meetings', 'events'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCalTab(tab)}
                    className="flex-1 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                    style={{
                      background: calTab === tab ? 'var(--surface)' : 'transparent',
                      color: calTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                      boxShadow: calTab === tab ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      border: 0,
                    }}
                  >
                    {tab === 'meetings' ? labels.tabMeetings : labels.tabEvents}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 flex flex-col gap-2">
                {calItems.map((item, i) => (
                  <div
                    key={`${calTab}-${item.title}`}
                    className="rounded-xl border px-3 py-2.5"
                    style={{
                      borderColor: 'var(--border)',
                      background: i === 0 ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                      animation: `smengo-toast-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms backwards`,
                    }}
                  >
                    <div className="text-[12.5px] font-semibold" style={{ color: 'var(--foreground)' }}>
                      {item.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="inline-flex items-center gap-1"><Clock3 size={11} strokeWidth={2.2} />{item.time}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={11} strokeWidth={2.2} />{item.place}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DemoCard>

            {/* Leave summary */}
            <DemoCard title={labels.leaveTitle}>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl px-3 py-3" style={{ background: 'var(--accent-soft)' }}>
                  <div className="font-serif text-[26px] font-bold leading-none" style={{ color: 'var(--accent)' }}>
                    {visible ? 34 : 0}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium leading-snug" style={{ color: 'var(--muted-foreground)' }}>
                    {labels.leaveAnnual}
                  </div>
                </div>
                <div className="rounded-xl px-3 py-3" style={{ background: 'color-mix(in oklab, var(--success) 12%, transparent)' }}>
                  <div className="font-serif text-[26px] font-bold leading-none" style={{ color: 'var(--success)' }}>
                    {visible ? 2 : 0}
                  </div>
                  <div className="mt-1.5 text-[11px] font-medium leading-snug" style={{ color: 'var(--muted-foreground)' }}>
                    {labels.leaveSick}
                  </div>
                </div>
              </div>
            </DemoCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoCard({
  title, subtitle, action, children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="min-w-0 rounded-2xl border p-3.5 sm:p-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function KpiCard({
  label, value, delta, vsPrev, Icon, run,
}: {
  label: string
  value: number
  delta: number
  vsPrev: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  run: boolean
}) {
  const shown = useCountUp(value, run)
  const positive = delta >= 0
  const TrendIcon = positive ? TrendingUp : TrendingDown
  return (
    <div
      className="min-w-0 rounded-2xl border px-3.5 py-3"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2 text-[11.5px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>
        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Icon size={13} strokeWidth={2.2} />
        </span>
        <span className="line-clamp-2 min-w-0 leading-tight">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-serif text-[28px] font-bold leading-none tabular-nums" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
          {shown}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums"
          style={{
            background: positive ? 'color-mix(in oklab, var(--success) 14%, transparent)' : 'color-mix(in oklab, var(--st-alert) 13%, transparent)',
            color: positive ? 'var(--success)' : 'var(--st-alert)',
          }}
        >
          <TrendIcon size={11} strokeWidth={2.4} />
          {positive ? '+' : ''}{delta}
        </span>
      </div>
      <div className="mt-1 truncate text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{vsPrev}</div>
    </div>
  )
}

const CHART_W = 560
const CHART_H = 190
const CHART_PAD_X = 14
const CHART_PAD_Y = 18

function chartPoints(values: number[], max: number, min: number): { x: number; y: number }[] {
  const span = Math.max(1, max - min)
  return values.map((v, i) => ({
    x: CHART_PAD_X + (i * (CHART_W - CHART_PAD_X * 2)) / Math.max(1, values.length - 1),
    y: CHART_H - CHART_PAD_Y - ((v - min) / span) * (CHART_H - CHART_PAD_Y * 2),
  }))
}

function toPolyline(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function HoursChart({
  planned, actual, axis, hourSuffix, plannedLabel, actualLabel, hoverIdx, onHover,
}: {
  planned: number[]
  actual: number[]
  axis: string[]
  hourSuffix: string
  plannedLabel: string
  actualLabel: string
  hoverIdx: number | null
  onHover: (idx: number | null) => void
}) {
  const all = [...planned, ...actual]
  const max = Math.max(...all) + 8
  const min = Math.max(0, Math.min(...all) - 10)
  const plannedPts = chartPoints(planned, max, min)
  const actualPts = chartPoints(actual, max, min)
  const hovered = hoverIdx !== null && hoverIdx >= 0 && hoverIdx < planned.length ? hoverIdx : null

  return (
    <div className="min-w-0">
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`${plannedLabel} / ${actualLabel}`}
          onMouseLeave={() => onHover(null)}
        >
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={CHART_PAD_X}
              x2={CHART_W - CHART_PAD_X}
              y1={CHART_PAD_Y + (CHART_H - CHART_PAD_Y * 2) * p}
              y2={CHART_PAD_Y + (CHART_H - CHART_PAD_Y * 2) * p}
              stroke="var(--border)"
              strokeDasharray="3 5"
              strokeWidth="1"
            />
          ))}

          <polyline
            points={toPolyline(plannedPts)}
            fill="none"
            stroke="color-mix(in oklab, var(--muted-foreground) 55%, transparent)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={toPolyline(actualPts)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {actualPts.map((p, i) => (
            <g key={i}>
              {/* invisible wide hit target per column */}
              <rect
                x={p.x - (CHART_W - CHART_PAD_X * 2) / Math.max(1, planned.length - 1) / 2}
                y={0}
                width={(CHART_W - CHART_PAD_X * 2) / Math.max(1, planned.length - 1)}
                height={CHART_H}
                fill="transparent"
                onMouseEnter={() => onHover(i)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 5 : 3.4}
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth="1.6"
                style={{ transition: 'r 120ms ease' }}
              />
            </g>
          ))}

          {hovered !== null && (
            <line
              x1={actualPts[hovered].x}
              x2={actualPts[hovered].x}
              y1={CHART_PAD_Y - 6}
              y2={CHART_H - CHART_PAD_Y + 6}
              stroke="color-mix(in oklab, var(--accent) 35%, transparent)"
              strokeWidth="1"
            />
          )}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold shadow-lg"
            style={{
              left: `${(actualPts[hovered].x / CHART_W) * 100}%`,
              top: 0,
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>{actual[hovered]}{hourSuffix}</span>
            <span className="mx-1" style={{ color: 'var(--muted-foreground)' }}>·</span>
            <span style={{ color: 'var(--muted-foreground)' }}>{plannedLabel.toLowerCase()} {planned[hovered]}{hourSuffix}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between px-1 text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>
        {axis.map((m, i) => (
          <span key={m} style={{ color: hovered === i ? 'var(--accent)' : undefined }}>{m}</span>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>
          <span style={{ width: 14, height: 2.5, borderRadius: 2, background: 'var(--accent)' }} />
          {actualLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>
          <span style={{ width: 14, height: 0, borderTop: '2.5px dashed color-mix(in oklab, var(--muted-foreground) 55%, transparent)' }} />
          {plannedLabel}
        </span>
      </div>
    </div>
  )
}
