'use client'

import { useMemo, useState } from 'react'
import {
  Search, Phone, Send, Mail, Copy, Check,
  CalendarDays, Clock3, CalendarCheck, FileText, ShieldCheck,
} from 'lucide-react'
import { Avatar } from './grid-preview'

export type EmployeeDatabaseDemoLabels = {
  chrome: string
  searchPlaceholder: string
  deptAll: string
  departments: string[]
  emptySearch: string
  tabProfile: string
  tabDocs: string
  tabDates: string
  phone: string
  telegram: string
  email: string
  copyTitle: string
  copiedTitle: string
  docSigned: string
  docExpiring: string
  docMissing: string
  docRequest: string
  docRequested: string
  docNames: string[]
  datesBirthday: string
  datesTenure: string
  datesFirstShift: string
  statusActive: string
  employees: {
    name: string
    role: string
    dept: number
    phone: string
    tg: string
    email: string
    birthday: string
    tenure: string
    firstShift: string
    docs: number[] // 0 signed · 1 expiring · 2 missing
  }[]
}

// Photo avatars reuse the stable name → photo map from grid-preview.
const AVATAR_NAMES = ['Anna Petrov', 'Mark Sidorov', 'Kate Volkova', 'Daria Kos', 'Alex Novikov', 'Yulia Lebed']

type Tab = 'profile' | 'docs' | 'dates'

