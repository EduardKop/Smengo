'use client'

import type { CSSProperties } from 'react'

interface Props {
  children: string
  radius?: number
  duration?: number
  reverse?: boolean
  fontSize?: number
  color?: string
  className?: string
  style?: CSSProperties
}

export function SpinningText({
  children,
  radius = 64,
  duration = 12,
  reverse = false,
  fontSize = 11,
  color,
  className,
  style,
}: Props) {
  const chars = children.split('')
  const total = chars.length

  return (
    <div
      className={className}
      role="img"
      aria-label={children}
      style={{ position: 'relative', width: radius * 2, height: radius * 2, ...style }}
    >
      <div
        aria-hidden="true"
        className="spinning-text-ring"
        style={{
          position: 'absolute',
          inset: 0,
          '--st-duration': `${duration}s`,
          '--st-direction': reverse ? 'reverse' : 'normal',
        } as CSSProperties}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: `calc(50% - ${radius}px)`,
              left: '50%',
              transform: `rotate(${(i / total) * 360}deg)`,
              transformOrigin: `0 ${radius}px`,
              fontSize,
              fontWeight: 700,
              letterSpacing: '0.04em',
              lineHeight: 1,
              color,
            }}
          >
            <span style={{ display: 'block', transform: 'translateX(-50%)' }}>
              {char}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
