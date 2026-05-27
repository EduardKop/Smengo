'use client'

import { useEffect, useRef, useState } from 'react'
import { Settings2, Pencil, X, Check, ChevronDown } from 'lucide-react'

type Status = 'W' | 'V' | 'S' | 'D' | 'L' | '-'
type Mode = 'compact' | 'detail' | 'extended'
type DeptKey = 'all' | 'sales' | 'ops' | 'support' | 'marketing' | 'design'
type ProjectKey = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'

export type GridPreviewLabels = {
  modeDetail: string
  modeCompact: string
  modeExtended: string
  monthLabel: string
  allDepts: string
  exportBtn: string
  addEmployee: string
  employee: string
  deptSales: string
  deptOps: string
  deptSupport: string
  deptMarketing: string
  deptDesign: string
  demoDept: string
  minDay: string
  alert: string
  allOnShift: string
  statusWork: string
  statusVac: string
  statusSick: string
  statusOff: string
  statusLate: string
  statusWorkFull: string
  displayLabel: string
  highContrastLabel: string
  highlightWeekendsLabel: string
  showTimesLabel: string
  mergedLabel: string
  gridLabel: string
  days: { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string }
  projectsBtn: string
  telegramBtn: string
  editBtn: string
  editDone: string
  toastCopied: string
  toastExported: string
  toastAdded: string
  newEmployee: string
  projectBadge: string
  projectTeam: string
  projectStatus: string
  projectClose: string
  projects: Record<ProjectKey, { name: string; desc: string; tag: string }>
  months: [string, string, string, string, string]
  colOffDays: string
  colWorkHrs: string
}

const DAYS_DEMO = [
  { n: 1, k: 'thu' as const }, { n: 2, k: 'fri' as const }, { n: 3, k: 'sat' as const },
  { n: 4, k: 'sun' as const }, { n: 5, k: 'mon' as const }, { n: 6, k: 'tue' as const },
  { n: 7, k: 'wed' as const }, { n: 8, k: 'thu' as const }, { n: 9, k: 'fri' as const },
  { n: 10, k: 'sat' as const }, { n: 11, k: 'sun' as const }, { n: 12, k: 'mon' as const },
  { n: 13, k: 'tue' as const }, { n: 14, k: 'wed' as const }, { n: 15, k: 'thu' as const },
]
const MONTH_DEMO = Array.from({ length: 31 }, (_, i) => {
  const dayOfWeekIdx = (3 + i) % 7
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
  return { n: i + 1, k: keys[dayOfWeekIdx] }
})

type ShiftType = 'day' | 'night'

type EmpDef = {
  dept: Exclude<DeptKey, 'all'>
  name: string
  tg: string
  pIdx: 1 | 2 | 3 | 4 | 5 | 6
  s: string
  shift: ShiftType
}

const BASE_EMPLOYEES: EmpDef[] = [
  { dept: 'sales', name: 'Anna Petrov',   tg: '@anna_p',   pIdx: 1, s: 'DWWWWWDDWWWWWDW',  shift: 'day'   },
  { dept: 'sales', name: 'Mark Sidorov',  tg: '@mark_sid', pIdx: 2, s: 'DWWDWWWWWDWWWWD',  shift: 'night' },
  { dept: 'sales', name: 'Kate Volkova',  tg: '@kate_v',   pIdx: 3, s: 'DWWWDWWWWWDDWWW',  shift: 'day'   },
  { dept: 'ops',   name: 'Ivan Melnikov', tg: '@ivan_m',   pIdx: 1, s: 'DWDWWWWWWDWWDWW',  shift: 'night' },
  { dept: 'ops',   name: 'Daria Kos',     tg: '@daria_k',  pIdx: 2, s: 'DWWWWDWWWWWDWDW',  shift: 'day'   },
  { dept: 'ops',   name: 'Alex Novikov',  tg: '@alex_nov', pIdx: 3, s: 'DWWWWWWDDWWLWWD',  shift: 'day'   },
  { dept: 'support',   name: 'Olga Romanenko', tg: '@olga_r',  pIdx: 4, s: 'DWWWDWWWWDWWWDW',  shift: 'day'   },
  { dept: 'support',   name: 'Pavel Yurov',    tg: '@pavel_y', pIdx: 5, s: 'DWWWWWDWWWWWDDW',  shift: 'night' },
  { dept: 'marketing', name: 'Yulia Lebed',    tg: '@yulia_l', pIdx: 4, s: 'DWWDWWWWWWDWWWD',  shift: 'day'   },
  { dept: 'marketing', name: 'Roma Karpov',    tg: '@roma_k',  pIdx: 6, s: 'DWWWWDDWWLWWDWW',  shift: 'day'   },
  { dept: 'design',    name: 'Lera Tarasova',  tg: '@lera_t',  pIdx: 5, s: 'DWDWWWWWDWWWWDW',  shift: 'night' },
]

