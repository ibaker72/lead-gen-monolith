import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listInvoices, getSubscription } from '@/lib/stripe'
import { BillingPortalButton } from '@/components/contractor/BillingPortalButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: contractor } = await admin
    .from('contractors')
    .select('id, company_name, plan_tier, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!contractor) redirect('/auth/login')

  let subscription = null
  let invoices: Awaited<ReturnType<typeof listInvoices>> = []

  if (contractor.stripe_customer_id) {
    try {
      invoices = await listInvoices(contractor.stripe_customer_id)
    } catch {
      // Stripe may not be configured in dev
    }
  }

  if (contractor.stripe_subscription_id) {
    try {
      subscription = await getSubscription(contractor.stripe_subscription_id)
    } catch {
      // Stripe may not be configured in dev
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and view invoices</p>
      </div>

      {/* Plan card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" aria-hidden="true" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 capitalize">{contractor.plan_tier} Plan</p>
              {subscription && (
                <p className="text-sm text-gray-500 mt-1">
                  Next billing date:{' '}
                  {formatDate(new Date(subscription.current_period_end * 1000).toISOString())}
                </p>
              )}
              {!contractor.stripe_subscription_id && (
                <p className="text-sm text-gray-500 mt-1">No active subscription</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {subscription && (
                <Badge
                  variant={subscription.status === 'active' ? 'success' : 'warning'}
                >
                  {subscription.status}
                </Badge>
              )}
              {contractor.stripe_customer_id && (
                <BillingPortalButton customerId={contractor.stripe_customer_id} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" aria-hidden="true" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(new Date((invoice.created) * 1000).toISOString())}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{invoice.status}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency((invoice.amount_paid ?? 0) / 100)}
                    </p>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
