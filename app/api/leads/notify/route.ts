import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendHomeownerConfirmation, sendContractorEmergencyAlert } from '@/lib/twilio'
import { sendLeadNotificationEmail } from '@/lib/resend'

const notifySchema = z.object({
  leadId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = notifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 422 })
  }

  const supabase = createAdminClient()

  const { data: lead, error } = await supabase
    .from('leads')
    .select(
      `*, niche_location:niche_locations(
        model_type,
        niche:niches(name),
        location:locations(city, state),
        contractor:contractors(email, phone, company_name)
      )`
    )
    .eq('id', parsed.data.leadId)
    .single()

  if (error || !lead) {
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
  }

  const nl = (lead as typeof lead & {
    niche_location: {
      niche: { name: string }
      location: { city: string; state: string }
      contractor: { email: string; phone: string | null; company_name: string } | null
    } | null
  }).niche_location

  const nicheName = nl?.niche?.name ?? 'Home Service'
  const city = nl?.location?.city ?? ''
  const state = nl?.location?.state ?? ''
  const contractor = nl?.contractor ?? null

  const results: Record<string, boolean> = {}

  try {
    await sendHomeownerConfirmation({
      phone: lead.phone,
      name: lead.name,
      nicheName,
    })
    results.homeownerSms = true
  } catch (e) {
    console.error('[notify] homeowner SMS failed:', e)
    results.homeownerSms = false
  }

  if (contractor) {
    try {
      await sendLeadNotificationEmail({
        contractorEmail: contractor.email,
        contractorName: contractor.company_name,
        lead,
        nicheName,
        city,
        state,
      })
      results.contractorEmail = true
    } catch (e) {
      console.error('[notify] contractor email failed:', e)
      results.contractorEmail = false
    }

    if (lead.urgency_label === 'emergency' && contractor.phone) {
      try {
        await sendContractorEmergencyAlert({
          phone: contractor.phone,
          leadName: lead.name,
          serviceType: lead.service_type,
          city,
          leadId: lead.id,
        })
        results.contractorEmergencySms = true
      } catch (e) {
        console.error('[notify] emergency SMS failed:', e)
        results.contractorEmergencySms = false
      }
    }
  }

  return NextResponse.json({ success: true, data: results })
}
