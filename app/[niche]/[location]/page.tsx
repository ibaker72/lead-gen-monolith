import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import { Hero } from '@/components/landing/Hero'
import { TrustBar } from '@/components/landing/TrustBar'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CredentialBar } from '@/components/landing/CredentialBar'
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

  const faqs = [
    {
      q: `How quickly will a ${nicheConfig.name.toLowerCase()} contractor contact me?`,
      a: `Most homeowners in ${locationConfig.city} hear from a licensed contractor within 60 minutes of submitting their request — often sooner.`,
    },
    {
      q: `Is the quote really free?`,
      a: `Yes. There is no cost, no obligation, and no credit card required to get a quote. You only pay if you choose to hire the contractor.`,
    },
    {
      q: `Are your contractors licensed and insured in ${locationConfig.state}?`,
      a: `All contractors in our network are fully licensed and insured in ${locationConfig.state}. We verify credentials before admitting any professional to the platform.`,
    },
    {
      q: `What ${nicheConfig.name.toLowerCase()} services are available in ${locationConfig.city}?`,
      a: `We connect homeowners with contractors offering: ${nicheConfig.serviceTypes.slice(0, -1).join(', ')}.`,
    },
    {
      q: `What areas do you serve beyond ${locationConfig.city}?`,
      a: `In addition to ${locationConfig.city}, we serve all of ${locationConfig.county} County and surrounding communities in ${locationConfig.state}.`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pb-20 lg:pb-0">
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

        <HowItWorks nicheName={nicheConfig.name} />

        <section className="bg-slate-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
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

        <CredentialBar />

        <Reviews nicheName={nicheConfig.name} city={locationConfig.city} />

        {/* FAQ */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group border border-slate-200 rounded-xl overflow-hidden"
                >
                  <summary className="flex justify-between items-center px-6 py-4 cursor-pointer list-none font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" aria-hidden="true" />
                  </summary>
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </dl>
          </div>
        </section>

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
