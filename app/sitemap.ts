import { MetadataRoute } from 'next'

const BASE_URL = 'https://smengo.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/pricing']

  return pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))
}
