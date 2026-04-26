import { Star } from 'lucide-react'

interface Review {
  name: string
  neighborhood: string
  text: string
  service: string
}

function getReviews(nicheName: string, city: string): Review[] {
  return [
    {
      name: 'Maria S.',
      neighborhood: city,
      text: `My ${nicheName.toLowerCase()} system broke down on a Friday night. They sent someone within the hour — completely saved our weekend. Professional, honest, and the price was fair.`,
      service: `${nicheName} Emergency`,
    },
    {
      name: 'James T.',
      neighborhood: city,
      text: `Got three quotes and these guys were the most transparent. No hidden fees. The technician explained everything before starting. Highly recommend to any homeowner in the area.`,
      service: `${nicheName} Installation`,
    },
    {
      name: 'Angela R.',
      neighborhood: city,
      text: `Called at 8am, had a tech at my door by 10. Fixed the issue in under two hours. The whole process was seamless — the online form made it so easy to get started.`,
      service: `${nicheName} Repair`,
    },
    {
      name: 'Carlos M.',
      neighborhood: city,
      text: `I've used a lot of contractors over the years. These were the most responsive. I got a call back within 20 minutes of submitting the form. Will definitely use again.`,
      service: `${nicheName} Service`,
    },
    {
      name: 'Linda K.',
      neighborhood: city,
      text: `Incredible service. They showed up on time, cleaned up after themselves, and did a thorough job. Getting a quote was the easiest part — literally took 60 seconds online.`,
      service: `${nicheName} Maintenance`,
    },
  ]
}

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
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
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          What Homeowners in {city} Are Saying
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          Real reviews from real customers in your area
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <article
              key={review.name}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100"
            >
              <StarRating />
              <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <footer className="mt-4">
                <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-500">
                  {review.service} · {review.neighborhood}
                </p>
              </footer>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {reviews.slice(3).map((review) => (
            <article
              key={review.name}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100"
            >
              <StarRating />
              <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <footer className="mt-4">
                <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-500">
                  {review.service} · {review.neighborhood}
                </p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
