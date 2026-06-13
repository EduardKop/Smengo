import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { getAppContext } from '@/lib/auth/context'
import { can } from '@/lib/permissions'
import { PLAN_LIMITS } from '@/lib/billing/types'
import { trialDaysLeft } from '@/lib/billing/trial'
import type { PlanTier } from '@/supabase/types'
import { BillingView, type BillingViewProps } from '@/components/app/billing-view'

const TRIAL_DAYS = 14
const MS_PER_DAY = 86_400_000
const PLAN_ORDER = ['start', 'team', 'business'] as const
/** Тариф → префикс ключей marketing.plans (start/team/biz) */
const MK: Record<PlanTier, 'start' | 'team' | 'biz'> = { start: 'start', team: 'team', business: 'biz' }

/** Дополнение нулём до 2 знаков для < 100, ∞ для безлимита */
function fmtStat(n: number): string {
  if (n === Infinity) return '∞'
  return n < 100 ? String(n).padStart(2, '0') : String(n)
}

/** Булевые фичи по тарифам (start, team, business) — как в сравнении тарифов */
const FEATURES: ReadonlyArray<readonly [string, readonly [boolean, boolean, boolean]]> = [
  ['featGrid', [true, true, true]],
  ['featExport', [true, true, true]],
  ['featAlerts', [false, true, true]],
  ['featAnalytics', [false, true, true]],
  ['featTelegram', [false, true, true]],
  ['featPortal', [false, false, true]],
  ['featApi', [false, false, true]],
  ['featPriority', [false, false, true]],
]

/**
 * Планы и оплата (owner-only): данные тарифа/триала → презентационный
 * BillingView (редакторская двухпанельная вёрстка по макету основателя).
 * Подключение Paddle-чекаута придёт с этапом биллинга.
 */
export default async function BillingPage() {
  const ctx = await getAppContext()
  if (!can(ctx.role, 'billing')) redirect('/dashboard')

  const t = await getTranslations('app.billingPage')
  const tp = await getTranslations('marketing.plans')
  const format = await getFormatter()

  const plan = ctx.org.plan as PlanTier
  const limits = PLAN_LIMITS[plan]
  const planName = tp(`${MK[plan]}Name`)

  // ── Обратный отсчёт триала ───────────────────────────────────────
  const trialEnds = ctx.org.trialEndsAt ? new Date(ctx.org.trialEndsAt) : null
  const daysLeft = trialDaysLeft(ctx.org.trialEndsAt)
  const onTrial = daysLeft !== null && daysLeft > 0
  const expired = daysLeft !== null && daysLeft <= 0
  const trialStart = trialEnds ? new Date(trialEnds.getTime() - TRIAL_DAYS * MS_PER_DAY) : null
  const elapsed = daysLeft !== null ? Math.min(TRIAL_DAYS, Math.max(0, TRIAL_DAYS - daysLeft)) : 0

  const statusLabel = t(expired ? 'statusExpired' : onTrial ? 'statusTrial' : 'statusActive')
  const bigValue = onTrial ? String(daysLeft) : expired ? '0' : '∞'
  const bigLabel = onTrial ? t('daysLeftLabel', { days: daysLeft as number }) : expired ? t('trialOver') : statusLabel

  const trialMeta: BillingViewProps['trialMeta'] = trialEnds
    ? {
        elapsed,
        total: TRIAL_DAYS,
        startedLabel: `${t('startedOn')} ${trialStart ? format.dateTime(trialStart, { day: 'numeric', month: 'long' }) : ''}`,
        untilLabel: `${t('trialUntil')} ${format.dateTime(trialEnds, { day: 'numeric', month: 'long', year: 'numeric' })}`,
      }
    : null

  const stats = [
    { value: fmtStat(limits.employees), label: t('statEmployees', { n: limits.employees === Infinity ? 5 : limits.employees }) },
    { value: fmtStat(limits.departments), label: t('statDepartments', { n: limits.departments === Infinity ? 5 : limits.departments }) },
    { value: fmtStat(limits.managers), label: t('statManagers', { n: limits.managers === Infinity ? 5 : limits.managers }) },
  ]

  const planCards = PLAN_ORDER.map((p) => ({
    name: tp(`${MK[p]}Name`),
    price: tp(`${MK[p]}Price`),
    current: p === plan,
  }))

  const compareHeaders = PLAN_ORDER.map((p) => ({ name: tp(`${MK[p]}Name`), current: p === plan }))

  const numericRows = [
    { label: t('compareEmployees'), vals: PLAN_ORDER.map((p) => t('compareUpTo', { n: PLAN_LIMITS[p].employees })) },
    {
      label: t('compareDepartments'),
      vals: PLAN_ORDER.map((p) =>
        PLAN_LIMITS[p].departments === Infinity ? t('compareUnlimited') : String(PLAN_LIMITS[p].departments),
      ),
    },
    { label: t('compareManagers'), vals: PLAN_ORDER.map((p) => String(PLAN_LIMITS[p].managers)) },
  ]

  const featureRows = FEATURES.map(([key, flags]) => ({ label: t(key), flags: [...flags] }))

  return (
    <BillingView
      tariffLabel={t('tariff')}
      planName={planName}
      statusLabel={statusLabel}
      bigValue={bigValue}
      bigLabel={bigLabel}
      trialMeta={trialMeta}
      includedLabel={t('sectionIncluded', { plan: planName })}
      stats={stats}
      upgradeLabel={t('upgradeTitle')}
      currentTag={t('current')}
      planTag={t('planTag')}
      perMonth={t('perMonth')}
      planCards={planCards}
      comingSoon={t('comingSoon')}
      viewPlansLabel={t('viewPlans')}
      viewPlansHref="/pricing"
      compareTitle={t('compareTitle')}
      compareHeaders={compareHeaders}
      numericRows={numericRows}
      featureRows={featureRows}
    />
  )
}
