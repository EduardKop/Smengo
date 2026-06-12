'use client'

import { useTranslations } from 'next-intl'
import { LayoutGrid, List } from 'lucide-react'
import type { EmployeeRow, DepartmentRow } from '@/lib/schedule/types'
import { EmployeeCard } from './employee-card'
import { EmployeeList } from './employee-list'

export type EmployeeView = 'cards' | 'list'

interface EmployeesTabProps {
  employees: EmployeeRow[]
  departments: DepartmentRow[]
  today: string
  view: EmployeeView
  onViewChange: (v: EmployeeView) => void
  /** If provided, edit modal is accessible on click */
  onEdit?: (employee: EmployeeRow) => void
}

export function EmployeesTab({
  employees,
  departments,
  today,
  view,
  onViewChange,
  onEdit,
}: EmployeesTabProps) {
  const t = useTranslations('app.schedule')

  return (
    <div className="flex flex-col gap-3">
      {/* View toggle — top right */}
      <div className="flex items-center justify-end">
        <div
          role="group"
          aria-label={t('viewCards')}
          className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
        >
          {([
            { key: 'cards' as EmployeeView, label: t('viewCards'), Icon: LayoutGrid },
            { key: 'list' as EmployeeView, label: t('viewList'), Icon: List },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onViewChange(key)}
              aria-pressed={view === key}
              className={[
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all',
                view === key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Icon size={13} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              departments={departments}
              today={today}
              onEdit={onEdit}
            />
          ))}
          {employees.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-12 text-sm text-muted-foreground">
              {t('emptyTitle')}
            </div>
          )}
        </div>
      ) : (
        <EmployeeList
          employees={employees}
          departments={departments}
          today={today}
          onEdit={onEdit}
        />
      )}
    </div>
  )
}
