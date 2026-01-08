import { MetadataRoute } from 'next'
import { getAllModules } from '@/lib/modules'

export default function sitemap(): MetadataRoute.Sitemap {
  const modules = getAllModules()
  const baseUrl = 'https://agenticengineer.keyurgolani.name'

  const moduleEntries: MetadataRoute.Sitemap = modules.map((module) => ({
    url: `${baseUrl}/modules/${module.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...moduleEntries,
  ]
}
