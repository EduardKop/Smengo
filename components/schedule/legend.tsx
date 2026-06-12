'use client'

import { useTranslations, useLocale } from 'next-intl'
import type { StatusTypeRow } from '@/lib/schedule/types'
import { statusLabel } from './status-style'

interface LegendProps {
  statusTypes: StatusTypeRow[]
}

export function Legend({ statusTypes }: LegendProps) {
  const t = useTranslations('app.schedule')
  const locale = useLocale()

  if (statusTypes.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {t('legendLabel')}:
      </span>
      {statusTypes.map((status) => (
        <span key={status.id} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 flex-none rounded-full"
            style={{ background: status.color ?? 'var(--muted-foreground)' }}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">
            {statusLabel(status, locale)}
          </span>
        </span>
      ))}
    </div>
  )
}
