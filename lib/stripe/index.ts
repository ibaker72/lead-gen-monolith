import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
    typescript: true,
  })

  return stripeClient
}

export async function createStripeCustomer(params: {
  email: string
  name: string
  metadata?: Record<string, string>
}): Promise<string> {
  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata ?? {},
  })
  return customer.id
}

export async function createBillingPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
  return session.url
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata ?? {},
  })
  return session.url!
}

export async function createPaymentIntent(params: {
  amount: number
  customerId: string
  metadata?: Record<string, string>
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()
  return stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: 'usd',
    customer: params.customerId,
    payment_method_types: ['card'],
    metadata: params.metadata ?? {},
  })
}

export async function listInvoices(customerId: string): Promise<Stripe.Invoice[]> {
  const stripe = getStripe()
  const { data } = await stripe.invoices.list({
    customer: customerId,
    limit: 20,
  })
  return data
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.retrieve(subscriptionId)
}
