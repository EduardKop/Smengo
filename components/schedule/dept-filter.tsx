'use client'

/**
 * Фильтр отделов — выпадающая пилюля из топбара демо
 * (grid-preview.tsx 3077–3109): кнопка smengo-tool + меню smengo-pop.
 */

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { DepartmentRow, EmployeeRow } from '@/lib/schedule/types'

/** Sentinel value in URL ?dept= param meaning "no department" group */
const NO_DEPT_FILTER = 'null'

interface DeptFilterProps {
  departments: DepartmentRow[]
  employees: EmployeeRow[]
  /** Currently selected dept filter value (dept id, 'null', or null = all) */
  value: string | null
  onChange: (value: string | null) => void
}

export function DeptFilter({ departments, employees, value, onChange }: DeptFilterProps) {
  const t = useTranslations('app.schedule')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const hasNoDeptEmployees = employees.some((e) => e.dept_id === null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const options: { key: string | null; label: string }[] = [
    { key: null, label: t('allDepts') },
    ...departments.map((d) => ({ key: d.id as string | null, label: d.name })),
    ...(hasNoDeptEmployees ? [{ key: NO_DEPT_FILTER as string | null, label: t('deptNoDept') }] : []),
  ]

  const current = options.find((o) => o.key === value) ?? options[0]

  const pick = (key: string | null) => {
    onChange(key)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="smengo-tool"
        aria-label={t('allDepts')}
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown style={{ width: 11, height: 11 }} />
      </button>
      {open && (
        <div
          /* z-50 — выше липкой шапки грида (z-30), иначе она перекрывает меню */
          className="smengo-pop absolute left-0 z-50 mt-1.5 w-48 p-1.5"
          style={{ ['--pop-origin' as string]: 'top left' }}
        >
          {options.map((o) => {
            const active = o.key === value || (o.key === null && value === null)
            return (
              <button
                key={o.key ?? 'all'}
                type="button"
                onClick={() => pick(o.key)}
                className="smengo-pop-item justify-between"
                style={{ fontSize: 12.5 }}
              >
                <span className="min-w-0 truncate" style={{ fontWeight: active ? 650 : 500 }}>{o.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
