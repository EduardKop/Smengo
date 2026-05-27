'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocaleAction } from '@/lib/actions/locale'

const LOCALE_LABELS: Record<string, string> = {
  ru: 'RU',
  uk: 'UA',
  en: 'EN',
}

const LOCALE_NAMES: Record<string, string> = {
  ru: 'Русский',
  uk: 'Українська',
  en: 'English',
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(newLocale: string) {
    startTransition(async () => {
      await setLocaleAction(newLocale)
      router.refresh()
    })
  }

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        aria-label="Select language"
        className="appearance-none cursor-pointer rounded-md border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {Object.entries(LOCALE_LABELS).map(([code, label]) => (
          <option key={code} value={code} title={LOCALE_NAMES[code]}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
