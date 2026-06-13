import { ArrowRight, Check } from 'lucide-react'
import { ShimmerButton } from '@/components/app/shimmer-button'

/**
 * Презентационная вёрстка страницы «Планы и оплата» (по макету основателя):
 * слева вермильоновый отрывной календарь триала, справа состав тарифа + выбор
 * плана, ниже — сравнение тарифов текстом с галочками. Данные/локализация
 * приходят пропами из server-страницы — компонент чистый (превью с моками).
 */

export interface BillingViewProps {
  tariffLabel: string
  planName: string
  statusLabel: string
  bigValue: string
  bigLabel: string
  /** null — платный план без триала (полоса/даты скрыты) */
  trialMeta: { elapsed: number; total: number; startedLabel: string; untilLabel: string } | null
  includedLabel: string
  stats: ReadonlyArray<{ value: string; label: string }>
  upgradeLabel: string
  currentTag: string
  planTag: string
  perMonth: string
  planCards: ReadonlyArray<{ name: string; price: string; current: boolean }>
  comingSoon: string
  viewPlansLabel: string
  viewPlansHref: string
  compareTitle: string
  compareHeaders: ReadonlyArray<{ name: string; current: boolean }>
  numericRows: ReadonlyArray<{ label: string; vals: ReadonlyArray<string> }>
  featureRows: ReadonlyArray<{ label: string; flags: ReadonlyArray<boolean> }>
}

function SectionLabel({ marker, label }: { marker: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-extrabold text-accent">{marker}</span>
      <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export function BillingView({
  tariffLabel,
  planName,
  statusLabel,
  bigValue,
  bigLabel,
  trialMeta,
  includedLabel,
  stats,
  upgradeLabel,
  currentTag,
  planTag,
  perMonth,
  planCards,
  comingSoon,
  viewPlansLabel,
  viewPlansHref,
  compareTitle,
  compareHeaders,
  numericRows,
  featureRows,
}: BillingViewProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ── Hero split (квадратный, без скруглений — правка основателя) ── */}
      <div className="flex flex-col overflow-hidden border border-border md:flex-row">
        {/* LEFT — отрывной календарь триала */}
        <div
          className="flex flex-col justify-between gap-10 p-6 sm:p-8 md:w-[38%]"
          style={{ background: 'var(--billing-hero-bg)', color: 'var(--billing-hero-fg)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
              {tariffLabel} · {planName}
            </span>
            <span
              className="shrink-0 rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ background: 'var(--billing-hero-fg)', color: 'var(--billing-hero-bg)' }}
            >
              {statusLabel}
            </span>
          </div>

          <div>
            <div className="text-[clamp(76px,13vw,156px)] font-extrabold leading-[0.82] tracking-[-0.04em] tabular-nums">
              {bigValue}
            </div>
            <div className="mt-2 text-xl font-bold sm:text-2xl">{bigLabel}</div>
          </div>

          {trialMeta && (
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5" aria-hidden="true">
                {Array.from({ length: trialMeta.total }, (_, i) => (
                  <span
                    key={i}
                    className="h-2 w-3.5 rounded-[2px]"
                    style={{
                      background:
                        i < trialMeta.elapsed
                          ? 'var(--billing-hero-fg)'
                          : 'color-mix(in srgb, var(--billing-hero-fg) 26%, transparent)',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.08em] opacity-85">
                <span>{trialMeta.startedLabel}</span>
                <span>{trialMeta.untilLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — состав тарифа + выбор плана (фон страницы) */}
        <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8">
          <section>
            <SectionLabel marker="A" label={includedLabel} />
            <div className="mt-5 grid grid-cols-3 divide-x divide-border">
              {stats.map((s, i) => (
                <div key={i} className={i === 0 ? 'pr-4' : 'px-4'}>
                  <div className="text-[34px] font-extrabold leading-none tracking-tight text-foreground tabular-nums sm:text-[40px]">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-[13px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel marker="B" label={upgradeLabel} />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {planCards.map((card) => (
                <div
                  key={card.name}
                  className={`rounded-xl border p-4 transition-colors ${
                    card.current ? 'border-accent bg-accent-soft' : 'border-border bg-card hover:border-foreground/25'
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                      card.current ? 'text-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {card.current ? currentTag : planTag}
                  </p>
                  <p className="mt-1 text-[17px] font-bold text-foreground">{card.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {card.price}
                    <span className="font-normal text-muted-foreground"> {perMonth}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-auto flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-end">
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">{comingSoon}</p>
            <ShimmerButton href={viewPlansHref} className="shrink-0">
              {viewPlansLabel}
              <ArrowRight className="h-4 w-4" />
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* ── Сравнение тарифов — текстом, с галочками ───────────────── */}
      <section className="mt-12">
        <SectionLabel marker="C" label={compareTitle} />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[34%] py-3 pr-4" />
                {compareHeaders.map((h) => (
                  <th
                    key={h.name}
                    className={`py-3 text-center text-[15px] font-bold ${h.current ? 'text-accent' : 'text-foreground'}`}
                  >
                    {h.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numericRows.map((row) => (
                <tr key={row.label} className="border-b border-border/70">
                  <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className="py-3 text-center font-medium text-foreground tabular-nums">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
              {featureRows.map((row) => (
                <tr key={row.label} className="border-b border-border/70">
                  <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                  {row.flags.map((on, i) => (
                    <td key={i} className="py-3 text-center">
                      {on ? (
                        <Check className="mx-auto h-4 w-4 text-accent" strokeWidth={2.5} />
                      ) : (
                        <span className="text-muted-foreground/40">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
