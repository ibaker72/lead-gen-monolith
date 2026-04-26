import { Phone, CheckCircle2, Star } from 'lucide-react'
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

const TRUST_BADGES = ['BBB A+', 'Google Verified', 'Licensed & Insured', 'Satisfaction Guaranteed']

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
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left — copy */}
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
              {city}, {state}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              {nicheName} Services in {city}, {state}
            </h1>

            {/* Social proof line */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">4.9/5</span>
              <span className="text-sm text-slate-400">from 500+ homeowners in {state}</span>
            </div>

            <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-lg">{tagline}</p>

            {/* Trust badge pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {TRUST_BADGES.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-slate-600 text-slate-300 bg-white/5"
                >
                  <CheckCircle2 className="w-3 h-3 text-blue-400" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>

            {/* Phone CTA */}
            <a
              href={PHONE_HREF}
              className="mt-8 inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl px-5 py-3 font-semibold text-white"
              aria-label={`Call our ${phoneLabel}`}
            >
              <span className="bg-emerald-500 rounded-full p-2" aria-hidden="true">
                <Phone className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-xs text-emerald-100 font-normal">{phoneLabel}</span>
                <span className="text-lg tracking-wide">{PHONE_NUMBER}</span>
              </span>
            </a>

            {/* Bullet points */}
            <ul className="mt-8 space-y-2.5 text-sm text-slate-300">
              {[
                'Response within 60 minutes',
                'Licensed & insured local contractors',
                'Free, no-obligation quotes',
                `Serving all of ${city} and surrounding areas`,
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="mt-10 flex gap-8">
              {[
                { value: '2,400+', label: 'Jobs Completed' },
                { value: '4.9★', label: 'Average Rating' },
                { value: '60 Min', label: 'Avg. Response' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <QuoteForm
              nicheSlug={nicheSlug}
              locationSlug={locationSlug}
              serviceTypes={serviceTypes}
              ctaText={ctaText}
              city={city}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA — hidden on lg+ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 flex gap-3 lg:hidden">
        <a
          href={PHONE_HREF}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold rounded-xl py-3 text-sm"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          Call Now
        </a>
        <a
          href="#quote-form"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl py-3 text-sm"
        >
          Get Free Quote
        </a>
      </div>
    </section>
  )
}
