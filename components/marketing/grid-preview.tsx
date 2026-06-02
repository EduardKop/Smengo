'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  Settings2, Pencil, X, Check, ChevronDown, RotateCcw,
  Sun, Sunset, Moon, TreePalm, Thermometer, AlertCircle, AlertTriangle,
  Palette,
} from 'lucide-react'
import { ClassicGrid } from './classic-grid'
import {
  RolePickerModal, AddSectionModal,
  ROLE_COLORS, type CustomSection, type RoleOrSectionKey,
} from './grid-shared'

export type Status = 'W' | 'V' | 'S' | 'D' | 'U' | '-'
export type Mode = 'compact' | 'detail' | 'extended'
export type DeptKey = 'all' | 'sales' | 'ops' | 'support' | 'marketing' | 'design'
export type ProjectKey = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
export type ShiftType = 'morning' | 'evening' | 'night'
export type RoleKey =
  | 'waiter' | 'host' | 'barista'
  | 'cook' | 'souschef' | 'pastry'
  | 'floormanager' | 'shiftlead'
  | 'cashier' | 'courier'
export type ShiftKey = 'morning' | 'evening' | 'night' | 'dayoff' | 'vacation' | 'sick' | 'unfilled'

// Day index that highlights a coverage gap (Wed, day 14)
export const PROBLEM_DAY_IDX = 13

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
  coverageSummary: string
  statusWork: string
  statusVac: string
  statusSick: string
  statusOff: string
  statusUncovered: string
  statusWorkFull: string
  shiftMorning: string
  shiftEvening: string
  shiftNight: string
  shortageBadge: string
  shortageLabel: string
  hourSuffix: string
  displayLabel: string
  highContrastLabel: string
  highlightWeekendsLabel: string
  showTimesLabel: string
  mergedLabel: string
  gridLabel: string
  stickyLabel: string
  timerLabel: string
  todayLabel: string
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
  roles: Record<RoleKey, string>
  shifts: Record<ShiftKey, string>
  coverageGap: string
  months: [string, string, string, string, string]
  colOffDays: string
  colWorkHrs: string
  chromeOnShift: string
  chromeOffToday: string
  chromeToday: string
  themeLabel: string
  themeStandard: string
  themeClassic: string
  classicTeams: string
  classicAbsence: string
  classicAll: string
  classicSearch: string
  addSectionBtn: string
  addSectionTitle: string
  sectionNameLabel: string
  sectionNamePlaceholder: string
  colorLabel: string
  previewLabel: string
  gradientLabel: string
  stdColorsLabel: string
  gradientsLabel: string
  customColorLabel: string
  createBtn: string
  cancelBtn: string
  changeRoleTitle: string
  customBadge: string
  resetBtn: string
  showRolesLabel: string
  empCalendarTitle: string
  empCalendarClose: string
  empCalendarLegendWork: string
  empCalendarLegendOff: string
  empCalendarLegendVacation: string
  empCalendarLegendSick: string
  empCalendarLegendDayoff: string
  empCalendarSummaryWorked: string
  empCalendarSummaryOff: string
  empCalendarSummaryHours: string
}

export const MONTH_DEMO = Array.from({ length: 31 }, (_, i) => {
  const dayOfWeekIdx = (3 + i) % 7
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
  return { n: i + 1, k: keys[dayOfWeekIdx] }
})

export type EmpDef = {
  dept: Exclude<DeptKey, 'all'>
  name: string
  tg: string
  pIdx: 1 | 2 | 3 | 4 | 5 | 6
  roleKey: RoleKey
  s: string
  shift: ShiftType
}

