'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal,
  TreePalm, Thermometer, AlertCircle, Home,
  Bell, Pencil, RotateCcw,
} from 'lucide-react'
import {
  type GridPreviewLabels, type EmpDef, type Status, type DeptKey, type Mode, type RoleKey,
  Avatar, BASE_EMPLOYEES, MONTH_DEMO, PROBLEM_DAY_IDX, rotateSchedule, workMeta,
} from './grid-preview'
import type { CustomSection, RoleOrSectionKey } from './grid-shared'

type Props = {
  labels: GridPreviewLabels
  mode: Mode
  monthIdx: number
  setMonthIdx: (n: number) => void
  deptFilter: DeptKey
  showTimer: boolean
  showToday: boolean
  contrast: boolean
  strongWeekend: boolean
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  sticky: boolean
  customSections: CustomSection[]
  empRoleOverrides: Record<string, RoleOrSectionKey>
  empOrder: string[]
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  onOpenRolePicker: (name: string) => void
  onOpenAddSection: () => void
  onReset: () => void
  onMoveEmp: (srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) => void
  dragEmp: string | null
  setDragEmp: (v: string | null) => void
  dragOverEmp: string | null
  setDragOverEmp: (v: string | null) => void
  dragOverGroup: string | null
  setDragOverGroup: (v: string | null) => void
}

type StatusVisual = {
  bg: string
  bgSoft: string
  fg: string
  fgSoft: string
  Icon: ComponentType<{ size?: number; style?: React.CSSProperties; strokeWidth?: number }>
}
const STATUS_VIS: Record<Exclude<Status, 'W' | '-'>, StatusVisual> = {
  V: { bg: '#5cb89a', bgSoft: '#dff0e9', fg: '#fff', fgSoft: '#2f7d62', Icon: TreePalm },
  S: { bg: '#e5746a', bgSoft: '#fadcd8', fg: '#fff', fgSoft: '#9d3a31', Icon: Thermometer },
  D: { bg: '#7d8896', bgSoft: '#dfe2e7', fg: '#fff', fgSoft: '#4a5562', Icon: Home },
  U: { bg: '#e8a04c', bgSoft: '#f9e5cb', fg: '#fff', fgSoft: '#8a5a1c', Icon: AlertCircle },
}

