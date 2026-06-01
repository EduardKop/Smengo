'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type Props = {
  /** Parallax speed factor: 0.15 means the layer moves at 15% of scroll. */
  speed?: number
  /** Max absolute translateY in px. Prevents the layer from drifting beyond its overflow buffer. */
  maxOffset?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * Lightweight scroll parallax wrapper.
 * - Applies translate3d(0, y, 0) based on element's position vs. viewport center.
 * - Disabled when prefers-reduced-motion: reduce.
 * - Disabled on viewports < 768px.
 * - rAF-throttled; passive scroll listener.
 */
export function ParallaxLayer({ speed = 0.15, maxOffset = 80, className, style, children }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(max-width: 767px)')

    let raf = 0
    let active = false

    const update = () => {
      raf = 0
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const center = rect.top + rect.height / 2 - vh / 2
      let y = -center * speed
      if (y > maxOffset) y = maxOffset
      else if (y < -maxOffset) y = -maxOffset
      inner.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const reset = () => {
      inner.style.transform = ''
    }

    const apply = () => {
      const enabled = !mqMotion.matches && !mqMobile.matches
      if (enabled === active) return
      active = enabled
      if (enabled) {
        inner.style.willChange = 'transform'
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
      } else {
        inner.style.willChange = ''
        reset()
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    }

    apply()
    mqMotion.addEventListener('change', apply)
    mqMobile.addEventListener('change', apply)

    return () => {
      mqMotion.removeEventListener('change', apply)
      mqMobile.removeEventListener('change', apply)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed, maxOffset])

  return (
    <div ref={wrapRef} className={className} style={style}>
      <div ref={innerRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  )
}
