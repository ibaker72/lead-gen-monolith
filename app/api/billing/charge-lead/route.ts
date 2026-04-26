import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaymentIntent } from '@/lib/stripe'

const chargeSchema = z.object({
  leadId: z.string().uuid(),
  amount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = chargeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 422 })
  }

  const admin = createAdminClient()

  const { data: contractor } = await admin
    .from('contractors')
    .select('id, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!contractor?.stripe_customer_id) {
    return NextResponse.json(
      { success: false, error: 'No Stripe customer on file' },
      { status: 400 }
    )
  }

  try {
    const intent = await createPaymentIntent({
      amount: parsed.data.amount,
      customerId: contractor.stripe_customer_id,
      metadata: { lead_id: parsed.data.leadId, contractor_id: contractor.id },
    })

    // Record payment in DB
    await admin.from('payments').insert({
      contractor_id: contractor.id,
      stripe_payment_intent_id: intent.id,
      amount: parsed.data.amount,
      lead_id: parsed.data.leadId,
      type: 'per_lead',
      status: intent.status,
    })

    return NextResponse.json({ success: true, data: { paymentIntentId: intent.id } })
  } catch (err) {
    console.error('[billing/charge-lead]', err)
    return NextResponse.json({ success: false, error: 'Payment failed' }, { status: 500 })
  }
}
