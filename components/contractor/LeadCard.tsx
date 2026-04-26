import Link from 'next/link'
import { Phone, MapPin, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { UrgencyBadge, StatusBadge } from './StatusBadge'
import { timeAgo } from '@/lib/utils'
import type { Lead } from '@/types/database'

interface LeadCardProps {
  lead: Lead & {
    niche_location: {
      niche: { name: string } | null
      location: { city: string; state: string } | null
    } | null
  }
}

export function LeadCard({ lead }: LeadCardProps) {
  const niche = lead.niche_location?.niche?.name ?? 'Service'
  const city = lead.niche_location?.location?.city ?? ''
  const state = lead.niche_location?.location?.state ?? ''

  return (
    <Link href={`/contractor/leads/${lead.id}`} className="block group">
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-transparent group-hover:border-l-blue-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <UrgencyBadge urgency={lead.urgency_label} score={lead.urgency_score} />
                <StatusBadge status={lead.status} />
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {niche}
                </span>
              </div>

              <h3 className="mt-2 text-base font-semibold text-gray-900 truncate">{lead.name}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{lead.service_type}</p>
            </div>

            <time
              dateTime={lead.created_at}
              className="text-xs text-gray-400 shrink-0"
            >
              {timeAgo(lead.created_at)}
            </time>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            {city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {city}, {state}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" aria-hidden="true" />
              {lead.phone}
            </span>
          </div>

          {lead.ai_summary && (
            <div className="mt-3 flex items-start gap-2 bg-blue-50 rounded-lg p-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-blue-800 leading-relaxed">{lead.ai_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
