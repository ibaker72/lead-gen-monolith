'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { ClipboardList, Loader2 } from 'lucide-react'
import type { LeadEvent } from '@/types/database'

const EVENT_LABELS: Record<string, string> = {
  lead_created: 'Lead submitted',
  status_changed_to_qualified: 'Marked qualified',
  status_changed_to_contacted: 'Marked contacted',
  status_changed_to_sold: 'Marked as sold',
  status_changed_to_rejected: 'Lead rejected',
  note_added: 'Note added',
}

interface LeadEventLogProps {
  events: LeadEvent[]
  leadId: string
  contractorId: string
}

export function LeadEventLog({ events, leadId }: LeadEventLogProps) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [localEvents, setLocalEvents] = useState<LeadEvent[]>(events)

  async function addNote() {
    if (!note.trim()) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('lead_events')
      .insert({
        lead_id: leadId,
        event_type: 'note_added',
        notes: note.trim(),
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to save note.')
      return
    }

    setLocalEvents((prev) => [data, ...prev])
    setNote('')
    toast.success('Note saved.')
    startTransition(() => router.refresh())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="w-4 h-4" aria-hidden="true" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note about this lead..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={addNote}
            disabled={!note.trim() || isPending}
          >
            {isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
            Save Note
          </Button>
        </div>

        {/* Event list */}
        {localEvents.length > 0 && (
          <ol className="relative border-l border-gray-200 space-y-4 ml-3">
            {localEvents.map((event) => (
              <li key={event.id} className="ml-4">
                <div className="absolute w-2.5 h-2.5 bg-blue-200 rounded-full -left-1.5 border border-white" />
                <p className="text-xs font-semibold text-gray-900">
                  {EVENT_LABELS[event.event_type] ?? event.event_type}
                </p>
                {event.notes && (
                  <p className="text-xs text-gray-600 mt-0.5">{event.notes}</p>
                )}
                <time dateTime={event.created_at} className="text-xs text-gray-400">
                  {formatDate(event.created_at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
