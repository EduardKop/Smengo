'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type SafariStaticSlots = {
  demo: HTMLElement
}

function isSafariBrowser() {
  const ua = window.navigator.userAgent
  return (
    window.navigator.vendor === 'Apple Computer, Inc.' &&
    /Safari/.test(ua) &&
    !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR/.test(ua)
  )
}

/**
 * Safari fallback: the grid renders at its NATIVE width (no transform scale).
 * Safari rasterizes transformed subtrees at 1× and stretches the cached layer,
 * which made the scaled variant blurry on 1080p screens and forced huge
 * composited layers. Native layout text stays crisp and costs nothing on scroll.
 */
function SafariDemoGrid({ labels }: { labels: GridPreviewLabels }) {
  return (
    <div
      className="overflow-hidden rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
      style={{
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(1800px, calc(100vw - 32px))',
      }}
    >
      <GridPreview labels={labels} />
    </div>
  )
}

/**
 * Renders a single real <GridPreview /> as a fixed-positioned card that
 * interpolates its position, size, and top-crop between two anchor slots
 * (hero and demo) as the user scrolls. In the hero state the right side
 * bleeds off the viewport; in the demo state it appears fully revealed.
 *
 * Perf notes:
 * - The scroll path reads NO layout: slot geometry is cached in document
 *   coordinates (refreshed on resize / ResizeObserver) and per-frame math
 *   uses window.scrollY only.
 * - Once the bubble animation finishes, the card "settles": it switches to
 *   absolute positioning in document flow coordinates, the scroll listener
 *   is removed and will-change is cleared. Scrolling the rest of the page
 *   costs nothing, and the browser re-rasterizes the settled card sharply.
 *
 * Desktop-only (>= lg). On smaller viewports the demo slot renders a
 * standalone fallback (handled in the page, not here).
 */
