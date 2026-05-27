import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/employees', '/departments', '/settings', '/billing', '/onboarding'],
      },
    ],
    sitemap: 'https://smengo.com/sitemap.xml',
  }
}
