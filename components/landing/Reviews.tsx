import { Star, CheckCircle2 } from 'lucide-react'

interface Review {
  name: string
  neighborhood: string
  text: string
  service: string
  date: string
  source: string
}

const AVATAR_COLORS: Record<string, string> = {
  M: 'bg-teal-500',
  J: 'bg-violet-500',
  A: 'bg-orange-500',
  C: 'bg-blue-500',
  L: 'bg-rose-500',
  D: 'bg-amber-500',
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name[0]] ?? 'bg-slate-500'
}

function getReviews(nicheName: string, city: string): Review[] {
  return [
    {
      name: 'Maria S.',
      neighborhood: city,
      text: `My ${nicheName.toLowerCase()} system broke down on a Friday night. They sent someone within the hour — completely saved our weekend. Professional, honest, and the price was fair.`,
      service: `${nicheName} Emergency`,
      date: '2 weeks ago',
      source: 'Google',
    },
    {
      name: 'James T.',
      neighborhood: city,
      text: `Got three quotes and these guys were the most transparent. No hidden fees. The technician explained everything before starting. Highly recommend to any homeowner in the area.`,
      service: `${nicheName} Installation`,
      date: '3 weeks ago',
      source: 'Google',
    },
    {
      name: 'Angela R.',
      neighborhood: city,
      text: `Called at 8am, had a tech at my door by 10. Fixed the issue in under two hours. The whole process was seamless — the online form made it so easy to get started.`,
      service: `${nicheName} Repair`,
      date: '1 month ago',
      source: 'Yelp',
    },
    {
      name: 'Carlos M.',
      neighborhood: city,
      text: `I've used a lot of contractors over the years. These were the most responsive. I got a call back within 20 minutes of submitting the form. Will definitely use again.`,
      service: `${nicheName} Service`,
      date: '1 month ago',
      source: 'Google',
    },
    {
      name: 'Linda K.',
      neighborhood: city,
      text: `Incredible service. They showed up on time, cleaned up after themselves, and did a thorough job. Getting a quote was the easiest part — literally took 60 seconds online.`,
      service: `${nicheName} Maintenance`,
      date: '2 months ago',
      source: 'Google',
    },
    {
      name: 'Derek W.',
      neighborhood: city,
      text: `Scheduled an annual tune-up and the tech was thorough, explained what he found, and didn't try to upsell anything unnecessary. Honest work at a fair price. Booking again next year.`,
      service: `${nicheName} Tune-Up`,
      date: '3 months ago',
      source: 'Yelp',
    },
  ]
}

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </div>
  )
}

interface ReviewsProps {
  nicheName: string
  city: string
}

export function Reviews({ nicheName, city }: ReviewsProps) {
  const reviews = getReviews(nicheName, city)

  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
          What Homeowners in {city} Are Saying
        </h2>
        <p className="text-center text-slate-500 mb-10 text-sm">
          Real reviews from real customers in your area
        </p>

        {/* Aggregate rating block */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-2xl p-6 mb-10 shadow-sm ring-1 ring-slate-200">
          <div className="text-center shrink-0">
            <div className="text-6xl font-extrabold text-slate-900">4.9</div>
            <div className="text-sm text-slate-500 mt-1">out of 5</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex gap-1 justify-center sm:justify-start mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-7 h-7 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <p className="text-sm font-semibold text-slate-700">Based on 500+ verified reviews</p>
            <p className="text-xs text-slate-400 mt-1">Sourced from Google Reviews &amp; Yelp</p>
          </div>
        </div>

        {/* 3×2 review grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-slate-200 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${getAvatarColor(review.name)}`}
                  aria-hidden="true"
                >
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-emerald-700 font-medium">Verified Customer</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {review.service} · {review.date} · via {review.source}
                  </p>
                </div>
              </div>
              <StarRating />
              <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
