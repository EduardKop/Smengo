'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

type FeatureKey =
  | 'feature_grid'
  | 'feature_export'
  | 'feature_alerts'
  | 'feature_analytics'
  | 'feature_telegram'
  | 'feature_portal'
  | 'feature_api'
  | 'feature_support'

interface Plan {
  key: 'start' | 'team' | 'business'
  nameKey: 'planStart' | 'planTeam' | 'planBusiness'
  descKey: 'planStartDesc' | 'planTeamDesc' | 'planBusinessDesc'
  /** monthly price in USD */
  price: number
  /** seat capacity for per-employee anchor */
  capacity: number
  employees: string
  groups: string | null
  managers: string
  recommended: boolean
  /** features new vs previous tier — for incremental display */
  newFeatures: FeatureKey[]
  /** name of previous tier for "Everything in X, plus:" — null for first tier */
  inheritsFrom: 'planStart' | 'planTeam' | null
}

const PLANS: Plan[] = [
  {
    key: 'start',
    nameKey: 'planStart',
    descKey: 'planStartDesc',
    price: 0,
    capacity: 15,
    employees: '15',
    groups: '2',
    managers: '1',
    recommended: false,
    newFeatures: ['feature_grid', 'feature_export'],
    inheritsFrom: null,
  },
  {
    key: 'team',
    nameKey: 'planTeam',
    descKey: 'planTeamDesc',
    price: 29,
    capacity: 75,
    employees: '75',
    groups: null,
    managers: '3',
    recommended: true,
    newFeatures: ['feature_alerts', 'feature_analytics', 'feature_telegram'],
    inheritsFrom: 'planStart',
  },
  {
    key: 'business',
    nameKey: 'planBusiness',
    descKey: 'planBusinessDesc',
    price: 79,
    capacity: 300,
    employees: '300',
    groups: null,
    managers: '10',
    recommended: false,
    newFeatures: ['feature_portal', 'feature_api', 'feature_support'],
    inheritsFrom: 'planTeam',
  },
]

export function PricingCards() {
  const t = useTranslations('pricing')
  const [yearly, setYearly] = useState(false)

  return (
    <>
      {/* ── Billing toggle ── */}
      <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-3">
        <div
          className="inline-flex items-center rounded-full border p-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          role="tablist"
          aria-label="Billing period"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!yearly}
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              !yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('billingMonthly')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={yearly}
            onClick={() => setYearly(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('billingYearly')}
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
              style={{
                background: yearly ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 18%, transparent)',
                color: yearly ? '#fff' : 'var(--accent)',
              }}
            >
              {t('yearlyBadge')}
            </span>
          </button>
        </div>
      </div>

      {/* ── 3 cards ── */}
      <div className="mx-auto grid max-w-5xl items-stretch gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard key={plan.key} plan={plan} yearly={yearly} />
        ))}
      </div>
    </>
  )
}

function PricingCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const t = useTranslations('pricing')

  // Yearly = 10× monthly (2 months free). Display monthly equivalent rounded.
  const displayPrice = yearly ? Math.round((plan.price * 10) / 12) : plan.price
  const yearlyTotal = plan.price * 10
  const perEmployee = plan.price > 0 ? (displayPrice / plan.capacity).toFixed(2) : null

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${plan.recommended ? 'lg:scale-[1.03]' : ''}`}
      style={{
        background: 'var(--surface)',
        borderRadius: 24,
        padding: '32px 28px',
        boxShadow: plan.recommended
          ? '0 1px 3px rgba(0,0,0,.06), 0 16px 40px rgba(217,119,87,.22)'
          : '0 1px 2px rgba(0,0,0,.05), 0 6px 20px rgba(0,0,0,.07)',
        border: plan.recommended
          ? '1.5px solid var(--accent)'
          : '1px solid var(--border)',
      }}
    >
      {plan.recommended && (
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-center text-[10.5px] font-semibold uppercase text-white"
          style={{ background: 'var(--accent)', letterSpacing: '0.12em', height: 24 }}
        >
          ★ {t('recommended')}
        </div>
      )}

      <div className={plan.recommended ? 'mt-6 text-center' : 'text-center'}>
        <h3
          className="font-serif font-semibold text-foreground"
          style={{ fontSize: 22, letterSpacing: '-0.01em' }}
        >
          {t(plan.nameKey)}
        </h3>
        <p
          className="mx-auto mt-1.5 text-[13px] leading-[1.45]"
          style={{ color: 'var(--subtle)', maxWidth: 200 }}
        >
          {t(plan.descKey)}
        </p>
      </div>

      <div className="mt-6 text-center">
        <div className="flex items-baseline justify-center gap-0.5">
          <span
            className="font-semibold text-foreground"
            style={{ fontSize: 40, letterSpacing: '-0.025em', lineHeight: 1 }}
          >
            ${displayPrice}
          </span>
          <span className="text-[15px] font-medium text-foreground">{t('monthly')}</span>
        </div>
        {/* Per-employee anchor (paid plans only) */}
        {perEmployee ? (
          <p className="mt-1.5 text-[12px]" style={{ color: 'var(--subtle)' }}>
            {t('perEmployee', { price: perEmployee })}
          </p>
        ) : (
          <p className="mt-1.5 text-[12px]" style={{ color: 'var(--subtle)' }}>
            {t('trialNote')}
          </p>
        )}
        {/* Yearly fineprint */}
        {yearly && plan.price > 0 && (
          <p className="mt-1 text-[11.5px]" style={{ color: 'var(--subtle)' }}>
            ${yearlyTotal} / {t('billedAnnually')}
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <div
          className="font-semibold text-foreground"
          style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {plan.employees}
        </div>
        <p
          className="mt-1 text-[13px] leading-[1.5]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <span className="underline decoration-dotted underline-offset-2">
            {t('employees')}
          </span>{' '}
          · {plan.groups ? `${plan.groups} ${t('groups')}` : t('unlimited')}
        </p>
      </div>

      {/* CTA — solid sand for recommended, outline for others */}
      <Link
        href="/register"
        className={`mt-7 block w-full rounded-full px-5 py-3 text-center text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
          plan.recommended
            ? 'bg-accent text-white shadow-md hover:bg-[var(--accent-hover)]'
            : 'border bg-transparent text-foreground hover:bg-muted/50'
        }`}
        style={
          plan.recommended
            ? undefined
            : { borderColor: 'var(--border)' }
        }
      >
        {t('startTrial')}
      </Link>
      <p className="mt-2 text-center text-[11.5px]" style={{ color: 'var(--subtle)' }}>
        {t('riskReducer')}
      </p>

      {/* Feature list — incremental for tiers 2+ */}
      <ul className="mt-6 flex flex-col gap-2.5 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
        {plan.inheritsFrom && (
          <li
            className="text-[12.5px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: 'var(--subtle)' }}
          >
            {t('incrementalIntro', { plan: t(plan.inheritsFrom) })}
          </li>
        )}
        {plan.newFeatures.map((fk) => (
          <li
            key={fk}
            className="flex items-start gap-2.5 text-[13.5px] text-foreground"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1 leading-[1.45]">{t(fk)}</span>
          </li>
        ))}
        <li
          className="flex items-start gap-2.5 text-[13.5px] text-foreground"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span className="flex-1 leading-[1.45]">
            {plan.managers}{' '}
            {plan.managers === '1'
              ? t('managers')
              : plan.managers === '3'
                ? t('managersPlural')
                : t('managersMany')}
          </span>
        </li>
      </ul>
    </div>
  )
}
