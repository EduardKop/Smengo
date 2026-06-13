import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { CreditCard } from 'lucide-react'
import { getAppContext } from '@/lib/auth/context'
import { can } from '@/lib/permissions'

/**
 * Plans & Pricing (owner-only): пока честная заглушка с текущим планом и
 * сроком триала — подключение Paddle-чекаута придёт с этапом биллинга.
 * Сюда же ведёт баннер истёкшего триала (trialExpired → goToBilling).
 */
export default async function BillingPage() {
  const ctx = await getAppContext()
  if (!can(ctx.role, 'billing')) redirect('/dashboard')

  const t = await getTranslations('app.billingPage')
  const format = await getFormatter()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t('currentPlan')}: <span className="uppercase">{ctx.org.plan}</span>
            </p>
            {ctx.org.trialEndsAt && (
              <p className="text-xs text-muted-foreground">
                {t('trialEnds')}: {format.dateTime(new Date(ctx.org.trialEndsAt), { dateStyle: 'long' })}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('comingSoon')}</p>
      </div>
    </div>
  )
}
