import { ShieldCheck, Award, MapPin, Tag } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Licensed & Insured' },
  { icon: Award, label: 'Background Checked' },
  { icon: MapPin, label: '100% Local Experts' },
  { icon: Tag, label: 'Free Quotes' },
]

export function TrustBar() {
  return (
    <section className="bg-blue-50 border-y border-blue-100 py-4">
      <div className="max-w-5xl mx-auto px-4">
        <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Icon className="w-5 h-5 text-blue-600 shrink-0" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
