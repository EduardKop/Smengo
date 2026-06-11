'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export function BuiltForMenu({ open, onOpen, onClose }: Props) {
  const t = useTranslations('marketing.nav')

  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onClick={() => (open ? onClose() : onOpen())}
      aria-expanded={open}
      aria-haspopup="menu"
      className={`flex items-center gap-1 whitespace-nowrap text-sm transition-colors ${
        open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {t('builtFor')}
      <ChevronDown
        className="h-3.5 w-3.5 transition-transform duration-300"
        style={{ transform: open ? 'rotate(180deg)' : 'none' }}
      />
    </button>
  )
}
