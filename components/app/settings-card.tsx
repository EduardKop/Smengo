import type { ReactNode } from 'react'
import { ChevronRight, type LucideIcon } from 'lucide-react'

/**
 * Карточка настроек в духе Linear/Stripe: поверхность с тонкой рамкой, мягкой
 * тенью и опциональной шапкой. Две шапки:
 *  • icon-token (иконка в чипе + заголовок) — биллинг, компания;
 *  • dotted-eyebrow (цветная точка + надзаголовок в разрядку) — аккаунт.
 * Все цвета/радиусы — через токены (правило 10).
 */

interface SettingsCardProps {
  icon?: LucideIcon
  title?: string
  /** Надзаголовок в разрядку с цветной точкой (альтернатива icon+title) */
  eyebrow?: string
  /** CSS-цвет точки надзаголовка (токен, напр. 'var(--success)') */
  dotColor?: string
  /** Декоративный шеврон справа в шапке (намёк «подробнее») */
  headerChevron?: boolean
  description?: string
  children: ReactNode
  /** Прижатая к низу строка действий с разделителем сверху */
  footer?: ReactNode
  className?: string
}

export function SettingsCard({
  icon: Icon,
  title,
  eyebrow,
  dotColor = 'var(--accent)',
  headerChevron = false,
  description,
  children,
  footer,
  className,
}: SettingsCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)] ${className ?? ''}`}
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {eyebrow ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--subtle)]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dotColor }} aria-hidden="true" />
                {eyebrow}
              </p>
              {description && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
            {headerChevron && (
              <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted-foreground/50" aria-hidden="true" />
            )}
          </div>
        ) : (title || Icon) ? (
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-[var(--surface)] text-accent">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold leading-tight text-foreground">{title}</h2>}
              {description && (
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        ) : null}
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-[var(--surface)]/40 px-5 py-3.5 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  )
}

/** Единый стиль полей ввода/селектов во всех формах продукт-зоны */
export const appInputClass =
  'w-full rounded-xl border border-border bg-[var(--surface)] px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60'

/** Основная кнопка действия (терракота) */
export const appPrimaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-default disabled:opacity-50'

/** Подпись поля над контролом — единый ритм во всех формах */
export function FieldLabel({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
        {children}
      </label>
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </div>
  )
}
