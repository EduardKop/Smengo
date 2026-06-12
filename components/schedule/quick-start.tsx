'use client'

import { Check, MousePointerClick, UserPlus, FolderOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'

// ── Props ────────────────────────────────────────────────────────────

interface QuickStartProps {
  departmentsCount: number
  employeesCount: number
  onCreateDepartment?: () => void
  onAddEmployee?: () => void
}

interface QuickStartBannerProps {
  onAddEmployee?: () => void
}

// ── Step item ────────────────────────────────────────────────────────

interface StepProps {
  number: number
  done: boolean
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    comingSoonLabel: string
  }
}

function Step({ number, done, title, description, action }: StepProps) {
  return (
    <div className="flex gap-4">
      {/* Badge */}
      <div className="flex-shrink-0">
        {done ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check size={16} strokeWidth={2.5} />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-semibold text-muted-foreground">
            {number}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 pb-6">
        <p className={`text-sm font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {action && !done && (
          <div className="mt-2">
            <button
              type="button"
              onClick={action.onClick}
              disabled={!action.onClick}
              title={!action.onClick ? action.comingSoonLabel : undefined}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── QuickStart (full empty state) ────────────────────────────────────

export function QuickStart({
  departmentsCount,
  employeesCount,
  onCreateDepartment,
  onAddEmployee,
}: QuickStartProps) {
  const t = useTranslations('app.schedule.quickStart')

  const step1Done = departmentsCount > 0
  const step2Done = employeesCount > 0
  const comingSoon = t('comingSoon')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-8">
      <div className="w-full max-w-sm">
        {/* Title */}
        <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
          {t('title')}
        </h2>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[15px] top-8 bottom-6 w-px bg-border"
            aria-hidden="true"
          />

          <Step
            number={1}
            done={step1Done}
            title={t('step1Title')}
            description={t('step1Desc')}
            action={{
              label: t('step1Title'),
              onClick: onCreateDepartment,
              comingSoonLabel: comingSoon,
            }}
          />

          <Step
            number={2}
            done={step2Done}
            title={t('step2Title')}
            description={t('step2Desc')}
            action={{
              label: t('step2Title'),
              onClick: onAddEmployee,
              comingSoonLabel: comingSoon,
            }}
          />

          <Step
            number={3}
            done={false}
            title={t('step3Title')}
            description={t('step3Desc')}
          />
        </div>

        {/* Step 3 icon hint */}
        <div className="flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-xs text-muted-foreground">
          <MousePointerClick size={14} className="flex-shrink-0" />
          <span>{t('step3Desc')}</span>
        </div>
      </div>
    </div>
  )
}

// ── QuickStartBanner (partial state — depts exist, no employees) ──────

export function QuickStartBanner({ onAddEmployee }: QuickStartBannerProps) {
  const t = useTranslations('app.schedule.quickStart')

  return (
    <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-2.5">
      <UserPlus size={16} className="flex-shrink-0 text-muted-foreground" />
      <span className="flex-1 text-sm text-foreground">{t('addFirstEmployee')}</span>
      <button
        type="button"
        onClick={onAddEmployee}
        disabled={!onAddEmployee}
        title={!onAddEmployee ? t('comingSoon') : undefined}
        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('step2Title')}
      </button>
    </div>
  )
}
