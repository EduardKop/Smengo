import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const BASE_URL = 'https://smengo.com'

function urlFor(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return `${BASE_URL}${path}`
  return `${BASE_URL}/${locale}${path}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: Array<{ path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/platform/schedule-grid', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  ]

  return paths.flatMap(({ path, priority, changeFrequency }) =>
    routing.locales.map((locale) => {
      const languages: Record<string, string> = {}
      for (const l of routing.locales) languages[l] = urlFor(l, path)
      languages['x-default'] = urlFor(routing.defaultLocale, path)
      return {
        url: urlFor(locale, path),
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages },
      }
    })
  )
}
