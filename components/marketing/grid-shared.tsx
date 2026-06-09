'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'
import type { RoleKey, GridPreviewLabels } from './grid-preview'

export type CustomSection = { key: string; name: string; color: string }
export type RoleOrSectionKey = RoleKey | string // custom section keys are prefixed with `cs:`

export const SOLID_COLORS = [
  { id: 'rose',    value: '#f43f5e' },
  { id: 'orange',  value: '#f97316' },
  { id: 'amber',   value: '#eab308' },
  { id: 'emerald', value: '#10b981' },
  { id: 'sky',     value: '#0ea5e9' },
  { id: 'violet',  value: '#8b5cf6' },
  { id: 'pink',    value: '#ec4899' },
  { id: 'teal',    value: '#14b8a6' },
] as const

export const GRADIENT_COLORS = [
  { id: 'grad-sunset',   value: 'linear-gradient(135deg, #f43f5e 0%, #f97316 55%, #fbbf24 100%)' },
  { id: 'grad-ocean',    value: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 45%, #10b981 100%)' },
  { id: 'grad-aurora',   value: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #38bdf8 100%)' },
  { id: 'grad-candy',    value: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb923c 100%)' },
  { id: 'grad-forest',   value: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #84cc16 100%)' },
  { id: 'grad-twilight', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' },
  { id: 'grad-fire',     value: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 45%, #fbbf24 100%)' },
  { id: 'grad-midnight', value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #38bdf8 100%)' },
] as const

// backward compat alias
export const COLOR_PRESETS = [...SOLID_COLORS, ...GRADIENT_COLORS]

export const ROLE_COLORS: Record<RoleKey, string> = {
  salesDepartment:       '#f43f5e',
  developmentDepartment: '#3b82f6',
  hr:                    '#10b981',
  salesLead:             '#f59e0b',
  projectManager:        '#8b5cf6',
}

export const ALL_ROLE_KEYS: RoleKey[] = [
  'salesDepartment',
  'developmentDepartment',
  'hr',
  'salesLead',
  'projectManager',
]

export const DEPARTMENT_ROLE_KEYS: RoleKey[] = [
  'salesDepartment',
  'developmentDepartment',
  'hr',
]

type ModalShellProps = {
  theme: 'standard' | 'classic'
  title: string
  closeLabel?: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

function ModalShell({ theme, title, closeLabel, onClose, children, width = 380 }: ModalShellProps) {
  const isClassic = theme === 'classic'
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: isClassic ? 'rgba(20,24,36,0.45)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 12,
      }}
    >
      <div
        ref={ref}
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--surface)',
          color: 'var(--foreground)',
          borderRadius: isClassic ? 6 : 12,
          border: '1px solid var(--border)',
          boxShadow: isClassic
            ? '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)'
            : '0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: isClassic ? 'ui-serif, Georgia, "Times New Roman", serif' : 'inherit',
          overflow: 'hidden',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isClassic ? '14px 18px' : '14px 16px',
            borderBottom: '1px solid var(--border)',
            background: isClassic ? 'var(--muted)' : 'transparent',
          }}
        >
          <span style={{
            fontSize: isClassic ? 16 : 14,
            fontWeight: isClassic ? 500 : 600,
            letterSpacing: isClassic ? '-0.01em' : '0',
          }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel ?? title}
            style={{
              background: 'transparent', border: 0, padding: 4,
              borderRadius: 4, cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ padding: 16, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

type RolePickerProps = {
  theme: 'standard' | 'classic'
  labels: GridPreviewLabels
  empName: string
  avatarSrc?: string
  currentDepartmentKey: RoleOrSectionKey
  currentRole: string
  customSections: CustomSection[]
  roleItemsByDepartment: Record<string, { key: string; label: string; color: string }[]>
  departmentColorOverrides?: Record<string, string>
  onPickDepartment: (key: RoleOrSectionKey) => void
  onPickRole: (key: string) => void
  onDepartmentColorChange: (key: RoleOrSectionKey, color: string) => void
  onRoleColorChange: (key: string, color: string) => void
  onCreateDepartment: (name: string, color: string) => RoleOrSectionKey
  onCreateRole: (departmentKey: RoleOrSectionKey, role: string, color: string) => void
  onClose: () => void
}

export function RolePickerModal({
  labels,
  empName,
  avatarSrc,
  currentDepartmentKey,
  currentRole,
  customSections,
  roleItemsByDepartment,
  departmentColorOverrides = {},
  onPickDepartment,
  onPickRole,
  onCreateDepartment,
  onCreateRole,
  onClose,
}: RolePickerProps) {
  const [closing, setClosing] = useState(false)
  const [draftDepartmentKey, setDraftDepartmentKey] = useState<RoleOrSectionKey>(currentDepartmentKey)
  const [draftRole, setDraftRole] = useState(currentRole)
  const [expandedDepartmentKey, setExpandedDepartmentKey] = useState(String(currentDepartmentKey))
  const [addingDepartmentKey, setAddingDepartmentKey] = useState<string | null>(null)
  const [addingDepartment, setAddingDepartment] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [newDepartmentColor, setNewDepartmentColor] = useState<string>(SOLID_COLORS[1].value)
  const closeTimerRef = useRef<number | null>(null)

  const requestClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(() => onClose(), 120)
  }, [closing, onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') requestClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  const tone = {
    overlay: 'color-mix(in oklab, var(--background) 18%, rgba(3, 7, 18, 0.62))',
    panel: 'var(--surface)',
    panelSoft: 'var(--grid-pill-bg)',
    card: 'var(--grid-cell)',
    field: 'var(--surface)',
    text: 'var(--foreground)',
    muted: 'var(--muted-foreground)',
    faint: 'var(--subtle)',
    border: 'var(--border)',
    borderStrong: 'color-mix(in oklab, var(--border) 72%, var(--foreground) 28%)',
    dashed: 'color-mix(in oklab, var(--border) 72%, var(--muted-foreground) 28%)',
    tree: 'color-mix(in oklab, var(--accent) 28%, var(--border))',
    footer: 'color-mix(in oklab, var(--surface) 92%, transparent)',
  }

  const departmentItems: { key: RoleOrSectionKey; label: string; color: string; isCustom?: boolean }[] = [
    ...DEPARTMENT_ROLE_KEYS.map((rk) => ({
      key: rk as RoleOrSectionKey,
      label: labels.roles[rk],
      color: departmentColorOverrides[rk] ?? ROLE_COLORS[rk],
    })),
    ...customSections.map((cs) => ({ key: cs.key, label: cs.name, color: departmentColorOverrides[cs.key] ?? cs.color, isCustom: true })),
  ]

  const rolesForDepartment = (key: RoleOrSectionKey) => roleItemsByDepartment[String(key)] ?? []
  const draftDepartment = departmentItems.find((it) => it.key === draftDepartmentKey) ?? departmentItems[0]
  const draftRoles = draftDepartment ? rolesForDepartment(draftDepartment.key) : []
  const draftRoleItem = draftRoles.find((it) => it.key === draftRole) ?? draftRoles[0] ?? null
  const canSave = Boolean(draftDepartment && draftRoleItem)
  const initials = empName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AP'

  const roleCount = (count: number) => labels.assignmentRoleCount.replace('{n}', String(count))
  const branchCode = (key: RoleOrSectionKey, label: string) => {
    if (key === 'salesDepartment') return labels.deptSales.startsWith('В') ? 'ВП' : labels.deptSales.startsWith('От') ? 'ОП' : 'SD'
    if (key === 'developmentDepartment') return labels.deptSales.startsWith('В') ? 'ВР' : labels.deptSales.startsWith('От') ? 'ОР' : 'DD'
    if (key === 'hr') return 'HR'
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'BR'
  }

  const softColor = (color: string, amount = 10) => `color-mix(in oklab, ${color} ${amount}%, ${tone.panel})`
  const activeRoleForDepartment = (key: RoleOrSectionKey) => {
    const roles = rolesForDepartment(key)
    if (String(key) === String(draftDepartmentKey)) return roles.find((role) => role.key === draftRole) ?? roles[0] ?? null
    return roles[0] ?? null
  }

  const handleDepartmentOpen = (key: RoleOrSectionKey) => {
    const keyString = String(key)
    const closingCurrent = expandedDepartmentKey === keyString
    setExpandedDepartmentKey(closingCurrent ? '' : keyString)
    setDraftDepartmentKey(key)
    const roles = rolesForDepartment(key)
    setDraftRole(roles[0]?.key ?? '')
    setAddingDepartment(false)
  }

  const handleRolePick = (departmentKey: RoleOrSectionKey, role: string) => {
    setExpandedDepartmentKey(String(departmentKey))
    setDraftDepartmentKey(departmentKey)
    setDraftRole(role)
  }

  const handleCreateRole = (department: { key: RoleOrSectionKey; color: string }) => {
    const name = newRoleName.trim()
    if (!name) return
    onCreateRole(department.key, name, department.color)
    handleRolePick(department.key, name)
    setNewRoleName('')
    setAddingDepartmentKey(null)
  }

  const handleCreateDepartment = () => {
    const name = newDepartmentName.trim()
    if (!name) return
    const key = onCreateDepartment(name, newDepartmentColor)
    setNewDepartmentName('')
    setAddingDepartment(false)
    setExpandedDepartmentKey(String(key))
    setDraftDepartmentKey(key)
    setDraftRole('')
  }

  const handleSave = () => {
    if (!canSave || !draftDepartment) return
    onPickDepartment(draftDepartment.key)
    onPickRole(draftRoleItem.key)
    requestClose()
  }

  const previewDepartment = draftDepartment?.label ?? labels.roles.salesDepartment
  const previewRole = draftRoleItem?.label ?? labels.assignmentRolePlaceholder
  const branchText = `${previewDepartment} › ${previewRole}`

  return (
    <div
      className="smengo-role-picker-overlay"
      data-closing={closing}
      onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: tone.overlay,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${labels.assignmentTitle} — ${empName}`}
        style={{
          width: 'min(480px, calc(100vw - 20px))',
          maxHeight: '74vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 12,
          border: `1px solid ${tone.border}`,
          background: tone.panel,
          color: tone.text,
          boxShadow: '0 22px 56px rgba(15,23,42,0.22)',
          fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
        }}
        className="smengo-role-picker-panel"
        data-closing={closing}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderBottom: `1px solid ${tone.border}`,
          }}
        >
          <span
            aria-label={empName}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: avatarSrc
                ? `url("${avatarSrc}") center / cover no-repeat`
                : 'linear-gradient(135deg, #8b73c9, #5b4b8b)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 750,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            {avatarSrc ? null : initials}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: tone.text, fontSize: 16, fontWeight: 760, lineHeight: 1.08, letterSpacing: 0 }}>
              {empName}
            </div>
            <div style={{ marginTop: 3, color: tone.muted, fontSize: 12, fontWeight: 500 }}>
              {labels.assignmentSubtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={labels.empCalendarClose}
            className="smengo-role-picker-action"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${tone.border}`,
              background: tone.card,
              color: tone.muted,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>

        <div style={{ overflow: 'auto', padding: '10px 12px 8px' }}>
          <div style={{ color: tone.muted, fontSize: 10, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {labels.assignmentStructureLabel}
          </div>

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {departmentItems.map((department) => {
              const key = String(department.key)
              const roles = rolesForDepartment(department.key)
              const expanded = expandedDepartmentKey === key
              const activeBranch = String(draftDepartmentKey) === key
              const selectedRole = activeRoleForDepartment(department.key)
              const branchAccent = selectedRole?.color ?? department.color

              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => handleDepartmentOpen(department.key)}
                    aria-expanded={expanded}
                    className="smengo-role-picker-branch"
                    style={{
                      width: '100%',
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      borderRadius: 10,
                      border: `1.5px solid ${activeBranch ? branchAccent : tone.border}`,
                      background: activeBranch ? softColor(branchAccent, 9) : tone.card,
                      color: tone.text,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1.5px solid color-mix(in oklab, ${branchAccent} 50%, ${tone.border})`,
                        background: `color-mix(in oklab, ${branchAccent} 13%, ${tone.panel})`,
                        color: branchAccent,
                        fontSize: 11,
                        fontWeight: 850,
                      }}
                    >
                      {branchCode(department.key, department.label)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, color: tone.text, fontSize: 14, fontWeight: 760, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {department.label}
                    </span>
                    <span style={{ color: tone.faint, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {roleCount(roles.length)}
                    </span>
                    <span aria-hidden="true" style={{ color: tone.faint, fontSize: 12, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 140ms ease' }}>›</span>
                  </button>

                  <div
                    className="smengo-role-picker-branch-body"
                    data-expanded={expanded}
                    aria-hidden={!expanded}
                    style={{
                      marginLeft: 24,
                      paddingLeft: 14,
                      borderLeft: `2px solid ${tone.tree}`,
                      paddingTop: expanded ? 3 : 0,
                      paddingBottom: expanded ? 6 : 0,
                      maxHeight: expanded ? 380 : 0,
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? 'translateY(0)' : 'translateY(-4px)',
                      overflow: 'hidden',
                      pointerEvents: expanded ? 'auto' : 'none',
                    }}
                  >
                      {roles.length === 0 && (
                        <div style={{ color: tone.muted, fontSize: 12, padding: '6px 0' }}>
                          {labels.assignmentNoRoles}
                        </div>
                      )}
                      {roles.map((role) => {
                        const active = activeBranch && role.key === draftRole
                        return (
                          <div key={role.key} style={{ display: 'flex', alignItems: 'center' }}>
                            <span aria-hidden="true" style={{ width: 15, borderTop: `2px solid ${tone.tree}`, marginRight: 5 }} />
                            <button
                              type="button"
                              onClick={() => handleRolePick(department.key, role.key)}
                              className="smengo-role-picker-row"
                              style={{
                                minHeight: 32,
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                border: 0,
                                borderRadius: 8,
                                background: active ? softColor(role.color, 11) : 'transparent',
                                color: tone.text,
                                padding: '0 10px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'inherit',
                              }}
                            >
                              <span
                                style={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  background: active ? role.color : 'transparent',
                                  border: active ? 'none' : `2px solid ${tone.faint}`,
                                  boxShadow: active ? `0 0 0 1px color-mix(in oklab, ${role.color} 28%, transparent)` : 'none',
                                }}
                              />
                              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 760 : 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {role.label}
                              </span>
                              {active && <Check style={{ width: 13, height: 13, color: role.color, flexShrink: 0 }} />}
                            </button>
                          </div>
                        )
                      })}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span aria-hidden="true" style={{ width: 15, borderTop: `2px solid ${tone.tree}`, marginRight: 5 }} />
                        {addingDepartmentKey === key ? (
                          <div
                            style={{
                              minHeight: 36,
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              borderRadius: 8,
                              border: `1.5px dashed ${tone.dashed}`,
                              background: tone.field,
                              padding: '4px 7px 4px 10px',
                            }}
                          >
                            <input
                              value={newRoleName}
                              autoFocus
                              onChange={(e) => setNewRoleName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateRole(department)
                                if (e.key === 'Escape') {
                                  setAddingDepartmentKey(null)
                                  setNewRoleName('')
                                }
                              }}
                              placeholder={labels.assignmentRolePlaceholder}
                              style={{
                                minWidth: 0,
                                flex: 1,
                                height: 28,
                                border: 0,
                                outline: 'none',
                                background: 'transparent',
                                color: tone.text,
                                fontSize: 13,
                                fontWeight: 650,
                                fontFamily: 'inherit',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleCreateRole(department)}
                              disabled={!newRoleName.trim()}
                              className="smengo-role-picker-action"
                              style={{
                                height: 28,
                                border: 0,
                                borderRadius: 7,
                                padding: '0 10px',
                                background: newRoleName.trim() ? branchAccent : tone.card,
                                color: newRoleName.trim() ? '#fff' : tone.faint,
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: newRoleName.trim() ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {labels.createBtn}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedDepartmentKey(key)
                              setAddingDepartmentKey(key)
                              setNewRoleName('')
                            }}
                            className="smengo-role-picker-add"
                            style={{
                              minHeight: 36,
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: 8,
                              border: `1.5px dashed ${tone.dashed}`,
                              background: 'transparent',
                              color: tone.faint,
                              padding: '0 12px',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 800,
                              textAlign: 'left',
                              fontFamily: 'inherit',
                            }}
                          >
                            {labels.assignmentAddRole}
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              )
            })}
            {addingDepartment ? (
              <div
                className="smengo-role-picker-expanded"
                style={{
                  minHeight: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  borderRadius: 9,
                  border: `1.5px dashed ${tone.dashed}`,
                  background: tone.card,
                  padding: '5px 7px',
                }}
              >
                <input
                  value={newDepartmentName}
                  autoFocus
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateDepartment()
                    if (e.key === 'Escape') {
                      setAddingDepartment(false)
                      setNewDepartmentName('')
                    }
                  }}
                  placeholder={labels.assignmentDepartmentPlaceholder}
                  style={{
                    minWidth: 0,
                    flex: 1,
                    height: 28,
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    color: tone.text,
                    fontSize: 13,
                    fontWeight: 650,
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  {SOLID_COLORS.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewDepartmentColor(item.value)}
                      aria-label={item.id}
                      className="smengo-role-picker-action"
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: 0,
                        padding: 0,
                        background: item.value,
                        cursor: 'pointer',
                        boxShadow: item.value === newDepartmentColor
                          ? `0 0 0 2px ${tone.panel}, 0 0 0 4px ${item.value}`
                          : `0 0 0 1px ${tone.borderStrong}`,
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateDepartment}
                  disabled={!newDepartmentName.trim()}
                  className="smengo-role-picker-action"
                  style={{
                    height: 28,
                    border: 0,
                    borderRadius: 7,
                    padding: '0 10px',
                    background: newDepartmentName.trim() ? newDepartmentColor : tone.panelSoft,
                    color: newDepartmentName.trim() ? '#fff' : tone.faint,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: newDepartmentName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {labels.createBtn}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingDepartment(true)
                  setExpandedDepartmentKey('')
                  setAddingDepartmentKey(null)
                }}
                className="smengo-role-picker-add"
                style={{
                  minHeight: 36,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 9,
                  border: `1.5px dashed ${tone.dashed}`,
                  background: 'transparent',
                  color: tone.faint,
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 800,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                {labels.assignmentAddDepartment}
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '9px 14px',
            borderTop: `1px solid ${tone.border}`,
            background: tone.footer,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ minWidth: 0, color: tone.faint, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {labels.assignmentBranchLabel} {branchText}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <button
              type="button"
              onClick={requestClose}
              className="smengo-role-picker-action"
              style={{
                minWidth: 88,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${tone.borderStrong}`,
                background: 'transparent',
                color: tone.muted,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {labels.cancelBtn}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="smengo-role-picker-action"
              style={{
                minWidth: 92,
                height: 34,
                borderRadius: 8,
                border: 0,
                background: canSave ? '#f45b2f' : tone.card,
                color: canSave ? '#fff' : tone.faint,
                fontSize: 13,
                fontWeight: 850,
                cursor: canSave ? 'pointer' : 'not-allowed',
                boxShadow: canSave ? '0 10px 24px rgba(244,91,47,0.22)' : 'none',
              }}
            >
              {labels.saveBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type AddSectionProps = {
  theme: 'standard' | 'classic'
  labels: GridPreviewLabels
  onCreate: (section: CustomSection) => void
  onClose: () => void
}

export function AddSectionModal({ theme, labels, onCreate, onClose }: AddSectionProps) {
  const isClassic = theme === 'classic'
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string>('rose')
  const [customHex, setCustomHex] = useState<string>('#6366f1')
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  // Collision-safe id for new custom sections (rapid double-Enter / double-click safe).
  const newSectionKey = () => {
    const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    return `cs:${rand}`
  }

  const ALL_PRESETS = [...SOLID_COLORS, ...GRADIENT_COLORS] as { id: string; value: string }[]
  const color = selectedId === 'custom'
    ? customHex
    : (ALL_PRESETS.find((c) => c.id === selectedId)?.value ?? SOLID_COLORS[0].value)

  const trimmed = name.trim()
  const canCreate = trimmed.length > 0

  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--muted-foreground)', marginBottom: 8,
    }}>{text}</div>
  )

  const swatchGrid = (items: { id: string; value: string }[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 7 }}>
      {items.map((c) => {
        const active = selectedId === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: '50%',
              background: c.value,
              border: 0, padding: 0, cursor: 'pointer',
              boxShadow: active
                ? `0 0 0 2.5px var(--surface), 0 0 0 4.5px var(--accent), 0 4px 12px rgba(0,0,0,0.25)`
                : '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.12s, box-shadow 0.12s',
              transform: active ? 'scale(1.12)' : 'scale(1)',
            }}
          />
        )
      })}
    </div>
  )

  return (
    <ModalShell theme={theme} title={labels.addSectionTitle} closeLabel={labels.empCalendarClose} onClose={onClose} width={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Name input */}
        <div>
          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--muted-foreground)',
          }}>{labels.sectionNameLabel}</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.sectionNamePlaceholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 12px',
              borderRadius: isClassic ? 4 : 8,
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              color: 'inherit',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canCreate) {
                onCreate({ key: newSectionKey(), name: trimmed, color })
                onClose()
              }
            }}
          />
        </div>

        {/* Standard colors */}
        <div>
          {sectionLabel(labels.stdColorsLabel)}
          {swatchGrid(SOLID_COLORS as unknown as { id: string; value: string }[])}
        </div>

        {/* Gradients */}
        <div>
          {sectionLabel(labels.gradientsLabel)}
          {swatchGrid(GRADIENT_COLORS as unknown as { id: string; value: string }[])}
        </div>

        {/* Custom color */}
        <div>
          {sectionLabel(labels.customColorLabel)}
          <div
            role="button"
            tabIndex={0}
            onClick={() => { setSelectedId('custom'); colorInputRef.current?.click() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedId('custom'); colorInputRef.current?.click() } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: isClassic ? 4 : 8,
              border: `1.5px solid ${selectedId === 'custom' ? 'var(--accent)' : 'var(--border)'}`,
              background: selectedId === 'custom' ? 'var(--accent-soft)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'border-color 0.12s, background 0.12s',
              position: 'relative',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: customHex,
              boxShadow: '0 0 0 1.5px var(--border)',
            }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{labels.customColorLabel}</span>
            <span style={{
              fontSize: 11, fontFamily: 'ui-monospace, monospace',
              color: 'var(--muted-foreground)', letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>{customHex}</span>
            <input
              ref={colorInputRef}
              type="color"
              value={customHex}
              onChange={(e) => { setCustomHex(e.target.value); setSelectedId('custom') }}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, padding: 0, border: 0 }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          borderRadius: isClassic ? 4 : 8,
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: color,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{labels.previewLabel}:</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{trimmed || labels.sectionNamePlaceholder}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: isClassic ? 4 : 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'inherit',
              fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >{labels.cancelBtn}</button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => {
              if (!canCreate) return
              onCreate({ key: newSectionKey(), name: trimmed, color })
              onClose()
            }}
            style={{
              padding: '8px 20px',
              borderRadius: isClassic ? 4 : 8,
              border: 0,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              opacity: canCreate ? 1 : 0.45,
              transition: 'opacity 0.12s',
            }}
          >{labels.createBtn}</button>
        </div>
      </div>
    </ModalShell>
  )
}
