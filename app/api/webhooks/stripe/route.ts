import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

      if (!customerId) break

      await admin.from('payments').insert({
        contractor_id: await getContractorIdByCustomer(customerId),
        stripe_payment_intent_id: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : null,
        amount: invoice.amount_paid / 100,
        type: 'subscription',
        status: 'paid',
      })

      // Ensure contractor is active
      await admin
        .from('contractors')
        .update({ is_active: true })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

      if (!customerId) break

      await admin
        .from('contractors')
        .update({ is_active: false })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id

      if (!customerId) break

      await admin
        .from('contractors')
        .update({
          stripe_subscription_id: null,
          plan_tier: 'free',
          is_active: false,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id

      if (!customerId) break

      await admin
        .from('contractors')
        .update({
          stripe_subscription_id: sub.id,
          is_active: sub.status === 'active',
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

      if (!customerId || !subscriptionId) break

      await admin
        .from('contractors')
        .update({
          stripe_subscription_id: subscriptionId,
          plan_tier: 'active',
          is_active: true,
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}

async function getContractorIdByCustomer(customerId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('contractors')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id ?? null
}
