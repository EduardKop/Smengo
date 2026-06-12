'use client'

/**
 * Чип организации в левом верхнем углу контента (язык 7shifts: знак + название).
 * Живёт в потоке контента — выезжающая панель сайдбара накрывает его, не сдвигая.
 * При нескольких организациях кликабелен: нативный select растянут поверх
 * чипа невидимым слоем.
 *
 * OrgMark — «универсальный логотип» организации без загруженного лого:
 * скруглённый квадрат в геометрии фирменного знака Smengo (радиус ≈28%),
 * детерминированный дуотон-градиент по id организации + белый инициал.
 * Палитра подобрана под тёплую гамму бренда (терракота/амбер/тауп) —
 * декоративный набор по образцу AVATAR_GRADIENTS грида.
 */

import { useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import { switchOrgAction } from '@/lib/actions/org'

const ORG_MARK_GRADIENTS = [
  'linear-gradient(135deg, #d97757 0%, #e0a96d 100%)', // терракота → амбер (бренд)
  'linear-gradient(135deg, #9e5a97 0%, #d97757 100%)', // слива → терракота
  'linear-gradient(135deg, #2f6f5e 0%, #7fb69a 100%)', // лес → шалфей
  'linear-gradient(135deg, #31537d 0%, #6e9fc9 100%)', // глубокая синь → небо
  'linear-gradient(135deg, #1f1e1c 0%, #9b8b73 100%)', // графит → тауп (палитра знака)
  'linear-gradient(135deg, #b3543f 0%, #e3b765 100%)', // кирпич → мёд
]

/** Локальная копия stableHash грида (тот же алгоритм, без кросс-импорта зон). */
function stableHash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function OrgMark({ orgId, orgName }: { orgId: string; orgName: string }) {
  const bg = ORG_MARK_GRADIENTS[stableHash(orgId) % ORG_MARK_GRADIENTS.length]
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-bold text-white"
      style={{
        backgroundImage: bg,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.10)',
        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
        userSelect: 'none',
      }}
    >
      {orgName.trim()[0]?.toUpperCase() ?? '·'}
    </span>
  )
}

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
      <OrgMark orgId={activeOrgId} orgName={orgName} />
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
