import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UrgencyBadge, StatusBadge } from '@/components/contractor/StatusBadge'
import { LeadStatusActions } from '@/components/contractor/LeadStatusActions'
import { LeadEventLog } from '@/components/contractor/LeadEventLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { Phone, Mail, MapPin, Link as LinkIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Lead Detail' }

interface PageProps {
  params: { id: string }
}

export default async function LeadDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: contractor } = await admin
    .from('contractors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!contractor) redirect('/auth/login')

  const { data: lead } = await admin
    .from('leads')
    .select(
      `*, niche_location:niche_locations(
        model_type,
        niche:niches(name, base_lead_price),
        location:locations(city, state)
      )`
    )
    .eq('id', params.id)
    .eq('contractor_id', contractor.id)
    .single()

  if (!lead) notFound()

  const { data: events } = await admin
    .from('lead_events')
    .select('*')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })

  const nl = lead.niche_location as unknown as {
    model_type: string
    niche: { name: string; base_lead_price: number } | null
    location: { city: string; state: string } | null
  } | null

  const nicheName = nl?.niche?.name ?? 'Service'
  const city = nl?.location?.city ?? ''
  const state = nl?.location?.state ?? ''

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <UrgencyBadge urgency={lead.urgency_label} score={lead.urgency_score} />
          <StatusBadge status={lead.status} />
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {nicheName}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Received {formatDate(lead.created_at)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — lead info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-medium">
                  {lead.phone}
                </a>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="text-gray-700">
                    {city}, {state}
                  </span>
                </div>
              )}
              {lead.source_url && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="text-gray-500 text-sm truncate">{lead.source_url}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-gray-900">{lead.service_type}</p>
            </CardContent>
          </Card>

          {lead.ai_summary && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  AI Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 leading-relaxed">{lead.ai_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Event log */}
          <LeadEventLog
            events={events ?? []}
            leadId={lead.id}
            contractorId={contractor.id}
          />
        </div>

        {/* Right — status actions */}
        <div className="space-y-4">
          <LeadStatusActions
            lead={{ id: lead.id, status: lead.status }}
            contractorId={contractor.id}
            modelType={nl?.model_type ?? 'rank_rent'}
            baseLeadPrice={nl?.niche?.base_lead_price ?? 0}
          />
        </div>
      </div>
    </div>
  )
}
