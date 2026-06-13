import type { ReactNode } from 'react'

/**
 * Единая шапка страниц продукт-зоны — «подпись» дизайна Smengo.
 *
 * Состав: мелкий глиф из трёх строк графика (мотив фирменного знака) + надзаголовок
 * в разрядку → крупный плотный H1 (Manrope, наследуется от font-app шелла) →
 * строка-описание. Справа — слот действий (напр. «Опубликовать», «+ Сотрудник»).
 * Один паттерн на все страницы связывает их в один продукт; терракота тратится
 * только на глиф и действия (правило 10 — токены, не магические значения).
 */

interface PageHeaderProps {
  /** Надзаголовок-overline (контекст раздела), напр. «Настройки» */
  eyebrow?: string
  title: string
  /** Однострочное описание под заголовком */
  subtitle?: string
  /** Действия справа (кнопки, бейджи) */
  actions?: ReactNode
  className?: string
}

/** Мини-глиф «строки графика» — рифма со знаком Smengo, единственная декорация шапки */
function ScheduleGlyph() {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 flex-col gap-[3px] pt-[3px]"
    >
      <span className="h-[3px] w-4 rounded-full bg-accent" />
      <span className="h-[3px] w-2.5 rounded-full bg-accent/55" />
      <span className="h-[3px] w-3.5 rounded-full bg-accent/30" />
    </span>
  )
}

export function PageHeader({ eyebrow, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={`mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className ?? ''}`}
    >
      <div className="flex min-w-0 gap-3.5">
        {/* Глиф-подпись только когда есть надзаголовок (график/сотрудники);
            на страницах настроек шапка чистая — крупный заголовок + описание */}
        {eyebrow && <ScheduleGlyph />}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--subtle)]">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[1.9rem] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
