import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { customerId?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.customerId) {
    return NextResponse.json({ success: false, error: 'Missing customerId' }, { status: 422 })
  }

  try {
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/contractor/billing`
    const url = await createBillingPortalSession({
      customerId: body.customerId,
      returnUrl,
    })
    return NextResponse.json({ success: true, data: { url } })
  } catch (err) {
    console.error('[billing/portal]', err)
    return NextResponse.json({ success: false, error: 'Failed to create portal session' }, { status: 500 })
  }
}
