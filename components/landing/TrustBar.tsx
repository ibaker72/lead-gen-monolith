import { ShieldCheck, Award, Star, Clock, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface TrustItem {
  icon: LucideIcon
  stat: string
  label: string
  sub: string
}

const TRUST_ITEMS: TrustItem[] = [
  { icon: ShieldCheck, stat: '100%', label: 'Licensed & Insured', sub: 'Full Coverage' },
  { icon: Award, stat: '500+', label: 'Vetted Contractors', sub: 'Background Checked' },
  { icon: Star, stat: '4.9★', label: 'Avg. Rating', sub: '500+ Reviews' },
  { icon: Clock, stat: '60 Min', label: 'Response Time', sub: 'Guaranteed' },
  { icon: Tag, stat: 'Free', label: 'No-Obligation Quotes', sub: 'No Hidden Fees' },
]

export function TrustBar() {
  return (
    <section className="bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map(({ icon: Icon, stat, label, sub }) => (
            <li key={label} className="flex flex-col items-center text-center py-6 px-2">
              <Icon className="w-8 h-8 text-blue-600 mb-2" aria-hidden="true" />
              <span className="text-2xl font-bold text-slate-900">{stat}</span>
              <span className="text-sm font-semibold text-slate-700 mt-0.5">{label}</span>
              <span className="text-xs text-slate-400 mt-0.5">{sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
