import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${appUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('niche_locations')
      .select('niche:niches(slug), location:locations(slug), created_at')
      .eq('is_active', true)

    const dynamicRoutes: MetadataRoute.Sitemap = (data ?? [])
      .map((row) => {
        const nl = row as unknown as {
          niche: { slug: string } | null
          location: { slug: string } | null
          created_at: string
        }
        if (!nl.niche?.slug || !nl.location?.slug) return null
        return {
          url: `${appUrl}/${nl.niche.slug}/${nl.location.slug}`,
          lastModified: new Date(nl.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap

    return [...staticRoutes, ...dynamicRoutes]
  } catch {
    return staticRoutes
  }
}
