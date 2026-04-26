'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, PhoneCall, XCircle, Loader2 } from 'lucide-react'
import type { LeadStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface LeadStatusActionsProps {
  lead: { id: string; status: LeadStatus }
  contractorId: string
  modelType: string
  baseLeadPrice: number
}

const TRANSITIONS: Record<LeadStatus, { label: string; next: LeadStatus; icon: React.ElementType; variant: 'default' | 'destructive' | 'secondary' }[]> = {
  new: [
    { label: 'Mark Contacted', next: 'contacted', icon: PhoneCall, variant: 'default' },
    { label: 'Reject Lead', next: 'rejected', icon: XCircle, variant: 'destructive' },
  ],
  qualified: [
    { label: 'Mark Contacted', next: 'contacted', icon: PhoneCall, variant: 'default' },
    { label: 'Reject Lead', next: 'rejected', icon: XCircle, variant: 'destructive' },
  ],
  contacted: [
    { label: 'Mark as Sold', next: 'sold', icon: CheckCircle, variant: 'default' },
    { label: 'Reject Lead', next: 'rejected', icon: XCircle, variant: 'destructive' },
  ],
  sold: [],
  rejected: [],
}

export function LeadStatusActions({
  lead,
  contractorId,
  modelType,
  baseLeadPrice,
}: LeadStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status)

  const actions = TRANSITIONS[currentStatus] ?? []

  async function updateStatus(nextStatus: LeadStatus) {
    const supabase = createClient()

    const { error } = await supabase
      .from('leads')
      .update({ status: nextStatus })
      .eq('id', lead.id)
      .eq('contractor_id', contractorId)

    if (error) {
      toast.error('Failed to update status. Please try again.')
      return
    }

    // Log event
    await supabase.from('lead_events').insert({
      lead_id: lead.id,
      event_type: `status_changed_to_${nextStatus}`,
      notes: `Status updated from ${currentStatus} to ${nextStatus}`,
    })

    // Trigger pay-per-lead charge when sold
    if (nextStatus === 'sold' && modelType === 'pay_per_lead') {
      try {
        await fetch('/api/billing/charge-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id, amount: baseLeadPrice }),
        })
      } catch {
        // Non-blocking: charge failure is handled server-side
      }
    }

    setCurrentStatus(nextStatus)
    toast.success(`Lead marked as ${nextStatus}`)

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-gray-500">
            {currentStatus === 'sold' ? '🎉 Deal closed!' : 'No further actions available.'}
          </p>
        ) : (
          actions.map(({ label, next, icon: Icon, variant }) => (
            <Button
              key={next}
              variant={variant}
              className="w-full justify-start"
              disabled={isPending}
              onClick={() => updateStatus(next)}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
              )}
              {label}
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
