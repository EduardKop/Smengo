import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Основная кнопка действия в стиле magicui Shimmer Button
 * (https://magicui.design/docs/components/shimmer-button), адаптирована под
 * бренд Smengo: фон — терракота (--accent, одинаков в обеих темах), бегущий
 * блик белым, лёгкое (квадратноватое) скругление. Все цвета — через токены.
 *
 * Анимации shimmer-slide / spin-around объявлены в globals.css и глушатся
 * под prefers-reduced-motion. Рендерится как <button> или (с href) как <Link>.
 */

interface ShimmerButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  children: ReactNode
  /** Скорость бега блика */
  speed?: string
  /** Радиус скругления (легкое, не пилюля) */
  radius?: string
  /** Если задан — рендерится как ссылка (next/link) вместо кнопки */
  href?: string
}

function shimmerStyle(speed: string, radius: string): CSSProperties {
  return {
    '--speed': speed,
    '--radius': radius,
    '--spread': '90deg',
    '--shimmer-color': 'rgba(255,255,255,0.9)',
    '--cut': '0.05em',
    '--bg': 'var(--accent)',
  } as CSSProperties
}

const baseClass = cn(
  'group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap',
  'border border-white/15 px-5 py-2.5 text-sm font-semibold text-accent-foreground',
  '[background:var(--bg)] [border-radius:var(--radius)]',
  'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
  'disabled:cursor-default disabled:opacity-50',
)

function ShimmerLayers({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Контейнер бегущего блика */}
      <div className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {/* Контент поверх */}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {/* Внутренняя подсветка низа */}
      <div className="absolute inset-0 size-full transform-gpu rounded-[var(--radius)] shadow-[inset_0_-8px_10px_rgba(255,255,255,0.12)] transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.25)] group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.25)]" />
      {/* Подложка-фон (оставляет тонкую кромку для блика) */}
      <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
    </>
  )
}

export function ShimmerButton({
  children,
  className,
  speed = '3s',
  radius = '10px',
  href,
  ...buttonProps
}: ShimmerButtonProps) {
  const style = shimmerStyle(speed, radius)
  const cls = cn(baseClass, className)

  if (href !== undefined) {
    return (
      <Link href={href} style={style} className={cls}>
        <ShimmerLayers>{children}</ShimmerLayers>
      </Link>
    )
  }

  return (
    <button style={style} className={cls} {...buttonProps}>
      <ShimmerLayers>{children}</ShimmerLayers>
    </button>
  )
}
