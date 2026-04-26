import { createAdminClient } from '@/lib/supabase/admin'
import { scoreLead } from '@/lib/anthropic'
import { sendHomeownerConfirmation, sendContractorEmergencyAlert } from '@/lib/twilio'
import { sendLeadNotificationEmail } from '@/lib/resend'
import { resolveNicheLocation, toE164 } from '@/lib/geo'
import type { LeadUrgency } from '@/types/database'

export interface LeadSubmission {
  name: string
  phone: string
  email?: string
  serviceType: string
  nicheSlug: string
  locationSlug: string
  sourceUrl: string
}

export interface PipelineResult {
  success: boolean
  leadId?: string
  error?: string
}

export async function runLeadPipeline(submission: LeadSubmission): Promise<PipelineResult> {
  const supabase = createAdminClient()

  // Step 1 — Resolve niche + location slot
  const slot = await resolveNicheLocation(submission.nicheSlug, submission.locationSlug)
  if (!slot) {
    return { success: false, error: 'Landing page not found or inactive' }
  }

  // Step 2 — Store lead (initial insert with no AI data yet)
  const e164Phone = toE164(submission.phone) ?? submission.phone

  const { data: lead, error: insertError } = await supabase
    .from('leads')
    .insert({
      niche_location_id: slot.nicheLocationId,
      contractor_id: slot.contractorId,
      name: submission.name,
      phone: e164Phone,
      email: submission.email ?? null,
      service_type: submission.serviceType,
      status: 'new',
      source_url: submission.sourceUrl,
    })
    .select()
    .single()

  if (insertError || !lead) {
    return { success: false, error: 'Failed to store lead' }
  }

  // Step 3 — AI Score (non-blocking: update lead if scoring succeeds)
  let urgencyLabel: LeadUrgency = 'medium'
  let urgencyScore = 5

  try {
    const scoreResult = await scoreLead({
      nicheName: slot.nicheName,
      city: slot.city,
      state: slot.state,
      serviceType: submission.serviceType,
      leadName: submission.name,
    })

    urgencyLabel = scoreResult.urgency_label
    urgencyScore = scoreResult.urgency_score

    await supabase
      .from('leads')
      .update({
        urgency_score: scoreResult.urgency_score,
        urgency_label: scoreResult.urgency_label,
        ai_summary: scoreResult.ai_summary,
        status: 'qualified',
      })
      .eq('id', lead.id)

    lead.urgency_score = scoreResult.urgency_score
    lead.urgency_label = scoreResult.urgency_label
    lead.ai_summary = scoreResult.ai_summary
    lead.status = 'qualified'
  } catch (err) {
    console.error('[lead-pipeline] AI scoring failed:', err)
  }

  // Log the initial event
  await supabase.from('lead_events').insert({
    lead_id: lead.id,
    event_type: 'lead_created',
    notes: `Lead submitted from ${submission.sourceUrl}. Urgency: ${urgencyLabel} (${urgencyScore}/10)`,
  })

  // Step 4 — Notify homeowner via SMS
  try {
    await sendHomeownerConfirmation({
      phone: e164Phone,
      name: submission.name,
      nicheName: slot.nicheName,
    })
  } catch (err) {
    console.error('[lead-pipeline] Homeowner SMS failed:', err)
  }

  // Step 4 — Notify contractor via email (if assigned)
  if (slot.contractorEmail) {
    try {
      await sendLeadNotificationEmail({
        contractorEmail: slot.contractorEmail,
        contractorName: slot.contractorCompanyName ?? 'Contractor',
        lead,
        nicheName: slot.nicheName,
        city: slot.city,
        state: slot.state,
      })
    } catch (err) {
      console.error('[lead-pipeline] Contractor email failed:', err)
    }

    // Emergency SMS to contractor
    if (urgencyLabel === 'emergency' && slot.contractorPhone) {
      try {
        await sendContractorEmergencyAlert({
          phone: slot.contractorPhone,
          leadName: submission.name,
          serviceType: submission.serviceType,
          city: slot.city,
          leadId: lead.id,
        })
      } catch (err) {
        console.error('[lead-pipeline] Emergency contractor SMS failed:', err)
      }
    }
  }

  return { success: true, leadId: lead.id }
}
