'use client'

import { useEffect, useRef } from 'react'
import { GridPreview, type GridPreviewLabels } from './grid-preview'

const NATURAL_W = 1400
// Height of the top mode-pill row (Компактно / Детально / Расширенно + mb-4) in natural px.
// Cropped out in the hero state, revealed in the demo state.
const TOP_CROP = 52
// How aggressively the morph accelerates. Range progress is squeezed so the grid
// lands in its demo seat earlier (well before centers actually meet). 0.55 ≈ snaps in
// when the hero is ~half-scrolled past its centre.
const PROGRESS_GAIN = 1.8

interface ScrollMorphGridProps {
  labels: GridPreviewLabels
  heroSlotId: string
  demoSlotId: string
}

/**
 * Renders a single real <GridPreview /> as a fixed-positioned card that
 * interpolates its position, size, and top-crop between two anchor slots
 * (hero and demo) as the user scrolls. In the hero state the right side
 * bleeds off the viewport; in the demo state it appears fully revealed.
 *
 * Desktop-only (>= lg). On smaller viewports the demo slot renders a
 * standalone fallback (handled in the page, not here).
 */
export function ScrollMorphGrid({ labels, heroSlotId, demoSlotId }: ScrollMorphGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  // Cached references to the GridPreview's top controls (mode pill + settings/theme buttons).
  // We fade them in only once the grid is seated, so they don't drift around mid-morph.
  const topBarRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Marketing scroll-animation always starts from the top.
    // If the browser restores a scroll position on reload, quietly reset it
    // before any layout reads so the grid starts from its hero slot state.
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    const hero = document.getElementById(heroSlotId)
    const demo = document.getElementById(demoSlotId)
    const wrap = wrapRef.current
    const inner = innerRef.current
    const grid = gridRef.current
    if (!hero || !demo || !wrap || !inner || !grid) return

    // Find the GridPreview's top controls row (`<div className="mb-4 …">` with the mode pill).
    // It always sits as the first child of the first relative wrapper.
    const topBar =
      (grid.querySelector('[data-mode-pill]')?.parentElement as HTMLElement | null) ??
      (grid.querySelector('.mb-4') as HTMLElement | null)
    if (topBar) {
      topBar.style.transition = 'opacity 320ms ease-out'
      topBar.style.opacity = '0'
      topBarRef.current = topBar
    }

    let raf = 0
    let seated = false
    let locked = false
    let bubbleRaf = 0
    let bubbleEndAt = 0
    // Captured at lock-time so the bubble grow tween interpolates from the slot's
    // current width up to the bubble width over BUBBLE_MS.
    let lockTime = 0
    let lockStartWidth = 0
    let lockStartLeft = 0
    const BUBBLE_MS = 700

    // Compute the bubble target dimensions given the current viewport.
    // Width: stretch close to viewport width (capped for ultra-wide). Height: derived from scale.
    const bubbleDims = () => {
      const naturalH = grid.offsetHeight || 620
      const bw = Math.min(window.innerWidth - 32, 1800)
      const scale = bw / NATURAL_W
      const bh = naturalH * scale
      const bleft = (window.innerWidth - bw) / 2
      return { bw, bh, bleft }
    }

    const update = () => {
      raf = 0
      const h = hero.getBoundingClientRect()
      const d = demo.getBoundingClientRect()
      const vh = window.innerHeight
      const target = vh / 2
      const hCenter = h.top + h.height / 2
      const dCenter = d.top + d.height / 2
      const range = dCenter - hCenter

      const raw = range === 0 ? 0 : (target - hCenter) / range
      // Accelerate: bias progress so t hits 1 earlier than at exact-center alignment.
      let t = raw * PROGRESS_GAIN
      // Once locked, never reverse — pin to t=1 forever (until reload).
      if (locked) t = 1
      t = Math.max(0, Math.min(1, t))
      // Smooth ease-in-out.
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

      const lerp = (a: number, b: number) => a + (b - a) * e

      // Demo-state target. Pre-lock: snap to slot's rect. Post-lock: tween from the slot's
      // width (captured at lock-time) to the viewport-wide bubble over BUBBLE_MS.
      let demoLeft = d.left
      let demoWidth = d.width
      if (locked) {
        const elapsed = performance.now() - lockTime
        const bp = Math.max(0, Math.min(1, elapsed / BUBBLE_MS))
        // Ease-out cubic for a soft "bubble" pop.
        const eased = 1 - Math.pow(1 - bp, 3)
        const b = bubbleDims()
        demoWidth = lockStartWidth + (b.bw - lockStartWidth) * eased
        demoLeft = lockStartLeft + (b.bleft - lockStartLeft) * eased
      }

      const left = lerp(h.left, demoLeft)
      const top = lerp(h.top, d.top)
      const width = lerp(h.width, demoWidth)

      const naturalH = grid.offsetHeight || 620
      const cropTop = lerp(TOP_CROP, 0)
      const scale = width / NATURAL_W
      const height = (naturalH - cropTop) * scale

      wrap.style.left = left + 'px'
      wrap.style.top = top + 'px'
      wrap.style.width = width + 'px'
      wrap.style.height = height + 'px'

      inner.style.transform = `translateY(${-cropTop * scale}px) scale(${scale})`

      const r = 16
      wrap.style.borderTopLeftRadius = r + 'px'
      wrap.style.borderBottomLeftRadius = r + 'px'
      wrap.style.borderTopRightRadius = lerp(0, r) + 'px'
      wrap.style.borderBottomRightRadius = lerp(0, r) + 'px'

      wrap.style.opacity = '1'

      // Seated state: when fully settled, become interactive and reveal the top toolbar.
      const isSeated = t >= 0.999
      if (isSeated !== seated) {
        seated = isSeated
        wrap.style.pointerEvents = seated ? 'auto' : 'none'
        if (topBarRef.current) topBarRef.current.style.opacity = seated ? '1' : '0'

        // First time we seat → lock the page state until reload.
        // The morph never reverses (t pinned to 1) but scroll itself is NOT blocked.
        if (seated && !locked) {
          locked = true
          lockTime = performance.now()
          lockStartWidth = d.width
          lockStartLeft = d.left
          document.body.dataset.gridLocked = 'true'

          // Grow the slot's CSS height to the bubble height so the layout below reflows
          // and there's no empty gap. Slot has its own height-only CSS transition.
          const slot = document.querySelector('[data-demo-slot]') as HTMLElement | null
          if (slot) {
            const { bh } = bubbleDims()
            slot.style.height = bh + 'px'
          }

          // rAF burst drives the JS bubble tween (width/left interpolation) frame-by-frame
          // through BUBBLE_MS without fighting any CSS transition on the wrap itself.
          bubbleEndAt = performance.now() + BUBBLE_MS + 100
          const tick = () => {
            bubbleRaf = 0
            update()
            if (performance.now() < bubbleEndAt) {
              bubbleRaf = requestAnimationFrame(tick)
            }
          }
          bubbleRaf = requestAnimationFrame(tick)
        }
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update()
    const t1 = window.setTimeout(update, 100)
    const t2 = window.setTimeout(update, 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    const ro = new ResizeObserver(onScroll)
    ro.observe(hero)
    ro.observe(demo)
    ro.observe(grid)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (bubbleRaf) cancelAnimationFrame(bubbleRaf)
      delete document.body.dataset.gridLocked
    }
  }, [heroSlotId, demoSlotId])

  return (
    <div
      ref={wrapRef}
      className="fixed left-0 top-0 z-10 hidden overflow-hidden drop-shadow-[0_24px_50px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)] lg:block"
      style={{
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: 'none',
        willChange: 'transform, top, left, width, height',
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: NATURAL_W + 'px',
          transformOrigin: 'top left',
        }}
      >
        <div ref={gridRef}>
          <GridPreview labels={labels} />
        </div>
      </div>
    </div>
  )
}
