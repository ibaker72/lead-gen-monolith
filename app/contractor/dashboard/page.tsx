import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LeadFeed } from '@/components/contractor/LeadFeed'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import type { Lead } from '@/types/database'

export const metadata: Metadata = { title: 'Dashboard' }

type LeadWithRelations = Lead & {
  niche_location: {
    niche: { name: string } | null
    location: { city: string; state: string } | null
  } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: contractor } = await admin
    .from('contractors')
    .select('id, company_name, plan_tier')
    .eq('user_id', user.id)
    .single()

  if (!contractor) redirect('/auth/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: leads } = await admin
    .from('leads')
    .select(
      `*, niche_location:niche_locations(
        niche:niches(name),
        location:locations(city, state)
      )`
    )
    .eq('contractor_id', contractor.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: monthLeads } = await admin
    .from('leads')
    .select('id, status')
    .eq('contractor_id', contractor.id)
    .gte('created_at', startOfMonth)

  const totalThisMonth = monthLeads?.length ?? 0
  const soldThisMonth = monthLeads?.filter((l) => l.status === 'sold').length ?? 0
  const conversionRate =
    totalThisMonth > 0 ? Math.round((soldThisMonth / totalThisMonth) * 100) : 0

  const { data: nicheLocations } = await admin
    .from('niche_locations')
    .select('monthly_rate')
    .eq('assigned_contractor_id', contractor.id)
    .eq('is_active', true)

  const estimatedValue =
    (nicheLocations ?? []).reduce((sum, nl) => sum + (nl.monthly_rate ?? 0), 0)

  const stats = [
    { label: 'Leads This Month', value: totalThisMonth, icon: Users, color: 'text-blue-600' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'text-green-600' },
    { label: 'Closed Deals', value: soldThisMonth, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Monthly Value', value: `$${estimatedValue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {contractor.company_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live lead feed */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Feed</h2>
        <LeadFeed
          initialLeads={(leads ?? []) as unknown as LeadWithRelations[]}
          contractorId={contractor.id}
        />
      </div>
    </div>
  )
}
