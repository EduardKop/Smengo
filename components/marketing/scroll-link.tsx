'use client'

import { type ReactNode } from 'react'

interface ScrollLinkProps {
  id: string
  className?: string
  children: ReactNode
}

export function ScrollLink({ id, className, children }: ScrollLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <a href={`#${id}`} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
