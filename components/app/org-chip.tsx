'use client'

/**
 * Чип организации в левом верхнем углу контента (язык 7shifts: кружок-инициал
 * + название). Живёт в потоке контента — выезжающая панель сайдбара
 * накрывает его, не сдвигая. При нескольких организациях кликабелен:
 * нативный select растянут поверх чипа невидимым слоем.
 */

import { useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import { switchOrgAction } from '@/lib/actions/org'

interface OrgChipProps {
  orgName: string
  memberships: { orgId: string; orgName: string }[]
  activeOrgId: string
  switcherLabel: string
}

export function OrgChip({ orgName, memberships, activeOrgId, switcherLabel }: OrgChipProps) {
  const [, startTransition] = useTransition()
  const multi = memberships.length > 1

  function handleChange(orgId: string) {
    if (orgId === activeOrgId) return
    const formData = new FormData()
    formData.set('org_id', orgId)
    startTransition(() => switchOrgAction(formData))
  }

  return (
    <div className="relative flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
      >
        {orgName.trim()[0]?.toUpperCase() ?? '·'}
      </span>
      <span className="truncate text-sm font-semibold tracking-tight text-foreground">{orgName}</span>
      {multi && (
        <>
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <select
            value={activeOrgId}
            onChange={(e) => handleChange(e.target.value)}
            aria-label={switcherLabel}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          >
            {memberships.map((m) => (
              <option key={m.orgId} value={m.orgId}>
                {m.orgName}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}