export function ScrollMorphGrid({ labels, heroSlotId, demoSlotId }: ScrollMorphGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [safariStaticSlots, setSafariStaticSlots] = useState<SafariStaticSlots | null>(null)
  // Cached references to the GridPreview's top controls (mode pill + settings/theme buttons).
  // We fade them in only once the grid is seated, so they don't drift around mid-morph.
  const topBarRef = useRef<HTMLElement | null>(null)
  const aiBarRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const hero = document.getElementById(heroSlotId)
    const demo = document.getElementById(demoSlotId)
    if (!hero || !demo) return

    if (isSafariBrowser()) {
      const demoHeight = demo.style.height
      const demoTransition = demo.style.transition

      demo.style.height = 'auto'
      demo.style.transition = 'none'
      document.body.dataset.gridLocked = 'true'
      document.body.dataset.gridSafariStatic = 'true'
      const frame = requestAnimationFrame(() => setSafariStaticSlots({ demo }))

      return () => {
        cancelAnimationFrame(frame)
        demo.style.height = demoHeight
        demo.style.transition = demoTransition
        delete document.body.dataset.gridLocked
        delete document.body.dataset.gridSafariStatic
      }
    }

    // Marketing scroll-animation always starts from the top.
    // If the browser restores a scroll position on reload, quietly reset it
    // before any layout reads so the grid starts from its hero slot state.
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    const wrap = wrapRef.current
    const inner = innerRef.current
    const grid = gridRef.current
    if (!wrap || !inner || !grid) return

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

    const aiBar = grid.querySelector('[data-ai-toolbar]') as HTMLElement | null
    if (aiBar) {
      aiBar.style.transition = 'opacity 360ms ease-out, transform 360ms ease-out'
      aiBar.style.opacity = '0'
      aiBar.style.transform = 'translateY(10px)'
      aiBar.style.pointerEvents = 'none'
      aiBarRef.current = aiBar
    }

    let raf = 0
    let seated = false
    let locked = false
    let settled = false
    let bubbleRaf = 0
    let bubbleEndAt = 0
    // Captured at lock-time so the bubble grow tween interpolates from the slot's
    // current width up to the bubble width over BUBBLE_MS.
    let lockTime = 0
    let lockStartWidth = 0
    let lockStartLeft = 0
    const BUBBLE_MS = 700

    // Slot geometry cached in DOCUMENT coordinates. The per-frame scroll path
    // derives viewport positions from window.scrollY — zero layout reads.
    const geo = {
      heroTop: 0, heroLeft: 0, heroW: 0, heroH: 0,
      demoTop: 0, demoLeft: 0, demoW: 0, demoH: 0,
      naturalH: 620,
      vw: window.innerWidth,
      vh: window.innerHeight,
    }

    const measure = () => {
      const h = hero.getBoundingClientRect()
      const d = demo.getBoundingClientRect()
      const sy = window.scrollY
      geo.heroTop = h.top + sy
      geo.heroLeft = h.left
      geo.heroW = h.width
      geo.heroH = h.height
      geo.demoTop = d.top + sy
      geo.demoLeft = d.left
      geo.demoW = d.width
      geo.demoH = d.height
      geo.naturalH = grid.offsetHeight || geo.naturalH
      geo.vw = window.innerWidth
      geo.vh = window.innerHeight
    }

    // Compute the bubble target dimensions given the current viewport.
    // Width: stretch close to viewport width (capped for ultra-wide). Height: derived from scale.
    const bubbleDims = () => {
      const bw = Math.min(geo.vw - 32, 1800)
      const scale = bw / NATURAL_W
      const bh = geo.naturalH * scale
      const bleft = (geo.vw - bw) / 2
      return { bw, bh, bleft }
    }

    // Final resting state: absolute positioning in document coordinates.
    // After this the card scrolls with the page natively — no scroll listener,
    // no will-change, and the browser re-rasterizes the text sharply.
    const applySettled = () => {
      const b = bubbleDims()
      const scale = b.bw / NATURAL_W
      const height = geo.naturalH * scale

      wrap.style.position = 'absolute'
      const parent = wrap.offsetParent as HTMLElement | null
      let pTop = 0
      let pLeft = 0
      if (parent) {
        const pr = parent.getBoundingClientRect()
        pTop = pr.top + window.scrollY
        pLeft = pr.left + window.scrollX
      }
      wrap.style.top = (geo.demoTop - pTop) + 'px'
      wrap.style.left = (b.bleft - pLeft) + 'px'
      wrap.style.width = b.bw + 'px'
      wrap.style.height = height + 'px'
      wrap.style.willChange = 'auto'
      inner.style.transform = `translateY(0px) scale(${scale})`

      const desired = Math.round(height)
      if (Math.abs(desired - (parseFloat(demo.style.height) || 0)) > 1) {
        demo.style.height = desired + 'px'
        geo.demoH = desired
      }
    }

    const settle = () => {
      if (settled) return
      settled = true
      window.removeEventListener('scroll', onScroll)
      measure()
      applySettled()
    }

    const update = () => {
      raf = 0
      if (settled) return
      const sy = window.scrollY
      const target = geo.vh / 2
      const hCenter = (geo.heroTop - sy) + geo.heroH / 2
      const dCenter = (geo.demoTop - sy) + geo.demoH / 2
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
      let demoLeft = geo.demoLeft
      let demoWidth = geo.demoW
      if (locked) {
        const elapsed = performance.now() - lockTime
        const bp = Math.max(0, Math.min(1, elapsed / BUBBLE_MS))
        // Ease-out cubic for a soft "bubble" pop.
        const eased = 1 - Math.pow(1 - bp, 3)
        const b = bubbleDims()
        demoWidth = lockStartWidth + (b.bw - lockStartWidth) * eased
        demoLeft = lockStartLeft + (b.bleft - lockStartLeft) * eased
      }

      const left = lerp(geo.heroLeft, demoLeft)
      const top = lerp(geo.heroTop - sy, geo.demoTop - sy)
      const width = lerp(geo.heroW, demoWidth)

      const cropTop = lerp(TOP_CROP, 0)
      const scale = width / NATURAL_W
      const height = (geo.naturalH - cropTop) * scale

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

      // While locked, keep the slot's CSS height in sync with the bubble's
      // actual visible height. The grid's offsetHeight can change after lock
      // (e.g. the top toolbar fades in adding ~52px), so without this the
      // bubble grows beyond the slot and visually overlaps content below.
      if (locked) {
        const { bh } = bubbleDims()
        const desired = Math.round(bh)
        const current = parseFloat(demo.style.height) || 0
        if (Math.abs(desired - current) > 1) {
          demo.style.height = desired + 'px'
          geo.demoH = desired
        }
      }

      // Seated state: when fully settled, become interactive and reveal the top toolbar.
      const isSeated = t >= 0.999
      if (isSeated !== seated) {
        seated = isSeated
        wrap.style.pointerEvents = seated ? 'auto' : 'none'
        if (topBarRef.current) topBarRef.current.style.opacity = seated ? '1' : '0'
        if (aiBarRef.current) {
          aiBarRef.current.style.opacity = seated ? '1' : '0'
          aiBarRef.current.style.transform = seated ? 'translateY(0)' : 'translateY(10px)'
          aiBarRef.current.style.pointerEvents = seated ? 'auto' : 'none'
        }

        // First time we seat → lock the page state until reload.
        // The morph never reverses (t pinned to 1) but scroll itself is NOT blocked.
        if (seated && !locked) {
          locked = true
          lockTime = performance.now()
          lockStartWidth = geo.demoW
          lockStartLeft = geo.demoLeft
          document.body.dataset.gridLocked = 'true'

          // Grow the slot's CSS height to the bubble height so the layout below reflows
          // and there's no empty gap. Slot has its own height-only CSS transition.
          const { bh } = bubbleDims()
          demo.style.height = bh + 'px'
          geo.demoH = bh

          // rAF burst drives the JS bubble tween (width/left interpolation) frame-by-frame
          // through BUBBLE_MS, then the card settles into document flow for good.
          bubbleEndAt = performance.now() + BUBBLE_MS + 100
          const tick = () => {
            bubbleRaf = 0
            update()
            if (performance.now() < bubbleEndAt) {
              bubbleRaf = requestAnimationFrame(tick)
            } else {
              settle()
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

    const onResize = () => {
      if (settled) {
        measure()
        applySettled()
      } else {
        measure()
        onScroll()
      }
    }

    measure()
    update()
    const remeasure = () => {
      measure()
      update()
    }
    const t1 = window.setTimeout(remeasure, 100)
    const t2 = window.setTimeout(remeasure, 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    // Sizes change → re-cache geometry. After settle, only the grid's own
    // height matters (the user can switch grid modes, which changes height).
    const ro = new ResizeObserver(() => {
      if (settled) {
        const nh = grid.offsetHeight || geo.naturalH
        if (Math.abs(nh - geo.naturalH) > 1) {
          geo.naturalH = nh
          applySettled()
        }
      } else {
        measure()
        onScroll()
      }
    })
    ro.observe(hero)
    ro.observe(demo)
    ro.observe(grid)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (bubbleRaf) cancelAnimationFrame(bubbleRaf)
      delete document.body.dataset.gridLocked
    }
  }, [heroSlotId, demoSlotId])

  return (
    <>
      {safariStaticSlots &&
        createPortal(<SafariDemoGrid labels={labels} />, safariStaticSlots.demo)}

      {!safariStaticSlots && (
        <div
          ref={wrapRef}
          className="fixed left-0 top-0 z-[70] hidden overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.55)] lg:block"
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
      )}
    </>
  )
}