const PROJECT_CYCLES: Record<string, ProjectKey[]> = {
  'Anna Petrov':   ['p1', 'p1', 'p2', 'p2', 'p1'],
  'Mark Sidorov':  ['p3', 'p3', 'p1', 'p3', 'p2'],
  'Kate Volkova':  ['p4', 'p4', 'p4', 'p1', 'p4'],
  'Ivan Melnikov': ['p2', 'p1', 'p2', 'p2', 'p1'],
  'Daria Kos':     ['p4', 'p3', 'p4', 'p4', 'p3'],
  'Alex Novikov':  ['p1', 'p2', 'p1', 'p3', 'p1'],
  'Olga Romanenko': ['p5', 'p5', 'p6', 'p5', 'p5'],
  'Pavel Yurov':    ['p6', 'p5', 'p6', 'p6', 'p5'],
  'Yulia Lebed':    ['p4', 'p2', 'p4', 'p2', 'p4'],
  'Roma Karpov':    ['p6', 'p6', 'p2', 'p6', 'p6'],
  'Lera Tarasova':  ['p5', 'p4', 'p5', 'p5', 'p4'],
}

function rotateSchedule(s: string, offset: number): string {
  const padded = (s + 'WWWWWWWWWWWWWWW').slice(0, 15)
  const o = ((offset % 15) + 15) % 15
  return padded.slice(o) + padded.slice(0, o)
}

function projectFor(name: string, dayIdx: number): ProjectKey {
  const list = PROJECT_CYCLES[name]
  if (!list) return 'p1'
  return list[dayIdx % list.length]
}

const STATUS_OPTIONS: Exclude<Status, never>[] = ['W', 'V', 'S', 'D', 'L', '-']

