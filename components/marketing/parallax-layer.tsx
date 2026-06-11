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
 * - No layout reads in the scroll path: the wrap's document position is cached
 *   (refreshed on resize / size changes) and the per-frame math uses scrollY only.
 * - Listens to scroll only while the wrap is near the viewport (IntersectionObserver).
 * - Disabled when prefers-reduced-motion: reduce, and on viewports < 768px.
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
    let enabled = false   // media-query gate
    let listening = false // near-viewport gate
    // Cached geometry (document coordinates) — no getBoundingClientRect on scroll.
    let docTop = 0
    let height = 0
    let vh = window.innerHeight

    const measure = () => {
      const rect = wrap.getBoundingClientRect()
      docTop = rect.top + window.scrollY
      height = rect.height
      vh = window.innerHeight || document.documentElement.clientHeight
    }

    const update = () => {
      raf = 0
      const center = (docTop - window.scrollY) + height / 2 - vh / 2
      let y = -center * speed
      if (y > maxOffset) y = maxOffset
      else if (y < -maxOffset) y = -maxOffset
      inner.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    const setListening = (next: boolean) => {
      if (next === listening) return
      listening = next
      if (next) {
        measure()
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
      } else {
        window.removeEventListener('scroll', onScroll)
      }
    }

    // Only do scroll work while the section is near the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (enabled) setListening(entry.isIntersecting)
      },
      { rootMargin: '25% 0px 25% 0px' },
    )

    const ro = new ResizeObserver(() => {
      if (listening) onResize()
    })

    const apply = () => {
      const next = !mqMotion.matches && !mqMobile.matches
      if (next === enabled) return
      enabled = next
      if (enabled) {
        inner.style.willChange = 'transform'
        io.observe(wrap)
        ro.observe(wrap)
        window.addEventListener('resize', onResize)
      } else {
        io.unobserve(wrap)
        ro.unobserve(wrap)
        window.removeEventListener('resize', onResize)
        setListening(false)
        inner.style.willChange = ''
        inner.style.transform = ''
      }
    }

    apply()
    mqMotion.addEventListener('change', apply)
    mqMobile.addEventListener('change', apply)

    return () => {
      mqMotion.removeEventListener('change', apply)
      mqMobile.removeEventListener('change', apply)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      ro.disconnect()
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
