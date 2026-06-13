'use client'

/**
 * Flickering Grid (magicui, https://magicui.design/docs/components/flickering-grid):
 * сетка мерцающих квадратов на canvas. Цвет можно задать CSS-переменной
 * (резолвится через getComputedStyle — работает в обеих темах). Уважает
 * prefers-reduced-motion: при включённом рисует статичную сетку без анимации.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FlickeringGridProps {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  /** CSS-цвет или var(--token) */
  color?: string
  maxOpacity?: number
  className?: string
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0,0,0)',
  maxOpacity = 0.3,
  className,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const rgbaPrefix = useMemo(() => {
    if (typeof window === 'undefined') return 'rgba(0,0,0,'
    // Резолвим var(--token) в конкретный цвет
    let resolved = color
    const varMatch = color.match(/^var\((--[\w-]+)\)$/)
    if (varMatch) {
      resolved = getComputedStyle(document.documentElement).getPropertyValue(varMatch[1]).trim() || '#000'
    }
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')
    if (!ctx) return 'rgba(0,0,0,'
    ctx.fillStyle = resolved
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
    return `rgba(${r}, ${g}, ${b},`
  }, [color])

  const setup = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cols = Math.max(1, Math.floor(w / (squareSize + gridGap)))
      const rows = Math.max(1, Math.floor(h / (squareSize + gridGap)))
      const squares = new Float32Array(cols * rows)
      for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity
      return { cols, rows, squares, dpr }
    },
    [squareSize, gridGap, maxOpacity],
  )

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.fillStyle = `${rgbaPrefix}${squares[i * rows + j]})`
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          )
        }
      }
    },
    [rgbaPrefix, squareSize, gridGap],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let params = setup(canvas, container.clientWidth || 1, container.clientHeight || 1)

    const resize = () => {
      setCanvasSize({ width: container.clientWidth, height: container.clientHeight })
      params = setup(canvas, container.clientWidth || 1, container.clientHeight || 1)
      draw(ctx, params.cols, params.rows, params.squares, params.dpr)
    }
    resize()

    let last = 0
    const loop = (time: number) => {
      if (!isInView) return
      const dt = (time - last) / 1000
      last = time
      for (let i = 0; i < params.squares.length; i++) {
        if (Math.random() < flickerChance * dt) params.squares[i] = Math.random() * maxOpacity
      }
      draw(ctx, params.cols, params.rows, params.squares, params.dpr)
      raf = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    const io = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0 })
    io.observe(canvas)

    if (isInView && !reduceMotion) raf = requestAnimationFrame(loop)
    else draw(ctx, params.cols, params.rows, params.squares, params.dpr)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [setup, draw, flickerChance, maxOpacity, isInView])

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      />
    </div>
  )
}