// Schedule strings are 15 chars. Index 13 (=day 14 Wed) is highlighted as a coverage gap.
// Mix is tuned for realism: ~63% W, ~26% D, ~9% V, ~1% S, ~1% U.
export const BASE_EMPLOYEES: EmpDef[] = [
  { dept: 'sales',     name: 'Anna Petrov',     tg: '@anna_p',   pIdx: 1, roleKey: 'waiter',       s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Mark Sidorov',    tg: '@mark_s',   pIdx: 2, roleKey: 'host',         s: 'WWDDWWWWWDDSSW', shift: 'evening' },
  { dept: 'sales',     name: 'Kate Volkova',    tg: '@kate_v',   pIdx: 1, roleKey: 'barista',      s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'ops',       name: 'Ivan Melnikov',   tg: '@ivan_m',   pIdx: 3, roleKey: 'cook',         s: 'WWDDWWDDWWDDWW', shift: 'night'   },
  { dept: 'ops',       name: 'Daria Kos',       tg: '@daria_k',  pIdx: 1, roleKey: 'souschef',     s: 'WWDDWWWWWDDWWU', shift: 'morning' },
  { dept: 'ops',       name: 'Alex Novikov',    tg: '@alex_n',   pIdx: 2, roleKey: 'pastry',       s: 'WWDDVVVVVVVWWU', shift: 'evening' },
  { dept: 'support',   name: 'Olga Romanenko',  tg: '@olga_r',   pIdx: 1, roleKey: 'floormanager', s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'support',   name: 'Pavel Yurov',     tg: '@pavel_y',  pIdx: 6, roleKey: 'shiftlead',    s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'marketing', name: 'Yulia Lebed',     tg: '@yulia_l',  pIdx: 5, roleKey: 'cashier',      s: 'WWDDWWWWWDDWWW', shift: 'evening' },
  { dept: 'marketing', name: 'Roma Karpov',     tg: '@roma_k',   pIdx: 5, roleKey: 'cashier',      s: 'WWDDWWWWVVVVVV', shift: 'morning' },
  { dept: 'design',    name: 'Lera Tarasova',   tg: '@lera_t',   pIdx: 4, roleKey: 'courier',      s: 'WWDDWWWWWDDWWW', shift: 'morning' },
]

export function rotateSchedule(s: string, offset: number): string {
  const padded = (s + 'WWWWWWWWWWWWWW').slice(0, 14)
  const o = ((offset % 14) + 14) % 14
  return padded.slice(o) + padded.slice(0, o)
}

const STATUS_OPTIONS: Exclude<Status, never>[] = ['W', 'V', 'S', 'D', 'U', '-']

export type WorkMeta = {
  bg: string
  name: string
  hours: number
  window: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
}

export function workMeta(shift: ShiftType, labels: GridPreviewLabels): WorkMeta {
  if (shift === 'morning') {
    return { bg: 'var(--st-work-morning)', name: labels.shiftMorning, hours: 8, window: '09–17', Icon: Sun }
  }
  if (shift === 'evening') {
    return { bg: 'var(--st-work-evening)', name: labels.shiftEvening, hours: 8, window: '14–22', Icon: Sunset }
  }
  return { bg: 'var(--st-work-night)', name: labels.shiftNight, hours: 10, window: '22–08', Icon: Moon }
}

function statusIcon(code: Status): ComponentType<{ size?: number; style?: React.CSSProperties }> | null {
  if (code === 'V') return TreePalm
  if (code === 'S') return Thermometer
  if (code === 'U') return AlertCircle
  return null
}

// Dashed orange edge marking the problem column. Applied per-cell so it scrolls naturally.
function problemColumnStyle(ci: number): React.CSSProperties {
  if (ci !== PROBLEM_DAY_IDX) return {}
  return {
    borderLeft: '1.5px dashed var(--accent)',
    borderRight: '1.5px dashed var(--accent)',
    background: 'rgba(217,119,87,0.08)',
  }
}

// Tooltip text for a cell — derives from status code + shift type.
function cellTooltip(code: Status, shift: ShiftType, labels: GridPreviewLabels): string {
  if (code === 'V') return labels.shifts.vacation
  if (code === 'S') return labels.shifts.sick
  if (code === 'D') return labels.shifts.dayoff
  if (code === 'U') return labels.shifts.unfilled
  if (code === 'W') return labels.shifts[shift]
  return ''
}

export function GridPreview({ labels }: { labels: GridPreviewLabels }) {
  const [mode, setMode] = useState<Mode>('compact')
  const [contrast, setContrast] = useState(true)
  const [strongWeekend, setStrongWeekend] = useState(false)
  const [showTimes, setShowTimes] = useState(true)
  const [merged, setMerged] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [sticky, setSticky] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const [showToday, setShowToday] = useState(true)
  const [theme, setTheme] = useState<'standard' | 'classic'>('standard')
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement | null>(null)
  const [showTelegram, setShowTelegram] = useState(false)
  const [showRoleChips, setShowRoleChips] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null)
  const [monthIdx, setMonthIdx] = useState(2) // May
  const [deptFilter, setDeptFilter] = useState<DeptKey>('all')
  const [deptOpen, setDeptOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [projectModal, setProjectModal] = useState<ProjectKey | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ name: string; day: number; px: number; py: number } | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Status>>({})
  const [demoEmps, setDemoEmps] = useState<EmpDef[]>([])

  // Custom sections + role overrides + custom order per employee (persisted)
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [empRoleOverrides, setEmpRoleOverrides] = useState<Record<string, RoleOrSectionKey>>({})
  const [empOrder, setEmpOrder] = useState<string[]>([])
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [dragEmp, setDragEmp] = useState<string | null>(null)
  const [dragOverEmp, setDragOverEmp] = useState<string | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  // Persist to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('smengo:demo:gridState')
      if (!raw) return
      const parsed = JSON.parse(raw) as { sections?: CustomSection[]; overrides?: Record<string, RoleOrSectionKey>; order?: string[] }
      if (parsed.sections) setCustomSections(parsed.sections)
      if (parsed.overrides) setEmpRoleOverrides(parsed.overrides)
      if (parsed.order) setEmpOrder(parsed.order)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('smengo:demo:gridState', JSON.stringify({
        sections: customSections,
        overrides: empRoleOverrides,
        order: empOrder,
      }))
    } catch { /* ignore */ }
  }, [customSections, empRoleOverrides, empOrder])

  function getEmpRoleKey(emp: EmpDef): RoleOrSectionKey {
    return empRoleOverrides[emp.name] ?? emp.roleKey
  }
  function getRoleLabel(key: RoleOrSectionKey): string {
    if (typeof key === 'string' && key.startsWith('cs:')) {
      return customSections.find((c) => c.key === key)?.name ?? key
    }
    return labels.roles[key as RoleKey] ?? String(key)
  }
  function getRoleColor(key: RoleOrSectionKey): string {
    if (typeof key === 'string' && key.startsWith('cs:')) {
      return customSections.find((c) => c.key === key)?.color ?? 'var(--muted-foreground)'
    }
    return ROLE_COLORS[key as RoleKey] ?? 'var(--muted-foreground)'
  }
  function onPickRole(empName: string, key: RoleOrSectionKey) {
    setEmpRoleOverrides((prev) => ({ ...prev, [empName]: key }))
  }
  function onCreateSection(section: CustomSection) {
    setCustomSections((prev) => [...prev, section])
  }
  function handleReset() {
    try { localStorage.removeItem('smengo:demo:gridState') } catch { /* ignore */ }
    setCustomSections([])
    setEmpRoleOverrides({})
    setEmpOrder([])
    setMode('compact')
    setTheme('standard')
    setContrast(true)
    setStrongWeekend(false)
    setShowTimes(true)
    setMerged(false)
    setShowGrid(false)
    setSticky(true)
    setShowTimer(true)
    setShowToday(true)
    setShowRoleChips(false)
    setSelectedEmp(null)
    setMonthIdx(2)
    setDeptFilter('all')
    setEditMode(false)
    setOverrides({})
  }
  function onMoveEmp(srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) {
    if (!srcName) return
    // Update role if dropping on a different group
    if (targetGroupKey !== null) {
      setEmpRoleOverrides((prev) => ({ ...prev, [srcName]: targetGroupKey }))
    }
    // Update order: place src right before/at target name (or end if null)
    setEmpOrder((prev) => {
      const everyone = [...BASE_EMPLOYEES.map((e) => e.name), ...demoEmps.map((e) => e.name)]
      const base = prev.length ? prev.filter((n) => everyone.includes(n)) : everyone.slice()
      const withoutSrc = base.filter((n) => n !== srcName)
      if (targetName && targetName !== srcName) {
        const idx = withoutSrc.indexOf(targetName)
        if (idx >= 0) {
          withoutSrc.splice(idx, 0, srcName)
          return withoutSrc
        }
      }
      withoutSrc.push(srcName)
      return withoutSrc
    })
  }

  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSec, setTimerSec] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const settingsRef = useRef<HTMLDivElement | null>(null)
  const deptRef = useRef<HTMLDivElement | null>(null)
  const editCellRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!timerRunning) return
    const id = window.setInterval(() => setTimerSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [timerRunning])

  useEffect(() => {
    if (!notifOpen) return
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [notifOpen])

  useEffect(() => {
    if (!userOpen) return
    function onDown(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userOpen])

  function fmtTime(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }

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
    if (!themeOpen) return
    function onDown(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [themeOpen])

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
    if (code === 'D') return 'var(--chip-d-bg)'
    if (contrast) {
      const map = {
        W: 'var(--st-work)',
        V: 'var(--st-vacation)',
        S: 'var(--st-sick)',
        D: 'var(--chip-d-bg)',
        U: 'var(--st-uncovered)',
      }
      return map[code]
    }
    return `var(--chip-${code.toLowerCase()}-bg)`
  }
  function chipFg(code: Exclude<Status, '-'>): string {
    if (code === 'D') return 'var(--chip-d-fg)'
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
    D: labels.statusOff,  U: labels.statusUncovered,
  }
  const CHIP_LBL_FULL: Record<Exclude<Status, '-'>, string> = {
    W: labels.statusWorkFull, V: labels.statusVac, S: labels.statusSick,
    D: labels.statusOff, U: labels.statusUncovered,
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
      roleKey: 'waiter',
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

  // Build role-based groups (respecting dept filter)
  const flatEmps: EmpDef[] = []
  for (const d of baseDeptOrder) {
    for (const e of BASE_EMPLOYEES) if (e.dept === d) flatEmps.push(e)
  }
  if (demoEmps.length > 0 && deptFilter === 'all') flatEmps.push(...demoEmps)
  // Apply custom order (if set)
  const orderedEmps: EmpDef[] = empOrder.length
    ? (() => {
        const map = new Map(flatEmps.map((e) => [e.name, e]))
        const out: EmpDef[] = []
        for (const n of empOrder) { const e = map.get(n); if (e) { out.push(e); map.delete(n) } }
        for (const e of map.values()) out.push(e)
        return out
      })()
    : flatEmps
  const roleOrderSt: RoleOrSectionKey[] = []
  const roleGroupMapSt = new Map<RoleOrSectionKey, EmpDef[]>()
  for (const emp of orderedEmps) {
    const rk = getEmpRoleKey(emp)
    if (!roleGroupMapSt.has(rk)) {
      roleOrderSt.push(rk)
      roleGroupMapSt.set(rk, [])
    }
    roleGroupMapSt.get(rk)!.push(emp)
  }
  // Append empty custom sections (so user can drop into them)
  for (const cs of customSections) {
    if (!roleGroupMapSt.has(cs.key)) {
      roleOrderSt.push(cs.key)
      roleGroupMapSt.set(cs.key, [])
    }
  }
  const groups: { key: string; name: string; min?: number; rows: EmpDef[] }[] =
    roleOrderSt.map((rk) => ({ key: String(rk), name: getRoleLabel(rk), rows: roleGroupMapSt.get(rk)! }))

  return (
    <div style={{ position: 'relative' }}>
      {/* Top controls: mode toggle + settings */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div
          data-mode-pill
          className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-border p-1 sm:w-auto"
          style={{ background: 'var(--grid-pill-bg)' }}
        >
          {(['compact', 'detail', 'extended'] as const).map((m) => {
            const lbl = m === 'detail' ? labels.modeDetail : m === 'compact' ? labels.modeCompact : labels.modeExtended
            const active = mode === m
            return (
              <button
                key={m}
                type="button"
                data-active={active}
                onClick={() => setMode(m)}
                className="flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors sm:flex-none sm:px-4"
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

        <div className="flex items-center gap-2">

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
              className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-border p-3 text-[13px] shadow-lg max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
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
              <SettingRow label={labels.stickyLabel} value={sticky} onChange={setSticky} />
              <SettingRow label={labels.timerLabel} value={showTimer} onChange={setShowTimer} />
              <SettingRow label={labels.todayLabel} value={showToday} onChange={setShowToday} />
              <SettingRow label={labels.showRolesLabel} value={showRoleChips} onChange={setShowRoleChips} />
            </div>
          )}
        </div>

        <div ref={themeRef} className="relative">
          <button
            type="button"
            onClick={() => setThemeOpen((v) => !v)}
            aria-label="Theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <Palette className="h-4 w-4" />
          </button>
          {themeOpen && (
            <div
              className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-border p-2 text-[13px] shadow-lg max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
              style={{ background: 'var(--surface)' }}
            >
              <div className="mb-1 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.themeLabel}
              </div>
              {(['standard', 'classic'] as const).map((t) => {
                const active = theme === t
                const isClassic = t === 'classic'
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTheme(t); setThemeOpen(false) }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
                    style={{
                      background: active ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    <span
                      style={isClassic
                        ? {
                            fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
                            fontSize: 15, fontWeight: 500,
                            color: '#1a1f2e',
                            background: '#ffffff',
                            border: '1px solid #e3e6ea',
                            padding: '2px 10px', borderRadius: 4,
                            letterSpacing: '-0.01em',
                          }
                        : {
                            fontFamily: 'inherit',
                            fontSize: 13, fontWeight: 600,
                            color: 'var(--accent)',
                            letterSpacing: '0.01em',
                          }
                      }
                    >
                      {isClassic ? labels.themeClassic : labels.themeStandard}
                    </span>
                    {active && <Check className="h-4 w-4" style={{ color: 'var(--accent)' }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

          <button
            type="button"
            onClick={handleReset}
            title={labels.resetBtn}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {theme === 'classic' ? (
        <ClassicGrid
          labels={labels}
          mode={mode}
          monthIdx={monthIdx}
          setMonthIdx={setMonthIdx}
          deptFilter={deptFilter}
          showTimer={showTimer}
          showToday={showToday}
          contrast={contrast}
          strongWeekend={strongWeekend}
          showTimes={showTimes}
          merged={merged}
          showGrid={showGrid}
          sticky={sticky}
          customSections={customSections}
          empRoleOverrides={empRoleOverrides}
          empOrder={empOrder}
          getEmpRoleKey={getEmpRoleKey}
          getRoleLabel={getRoleLabel}
          getRoleColor={getRoleColor}
          onOpenRolePicker={(name) => setRolePickerFor(name)}
          onOpenAddSection={() => setAddSectionOpen(true)}
          onReset={handleReset}
          onMoveEmp={onMoveEmp}
          dragEmp={dragEmp}
          setDragEmp={setDragEmp}
          dragOverEmp={dragOverEmp}
          setDragOverEmp={setDragOverEmp}
          dragOverGroup={dragOverGroup}
          setDragOverGroup={setDragOverGroup}
        />
      ) : (
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
        {/* Default chrome bar - hidden on mobile (decorative) */}
        <div className="hidden sm:contents">
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: 'var(--grid-chrome)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
            smengo · {monthLabel}
          </span>
          {showToday && (() => {
            let onShift = 0, offToday = 0
            for (const emp of allEmps) {
              const s = statusOf(emp.name, PROBLEM_DAY_IDX % 14, emp.s)
              if (s === 'W') onShift++
              else if (s === 'V' || s === 'S' || s === 'D') offToday++
            }
            return (
              <span
                style={{
                  marginLeft: 14,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 11,
                  background: 'var(--grid-cell)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{labels.chromeToday}</span>
                <span style={{ width: 1, height: 10, background: 'var(--border)' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-work)' }} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{onShift}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{labels.chromeOnShift}</span>
                </span>
                <span style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--chip-d-bg)', border: '1px solid var(--border)' }} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{offToday}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{labels.chromeOffToday}</span>
                </span>
              </span>
            )
          })()}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {showTimer && (
            <>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13, fontWeight: 600, letterSpacing: 1,
                color: timerRunning ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.2s',
              }}
            >
              {fmtTime(timerSec)}
            </span>
            <button
              type="button"
              onClick={() => setTimerRunning((v) => !v)}
              aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
              className="cursor-pointer transition-transform hover:scale-110"
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: timerRunning ? '#e0a93a' : '#28c840',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: timerRunning ? '0 1px 3px rgba(224,169,58,.4)' : '0 1px 3px rgba(40,200,64,.35)',
                border: 0, padding: 0,
              }}
            >
              {timerRunning ? (
                <svg width="8" height="9" viewBox="0 0 8 9" fill="#fff">
                  <rect x="1" y="0.5" width="2" height="8" rx="0.5" />
                  <rect x="5" y="0.5" width="2" height="8" rx="0.5" />
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 8 8" fill="#fff" style={{ marginLeft: 1 }}>
                  <path d="M1 0.5 L7 4 L1 7.5 Z" />
                </svg>
              )}
            </button>
            </>
            )}

            <div ref={notifRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onClick={() => { setNotifOpen((v) => !v); setUserOpen(false) }}
                aria-label="Notifications"
                className="cursor-pointer transition-colors hover:opacity-80"
                style={{
                  background: 'transparent', border: 0, padding: 2,
                  display: 'inline-flex', alignItems: 'center', position: 'relative',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span style={{
                  position: 'absolute', top: 1, right: 1,
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 0 1.5px var(--grid-chrome)',
                }} />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 z-30 mt-2 rounded-xl border border-border shadow-lg"
                  style={{
                    top: '100%', background: 'var(--surface)',
                    width: 260, padding: 8, fontSize: 12,
                  }}
                >
                  <div style={{
                    padding: '6px 8px 8px',
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--muted-foreground)',
                  }}>
                    {labels.shortageLabel}
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, padding: '8px',
                    borderRadius: 6, background: 'var(--accent-soft)',
                    color: 'var(--foreground)', lineHeight: 1.35,
                  }}>
                    <AlertCircle style={{ width: 14, height: 14, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                    <span>{labels.coverageSummary}</span>
                  </div>
                </div>
              )}
            </div>

            <div ref={userRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onClick={() => { setUserOpen((v) => !v); setNotifOpen(false) }}
                aria-label="User menu"
                className="cursor-pointer transition-transform hover:scale-105"
                style={{ background: 'transparent', border: 0, padding: 0, borderRadius: '50%' }}
              >
                <Avatar name="Olga Romanenko" size={22} />
              </button>
              {userOpen && (
                <div
                  className="absolute right-0 z-30 mt-2 rounded-xl border border-border shadow-lg"
                  style={{
                    top: '100%', background: 'var(--surface)',
                    width: 200, padding: 10, fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <Avatar name="Olga Romanenko" size={28} />
                    <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: 12 }}>Olga Romanenko</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>olga@smengo.app</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    {[labels.editBtn, labels.exportBtn].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setUserOpen(false)}
                        className="block w-full text-left cursor-pointer transition-colors hover:bg-muted rounded"
                        style={{
                          background: 'transparent', border: 0,
                          padding: '6px 8px', fontSize: 12, color: 'var(--foreground)',
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>


        {/* App topbar */}
        <div
          data-grid-topbar
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

          {/* Add Section - hidden on mobile to reduce clutter */}
          <button
            type="button"
            onClick={() => setAddSectionOpen(true)}
            className="hidden cursor-pointer transition-colors hover:opacity-80 sm:inline-block"
            style={{
              background: 'var(--grid-pill-bg)', borderRadius: 6,
              padding: '4px 8px', fontSize: 11,
              color: 'var(--muted-foreground)', border: 0,
            }}
          >
            {labels.addSectionBtn}
          </button>

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
            contrast={contrast}
            labels={labels}
            showTelegram={showTelegram}
            showRoleChips={showRoleChips}
            onEmpClick={(name) => setSelectedEmp(name)}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            sticky={sticky}
            editMode={editMode}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
            getEmpRoleKey={getEmpRoleKey}
            getRoleLabel={getRoleLabel}
            getRoleColor={getRoleColor}
            onOpenRolePicker={(name) => setRolePickerFor(name)}
            dragEmp={dragEmp}
            setDragEmp={setDragEmp}
            dragOverEmp={dragOverEmp}
            setDragOverEmp={setDragOverEmp}
            dragOverGroup={dragOverGroup}
            setDragOverGroup={setDragOverGroup}
            onMoveEmp={onMoveEmp}
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
            contrast={contrast}
            weekendBg={weekendBg}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            sticky={sticky}
            showTelegram={showTelegram}
            showRoleChips={showRoleChips}
            onEmpClick={(name) => setSelectedEmp(name)}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            editMode={editMode}
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
            getEmpRoleKey={getEmpRoleKey}
            getRoleLabel={getRoleLabel}
            getRoleColor={getRoleColor}
            onOpenRolePicker={(name) => setRolePickerFor(name)}
            dragEmp={dragEmp}
            setDragEmp={setDragEmp}
            dragOverEmp={dragOverEmp}
            setDragOverEmp={setDragOverEmp}
            dragOverGroup={dragOverGroup}
            setDragOverGroup={setDragOverGroup}
            onMoveEmp={onMoveEmp}
          />
        )}

        {/* Coverage summary strip */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: contrast ? 'rgba(224, 155, 58, 0.12)' : 'rgba(224, 155, 58, 0.08)',
            borderTop: '1px solid rgba(224, 155, 58, 0.30)',
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--warning)', color: '#fff',
            }}
          >
            <AlertTriangle style={{ width: 10, height: 10, strokeWidth: 2.5 }} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--warning)' }}>
            {labels.coverageSummary}
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
      )}

      {/* Role picker modal (themed) */}
      {rolePickerFor && (
        <RolePickerModal
          theme={theme}
          labels={labels}
          empName={rolePickerFor}
          currentKey={getEmpRoleKey(allEmps.find((e) => e.name === rolePickerFor) ?? BASE_EMPLOYEES[0])}
          customSections={customSections}
          onPick={(key) => onPickRole(rolePickerFor, key)}
          onClose={() => setRolePickerFor(null)}
        />
      )}
      {addSectionOpen && (
        <AddSectionModal
          theme={theme}
          labels={labels}
          onCreate={onCreateSection}
          onClose={() => setAddSectionOpen(false)}
        />
      )}

      {/* Employee calendar overlay (themed, animated) */}
      <EmployeeCalendarOverlay
        empName={selectedEmp}
        emp={allEmps.find((e) => e.name === selectedEmp) ?? null}
        monthLabel={monthLabel}
        labels={labels}
        statusOf={statusOf}
        getEmpRoleKey={getEmpRoleKey}
        getRoleLabel={getRoleLabel}
        getRoleColor={getRoleColor}
        onClose={() => setSelectedEmp(null)}
      />
    </div>
  )
}

export const AVATAR_COLORS = ['#3b9b7f', '#e8a04c', '#d4604a', '#c77dc0', '#6b8cae', '#9b85c4', '#5da38c', '#cc8a4b']
export function Avatar({ name, size = 18 }: { name: string; size?: number }) {
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

/* ── Employee calendar overlay ─────────────────────────────────── */
function EmployeeCalendarOverlay({
  empName, emp, monthLabel, labels, statusOf,
  getEmpRoleKey, getRoleLabel, getRoleColor, onClose,
}: {
  empName: string | null
  emp: EmpDef | null
  monthLabel: string
  labels: GridPreviewLabels
  statusOf: (name: string, dayIdx: number, base: string) => Status
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  onClose: () => void
}) {
  const open = !!empName && !!emp
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (!open) { setMounted(false); return }
    // Trigger enter animation on next frame
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !emp || !empName) return null

  // Build a 6×7 calendar grid for the 31-day demo month.
  // MONTH_DEMO[0] is Thursday (dayOfWeekIdx = 3 with mon=0).
  const firstDowMon0 = 3 // Thursday
  type CellData = { day: number; status: Status; isWeekend: boolean; idx: number }
  const cells: (CellData | null)[] = []
  for (let i = 0; i < firstDowMon0; i++) cells.push(null)
  for (let i = 0; i < MONTH_DEMO.length; i++) {
    const d = MONTH_DEMO[i]
    let code = statusOf(empName, i % 14, emp.s)
    if (code === 'U' && i !== PROBLEM_DAY_IDX) code = 'W'
    cells.push({ day: d.n, status: code, isWeekend: d.k === 'sat' || d.k === 'sun', idx: i })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (CellData | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  // Compute summary
  let workDays = 0, offDays = 0, vacationDays = 0, sickDays = 0, hours = 0
  for (const c of cells) {
    if (!c) continue
    if (c.status === 'W') {
      workDays++
      hours += emp.shift === 'night' ? 13 : 8
    } else if (c.status === 'V') vacationDays++
    else if (c.status === 'S') sickDays++
    else if (c.status === 'D' || c.status === '-' || c.status === undefined) offDays++
  }

  const dowKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

  function statusColor(s: Status, isWeekend?: boolean): { bg: string; fg: string; label: string } {
    if (s === 'W') {
      const t = emp!.shift
      const time = t === 'night' ? '19–8' : t === 'evening' ? '14–22' : '9–17'
      return { bg: 'color-mix(in oklab, var(--st-work) 22%, transparent)', fg: 'var(--foreground)', label: time }
    }
    if (s === 'V') return { bg: 'color-mix(in oklab, var(--accent) 22%, transparent)', fg: 'var(--accent)', label: labels.empCalendarLegendVacation }
    if (s === 'S') return { bg: 'color-mix(in oklab, #d4604a 22%, transparent)', fg: '#d4604a', label: labels.empCalendarLegendSick }
    if (s === 'D') return { bg: 'color-mix(in oklab, var(--muted-foreground) 14%, transparent)', fg: 'var(--muted-foreground)', label: isWeekend ? labels.empCalendarLegendOff : labels.empCalendarLegendDayoff }
    if (s === 'U') return { bg: 'color-mix(in oklab, var(--accent) 22%, transparent)', fg: 'var(--accent)', label: '!' }
    return { bg: 'transparent', fg: 'var(--muted-foreground)', label: labels.empCalendarLegendOff }
  }

  const roleColor = getRoleColor(getEmpRoleKey(emp))
  const roleLabel = getRoleLabel(getEmpRoleKey(emp))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: mounted ? 'rgba(8,7,5,0.55)' : 'rgba(8,7,5,0)',
        backdropFilter: mounted ? 'blur(6px)' : 'blur(0)',
        transition: 'background 240ms ease, backdrop-filter 240ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={labels.empCalendarTitle}
        style={{
          width: '100%', maxWidth: 400,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: 'var(--surface)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.45)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 280ms cubic-bezier(.32,.72,0,1), opacity 220ms ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Avatar name={empName} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{empName}</div>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 7px', borderRadius: 5,
                  background: `color-mix(in oklab, ${roleColor} 18%, transparent)`,
                  color: roleColor,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor }} />
                {roleLabel}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{monthLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.empCalendarClose}
            className="cursor-pointer hover:opacity-80"
            style={{
              flexShrink: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--grid-pill-bg)',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2.5 2.5 L11.5 11.5 M11.5 2.5 L2.5 11.5" />
            </svg>
          </button>
        </div>

        {/* Summary chips */}
        <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--st-work) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--st-work) 28%, transparent)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{workDays}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryWorked}</div>
          </div>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--muted-foreground) 10%, transparent)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{offDays + vacationDays + sickDays}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryOff}</div>
          </div>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--accent) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 24%, transparent)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{hours}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted-foreground)', marginLeft: 2 }}>{labels.hourSuffix}</span></div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryHours}</div>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {dowKeys.map((k) => (
              <div key={k} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 0' }}>
                {labels.days[k]}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} style={{ aspectRatio: '1 / 1.05' }} />
              const sc = statusColor(c.status, c.isWeekend)
              const isUnfilled = c.status === 'U'
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1 / 1.05',
                    borderRadius: 6,
                    background: sc.bg,
                    border: isUnfilled ? '1.5px dashed var(--accent)' : `1px solid ${c.isWeekend ? 'color-mix(in oklab, var(--accent) 12%, var(--border))' : 'var(--border)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px 2px 3px',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, color: c.isWeekend && c.status !== 'W' ? 'var(--accent)' : 'var(--foreground)', opacity: c.status === 'W' || c.status === 'V' || c.status === 'S' ? 1 : 0.78 }}>
                    {c.day}
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: sc.fg, lineHeight: 1, textAlign: 'center' }}>
                    {sc.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '6px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 10, color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
          <LegendDot color="var(--st-work)" label={labels.empCalendarLegendWork} />
          <LegendDot color="var(--muted-foreground)" label={labels.empCalendarLegendDayoff} />
          <LegendDot color="var(--accent)" label={labels.empCalendarLegendVacation} />
          <LegendDot color="#d4604a" label={labels.empCalendarLegendSick} />
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
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
  mode, groups, statusOf, labels, chipLbl, chipLblFull, chipBg, chipFg, contrast, weekendBg,
  showTimes, merged, showGrid, sticky, showTelegram, showRoleChips, onEmpClick, onToggleProjects, onProjectClick, editMode, onCellEdit,
  getEmpRoleKey, getRoleLabel, getRoleColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
}: {
  mode: Mode
  groups: { key: string; name: string; min?: number; rows: EmpDef[] }[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  labels: GridPreviewLabels
  chipLbl: Record<Exclude<Status, '-'>, string>
  chipLblFull: Record<Exclude<Status, '-'>, string>
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  contrast: boolean
  weekendBg: string
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  sticky: boolean
  showTelegram: boolean
  showRoleChips: boolean
  onEmpClick: (name: string) => void
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  editMode: boolean
  onCellEdit: (name: string, day: number, px: number, py: number) => void
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  onOpenRolePicker: (name: string) => void
  dragEmp: string | null
  setDragEmp: (v: string | null) => void
  dragOverEmp: string | null
  setDragOverEmp: (v: string | null) => void
  dragOverGroup: string | null
  setDragOverGroup: (v: string | null) => void
  onMoveEmp: (srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) => void
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  const dayKey = (k: keyof GridPreviewLabels['days']) => labels.days[k]
  const isExt = mode === 'extended'
  const colW = isExt ? 60 : 38
  const colMinW = isExt ? 52 : 30
  const rowPad = isExt ? '6px 4px' : '3px 2px'
  const nameColWMax = isExt ? (sticky ? 240 : 168) : (sticky ? 220 : 148)
  const nameColWMin = isExt ? 130 : 110
  const nameColW = `clamp(${nameColWMin}px, 34vw, ${nameColWMax}px)`

  function workLabel(emp: EmpDef): string {
    if (!showTimes) return isExt ? chipLblFull.W : chipLbl.W
    return emp.shift === 'night'
      ? (isExt ? '19:00–08:00' : '19–8')
      : (isExt ? '09:00–19:00' : '9–19')
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%', fontSize: 11, tableLayout: 'fixed' }}>
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
                  className="hidden cursor-pointer transition-colors sm:inline-block"
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
            {MONTH_DEMO.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isProblem = ci === PROBLEM_DAY_IDX
              return (
                <th
                  key={d.n}
                  style={{
                    width: colW, minWidth: colMinW, padding: '4px 2px', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                    position: 'relative',
                    overflow: 'hidden',
                    ...problemColumnStyle(ci),
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 11 }}>{d.n}</div>
                  <div style={{ fontSize: 9, opacity: 0.65 }}>{dayKey(d.k)}</div>
                  {isProblem && (
                    <div
                      title={labels.shortageLabel}
                      aria-label={labels.shortageLabel}
                      style={{
                        marginTop: 2,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 14, height: 14, borderRadius: '50%',
                        background: 'var(--accent)', color: '#fff',
                      }}
                    >
                      <AlertCircle style={{ width: 9, height: 9 }} />
                    </div>
                  )}
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
            ...(sticky ? [] : [(
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                onDragOver={(e) => { if (dragEmp) { e.preventDefault(); setDragOverGroup(dept.key) } }}
                onDragLeave={() => setDragOverGroup(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragEmp) onMoveEmp(dragEmp, null, dept.key as RoleOrSectionKey)
                  setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                }}
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '4px 10px',
                  background: dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)',
                  width: nameColW, minWidth: nameColW,
                  fontSize: 10, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  outline: dragOverGroup === dept.key ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: -2,
                  transition: 'background 0.12s',
                }}
              >
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: getRoleColor(dept.key as RoleOrSectionKey),
                  marginRight: 6, verticalAlign: 'middle',
                }} />
                ▸ {dept.name}
                {dept.min && (
                  <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: 'none' }}>
                    · {labels.minDay.replace('{n}', String(dept.min))}
                  </span>
                )}
              </td>
              <td colSpan={MONTH_DEMO.length + 2} style={{ background: dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)' }} />
            </tr>
            )]),
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  onDragOver={(e) => { if (!sticky && dragEmp && dragEmp !== emp.name) { e.preventDefault(); setDragOverEmp(emp.name) } }}
                  onDragLeave={() => { if (dragOverEmp === emp.name) setDragOverEmp(null) }}
                  onDrop={(e) => {
                    if (sticky) return
                    e.preventDefault()
                    if (dragEmp && dragEmp !== emp.name) onMoveEmp(dragEmp, emp.name, dept.key as RoleOrSectionKey)
                    setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                  }}
                  style={{
                    position: sticky ? 'sticky' : 'static', left: 0, zIndex: 5,
                    background: 'var(--grid-cell)',
                    padding: '6px 10px', fontWeight: 500,
                    color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden',
                    borderTop: !sticky && dragOverEmp === emp.name ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: dragEmp === emp.name ? 0.4 : 1,
                  }}
                >
                  <div
                    className="flex items-center gap-2"
                    draggable={!sticky}
                    onDragStart={(e) => { if (!sticky) { setDragEmp(emp.name); e.dataTransfer.effectAllowed = 'move' } }}
                    onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
                    style={{ cursor: !sticky ? 'grab' : 'default' }}
                  >
                    {sticky && (
                      <span className="hidden sm:inline-flex"
                        style={{
                          alignItems: 'center',
                          padding: '1px 5px', borderRadius: 3,
                          background: 'var(--grid-dept-bg)',
                          color: 'var(--grid-dept-fg)',
                          fontSize: 8.5, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        {dept.name}
                      </span>
                    )}
                    <Avatar name={emp.name} size={18} />
                    <button
                      type="button"
                      onClick={() => onEmpClick(emp.name)}
                      className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                      style={{ border: 0, color: 'inherit', font: 'inherit' }}
                    >
                      {emp.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => showTelegram ? onProjectClick(emp.name, emp.pIdx) : onOpenRolePicker(emp.name)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={(!showRoleChips && !showTelegram) ? {
                        background: 'transparent',
                        border: 0, padding: 2,
                        display: 'inline-flex', alignItems: 'center',
                        flexShrink: 0,
                      } : {
                        background: showTelegram ? 'rgba(56, 132, 222, 0.14)' : `color-mix(in oklab, ${getRoleColor(getEmpRoleKey(emp))} 18%, transparent)`,
                        color: showTelegram ? '#3884de' : getRoleColor(getEmpRoleKey(emp)),
                        border: 0, borderRadius: 4,
                        padding: '2px 6px', fontSize: 9.5, fontWeight: 600,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {showTelegram ? (
                        emp.tg
                      ) : (!showRoleChips) ? (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: getRoleColor(getEmpRoleKey(emp)), boxShadow: `0 0 0 2px color-mix(in oklab, ${getRoleColor(getEmpRoleKey(emp))} 18%, transparent)` }} />
                      ) : (
                        <>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: getRoleColor(getEmpRoleKey(emp)) }} />
                          {getRoleLabel(getEmpRoleKey(emp))}
                        </>
                      )}
                    </button>
                  </div>
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  MONTH_DEMO.forEach((_d, ci) => {
                    let code = statusOf(emp.name, ci % 14, emp.s)
                    if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
                    const last = runs[runs.length - 1]
                    if (last && last.code === code) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
                  return runs.map((run, ri) => {
                    const { code, indices } = run
                    const span = indices.length
                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = MONTH_DEMO[i]; return d.k === 'sat' || d.k === 'sun' })
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
                })() : MONTH_DEMO.map((d, ci) => {
                  let raw = statusOf(emp.name, ci % 14, emp.s)
                  if (raw === 'U' && ci !== PROBLEM_DAY_IDX) raw = 'W'
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = raw === '-' || raw === undefined
                  const cellInteractive = editMode
                  const tip = isOff ? '' : cellTooltip(raw, emp.shift, labels)
                  return (
                    <td
                      key={d.n}
                      title={tip || undefined}
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
                      ) : (() => {
                        const code = raw as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
                        const WIcon = wm.Icon
                        const StIcon = statusIcon(code)
                        const bg = code === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(code)
                        const fg = chipFg(code)
                        const isU = code === 'U'
                        if (isExt) {
                          return (
                            <div
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                                background: isU ? 'transparent' : bg,
                                color: isU ? 'var(--st-uncovered)' : fg,
                                border: isU ? '1.5px dashed var(--st-uncovered)' : 'none',
                                padding: '5px 7px', borderRadius: 5,
                                fontSize: 10, fontWeight: 600, lineHeight: 1.15,
                                textAlign: 'left',
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: code === 'W' && showTimes ? 9 : 10.5, fontWeight: 600 }}>
                                {code === 'W' ? (
                                  <>
                                    <WIcon size={10} strokeWidth={2.4} />
                                    {workLabel(emp)}
                                  </>
                                ) : (
                                  <>
                                    {StIcon && <StIcon size={10} />}
                                    {chipLblFull[code]}
                                  </>
                                )}
                              </span>
                              {code === 'W' && (
                                <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.88, marginTop: 1 }}>
                                  {wm.window} · {wm.hours}{labels.hourSuffix}
                                </span>
                              )}
                            </div>
                          )
                        }
                        return (
                          <div
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              background: isU ? 'transparent' : bg,
                              color: isU ? 'var(--st-uncovered)' : fg,
                              border: isU ? '1.5px dashed var(--st-uncovered)' : 'none',
                              padding: '1px 5px', borderRadius: 3,
                              fontSize: code === 'W' && showTimes ? 8 : 9.5,
                              fontWeight: 500, whiteSpace: 'nowrap',
                            }}
                          >
                            {code === 'W' ? (
                              <>
                                <WIcon size={9} strokeWidth={2.4} />
                                {showTimes ? workLabel(emp) : null}
                              </>
                            ) : StIcon ? (
                              <StIcon size={9} />
                            ) : (
                              chipLbl[code]
                            )}
                          </div>
                        )
                      })()}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  MONTH_DEMO.forEach((_d, ci) => {
                    let s = statusOf(emp.name, ci % 14, emp.s)
                    if (s === 'U' && ci !== PROBLEM_DAY_IDX) s = 'W'
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W') work++
                  })
                  const wm = workMeta(emp.shift, labels)
                  const hrs = work * wm.hours
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: 48, minWidth: 48, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}${labels.hourSuffix}` : '—'}</span>
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
  groups, statusOf, weekendBg, chipBg, chipFg, contrast, labels,
  showTimes, merged, showGrid, sticky, showTelegram, showRoleChips, onEmpClick, editMode, onToggleProjects, onProjectClick, onCellEdit,
  getEmpRoleKey, getRoleLabel, getRoleColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
}: {
  groups: { key: string; name: string; min?: number; rows: EmpDef[] }[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  weekendBg: string
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  contrast: boolean
  labels: GridPreviewLabels
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  sticky: boolean
  showTelegram: boolean
  showRoleChips: boolean
  onEmpClick: (name: string) => void
  editMode: boolean
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  onCellEdit: (name: string, day: number, px: number, py: number) => void
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  onOpenRolePicker: (name: string) => void
  dragEmp: string | null
  setDragEmp: (v: string | null) => void
  dragOverEmp: string | null
  setDragOverEmp: (v: string | null) => void
  dragOverGroup: string | null
  setDragOverGroup: (v: string | null) => void
  onMoveEmp: (srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) => void
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  const nameColWMax = sticky ? 220 : 168
  const nameColW = `clamp(110px, 34vw, ${nameColWMax}px)`
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%', fontSize: 10, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                position: 'sticky', left: 0, zIndex: 10,
                background: 'var(--grid-cell)',
                padding: '6px 10px', width: nameColW, minWidth: nameColW,
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
                  className="hidden cursor-pointer transition-colors sm:inline-block"
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
            {MONTH_DEMO.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isProblem = ci === PROBLEM_DAY_IDX
              return (
                <th
                  key={d.n}
                  style={{
                    width: 32, minWidth: 28, padding: '4px 0', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                    fontWeight: 500, fontSize: 9.5,
                    position: 'relative',
                    overflow: 'hidden',
                    ...problemColumnStyle(ci),
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 9.5 }}>{d.n}</div>
                  <div style={{ fontSize: 8, opacity: 0.65 }}>{labels.days[d.k]}</div>
                  {isProblem && (
                    <div
                      title={labels.shortageLabel}
                      aria-label={labels.shortageLabel}
                      style={{
                        marginTop: 2,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 12, height: 12, borderRadius: '50%',
                        background: 'var(--accent)', color: '#fff',
                      }}
                    >
                      <AlertCircle style={{ width: 8, height: 8 }} />
                    </div>
                  )}
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
            ...(sticky ? [] : [(
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                onDragOver={(e) => { if (dragEmp) { e.preventDefault(); setDragOverGroup(dept.key) } }}
                onDragLeave={() => setDragOverGroup(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragEmp) onMoveEmp(dragEmp, null, dept.key as RoleOrSectionKey)
                  setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                }}
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '3px 10px',
                  background: dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)',
                  width: nameColW, minWidth: nameColW,
                  fontSize: 9.5, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  outline: dragOverGroup === dept.key ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: -2,
                  transition: 'background 0.12s',
                }}
              >
                <span style={{
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: getRoleColor(dept.key as RoleOrSectionKey),
                  marginRight: 5, verticalAlign: 'middle',
                }} />
                ▸ {dept.name}
              </td>
              <td colSpan={MONTH_DEMO.length + 2} style={{ background: dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)' }} />
            </tr>
            )]),
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  onDragOver={(e) => { if (!sticky && dragEmp && dragEmp !== emp.name) { e.preventDefault(); setDragOverEmp(emp.name) } }}
                  onDragLeave={() => { if (dragOverEmp === emp.name) setDragOverEmp(null) }}
                  onDrop={(e) => {
                    if (sticky) return
                    e.preventDefault()
                    if (dragEmp && dragEmp !== emp.name) onMoveEmp(dragEmp, emp.name, dept.key as RoleOrSectionKey)
                    setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                  }}
                  style={{
                    position: sticky ? 'sticky' : 'static', left: 0, zIndex: 5,
                    background: 'var(--grid-cell)',
                    padding: '3px 10px', fontWeight: 500,
                    color: 'var(--foreground)', whiteSpace: 'nowrap', fontSize: 11, overflow: 'hidden',
                    borderTop: !sticky && dragOverEmp === emp.name ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: dragEmp === emp.name ? 0.4 : 1,
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-2"
                    draggable={!sticky}
                    onDragStart={(e) => { if (!sticky) { setDragEmp(emp.name); e.dataTransfer.effectAllowed = 'move' } }}
                    onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
                    style={{ cursor: !sticky ? 'grab' : 'default' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {sticky && (
                        <span className="hidden sm:inline-flex"
                          style={{
                            alignItems: 'center',
                            padding: '1px 5px', borderRadius: 3,
                            background: 'var(--grid-dept-bg)',
                            color: 'var(--grid-dept-fg)',
                            fontSize: 8, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}
                        >
                          {dept.name}
                        </span>
                      )}
                      <Avatar name={emp.name} size={16} />
                      <button
                        type="button"
                        onClick={() => onEmpClick(emp.name)}
                        className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                        style={{ border: 0, color: 'inherit', font: 'inherit' }}
                      >
                        {emp.name}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => showTelegram ? onProjectClick(emp.name, emp.pIdx) : onOpenRolePicker(emp.name)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={(!showRoleChips && !showTelegram) ? {
                        background: 'transparent',
                        border: 0, padding: 2,
                        display: 'inline-flex', alignItems: 'center',
                        flexShrink: 0,
                      } : {
                        background: showTelegram ? 'rgba(56, 132, 222, 0.14)' : `color-mix(in oklab, ${getRoleColor(getEmpRoleKey(emp))} 18%, transparent)`,
                        color: showTelegram ? '#3884de' : getRoleColor(getEmpRoleKey(emp)),
                        border: 0, borderRadius: 4,
                        padding: '1px 5px', fontSize: 9, fontWeight: 600,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      {showTelegram ? (
                        emp.tg
                      ) : (!showRoleChips) ? (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: getRoleColor(getEmpRoleKey(emp)), boxShadow: `0 0 0 2px color-mix(in oklab, ${getRoleColor(getEmpRoleKey(emp))} 18%, transparent)` }} />
                      ) : (
                        <>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: getRoleColor(getEmpRoleKey(emp)) }} />
                          {getRoleLabel(getEmpRoleKey(emp))}
                        </>
                      )}
                    </button>
                  </div>
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  MONTH_DEMO.forEach((_d, ci) => {
                    let code = statusOf(emp.name, ci % 14, emp.s)
                    if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
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
                  let code = statusOf(emp.name, ci % 14, emp.s)
                  if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = code === '-' || code === undefined
                  const tip = isOff ? '' : cellTooltip(code, emp.shift, labels)
                  return (
                    <td
                      key={d.n}
                      title={tip || undefined}
                      onClick={editMode ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci % 14, r.left + r.width / 2, r.bottom + 4)
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
                      ) : (() => {
                        const cc = code as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
                        const bg = cc === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(cc)
                        const isU = cc === 'U'
                        const timeText = cc === 'W' && showTimes
                          ? (emp.shift === 'night' ? '22–8' : emp.shift === 'evening' ? '14–22' : '9–17')
                          : ''
                        return (
                          <div
                            style={{
                              background: isU ? 'transparent' : bg,
                              color: isU ? 'var(--st-uncovered)' : cc === 'W' ? (contrast ? 'var(--st-work-fg)' : chipFg('W')) : chipFg(cc),
                              border: isU ? '1px dashed var(--st-uncovered)' : 'none',
                              borderRadius: 4,
                              fontSize: cc === 'W' && showTimes ? 9 : 10.5,
                              fontWeight: 600,
                              padding: '3px 0', lineHeight: 1.15,
                              minHeight: 16,
                            }}
                          >
                            {isU ? '?' : timeText}
                          </div>
                        )
                      })()}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  MONTH_DEMO.forEach((_d, ci) => {
                    let s = statusOf(emp.name, ci % 14, emp.s)
                    if (s === 'U' && ci !== PROBLEM_DAY_IDX) s = 'W'
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W') work++
                  })
                  const wm = workMeta(emp.shift, labels)
                  const hrs = work * wm.hours
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: 46, minWidth: 46, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}${labels.hourSuffix}` : '—'}</span>
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
