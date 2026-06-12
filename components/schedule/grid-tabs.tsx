'use client'

/**
 * Пилюли «График | Сотрудники» — копия DemoTabs из демо
 * (grid-preview.tsx 3771–3833): иконки phosphor CalendarDots/UsersThree.
 */

import { CalendarDots, UsersThree } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'

export type ScheduleTab = 'schedule' | 'employees'

interface GridTabsProps {
  active: ScheduleTab
  onChange: (tab: ScheduleTab) => void
  compact?: boolean
}

export function GridTabs({ active, onChange, compact = false }: GridTabsProps) {
  const t = useTranslations('app.schedule')

  const tabs: Array<{ key: ScheduleTab; label: string; icon: React.ReactNode }> = [
    { key: 'schedule', label: t('scheduleTab'), icon: <CalendarDots size={compact ? 13 : 14} weight="duotone" /> },
    { key: 'employees', label: t('employeesTab'), icon: <UsersThree size={compact ? 13 : 14} weight="duotone" /> },
  ]

  return (
    <div
      role="tablist"
      aria-label={t('modeGroup')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--grid-pill-bg)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="cursor-pointer transition-colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: compact ? 4 : 6,
              border: 0,
              borderRadius: 6,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              padding: compact ? '3px 7px' : '4px 9px',
              fontSize: compact ? 10 : 11,
              fontWeight: isActive ? 650 : 550,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
