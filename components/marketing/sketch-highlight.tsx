'use client'

import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'
import type { RoughAnnotation } from 'rough-notation/lib/model'

interface Props {
  children: string
  color?: string
  action?: 'highlight' | 'underline' | 'circle' | 'box' | 'bracket' | 'strike-through' | 'crossed-off'
  animationDuration?: number
  strokeWidth?: number
  padding?: number | [number, number]
}

export function SketchHighlight({
  children,
  color = '#e0a96d',
  action = 'highlight',
  animationDuration = 600,
  strokeWidth = 2,
  padding = 3,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const annotation = useRef<RoughAnnotation | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        annotation.current = annotate(el, {
          type: action,
          color,
          animationDuration,
          strokeWidth,
          padding,
          iterations: 2,
          multiline: false,
        })
        annotation.current.show()
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      annotation.current?.hide()
    }
  }, [action, color, animationDuration, strokeWidth, padding])

  return <span ref={ref}>{children}</span>
}