export function EmployeeDatabaseDemo({ labels }: { labels: EmployeeDatabaseDemoLabels }) {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [tab, setTab] = useState<Tab>('profile')
  const [requested, setRequested] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return labels.employees
      .map((emp, idx) => ({ emp, idx }))
      .filter(({ emp }) => (dept === null || emp.dept === dept)
        && (q === '' || emp.name.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q)))
  }, [labels.employees, query, dept])

  const selected = labels.employees[selectedIdx]

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
        className="flex items-center gap-1.5"
        style={{ padding: '10px 14px', background: 'var(--grid-chrome)', borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
          {labels.chrome}
        </span>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        {/* Directory: search + list */}
        <div className="flex min-w-0 flex-col border-b sm:border-b-0 sm:border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <label
              className="flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
            >
              <Search size={14} strokeWidth={2.2} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full min-w-0 bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--foreground)', border: 0 }}
              />
            </label>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <DeptPill label={labels.deptAll} active={dept === null} onClick={() => setDept(null)} />
              {labels.departments.map((d, i) => (
                <DeptPill key={d} label={d} active={dept === i} onClick={() => setDept(dept === i ? null : i)} />
              ))}
            </div>
          </div>

          <div className="flex max-h-[330px] flex-col overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                {labels.emptySearch}
              </div>
            )}
            {filtered.map(({ emp, idx }) => {
              const active = idx === selectedIdx
              return (
                <button
                  key={emp.name}
                  type="button"
                  onClick={() => { setSelectedIdx(idx); setTab('profile') }}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors"
                  style={{
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: 0,
                  }}
                >
                  <Avatar name={AVATAR_NAMES[idx % AVATAR_NAMES.length]} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
                      {emp.name}
                    </span>
                    <span className="block truncate text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {labels.departments[emp.dept]} · {emp.role}
                    </span>
                  </span>
                  {emp.docs.some((d) => d !== 0) && (
                    <span
                      title={labels.docExpiring}
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: 'var(--warning)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected employee card */}
        <div className="min-w-0 p-4" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <Avatar name={AVATAR_NAMES[selectedIdx % AVATAR_NAMES.length]} size={44} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                {selected.name}
              </div>
              <div className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                {labels.departments[selected.dept]} · {selected.role}
              </div>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide"
              style={{ background: 'color-mix(in oklab, var(--success) 14%, transparent)', color: 'var(--success)' }}
            >
              <ShieldCheck size={11} strokeWidth={2.4} />
              {labels.statusActive}
            </span>
          </div>

          <div
            className="mt-3.5 inline-flex w-full items-center gap-0.5 rounded-full border p-0.5"
            style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
          >
            {([
              ['profile', labels.tabProfile],
              ['docs', labels.tabDocs],
              ['dates', labels.tabDates],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex-1 cursor-pointer rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors"
                style={{
                  background: tab === key ? 'var(--surface)' : 'transparent',
                  color: tab === key ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: tab === key ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  border: 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 min-h-[180px]">
            {tab === 'profile' && (
              <div className="flex flex-col gap-1.5">
                <ContactRow Icon={Phone} label={labels.phone} value={selected.phone} copyTitle={labels.copyTitle} copiedTitle={labels.copiedTitle} />
                <ContactRow Icon={Send} label={labels.telegram} value={selected.tg} copyTitle={labels.copyTitle} copiedTitle={labels.copiedTitle} />
                <ContactRow Icon={Mail} label={labels.email} value={selected.email} copyTitle={labels.copyTitle} copiedTitle={labels.copiedTitle} />
              </div>
            )}

            {tab === 'docs' && (
              <div className="flex flex-col gap-1.5">
                {labels.docNames.map((doc, i) => {
                  const status = selected.docs[i] ?? 0
                  const reqKey = `${selectedIdx}-${i}`
                  const isRequested = requested[reqKey]
                  const statusLabel = status === 0 ? labels.docSigned : status === 1 ? labels.docExpiring : labels.docMissing
                  const statusColor = status === 0 ? 'var(--success)' : status === 1 ? 'var(--warning)' : 'var(--st-alert)'
                  return (
                    <div
                      key={doc}
                      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
                      style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
                    >
                      <FileText size={15} strokeWidth={2} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold" style={{ color: 'var(--foreground)' }}>
                        {doc}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `color-mix(in oklab, ${statusColor} 14%, transparent)`, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                      {status !== 0 && (
                        <button
                          type="button"
                          onClick={() => setRequested((prev) => ({ ...prev, [reqKey]: true }))}
                          disabled={isRequested}
                          className="shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-colors"
                          style={{
                            background: isRequested ? 'color-mix(in oklab, var(--success) 14%, transparent)' : 'var(--accent)',
                            color: isRequested ? 'var(--success)' : '#fff',
                            border: 0,
                            cursor: isRequested ? 'default' : 'pointer',
                          }}
                        >
                          {isRequested ? labels.docRequested : labels.docRequest}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'dates' && (
              <div className="flex flex-col gap-1.5">
                <DateRow Icon={CalendarDays} label={labels.datesBirthday} value={selected.birthday} />
                <DateRow Icon={Clock3} label={labels.datesTenure} value={selected.tenure} />
                <DateRow Icon={CalendarCheck} label={labels.datesFirstShift} value={selected.firstShift} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeptPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
      style={{
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--muted-foreground)',
      }}
    >
      {label}
    </button>
  )
}

function ContactRow({
  Icon, label, value, copyTitle, copiedTitle,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  label: string
  value: string
  copyTitle: string
  copiedTitle: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      title={copied ? copiedTitle : copyTitle}
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(value).catch(() => {})
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
      className="group flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors hover:border-foreground/25"
      style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
    >
      <Icon size={15} strokeWidth={2} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </span>
        <span className="block truncate text-[12.5px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
          {value}
        </span>
      </span>
      <span className="shrink-0" style={{ color: copied ? 'var(--success)' : 'var(--muted-foreground)' }}>
        {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={13} strokeWidth={2} className="opacity-50 transition-opacity group-hover:opacity-100" />}
      </span>
    </button>
  )
}

function DateRow({
  Icon, label, value,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
      style={{ borderColor: 'var(--border)', background: 'var(--grid-pill-bg)' }}
    >
      <Icon size={15} strokeWidth={2} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
      <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
      <span className="shrink-0 text-[12.5px] font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
        {value}
      </span>
    </div>
  )
}
