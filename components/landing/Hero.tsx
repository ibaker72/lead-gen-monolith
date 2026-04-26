import { Phone } from 'lucide-react'
import { QuoteForm } from './QuoteForm'

interface HeroProps {
  nicheSlug: string
  nicheName: string
  locationSlug: string
  city: string
  state: string
  tagline: string
  ctaText: string
  phoneLabel: string
  serviceTypes: string[]
}

const PHONE_NUMBER = '(973) 555-0100'
const PHONE_HREF = 'tel:+19735550100'

export function Hero({
  nicheSlug,
  nicheName,
  locationSlug,
  city,
  state,
  tagline,
  ctaText,
  phoneLabel,
  serviceTypes,
}: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {/* decorative pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left — copy */}
          <div>
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
              {city}, {state}
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              {nicheName} Services in {city}, {state}
            </h1>

            <p className="mt-4 text-lg text-blue-100 leading-relaxed max-w-lg">{tagline}</p>

            <a
              href={PHONE_HREF}
              className="mt-8 inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-5 py-3 font-semibold text-white border border-white/20"
              aria-label={`Call our ${phoneLabel}`}
            >
              <span className="bg-blue-500 rounded-full p-2" aria-hidden="true">
                <Phone className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs text-blue-200 font-normal">{phoneLabel}</span>
                <span className="text-lg tracking-wide">{PHONE_NUMBER}</span>
              </span>
            </a>

            <ul className="mt-8 space-y-2 text-sm text-blue-100">
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Response within 60 minutes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Licensed &amp; insured local contractors
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Free, no-obligation quotes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Serving all of {city} and surrounding areas
              </li>
            </ul>
          </div>

          {/* Right — form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <QuoteForm
              nicheSlug={nicheSlug}
              locationSlug={locationSlug}
              serviceTypes={serviceTypes}
              ctaText={ctaText}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
