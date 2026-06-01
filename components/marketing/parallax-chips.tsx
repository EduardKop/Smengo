'use client'

import { useEffect, useRef } from 'react'

interface ChipConfig {
  color: string
  rot: number
  opacity: number
  speed: number
  show: string
  pos: { top?: string; bottom?: string; left?: string; right?: string }
}

// Foreground layer — sharp, moves faster (feels closer)
const FG_CONFIG: ChipConfig[] = [
  { color: '#3b82f6', rot: -6, opacity: 0.92, speed: 0.20, show: 'hidden lg:block', pos: { top: '15%',    left:  '0.5%' } },
  { color: '#10b981', rot: -4, opacity: 0.92, speed: 0.26, show: 'hidden lg:block', pos: { top: '55%',    left:  '0.5%' } },
  { color: '#f97316', rot:  7, opacity: 0.92, speed: 0.18, show: 'hidden md:block', pos: { bottom: '8%',  left:  '0.5%' } },
  { color: '#8b5cf6', rot:  4, opacity: 0.92, speed: 0.22, show: 'hidden lg:block', pos: { top: '46%',    right: '0.5%' } },
  { color: '#f59e0b', rot: -5, opacity: 0.92, speed: 0.28, show: 'hidden md:block', pos: { bottom: '14%', right: '0.5%' } },
  { color: '#0d9488', rot:  8, opacity: 0.92, speed: 0.21, show: 'hidden xl:block', pos: { bottom: '3%',  left:  '21%'  } },
]

// Background layer — blurred, moves slower (feels further away), distinct palette
const BG_CONFIG: ChipConfig[] = [
  { color: '#ec4899', rot: -9, opacity: 0.55, speed: 0.06, show: 'hidden lg:block', pos: { top: '28%',    left:  '2.5%' } },
  { color: '#06b6d4', rot:  6, opacity: 0.55, speed: 0.08, show: 'hidden lg:block', pos: { top: '68%',    left:  '3.5%' } },
  { color: '#eab308', rot: -3, opacity: 0.52, speed: 0.07, show: 'hidden md:block', pos: { bottom: '22%', left:  '2%'   } },
  { color: '#ef4444', rot:  7, opacity: 0.54, speed: 0.05, show: 'hidden lg:block', pos: { top: '32%',    right: '2.5%' } },
  { color: '#84cc16', rot: -8, opacity: 0.55, speed: 0.09, show: 'hidden md:block', pos: { bottom: '30%', right: '2%'   } },
  { color: '#a855f7', rot:  4, opacity: 0.50, speed: 0.06, show: 'hidden xl:block', pos: { bottom: '14%', left:  '17%'  } },
]

interface Props {
  labels: string[]
}

export function ParallaxChips({ labels }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const fgRefs = useRef<(HTMLSpanElement | null)[]>([])
  const bgRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqSmall  = window.matchMedia('(max-width: 767px)')
    if (mqMotion.matches || mqSmall.matches) return

    let raf = 0

    const update = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      // progress: -1 when section just enters from bottom, 0 when centered, +1 when leaving from top
      const sectionCenter = rect.top + rect.height / 2
      const progress = (vh / 2 - sectionCenter) / (vh / 2 + rect.height / 2)

      // Foreground — fast, big travel
      fgRefs.current.forEach((el, i) => {
        if (!el) return
        const cfg = FG_CONFIG[i]!
        const y = progress * cfg.speed * 600
        el.style.transform = `rotate(${cfg.rot}deg) translateY(${y.toFixed(2)}px)`
      })

      // Background — slow, small travel
      bgRefs.current.forEach((el, i) => {
        if (!el) return
        const cfg = BG_CONFIG[i]!
        const y = progress * cfg.speed * 600
        el.style.transform = `rotate(${cfg.rot}deg) translateY(${y.toFixed(2)}px)`
      })
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none select-none absolute inset-0 z-0">
      {/* Background layer — blurred, slow */}
      {BG_CONFIG.map((cfg, i) => (
        <span
          key={`bg-${i}`}
          ref={(el) => { bgRefs.current[i] = el }}
          className={`absolute rounded-full px-4 py-1.5 text-[12px] font-semibold text-white ${cfg.show}`}
          style={{
            backgroundColor: cfg.color,
            opacity: cfg.opacity,
            transform: `rotate(${cfg.rot}deg)`,
            filter: 'blur(7px)',
            ...cfg.pos,
          }}
        >
          {labels[i] ?? ''}
        </span>
      ))}

      {/* Foreground layer — sharp, fast */}
      {FG_CONFIG.map((cfg, i) => (
        <span
          key={`fg-${i}`}
          ref={(el) => { fgRefs.current[i] = el }}
          className={`absolute rounded-full px-3 py-1 text-[11px] font-semibold text-white ${cfg.show}`}
          style={{
            backgroundColor: cfg.color,
            opacity: cfg.opacity,
            transform: `rotate(${cfg.rot}deg)`,
            ...cfg.pos,
          }}
        >
          {labels[i] ?? ''}
        </span>
      ))}
    </div>
  )
}