const STATUS_OPTIONS: Status[] = ['W', 'V', 'S', 'D', 'U', '-']

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function ClassicGrid({
  labels, mode, monthIdx, setMonthIdx, deptFilter,
  showTimer, showToday,
  contrast, strongWeekend, showTimes, merged, showGrid, sticky,
  customSections, empRoleOverrides, empOrder,
  getEmpRoleKey, getRoleLabel, getRoleColor,
  onOpenRolePicker, onOpenAddSection, onReset, onMoveEmp,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup,
}: Props) {
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSec, setTimerSec] = useState(0)
  const [overrides, setOverrides] = useState<Record<string, Status>>({})
  const [hoverCell, setHoverCell] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ name: string; day: number; px: number; py: number } | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const editCellRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!timerRunning) return
    const id = window.setInterval(() => setTimerSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [timerRunning])

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

  useEffect(() => {
    if (!notifOpen) return
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [notifOpen])

  const monthLabel = labels.months[monthIdx]
  const monthOffset = (monthIdx - 2) * 3

  // Filter employees by department
  const baseDeptOrder: Exclude<DeptKey, 'all'>[] =
    deptFilter === 'all'
      ? ['sales', 'ops', 'support', 'marketing', 'design']
      : [deptFilter]
  const emps: EmpDef[] = []
  for (const d of baseDeptOrder) {
    for (const e of BASE_EMPLOYEES) if (e.dept === d) emps.push(e)
  }
  // Apply custom ordering
  const orderedEmps = empOrder.length
    ? (() => {
        const map = new Map(emps.map((e) => [e.name, e]))
        const out: EmpDef[] = []
        for (const n of empOrder) { const e = map.get(n); if (e) { out.push(e); map.delete(n) } }
        for (const e of map.values()) out.push(e)
        return out
      })()
    : emps

  // Status lookup keyed by full day index (bug fix: don't fold to ci % 14)
  function statusOf(name: string, fullDayIdx: number, base: string): Status {
    const key = `${name}-${fullDayIdx}-${monthIdx}`
    if (overrides[key]) return overrides[key]
    const rotated = rotateSchedule(base, monthOffset)
    return (rotated[fullDayIdx % 14] ?? 'W') as Status
  }

  function setStatusOf(name: string, fullDayIdx: number, s: Status) {
    setOverrides((prev) => ({ ...prev, [`${name}-${fullDayIdx}-${monthIdx}`]: s }))
  }

  // Mode-dependent dimensions: detail/extended show times + wider cells
  const rowH = mode === 'compact' ? 44 : mode === 'detail' ? 58 : 76
  const colW = mode === 'compact' ? 48 : mode === 'detail' ? 60 : 80
  const cellPad = mode === 'compact' ? 3 : 4
  const nameSize = mode === 'compact' ? 12 : 13
  const roleSize = mode === 'compact' ? 10 : 11
  const stickyWMax = mode === 'compact' ? 220 : mode === 'detail' ? 250 : 280
  const stickyW = `clamp(140px, 42vw, ${stickyWMax}px)`
  const iconSize = mode === 'compact' ? 12 : mode === 'detail' ? 14 : 16
  const timeSize = mode === 'compact' ? 9 : mode === 'detail' ? 10 : 11

  // Stats for "Today" header chip
  let onShift = 0, offToday = 0
  for (const emp of orderedEmps) {
    const s = statusOf(emp.name, PROBLEM_DAY_IDX, emp.s)
    if (s === 'W') onShift++
    else if (s === 'V' || s === 'S' || s === 'D') offToday++
  }

  function prevMonth() { setMonthIdx(Math.max(0, monthIdx - 1)) }
  function nextMonth() { setMonthIdx(Math.min(4, monthIdx + 1)) }

  function dayShort(k: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'): string {
    return labels.days[k].slice(0, 2)
  }

  function cellBg(s: Exclude<Status, 'W' | '-'>): string {
    return contrast ? STATUS_VIS[s].bg : STATUS_VIS[s].bgSoft
  }
  function cellFg(s: Exclude<Status, 'W' | '-'>): string {
    return contrast ? STATUS_VIS[s].fg : STATUS_VIS[s].fgSoft
  }

  function weekendBg(): string {
    return strongWeekend
      ? 'color-mix(in oklab, var(--accent-soft) 70%, transparent)'
      : 'color-mix(in oklab, var(--classic-grid-line) 40%, transparent)'
  }

  // Returns true when current cell continues a same-status run from previous day (for merged setting)
  function isMergedSame(empName: string, ci: number, base: string): boolean {
    if (!merged || ci === 0) return false
    const prev = statusOf(empName, ci - 1, base)
    const curr = statusOf(empName, ci, base)
    return prev === curr && curr !== 'W' && curr !== '-'
  }

  function isMergedSameRight(empName: string, ci: number, base: string): boolean {
    if (!merged || ci >= MONTH_DEMO.length - 1) return false
    const next = statusOf(empName, ci + 1, base)
    const curr = statusOf(empName, ci, base)
    return next === curr && curr !== 'W' && curr !== '-'
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.10)',
        ...({
          '--classic-grid-line': 'color-mix(in oklab, var(--border) 80%, transparent)',
          '--classic-row-hover': 'color-mix(in oklab, var(--muted) 50%, transparent)',
          '--classic-gap-bg': 'rgba(217,119,87,0.06)',
          '--classic-gap-edge': 'rgba(217,119,87,0.45)',
        } as React.CSSProperties),
      }}
    >
      {/* Top thin bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 14px',
          borderBottom: '1px solid var(--classic-grid-line)',
          background: 'var(--surface)',
          gap: 10,
        }}
      >
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {showToday && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11,
                background: 'color-mix(in oklab, var(--muted) 50%, transparent)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '3px 10px',
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--muted-foreground)',
              }}
            >
              <span style={{ fontWeight: 500 }}>{labels.chromeToday}</span>
              <span style={{ width: 1, height: 10, background: 'var(--classic-grid-line)' }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5cb89a' }} />
                <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{onShift}</span>
                <span>{labels.chromeOnShift}</span>
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7d8896' }} />
                <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{offToday}</span>
                <span>{labels.chromeOffToday}</span>
              </span>
            </span>
          )}
          {showTimer && (
            <>
              <span
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 13, fontWeight: 600, letterSpacing: 1,
                  color: timerRunning ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmtTime(timerSec)}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((v) => !v)}
                aria-label={timerRunning ? 'Pause' : 'Start'}
                className="cursor-pointer transition-transform hover:scale-110"
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: timerRunning ? '#e0a93a' : '#28c840',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="cursor-pointer transition-colors hover:opacity-80"
              style={{
                background: 'transparent', border: 0, padding: 2,
                display: 'inline-flex', alignItems: 'center', position: 'relative',
              }}
            >
              <Bell size={16} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{
                position: 'absolute', top: 1, right: 1,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 0 1.5px var(--surface)',
              }} />
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 z-30 mt-2 rounded-xl border border-border shadow-lg"
                style={{ top: '100%', background: 'var(--surface)', width: 260, padding: 8, fontSize: 12 }}
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
          <Avatar name="Olga Romanenko" size={24} />
        </div>
      </div>

      {/* Main column (no sidebar nav anymore) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 18px 10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="cursor-pointer transition-colors hover:bg-muted"
            style={{
              width: 32, height: 32, borderRadius: 6, border: 0,
              background: 'transparent', color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: 22, fontWeight: 500,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
              fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
              minWidth: 140, textAlign: 'center',
            }}
          >
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="cursor-pointer transition-colors hover:bg-muted"
            style={{
              width: 32, height: 32, borderRadius: 6, border: 0,
              background: 'transparent', color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight size={18} />
          </button>

          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onOpenAddSection}
              className="cursor-pointer transition-colors hover:bg-muted"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'transparent',
                color: 'var(--foreground)',
                fontSize: 12, fontWeight: 500,
              }}
            >
              {labels.addSectionBtn}
            </button>
            <button
              type="button"
              onClick={() => { setEditMode((v) => !v); setEditCell(null) }}
              className="cursor-pointer transition-colors"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: editMode ? 'var(--accent)' : 'transparent',
                color: editMode ? '#fff' : 'var(--foreground)',
                fontSize: 12, fontWeight: 500,
              }}
            >
              <Pencil size={12} />
              {editMode ? labels.editDone : labels.editBtn}
            </button>
            <button
              type="button"
              className="cursor-pointer transition-colors hover:bg-muted"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                border: 0, background: 'transparent',
                color: 'var(--foreground)', fontSize: 12, fontWeight: 500,
              }}
            >
              A → Z <ChevronDown size={12} />
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>
              {labels.classicTeams}: <span style={{ color: 'var(--muted-foreground)' }}>{labels.classicAll}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>
              {labels.classicAbsence}: <span style={{ color: 'var(--muted-foreground)' }}>{labels.classicAll}</span>
            </span>
            <button
              type="button"
              aria-label="More"
              className="cursor-pointer transition-colors hover:bg-muted"
              style={{
                width: 28, height: 28, borderRadius: 6, border: 0,
                background: 'transparent', color: 'var(--muted-foreground)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowX: 'auto', padding: '0 0 14px' }}>
          <div style={{ display: 'block', width: 'max-content', minWidth: '100%', position: 'relative' }}>
            {/* Header row */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--classic-grid-line)' }}>
              <div
                style={{
                  width: stickyW, flexShrink: 0,
                  padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  position: sticky ? 'sticky' : 'static',
                  left: 0,
                  background: 'var(--surface)',
                  zIndex: 2,
                  borderRight: sticky ? '1px solid var(--classic-grid-line)' : 'none',
                }}
              >
                <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {labels.classicSearch}
                </span>
              </div>
              {MONTH_DEMO.map((d, ci) => {
                const isProblem = ci === PROBLEM_DAY_IDX
                const isWeekend = d.k === 'sat' || d.k === 'sun'
                return (
                  <div
                    key={ci}
                    style={{
                      width: colW, flexShrink: 0,
                      padding: '8px 0',
                      textAlign: 'center',
                      background: isProblem
                        ? 'var(--classic-gap-bg)'
                        : isWeekend
                          ? weekendBg()
                          : 'transparent',
                      borderLeft: isProblem
                        ? '1px dashed var(--classic-gap-edge)'
                        : showGrid
                          ? '1px solid var(--classic-grid-line)'
                          : 'none',
                      borderRight: isProblem ? '1px dashed var(--classic-gap-edge)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14, fontWeight: 500,
                        color: isWeekend ? 'var(--muted-foreground)' : 'var(--foreground)',
                        lineHeight: 1.1,
                      }}
                    >
                      {d.n}
                    </div>
                    <div
                      style={{
                        fontSize: 10, fontWeight: 500,
                        color: 'var(--muted-foreground)',
                        marginTop: 2, textTransform: 'capitalize',
                      }}
                    >
                      {dayShort(d.k)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Body rows */}
            {(() => {
              const visRows: Array<{ type: 'emp'; emp: EmpDef } | { type: 'role'; rk: RoleOrSectionKey }> = []
              if (!sticky) {
                const seen = new Set<RoleOrSectionKey>()
                const orderUsed: RoleOrSectionKey[] = []
                for (const empItem of orderedEmps) {
                  const rk = getEmpRoleKey(empItem)
                  if (!seen.has(rk)) {
                    seen.add(rk)
                    orderUsed.push(rk)
                    visRows.push({ type: 'role', rk })
                  }
                  visRows.push({ type: 'emp', emp: empItem })
                }
                // Append empty custom sections (drop targets)
                for (const cs of customSections) {
                  if (!seen.has(cs.key)) {
                    visRows.push({ type: 'role', rk: cs.key })
                  }
                }
              } else {
                for (const empItem of orderedEmps) visRows.push({ type: 'emp', emp: empItem })
              }
              return visRows.map((row) => {
                if (row.type === 'role') {
                  const isOver = dragOverGroup === String(row.rk)
                  return (
                    <div
                      key={`role-${String(row.rk)}`}
                      onDragOver={(e) => { if (dragEmp) { e.preventDefault(); setDragOverGroup(String(row.rk)) } }}
                      onDragLeave={() => setDragOverGroup(null)}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (dragEmp) onMoveEmp(dragEmp, null, row.rk)
                        setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                      }}
                      style={{
                        display: 'flex',
                        borderBottom: '2px solid var(--classic-grid-line)',
                        background: isOver
                          ? 'color-mix(in oklab, var(--accent) 14%, transparent)'
                          : 'color-mix(in oklab, var(--muted) 60%, transparent)',
                        outline: isOver ? '2px dashed var(--accent)' : 'none',
                        outlineOffset: -2,
                        transition: 'background 0.12s',
                      }}
                    >
                      <div
                        style={{
                          width: stickyW, flexShrink: 0,
                          padding: '5px 12px',
                          position: 'sticky',
                          left: 0,
                          background: 'var(--surface)',
                          zIndex: 3,
                          borderRight: '1px solid var(--classic-grid-line)',
                          fontSize: 10, fontWeight: 700,
                          color: 'var(--muted-foreground)',
                          textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: getRoleColor(row.rk),
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
                        }} />
                        {getRoleLabel(row.rk)}
                      </div>
                      {MONTH_DEMO.map((_, ci) => (
                        <div key={ci} style={{ width: colW, flexShrink: 0, height: 24 }} />
                      ))}
                    </div>
                  )
                }
                const emp = row.emp
                const empRoleKey = getEmpRoleKey(emp)
                const isDraggingThis = dragEmp === emp.name
                const isOverThis = !sticky && dragOverEmp === emp.name
                return (
              <div
                key={emp.name}
                onDragOver={(e) => { if (!sticky && dragEmp && dragEmp !== emp.name) { e.preventDefault(); setDragOverEmp(emp.name) } }}
                onDragLeave={() => setDragOverEmp(dragOverEmp === emp.name ? null : dragOverEmp)}
                onDrop={(e) => {
                  if (sticky) return
                  e.preventDefault()
                  if (dragEmp && dragEmp !== emp.name) onMoveEmp(dragEmp, emp.name, empRoleKey)
                  setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                }}
                style={{
                  display: 'flex',
                  borderTop: isOverThis ? '2px solid var(--accent)' : '2px solid transparent',
                  borderBottom: '1px solid var(--classic-grid-line)',
                  minHeight: rowH,
                  opacity: isDraggingThis ? 0.4 : 1,
                }}
              >
                <div
                  draggable={!sticky}
                  onDragStart={(e) => { if (!sticky) { setDragEmp(emp.name); e.dataTransfer.effectAllowed = 'move' } }}
                  onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
                  style={{
                    width: stickyW, flexShrink: 0,
                    padding: '8px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderRight: '1px solid var(--classic-grid-line)',
                    position: sticky ? 'sticky' : 'static',
                    left: 0,
                    background: 'var(--surface)',
                    zIndex: 2,
                    cursor: !sticky ? 'grab' : 'default',
                  }}
                >
                  <Avatar name={emp.name} size={32} />
                  <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                    <div
                      style={{
                        fontSize: nameSize, fontWeight: 600,
                        color: 'var(--foreground)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {emp.name}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenRolePicker(emp.name) }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        marginTop: 1,
                        background: 'transparent',
                        border: 0, padding: 0,
                        cursor: 'pointer',
                        fontSize: roleSize,
                        color: getRoleColor(empRoleKey),
                        fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: getRoleColor(empRoleKey),
                      }} />
                      {getRoleLabel(empRoleKey)}
                    </button>
                  </div>
                </div>
                {MONTH_DEMO.map((d, ci) => {
                  const s = statusOf(emp.name, ci, emp.s)
                  const isProblem = ci === PROBLEM_DAY_IDX
                  const isWeekend = d.k === 'sat' || d.k === 'sun'
                  const cellKey = `${emp.name}-${ci}`
                  const hovered = hoverCell === cellKey
                  const vis = s !== 'W' && s !== '-' ? STATUS_VIS[s] : null
                  const mergedLeft = vis && isMergedSame(emp.name, ci, emp.s)
                  const mergedRight = vis && isMergedSameRight(emp.name, ci, emp.s)
                  const wm = workMeta(emp.shift, labels)

                  return (
                    <div
                      key={ci}
                      onMouseEnter={() => setHoverCell(cellKey)}
                      onMouseLeave={() => setHoverCell((h) => (h === cellKey ? null : h))}
                      onClick={(e) => {
                        if (!editMode) return
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setEditCell({
                          name: emp.name, day: ci,
                          px: r.left + r.width / 2,
                          py: r.bottom + 6,
                        })
                      }}
                      style={{
                        width: colW, flexShrink: 0,
                        minHeight: rowH,
                        padding: cellPad,
                        background: isProblem
                          ? 'var(--classic-gap-bg)'
                          : isWeekend
                            ? weekendBg()
                            : hovered && editMode
                              ? 'var(--classic-row-hover)'
                              : 'transparent',
                        borderLeft: isProblem
                          ? '1px dashed var(--classic-gap-edge)'
                          : showGrid && !mergedLeft
                            ? '1px solid var(--classic-grid-line)'
                            : 'none',
                        borderRight: isProblem ? '1px dashed var(--classic-gap-edge)' : 'none',
                        cursor: editMode ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        outline: editMode ? '1px dashed var(--accent)' : 'none',
                        outlineOffset: editMode ? -2 : 0,
                        transition: 'background 0.12s',
                      }}
                      title={s === 'V' ? labels.shifts.vacation
                        : s === 'S' ? labels.shifts.sick
                        : s === 'D' ? labels.shifts.dayoff
                        : s === 'U' ? labels.shifts.unfilled
                        : s === 'W' ? labels.shifts[emp.shift]
                        : ''}
                    >
                      {vis && (
                        <span
                          style={{
                            width: mergedLeft ? `calc(100% + ${2 * cellPad}px)` : '100%',
                            alignSelf: 'stretch',
                            background: cellBg(s as Exclude<Status, 'W' | '-'>),
                            color: cellFg(s as Exclude<Status, 'W' | '-'>),
                            borderRadius: 6,
                            borderTopLeftRadius: mergedLeft ? 0 : 6,
                            borderBottomLeftRadius: mergedLeft ? 0 : 6,
                            borderTopRightRadius: mergedRight ? 0 : 6,
                            borderBottomRightRadius: mergedRight ? 0 : 6,
                            marginLeft: mergedLeft ? -(2 * cellPad) : 0,
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: mode === 'compact' ? 3 : 5,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            gap: 2,
                          }}
                        >
                          {!mergedLeft && <vis.Icon size={iconSize} strokeWidth={2.2} />}
                          {showTimes && !mergedLeft && (
                            <span style={{ fontSize: timeSize, fontWeight: 600, lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                              {mode !== 'compact'
                                ? (s === 'V' ? labels.shifts.vacation
                                  : s === 'S' ? labels.shifts.sick
                                  : s === 'D' ? labels.shifts.dayoff
                                  : labels.shifts.unfilled)
                                : (s === 'V' ? labels.statusVac
                                  : s === 'S' ? labels.statusSick
                                  : s === 'D' ? labels.statusOff
                                  : labels.statusUncovered)}
                            </span>
                          )}
                        </span>
                      )}
                      {!vis && s === 'W' && showTimes && (
                        <span
                          style={{
                            fontSize: timeSize, fontWeight: 600,
                            color: 'var(--muted-foreground)',
                            opacity: 0.7,
                            padding: 2,
                            lineHeight: 1,
                          }}
                        >
                          {wm.window}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* Cell-edit popover */}
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
            {STATUS_OPTIONS.map((s) => {
              const isEmpty = s === '-'
              const isWork = s === 'W'
              const visual = !isEmpty && !isWork ? STATUS_VIS[s as Exclude<Status, 'W' | '-'>] : null
              const lbl = isEmpty
                ? '—'
                : isWork
                  ? labels.statusWork
                  : s === 'V' ? labels.statusVac
                  : s === 'S' ? labels.statusSick
                  : s === 'D' ? labels.statusOff
                  : labels.statusUncovered
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusOf(editCell.name, editCell.day, s)
                    setEditCell(null)
                  }}
                  className="cursor-pointer transition-transform hover:scale-105"
                  style={{
                    width: 40, height: 30, border: 0, borderRadius: 5,
                    background: isEmpty
                      ? 'var(--muted)'
                      : isWork
                        ? '#5cb89a'
                        : visual!.bg,
                    color: isEmpty
                      ? 'var(--muted-foreground)'
                      : '#fff',
                    fontSize: 10, fontWeight: 600,
                  }}
                >
                  {lbl}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
