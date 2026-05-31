'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
}

interface FaqAccordionProps {
  tag: string
  title: string
  items: FaqItem[]
}

export function FaqAccordion({ tag, title, items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mx-auto" style={{ maxWidth: 680 }}>
      <div className="mb-10 text-center">
        <span
          className="mb-3 inline-block text-[11.5px] font-semibold uppercase"
          style={{ letterSpacing: '0.08em', color: 'var(--accent)' }}
        >
          {tag}
        </span>
        <h2
          className="mt-3 font-serif font-semibold text-foreground"
          style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.18 }}
        >
          {title}
        </h2>
      </div>

      <div>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              className="flex w-full items-center justify-between gap-4 text-left transition-colors"
              style={{ padding: '20px 0', minHeight: 56 }}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="text-[15px] font-medium text-foreground sm:text-[14.5px]">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition-transform duration-200 sm:h-4 sm:w-4 ${
                  open === i ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--subtle)' }}
              />
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-200"
              style={{ maxHeight: open === i ? '20rem' : 0 }}
            >
              <p className="pb-5 pr-8 text-[13.5px] leading-[1.65] text-muted-foreground">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
