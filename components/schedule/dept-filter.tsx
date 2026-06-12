'use client'

import { useTranslations } from 'next-intl'
import type { DepartmentRow, EmployeeRow } from '@/lib/schedule/types'

/** Sentinel value in URL ?dept= param meaning "no department" group */
const NO_DEPT_FILTER = 'null'

const selectClass =
  'h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

interface DeptFilterProps {
  departments: DepartmentRow[]
  employees: EmployeeRow[]
  /** Currently selected dept filter value (dept id, 'null', or null = all) */
  value: string | null
  onChange: (value: string | null) => void
}

export function DeptFilter({ departments, employees, value, onChange }: DeptFilterProps) {
  const t = useTranslations('app.schedule')

  const hasNoDeptEmployees = employees.some((e) => e.dept_id === null)

  const selectValue = value ?? ''

  return (
    <select
      value={selectValue}
      onChange={(e) => {
        const v = e.currentTarget.value
        onChange(v === '' ? null : v)
      }}
      className={selectClass}
      aria-label={t('allDepts')}
    >
      <option value="">{t('allDepts')}</option>

      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}

      {hasNoDeptEmployees && (
        <option value={NO_DEPT_FILTER}>{t('deptNoDept')}</option>
      )}
    </select>
  )
}
