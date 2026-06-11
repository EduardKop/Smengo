'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Check, ChevronRight, Plus } from 'lucide-react'
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
      className="smengo-overlay-scrim"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 12,
      }}
    >
      <div
        ref={ref}
        className="smengo-modal-panel"
        style={{
          width: '100%', maxWidth: width,
          color: 'var(--foreground)',
          borderRadius: isClassic ? 10 : 18,
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
            className="transition-colors hover:bg-muted hover:text-foreground"
            style={{
              background: 'transparent', border: 0,
              width: 28, height: 28,
              borderRadius: 8, cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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
          borderRadius: 16,
          border: `1px solid ${tone.border}`,
          background: tone.panel,
          color: tone.text,
          boxShadow: 'var(--modal-shadow)',
          fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
        }}
        className="smengo-role-picker-panel"
        data-closing={closing}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '13px 14px',
            borderBottom: `1px solid ${tone.border}`,
            background: `linear-gradient(180deg, color-mix(in oklab, ${draftDepartment?.color ?? 'var(--accent)'} 5%, transparent), transparent)`,
          }}
        >
          <span
            aria-label={empName}
            style={{
              width: 38,
              height: 38,
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
              boxShadow: `0 0 0 2px ${tone.panel}, 0 0 0 3.5px color-mix(in oklab, ${draftRoleItem?.color ?? draftDepartment?.color ?? 'var(--accent)'} 65%, transparent)`,
              overflow: 'hidden',
              transition: 'box-shadow 200ms ease',
            }}
          >
            {avatarSrc ? null : initials}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: tone.text, fontSize: 15, fontWeight: 650, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
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
              width: 30,
              height: 30,
              borderRadius: 9,
              border: 0,
              background: 'transparent',
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

        <div style={{ overflow: 'auto', padding: '12px 14px 10px' }}>
          <div style={{ color: tone.muted, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {labels.assignmentStructureLabel}
          </div>

          <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
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
                      minHeight: 46,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: 12,
                      border: `1px solid ${activeBranch ? `color-mix(in oklab, ${branchAccent} 34%, var(--pop-border))` : 'var(--pop-border)'}`,
                      background: activeBranch ? softColor(branchAccent, 7) : tone.card,
                      color: tone.text,
                      padding: '7px 11px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      boxShadow: activeBranch ? `inset 3px 0 0 ${branchAccent}` : 'none',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 4,
                        flexShrink: 0,
                        background: department.color,
                        boxShadow: `0 0 0 3px color-mix(in oklab, ${department.color} 16%, transparent)`,
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0, color: tone.text, fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {department.label}
                    </span>
                    {activeBranch && selectedRole && !expanded && (
                      <span
                        style={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          borderRadius: 999,
                          padding: '2.5px 9px',
                          background: softColor(selectedRole.color, 14),
                          color: selectedRole.color,
                          fontSize: 11,
                          fontWeight: 650,
                        }}
                      >
                        {selectedRole.label}
                      </span>
                    )}
                    <span
                      aria-label={roleCount(roles.length)}
                      title={roleCount(roles.length)}
                      style={{
                        minWidth: 21,
                        height: 19,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 6px',
                        borderRadius: 999,
                        background: 'var(--grid-pill-bg)',
                        color: tone.muted,
                        fontSize: 10.5,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {roles.length}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      style={{
                        width: 14,
                        height: 14,
                        color: tone.faint,
                        flexShrink: 0,
                        transform: expanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 160ms ease',
                      }}
                    />
                  </button>

                  <div
                    className="smengo-role-picker-branch-body"
                    data-expanded={expanded}
                    aria-hidden={!expanded}
                    style={{
                      marginLeft: 16,
                      paddingLeft: 13,
                      borderLeft: `2px solid ${expanded ? `color-mix(in oklab, ${branchAccent} 32%, var(--pop-border))` : 'var(--pop-border)'}`,
                      marginTop: expanded ? 5 : 0,
                      paddingTop: expanded ? 1 : 0,
                      paddingBottom: expanded ? 4 : 0,
                      maxHeight: expanded ? 380 : 0,
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? 'translateY(0)' : 'translateY(-4px)',
                      overflow: 'hidden',
                      pointerEvents: expanded ? 'auto' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                      {roles.length === 0 && (
                        <div style={{ color: tone.muted, fontSize: 12, padding: '6px 0 6px 10px' }}>
                          {labels.assignmentNoRoles}
                        </div>
                      )}
                      {roles.map((role) => {
                        const active = activeBranch && role.key === draftRole
                        return (
                          <button
                            key={role.key}
                            type="button"
                            onClick={() => handleRolePick(department.key, role.key)}
                            className="smengo-role-picker-row"
                            style={{
                              minHeight: 34,
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 9,
                              border: 0,
                              borderRadius: 9,
                              background: active ? softColor(role.color, 11) : 'transparent',
                              color: tone.text,
                              padding: '0 10px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontFamily: 'inherit',
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                flexShrink: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: active
                                  ? `1.5px solid ${role.color}`
                                  : `1.5px solid color-mix(in oklab, var(--pop-border) 60%, ${tone.muted})`,
                                transition: 'border-color 140ms ease',
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: active ? role.color : 'transparent',
                                  transform: active ? 'scale(1)' : 'scale(0.4)',
                                  transition: 'transform 160ms cubic-bezier(.34,1.5,.5,1), background 140ms ease',
                                }}
                              />
                            </span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {role.label}
                            </span>
                            {active && <Check style={{ width: 13.5, height: 13.5, color: role.color, flexShrink: 0 }} strokeWidth={2.6} />}
                          </button>
                        )
                      })}
                      {addingDepartmentKey === key ? (
                        <div
                          style={{
                            minHeight: 36,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            borderRadius: 9,
                            border: `1.5px dashed color-mix(in oklab, ${branchAccent} 45%, ${tone.dashed})`,
                            background: tone.field,
                            padding: '4px 7px 4px 10px',
                            marginTop: 2,
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
                            minHeight: 32,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            borderRadius: 9,
                            border: 0,
                            background: 'transparent',
                            color: tone.faint,
                            padding: '0 10px',
                            cursor: 'pointer',
                            fontSize: 12.5,
                            fontWeight: 600,
                            textAlign: 'left',
                            fontFamily: 'inherit',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1.5px dashed ${tone.dashed}`,
                            }}
                          >
                            <Plus style={{ width: 9, height: 9 }} strokeWidth={2.5} />
                          </span>
                          {labels.assignmentAddRole}
                        </button>
                      )}
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
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 12,
                  border: `1.5px dashed ${tone.dashed}`,
                  background: 'transparent',
                  color: tone.faint,
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px dashed ${tone.dashed}`,
                  }}
                >
                  <Plus style={{ width: 10, height: 10 }} strokeWidth={2.5} />
                </span>
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
            padding: '10px 14px',
            borderTop: `1px solid ${tone.border}`,
            background: tone.footer,
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            title={`${labels.assignmentBranchLabel} ${branchText}`}
            style={{
              minWidth: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '4.5px 10px',
              borderRadius: 999,
              background: 'var(--grid-pill-bg)',
              border: '1px solid var(--pop-border)',
              color: tone.muted,
              fontSize: 11.5,
              fontWeight: 550,
              overflow: 'hidden',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                flexShrink: 0,
                background: draftRoleItem?.color ?? draftDepartment?.color ?? 'var(--accent)',
              }}
            />
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {branchText}
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <button
              type="button"
              onClick={requestClose}
              className="smengo-role-picker-action"
              style={{
                minWidth: 84,
                height: 34,
                borderRadius: 10,
                border: '1px solid var(--pop-border)',
                background: 'transparent',
                color: tone.muted,
                fontSize: 13,
                fontWeight: 600,
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
                borderRadius: 10,
                border: '1px solid color-mix(in oklab, #fff 18%, var(--accent))',
                background: 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 88%, #fff 12%), var(--accent))',
                color: '#fff',
                opacity: canSave ? 1 : 0.45,
                fontSize: 13,
                fontWeight: 650,
                cursor: canSave ? 'pointer' : 'not-allowed',
                boxShadow: canSave
                  ? '0 6px 16px -6px color-mix(in oklab, var(--accent) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)'
                  : 'none',
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
              borderRadius: isClassic ? 4 : 10,
              border: '1px solid var(--pop-border)',
              background: 'var(--grid-pill-bg)',
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
              border: `1px solid ${selectedId === 'custom' ? 'var(--accent)' : 'var(--pop-border)'}`,
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
