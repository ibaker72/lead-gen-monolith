'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadCard } from './LeadCard'
import { Loader2, Inbox } from 'lucide-react'
import type { Lead } from '@/types/database'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

type LeadWithRelations = Lead & {
  niche_location: {
    niche: { name: string } | null
    location: { city: string; state: string } | null
  } | null
}

interface LeadFeedProps {
  initialLeads: LeadWithRelations[]
  contractorId: string
  filters?: {
    status?: string
    urgency?: string
  }
}

export function LeadFeed({ initialLeads, contractorId, filters }: LeadFeedProps) {
  const [leads, setLeads] = useState<LeadWithRelations[]>(initialLeads)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`contractor-leads-${contractorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `contractor_id=eq.${contractorId}`,
        },
        async (payload: RealtimePostgresInsertPayload<Lead>) => {
          // Fetch the full lead with relations
          const { data } = await supabase
            .from('leads')
            .select(
              `*, niche_location:niche_locations(
                niche:niches(name),
                location:locations(city, state)
              )`
            )
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setLeads((prev) => [data as unknown as LeadWithRelations, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `contractor_id=eq.${contractorId}`,
        },
        (payload) => {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === payload.new.id ? { ...l, ...(payload.new as Lead) } : l
            )
          )
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contractorId])

  const filtered = leads.filter((lead) => {
    if (filters?.status && filters.status !== 'all' && lead.status !== filters.status) return false
    if (filters?.urgency && filters.urgency !== 'all' && lead.urgency_label !== filters.urgency) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
          aria-label={isLive ? 'Live updates active' : 'Connecting...'}
        />
        <span className="text-xs text-gray-500">
          {isLive ? 'Live updates' : 'Connecting...'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="font-medium">No leads yet</p>
          <p className="text-sm mt-1">New leads will appear here in real time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}
