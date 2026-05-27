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
    <div className="mx-auto max-w-2xl">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
          {tag}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-[--radius] border border-border">
        {items.map((item, i) => (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 bg-card px-6 py-5 text-left transition-colors hover:bg-muted/40"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-200"
              style={{ maxHeight: open === i ? '20rem' : 0 }}
            >
              <p className="bg-card px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
