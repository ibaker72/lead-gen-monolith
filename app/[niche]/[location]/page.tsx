import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { TrustBar } from '@/components/landing/TrustBar'
import { Reviews } from '@/components/landing/Reviews'
import { getNicheConfig } from '@/config/niches'
import { getLocationConfig } from '@/config/locations'
import { createAdminClient } from '@/lib/supabase/admin'

interface PageProps {
  params: { niche: string; location: string }
}

export async function generateStaticParams() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('niche_locations')
      .select('niche:niches(slug), location:locations(slug)')
      .eq('is_active', true)

    if (!data) return []

    return data
      .map((row) => {
        const nl = row as unknown as {
          niche: { slug: string } | null
          location: { slug: string } | null
        }
        if (!nl.niche?.slug || !nl.location?.slug) return null
        return { niche: nl.niche.slug, location: nl.location.slug }
      })
      .filter(Boolean) as { niche: string; location: string }[]
  } catch {
    // Fallback to config-based generation if DB is unavailable at build time
    const niches = ['hvac', 'roofing', 'plumbing']
    const locations = [
      'paterson-nj', 'clifton-nj', 'wayne-nj', 'passaic-nj', 'hackensack-nj',
      'newark-nj', 'jersey-city-nj', 'hoboken-nj', 'teaneck-nj', 'bloomfield-nj',
    ]
    return niches.flatMap((niche) => locations.map((location) => ({ niche, location })))
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const nicheConfig = getNicheConfig(params.niche)
  const locationConfig = getLocationConfig(params.location)

  if (!nicheConfig || !locationConfig) return {}

  const title = `${nicheConfig.name} in ${locationConfig.city}, ${locationConfig.state} — Free Quotes`
  const description = `${nicheConfig.seoDescription} Serving ${locationConfig.city}, ${locationConfig.state} and surrounding areas.`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const canonical = `${appUrl}/${params.niche}/${params.location}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export const revalidate = 3600

export default function NicheLocationPage({ params }: PageProps) {
  const nicheConfig = getNicheConfig(params.niche)
  const locationConfig = getLocationConfig(params.location)

  if (!nicheConfig || !locationConfig) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const canonical = `${appUrl}/${params.niche}/${params.location}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${nicheConfig.name} Contractors in ${locationConfig.city}, ${locationConfig.state}`,
    description: nicheConfig.seoDescription,
    url: canonical,
    telephone: '+19735550100',
    address: {
      '@type': 'PostalAddress',
      addressLocality: locationConfig.city,
      addressRegion: locationConfig.state,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: locationConfig.lat,
      longitude: locationConfig.lng,
    },
    areaServed: locationConfig.zip_codes.map((zip) => ({
      '@type': 'PostalAddress',
      postalCode: zip,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <Hero
          nicheSlug={params.niche}
          nicheName={nicheConfig.name}
          locationSlug={params.location}
          city={locationConfig.city}
          state={locationConfig.state}
          tagline={nicheConfig.heroTagline}
          ctaText={nicheConfig.ctaText}
          phoneLabel={nicheConfig.phoneLabel}
          serviceTypes={nicheConfig.serviceTypes}
        />

        <TrustBar />

        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Professional {nicheConfig.name} Services in {locationConfig.city}, {locationConfig.state}
            </h2>
            <div className="prose prose-gray max-w-none text-gray-600">
              <p>
                Finding a reliable {nicheConfig.name.toLowerCase()} contractor in{' '}
                {locationConfig.city} doesn&apos;t have to be hard. Our network of licensed,
                insured professionals has served {locationConfig.county} County homeowners for
                years — delivering fast response times and transparent pricing on every job.
              </p>
              <p className="mt-4">
                Whether you need an emergency repair or are planning an upcoming installation, our
                local {nicheConfig.name.toLowerCase()} experts are standing by. Submit your request
                above and you&apos;ll hear back within 60 minutes — guaranteed.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                Services Available in {locationConfig.city}
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {nicheConfig.serviceTypes.slice(0, -1).map((svc) => (
                  <li key={svc} className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600 font-bold">→</span> {svc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Reviews nicheName={nicheConfig.name} city={locationConfig.city} />

        <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Lead Gen Engine &middot;{' '}
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>{' '}
            &middot;{' '}
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </p>
          <p className="mt-2 text-xs">
            Serving {locationConfig.city}, {locationConfig.state} and surrounding {locationConfig.county} County areas.
          </p>
        </footer>
      </main>
    </>
  )
}