export function GridPreview({ labels }: { labels: GridPreviewLabels }) {
  const [mode, setMode] = useState<Mode>('compact')
  const [contrast, setContrast] = useState(true)
  const [strongWeekend, setStrongWeekend] = useState(false)
  const [showTimes, setShowTimes] = useState(false)
  const [merged, setMerged] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showTelegram, setShowTelegram] = useState(false)
  const [monthIdx, setMonthIdx] = useState(2) // May
  const [deptFilter, setDeptFilter] = useState<DeptKey>('all')
  const [deptOpen, setDeptOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [projectModal, setProjectModal] = useState<ProjectKey | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ name: string; day: number; px: number; py: number } | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Status>>({})
  const [demoEmps, setDemoEmps] = useState<EmpDef[]>([])

  const settingsRef = useRef<HTMLDivElement | null>(null)
  const deptRef = useRef<HTMLDivElement | null>(null)
  const editCellRef = useRef<HTMLDivElement | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!settingsOpen) return
    function onDown(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [settingsOpen])

  useEffect(() => {
    if (!deptOpen) return
    function onDown(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [deptOpen])

  useEffect(() => {
    if (!editCell) return
    function onDown(e: MouseEvent) {
      if (editCellRef.current && !editCellRef.current.contains(e.target as Node)) {
        setEditCell(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [editCell])

  function showToast(text: string) {
    setToast(text)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }

  function chipBg(code: Exclude<Status, '-'>): string {
    if (contrast) {
      const map = { W: 'var(--st-work)', V: 'var(--st-vacation)', S: 'var(--st-sick)', D: 'var(--st-dayoff)', L: 'var(--st-late)' }
      return map[code]
    }
    return `var(--chip-${code.toLowerCase()}-bg)`
  }
  function chipFg(code: Exclude<Status, '-'>): string {
    if (contrast) return '#fff'
    return `var(--chip-${code.toLowerCase()}-fg)`
  }

  const weekendBg = strongWeekend ? 'var(--accent-soft)' : 'var(--grid-weekend)'
  const monthLabel = labels.months[monthIdx]
  const monthOffset = (monthIdx - 2) * 3

  const allEmps = [...BASE_EMPLOYEES, ...demoEmps]

  function statusOf(name: string, dayIdx: number, base: string): Status {
    const key = `${name}-${dayIdx}-${monthIdx}`
    if (overrides[key]) return overrides[key]
    const rotated = rotateSchedule(base, monthOffset)
    return (rotated[dayIdx] ?? 'W') as Status
  }

  function setStatusOf(name: string, dayIdx: number, s: Status) {
    setOverrides((prev) => ({ ...prev, [`${name}-${dayIdx}-${monthIdx}`]: s }))
  }

  const CHIP_LBL: Record<Exclude<Status, '-'>, string> = {
    W: labels.statusWork, V: labels.statusVac, S: labels.statusSick,
    D: labels.statusOff,  L: labels.statusLate,
  }
  const CHIP_LBL_FULL: Record<Exclude<Status, '-'>, string> = {
    W: labels.statusWorkFull, V: labels.statusVac, S: labels.statusSick,
    D: labels.statusOff, L: labels.statusLate,
  }

  function onDeptPick(d: DeptKey) {
    setDeptFilter(d)
    setDeptOpen(false)
  }

  function onAddEmployee() {
    if (demoEmps.length >= 4) return
    const idx = demoEmps.length + 1
    const tg = `@new_user${idx}`
    const template = BASE_EMPLOYEES[Math.floor(Math.random() * BASE_EMPLOYEES.length)]
    setDemoEmps((prev) => [...prev, {
      dept: 'sales',
      name: `${labels.newEmployee} ${idx}`,
      tg,
      pIdx: ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
      s: template.s,
      shift: template.shift,
    }])
    showToast(labels.toastAdded)
  }

  function onTelegramClick(tg: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tg).catch(() => {})
    }
    showToast(labels.toastCopied)
  }

  const deptOptions: { k: DeptKey; label: string }[] = [
    { k: 'all',       label: labels.allDepts },
    { k: 'sales',     label: labels.deptSales },
    { k: 'ops',       label: labels.deptOps },
    { k: 'support',   label: labels.deptSupport },
    { k: 'marketing', label: labels.deptMarketing },
    { k: 'design',    label: labels.deptDesign },
  ]

  function deptLabel(d: Exclude<DeptKey, 'all'>): string {
    return d === 'sales' ? labels.deptSales
      : d === 'ops' ? labels.deptOps
      : d === 'support' ? labels.deptSupport
      : d === 'marketing' ? labels.deptMarketing
      : labels.deptDesign
  }

  // Build groups including demo dept
  const baseDeptOrder: Exclude<DeptKey, 'all'>[] =
    deptFilter === 'all'
      ? ['sales', 'ops', 'support', 'marketing', 'design']
      : [deptFilter]

  const groups: { key: string; name: string; min?: number; rows: EmpDef[] }[] = []
  for (const d of baseDeptOrder) {
    const rows = BASE_EMPLOYEES.filter((e) => e.dept === d)
    if (rows.length === 0) continue
    groups.push({ key: d, name: deptLabel(d), min: d === 'sales' ? 3 : d === 'ops' ? 2 : undefined, rows })
  }
  if (demoEmps.length > 0 && deptFilter === 'all') {
    groups.push({ key: 'demo', name: labels.demoDept, rows: demoEmps })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Top controls: mode toggle + settings */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-border p-1"
          style={{ background: 'var(--grid-pill-bg)' }}
        >
          {(['compact', 'detail', 'extended'] as const).map((m) => {
            const lbl = m === 'detail' ? labels.modeDetail : m === 'compact' ? labels.modeCompact : labels.modeExtended
            const active = mode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {lbl}
              </button>
            )
          })}
        </div>

        <div ref={settingsRef} className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="Display settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {settingsOpen && (
            <div
              className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-border p-3 text-[13px] shadow-lg"
              style={{ background: 'var(--surface)' }}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.displayLabel}
              </div>
              <SettingRow label={labels.highContrastLabel} value={contrast} onChange={setContrast} />
              <SettingRow label={labels.highlightWeekendsLabel} value={strongWeekend} onChange={setStrongWeekend} />
              <SettingRow label={labels.showTimesLabel} value={showTimes} onChange={setShowTimes} />
              <SettingRow label={labels.mergedLabel} value={merged} onChange={setMerged} />
              <SettingRow label={labels.gridLabel} value={showGrid} onChange={setShowGrid} />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          background: 'var(--grid-cell)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.10)',
          position: 'relative',
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: 'var(--grid-chrome)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
            smengo · {monthLabel}
          </span>
        </div>

        {/* App topbar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderBottom: '1px solid var(--border)',
            background: 'var(--grid-cell)', flexWrap: 'wrap',
          }}
        >
          {/* Month pill */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--grid-pill-bg)', borderRadius: 6,
              padding: '4px 8px', fontSize: 11, fontWeight: 500,
              color: 'var(--foreground)',
            }}
          >
            <button
              type="button"
              onClick={() => setMonthIdx((m) => (m + labels.months.length - 1) % labels.months.length)}
              className="cursor-pointer hover:opacity-70"
              aria-label="Previous month"
              style={{ background: 'transparent', border: 0, padding: '0 2px', color: 'inherit' }}
            >
              ‹
            </button>
            <span>{monthLabel}</span>
            <button
              type="button"
              onClick={() => setMonthIdx((m) => (m + 1) % labels.months.length)}
              className="cursor-pointer hover:opacity-70"
              aria-label="Next month"
              style={{ background: 'transparent', border: 0, padding: '0 2px', color: 'inherit' }}
            >
              ›
            </button>
          </div>

          {/* Dept dropdown */}
          <div ref={deptRef} className="relative">
            <button
              type="button"
              onClick={() => setDeptOpen((v) => !v)}
              className="cursor-pointer hover:opacity-80"
              style={{
                background: 'var(--grid-pill-bg)', borderRadius: 6,
                padding: '4px 8px', fontSize: 11,
                color: 'var(--muted-foreground)', border: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              {deptFilter === 'all' ? labels.allDepts : deptLabel(deptFilter)}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
            {deptOpen && (
              <div
                className="absolute left-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border shadow-lg"
                style={{ background: 'var(--surface)' }}
              >
                {deptOptions.map((d) => (
                  <button
                    key={d.k}
                    type="button"
                    onClick={() => onDeptPick(d.k)}
                    className="block w-full px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-muted"
                    style={{
                      color: 'var(--foreground)',
                      background: deptFilter === d.k ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Edit toggle */}
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className="cursor-pointer transition-colors"
            style={{
              background: editMode ? 'var(--accent)' : 'var(--grid-pill-bg)',
              color: editMode ? '#fff' : 'var(--muted-foreground)',
              borderRadius: 6, padding: '4px 8px', fontSize: 11,
              border: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <Pencil style={{ width: 11, height: 11 }} />
            {editMode ? labels.editDone : labels.editBtn}
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={() => showToast(labels.toastExported)}
            className="cursor-pointer transition-colors hover:opacity-80"
            style={{
              background: 'var(--grid-pill-bg)', borderRadius: 6,
              padding: '4px 8px', fontSize: 11,
              color: 'var(--muted-foreground)', border: 0,
            }}
          >
            {labels.exportBtn}
          </button>

          {/* Add employee */}
          <button
            type="button"
            onClick={onAddEmployee}
            disabled={demoEmps.length >= 4}
            className="cursor-pointer transition-colors"
            style={{
              background: 'var(--accent)', borderRadius: 6,
              padding: '4px 8px', fontSize: 11, fontWeight: 600,
              color: '#fff', border: 0,
              opacity: demoEmps.length >= 4 ? 0.5 : 1,
              cursor: demoEmps.length >= 4 ? 'not-allowed' : 'pointer',
            }}
          >
            {labels.addEmployee}
          </button>
        </div>

        {/* Body */}
        {mode === 'compact' ? (
          <CompactGrid
            groups={groups}
            statusOf={statusOf}
            weekendBg={weekendBg}
            chipBg={chipBg}
            chipFg={chipFg}
            labels={labels}
            showTelegram={showTelegram}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            editMode={editMode}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
          />
        ) : (
          <DetailGrid
            mode={mode}
            groups={groups}
            statusOf={statusOf}
            labels={labels}
            chipLbl={CHIP_LBL}
            chipLblFull={CHIP_LBL_FULL}
            chipBg={chipBg}
            chipFg={chipFg}
            weekendBg={weekendBg}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            showTelegram={showTelegram}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            editMode={editMode}
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
          />
        )}

        {/* Success strip (replaces alert) */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: contrast ? 'rgba(74, 155, 111, 0.12)' : 'rgba(74, 155, 111, 0.08)',
            borderTop: '1px solid rgba(74, 155, 111, 0.30)',
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--success)', color: '#fff',
            }}
          >
            <Check style={{ width: 11, height: 11, strokeWidth: 3 }} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--success)' }}>
            {labels.allOnShift}
          </span>
        </div>

        {/* Cell-edit popover — fixed so it renders above overflow:hidden tables */}
        {editCell && (
          <div
            ref={editCellRef}
            className="fixed z-[9999] rounded-lg border border-border shadow-xl"
            style={{
              background: 'var(--surface)',
              padding: 6,
              top: editCell.py,
              left: editCell.px,
              transform: 'translateX(-50%)',
              animation: 'smengo-popover-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {editCell.name}
            </div>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusOf(editCell.name, editCell.day, s)
                    setEditCell(null)
                  }}
                  className="cursor-pointer transition-transform hover:scale-105"
                  style={{
                    width: 36, height: 30, border: 0, borderRadius: 5,
                    background: s === '-' ? 'var(--muted)' : chipBg(s as Exclude<Status, '-'>),
                    color: s === '-' ? 'var(--muted-foreground)' : chipFg(s as Exclude<Status, '-'>),
                    fontSize: 10, fontWeight: 600,
                  }}
                >
                  {s === '-' ? '—' : CHIP_LBL[s as Exclude<Status, '-'>]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project modal */}
        {projectModal && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: 'smengo-backdrop-in 0.22s ease-out',
            }}
            onClick={() => setProjectModal(null)}
          >
            <div
              className="rounded-xl border border-border p-5 shadow-xl"
              style={{
                background: 'var(--surface)', width: 320, maxWidth: '90%',
                animation: 'smengo-modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 999, color: 'var(--accent)',
                    background: 'var(--accent-soft)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {labels.projects[projectModal].tag}
                </span>
                <button
                  type="button"
                  onClick={() => setProjectModal(null)}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  style={{ background: 'transparent', border: 0, padding: 2 }}
                  aria-label={labels.projectClose}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <h4 className="mb-1 font-serif text-[18px] font-semibold text-foreground">
                {labels.projects[projectModal].name}
              </h4>
              <p className="text-[13px] leading-[1.55] text-muted-foreground">
                {labels.projects[projectModal].desc}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px]">
                <span style={{ color: 'var(--subtle)' }}>{labels.projectTeam}</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                  {allEmps.filter((e) => `p${e.pIdx}` === projectModal).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Toast (bottom-left of grid) */}
        {toast && (
          <div
            className="absolute z-50 rounded-lg shadow-lg"
            style={{
              left: 14, bottom: 14,
              background: 'var(--foreground)',
              color: 'var(--background)',
              padding: '9px 14px', fontSize: 12, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              animation: 'smengo-toast-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--success)', color: '#fff',
              }}
            >
              <Check style={{ width: 9, height: 9, strokeWidth: 3 }} />
            </span>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

const AVATAR_COLORS = ['#3b9b7f', '#e8a04c', '#d4604a', '#c77dc0', '#6b8cae', '#9b85c4', '#5da38c', '#cc8a4b']
function Avatar({ name, size = 18 }: { name: string; size?: number }) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const bg = AVATAR_COLORS[h % AVATAR_COLORS.length]
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5, fontWeight: 600, flexShrink: 0, lineHeight: 1,
      }}
    >
      {initial}
    </span>
  )
}

function SettingRow({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-foreground">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ background: value ? 'var(--accent)' : 'var(--muted)' }}
        aria-pressed={value}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? '18px' : '2px' }}
        />
      </button>
    </label>
  )
}

/* ── Detail / Extended mode ────────────────────────────────────── */
function DetailGrid({
  mode, groups, statusOf, labels, chipLbl, chipLblFull, chipBg, chipFg, weekendBg,
  showTimes, merged, showGrid, showTelegram, onToggleProjects, onProjectClick, editMode, onCellEdit,
}: {
  mode: Mode
  groups: { key: string; name: string; min?: number; rows: EmpDef[] }[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  labels: GridPreviewLabels
  chipLbl: Record<Exclude<Status, '-'>, string>
  chipLblFull: Record<Exclude<Status, '-'>, string>
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  weekendBg: string
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  showTelegram: boolean
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  editMode: boolean
  onCellEdit: (name: string, day: number, px: number, py: number) => void
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  const dayKey = (k: keyof GridPreviewLabels['days']) => labels.days[k]
  const isExt = mode === 'extended'
  const colW = isExt ? 80 : 52
  const colMinW = isExt ? 72 : 44
  const rowPad = isExt ? '6px 4px' : '3px 2px'
  const nameColW = isExt ? 168 : 148

  function workLabel(emp: EmpDef): string {
    if (!showTimes) return isExt ? chipLblFull.W : chipLbl.W
    return emp.shift === 'night'
      ? (isExt ? '19:00–08:00' : '19–8')
      : (isExt ? '09:00–19:00' : '9–19')
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                position: 'sticky', left: 0, zIndex: 10,
                background: 'var(--grid-cell)',
                padding: '6px 10px', width: nameColW, minWidth: nameColW,
                textAlign: 'left', fontWeight: 500,
                color: 'var(--muted-foreground)', fontSize: 10,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 7px',
                    fontSize: 9.5, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
            </th>
            {DAYS_DEMO.map((d) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              return (
                <th
                  key={d.n}
                  style={{
                    width: colW, minWidth: colMinW, padding: '4px 2px', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 11 }}>{d.n}</div>
                  <div style={{ fontSize: 9, opacity: 0.65 }}>{dayKey(d.k)}</div>
                </th>
              )
            })}
            <th style={{ width: 40, minWidth: 40, padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colOffDays}
            </th>
            <th style={{ width: 48, minWidth: 48, padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colWorkHrs}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((dept, di) => [
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '4px 10px',
                  background: 'var(--grid-dept-bg)',
                  width: nameColW, minWidth: nameColW,
                  fontSize: 10, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                ▸ {dept.name}
                {dept.min && (
                  <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: 'none' }}>
                    · {labels.minDay.replace('{n}', String(dept.min))}
                  </span>
                )}
              </td>
              <td colSpan={DAYS_DEMO.length + 2} style={{ background: 'var(--grid-dept-bg)' }} />
            </tr>,
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  style={{
                    position: 'sticky', left: 0, zIndex: 5,
                    background: 'var(--grid-cell)',
                    padding: '6px 10px', fontWeight: 500,
                    color: 'var(--foreground)', whiteSpace: 'nowrap',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={emp.name} size={18} />
                    <span>{emp.name}</span>
                    <button
                      type="button"
                      onClick={() => onProjectClick(emp.name, emp.pIdx)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        background: showTelegram ? 'rgba(56, 132, 222, 0.14)' : 'var(--accent-soft)',
                        color: showTelegram ? '#3884de' : 'var(--accent)',
                        border: 0, borderRadius: 4,
                        padding: '2px 6px', fontSize: 9.5, fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {showTelegram ? emp.tg : labels.projectBadge.replace('{n}', String(emp.pIdx))}
                    </button>
                  </div>
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  DAYS_DEMO.forEach((_d, ci) => {
                    const code = statusOf(emp.name, ci, emp.s)
                    const last = runs[runs.length - 1]
                    if (last && last.code === code) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
                  return runs.map((run, ri) => {
                    const { code, indices } = run
                    const span = indices.length
                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = DAYS_DEMO[i]; return d.k === 'sat' || d.k === 'sun' })
                    const raw = code as Exclude<Status, '-'>
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    return (
                      <td
                        key={`run-${ri}`}
                        colSpan={span}
                        onMouseEnter={() => setHoveredRun(runKey)}
                        onMouseLeave={() => setHoveredRun(null)}
                        style={{
                          padding: rowPad, textAlign: 'center',
                          position: 'relative',
                          background: allWkd ? weekendBg : 'var(--grid-cell)',
                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
                        {!isOff && (isExt ? (
                          <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                            background: chipBg(raw), color: chipFg(raw),
                            padding: '5px 7px', borderRadius: 5,
                            fontSize: 10, fontWeight: 600, lineHeight: 1.15, textAlign: 'left',
                          }}>
                            <span style={{ fontSize: code === 'W' && showTimes ? 9 : 10.5, fontWeight: 600 }}>
                              {code === 'W' ? workLabel(emp) : chipLblFull[raw]}
                            </span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: chipBg(raw), color: chipFg(raw),
                            padding: '1px 5px', borderRadius: 3,
                            fontSize: code === 'W' && showTimes ? 8 : 9.5,
                            fontWeight: 500, whiteSpace: 'nowrap',
                          }}>
                            {code === 'W' ? workLabel(emp) : chipLbl[raw]}
                          </div>
                        ))}
                      </td>
                    )
                  })
                })() : DAYS_DEMO.map((d, ci) => {
                  const raw = statusOf(emp.name, ci, emp.s)
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = raw === '-' || raw === undefined
                  const cellInteractive = editMode
                  return (
                    <td
                      key={d.n}
                      onClick={cellInteractive ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci, r.left + r.width / 2, r.bottom + 6)
                      } : undefined}
                      style={{
                        padding: rowPad, textAlign: 'center',
                        background: isWkd ? weekendBg : 'var(--grid-cell)',
                        position: 'relative',
                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
                        outline: editMode ? '1px dashed var(--accent)' : 'none',
                        outlineOffset: editMode ? -2 : 0,
                        cursor: cellInteractive ? 'pointer' : 'default',
                      }}
                    >
                      {isOff ? (
                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
                      ) : isExt ? (
                        <div
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                            background: chipBg(raw as Exclude<Status, '-'>),
                            color: chipFg(raw as Exclude<Status, '-'>),
                            padding: '5px 7px', borderRadius: 5,
                            fontSize: 10, fontWeight: 600, lineHeight: 1.15,
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: raw === 'W' && showTimes ? 9 : 10.5, fontWeight: 600 }}>
                            {raw === 'W' ? workLabel(emp) : chipLblFull[raw as Exclude<Status, '-'>]}
                          </span>
                          {raw === 'W' && (
                            <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.88, marginTop: 1 }}>
                              {labels.projects[projectFor(emp.name, ci)].name}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: chipBg(raw as Exclude<Status, '-'>),
                            color: chipFg(raw as Exclude<Status, '-'>),
                            padding: '1px 5px', borderRadius: 3,
                            fontSize: raw === 'W' && showTimes ? 8 : 9.5,
                            fontWeight: 500, whiteSpace: 'nowrap',
                          }}
                        >
                          {raw === 'W' ? workLabel(emp) : chipLbl[raw as Exclude<Status, '-'>]}
                        </div>
                      )}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  DAYS_DEMO.forEach((_d, ci) => {
                    const s = statusOf(emp.name, ci, emp.s)
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W' || s === 'L') work++
                  })
                  const hrs = work * (emp.shift === 'night' ? 13 : 10)
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: 48, minWidth: 48, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}h` : '—'}</span>
                      </td>
                    </>
                  )
                })()}
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  )
}

/* ── Compact mode ──────────────────────────────────────────────── */
function CompactGrid({
  groups, statusOf, weekendBg, chipBg, chipFg, labels,
  showTimes, merged, showGrid, showTelegram, editMode, onToggleProjects, onProjectClick, onCellEdit,
}: {
  groups: { key: string; name: string; min?: number; rows: EmpDef[] }[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  weekendBg: string
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  labels: GridPreviewLabels
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  showTelegram: boolean
  editMode: boolean
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  onCellEdit: (name: string, day: number, px: number, py: number) => void
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 10 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                position: 'sticky', left: 0, zIndex: 10,
                background: 'var(--grid-cell)',
                padding: '6px 10px', width: 168, minWidth: 168,
                textAlign: 'left', fontWeight: 500,
                color: 'var(--muted-foreground)', fontSize: 9.5,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 6px',
                    fontSize: 9, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
            </th>
            {MONTH_DEMO.map((d) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              return (
                <th
                  key={d.n}
                  style={{
                    width: 22, minWidth: 22, padding: '4px 0', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                    fontWeight: 500, fontSize: 9.5,
                  }}
                >
                  {d.n}
                </th>
              )
            })}
            <th style={{ width: 40, minWidth: 40, padding: '4px 4px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colOffDays}
            </th>
            <th style={{ width: 46, minWidth: 46, padding: '4px 4px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colWorkHrs}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((dept, di) => [
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '3px 10px',
                  background: 'var(--grid-dept-bg)',
                  width: 168, minWidth: 168,
                  fontSize: 9.5, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                ▸ {dept.name}
              </td>
              <td colSpan={MONTH_DEMO.length + 2} style={{ background: 'var(--grid-dept-bg)' }} />
            </tr>,
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  style={{
                    position: 'sticky', left: 0, zIndex: 5,
                    background: 'var(--grid-cell)',
                    padding: '3px 10px', fontWeight: 500,
                    color: 'var(--foreground)', whiteSpace: 'nowrap', fontSize: 11,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={emp.name} size={16} />
                      <span className="truncate">{emp.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onProjectClick(emp.name, emp.pIdx)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        background: showTelegram ? 'rgba(56, 132, 222, 0.14)' : 'var(--accent-soft)',
                        color: showTelegram ? '#3884de' : 'var(--accent)',
                        border: 0, borderRadius: 4,
                        padding: '1px 5px', fontSize: 9, fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {showTelegram ? emp.tg : labels.projectBadge.replace('{n}', String(emp.pIdx))}
                    </button>
                  </div>
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  MONTH_DEMO.forEach((_d, ci) => {
                    const code = statusOf(emp.name, ci % 15, emp.s)
                    const last = runs[runs.length - 1]
                    if (last && last.code === code) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
                  return runs.map((run, ri) => {
                    const { code, indices } = run
                    const span = indices.length
                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = MONTH_DEMO[i]; return d.k === 'sat' || d.k === 'sun' })
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    return (
                      <td
                        key={`run-${ri}`}
                        colSpan={span}
                        onMouseEnter={() => setHoveredRun(runKey)}
                        onMouseLeave={() => setHoveredRun(null)}
                        style={{
                          padding: '2px 1px',
                          position: 'relative',
                          background: allWkd ? weekendBg : 'var(--grid-cell)',
                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
                        {!isOff && (
                          <div style={{
                            background: chipBg(code as Exclude<Status, '-'>),
                            color: chipFg(code as Exclude<Status, '-'>),
                            borderRadius: 4,
                            fontSize: code === 'W' && showTimes ? 7.5 : 9,
                            fontWeight: 600,
                            padding: '3px 4px',
                            lineHeight: 1.1,
                            textAlign: 'center',
                          }}>
                            {code === 'W' && showTimes
                              ? (emp.shift === 'night' ? '19–8' : '9–19')
                              : code}
                          </div>
                        )}
                      </td>
                    )
                  })
                })() : MONTH_DEMO.map((d, ci) => {
                  const code = statusOf(emp.name, ci % 15, emp.s)
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = code === '-' || code === undefined
                  return (
                    <td
                      key={d.n}
                      onClick={editMode ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci % 15, r.left + r.width / 2, r.bottom + 4)
                      } : undefined}
                      style={{
                        padding: 2, textAlign: 'center',
                        background: isWkd ? weekendBg : 'var(--grid-cell)',
                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
                        outline: editMode ? '1px dashed var(--accent)' : 'none',
                        outlineOffset: editMode ? -1 : 0,
                        cursor: editMode ? 'pointer' : 'default',
                      }}
                    >
                      {isOff ? (
                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
                      ) : (
                        <div
                          style={{
                            background: chipBg(code as Exclude<Status, '-'>),
                            color: chipFg(code as Exclude<Status, '-'>),
                            borderRadius: 3,
                            fontSize: code === 'W' && showTimes ? 7.5 : 9,
                            fontWeight: 600,
                            padding: '2px 0', lineHeight: 1.1,
                          }}
                        >
                          {code === 'W' && showTimes
                            ? (emp.shift === 'night' ? '19–8' : '9–19')
                            : code}
                        </div>
                      )}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  MONTH_DEMO.forEach((_d, ci) => {
                    const s = statusOf(emp.name, ci % 15, emp.s)
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W' || s === 'L') work++
                  })
                  const hrs = work * (emp.shift === 'night' ? 13 : 10)
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: 46, minWidth: 46, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}h` : '—'}</span>
                      </td>
                    </>
                  )
                })()}
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  )
}
