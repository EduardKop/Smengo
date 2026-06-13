import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { ArrowRight, Building2, Check, Layers, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { getAppContext } from '@/lib/auth/context'
import { can } from '@/lib/permissions'
import { PLAN_LIMITS } from '@/lib/billing/types'
import { trialDaysLeft } from '@/lib/billing/trial'
import type { PlanTier } from '@/supabase/types'
import { PageHeader } from '@/components/app/page-header'
import { SettingsCard } from '@/components/app/settings-card'
import { ShimmerButton } from '@/components/app/shimmer-button'

const TRIAL_DAYS = 14

/**
 * Планы и оплата (owner-only): карточка текущего плана с обратным отсчётом
 * триала и составом тарифа. Подключение Paddle-чекаута придёт с этапом биллинга
 * — сюда же ведёт баннер истёкшего триала (trialExpired → goToBilling).
 */
export default async function BillingPage() {
  const ctx = await getAppContext()
  if (!can(ctx.role, 'billing')) redirect('/dashboard')

  const t = await getTranslations('app.billingPage')
  const format = await getFormatter()

  const plan = ctx.org.plan as PlanTier
  const limits = PLAN_LIMITS[plan]

  // Обратный отсчёт триала (в таймзоне сервера достаточно — точность в днях)
  const trialEnds = ctx.org.trialEndsAt ? new Date(ctx.org.trialEndsAt) : null
  const daysLeft = trialDaysLeft(ctx.org.trialEndsAt)
  const onTrial = daysLeft !== null && daysLeft > 0
  const expired = daysLeft !== null && daysLeft <= 0
  const progress = onTrial ? Math.min(100, Math.max(6, ((TRIAL_DAYS - daysLeft) / TRIAL_DAYS) * 100)) : 100

  const status = expired ? 'expired' : onTrial ? 'trial' : 'active'
  const statusLabel = t(status === 'expired' ? 'statusExpired' : status === 'trial' ? 'statusTrial' : 'statusActive')
  const statusTone =
    status === 'expired'
      ? 'bg-destructive/12 text-destructive'
      : status === 'trial'
        ? 'bg-accent-soft text-accent'
        : 'bg-success/15 text-success'

  const deptLabel =
    limits.departments === Infinity ? t('featDepartmentsUnlimited') : t('featDepartments', { n: limits.departments })

  const features = [
    { icon: Users, label: t('featEmployees', { n: limits.employees }) },
    { icon: Layers, label: deptLabel },
    { icon: ShieldCheck, label: t('featManagers', { n: limits.managers }) },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="flex flex-col gap-5">
        <SettingsCard>
          {/* Шапка плана */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Sparkles className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--subtle)]">
                  {t('currentPlan')}
                </p>
                <p className="text-xl font-bold tracking-tight text-foreground">{t(`planNames.${plan}`)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
              {statusLabel}
            </span>
          </div>

          {/* Прогресс триала */}
          {daysLeft !== null && (
            <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {expired ? t('trialOver') : t('trialDaysLeft', { days: daysLeft })}
                </span>
                {trialEnds && (
                  <span className="text-xs text-muted-foreground">
                    {t('trialUntil')} {format.dateTime(trialEnds, { dateStyle: 'long' })}
                  </span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${expired ? 'bg-destructive' : 'bg-accent'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Что входит */}
          <div>
            <p className="mb-3 text-[13px] font-semibold text-foreground">{t('included')}</p>
            <ul className="grid gap-2.5">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.9} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </SettingsCard>

        {/* CTA: выбор тарифа (чекаут — этап биллинга) */}
        <SettingsCard icon={Building2} title={t('upgradeTitle')} description={t('comingSoon')}>
          <ShimmerButton href="/pricing" className="w-fit">
            {t('viewPlans')}
            <ArrowRight className="h-4 w-4" />
          </ShimmerButton>
        </SettingsCard>
      </div>
    </div>
  )
}
