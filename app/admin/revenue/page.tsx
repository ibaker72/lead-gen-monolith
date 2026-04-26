import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Zap, MapPin } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin — Revenue' }

export default async function AdminRevenuePage() {
  const admin = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  // MRR = sum of monthly_rate for all active assigned slots
  const { data: activeSlots } = await admin
    .from('niche_locations')
    .select('monthly_rate, niche:niches(name), location:locations(city, state)')
    .eq('is_active', true)
    .not('assigned_contractor_id', 'is', null)

  const mrr = (activeSlots ?? []).reduce((sum, s) => sum + (s.monthly_rate ?? 0), 0)

  // Leads this month
  const { count: leadsThisMonth } = await admin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  // Leads last month (for comparison)
  const { count: leadsLastMonth } = await admin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfLastMonth)
    .lt('created_at', startOfMonth)

  // Sold leads for average lead value
  const { data: soldLeads } = await admin
    .from('leads')
    .select('niche_location:niche_locations(niche:niches(base_lead_price))')
    .eq('status', 'sold')
    .gte('created_at', startOfMonth)

  const totalLeadValue = (soldLeads ?? []).reduce((sum, l) => {
    const nl = l.niche_location as unknown as { niche: { base_lead_price: number } | null } | null
    return sum + (nl?.niche?.base_lead_price ?? 0)
  }, 0)

  const avgLeadValue = soldLeads && soldLeads.length > 0 ? totalLeadValue / soldLeads.length : 0

  // Top performing slots
  const slotLeadCounts = await admin
    .from('leads')
    .select('niche_location_id')
    .gte('created_at', startOfMonth)
    .not('niche_location_id', 'is', null)

  const countBySlot = (slotLeadCounts.data ?? []).reduce(
    (acc: Record<string, number>, row) => {
      if (row.niche_location_id) {
        acc[row.niche_location_id] = (acc[row.niche_location_id] ?? 0) + 1
      }
      return acc
    },
    {}
  )

  const topSlotIds = Object.entries(countBySlot)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id)

  const { data: topSlots } = topSlotIds.length > 0
    ? await admin
        .from('niche_locations')
        .select('id, monthly_rate, niche:niches(name), location:locations(city, state)')
        .in('id', topSlotIds)
    : { data: [] }

  // Monthly lead counts for chart (last 6 months)
  const { data: chartData } = await admin
    .from('leads')
    .select('created_at')
    .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString())
    .order('created_at')

  const monthlyCounts = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
    const count = (chartData ?? []).filter((l) => {
      const ld = new Date(l.created_at)
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear()
    }).length
    return { month: label, leads: count }
  })

  const leadsGrowth =
    leadsLastMonth && leadsLastMonth > 0
      ? Math.round((((leadsThisMonth ?? 0) - leadsLastMonth) / leadsLastMonth) * 100)
      : null

  const stats = [
    {
      label: 'Monthly Recurring Revenue',
      value: formatCurrency(mrr),
      icon: DollarSign,
      sub: 'From active slots',
      color: 'text-green-600',
    },
    {
      label: 'Leads This Month',
      value: leadsThisMonth ?? 0,
      icon: Zap,
      sub: leadsGrowth !== null ? `${leadsGrowth > 0 ? '+' : ''}${leadsGrowth}% vs last month` : 'First month',
      color: 'text-blue-600',
    },
    {
      label: 'Avg Lead Value',
      value: formatCurrency(avgLeadValue),
      icon: TrendingUp,
      sub: 'Sold leads this month',
      color: 'text-purple-600',
    },
    {
      label: 'Active Slots',
      value: activeSlots?.length ?? 0,
      icon: MapPin,
      sub: 'Assigned & live',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-gray-500 text-sm mt-1">Platform performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, sub, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Lead Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={monthlyCounts} />
            </CardContent>
          </Card>
        </div>

        {/* Top slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Geo-Niche Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {topSlots && topSlots.length > 0 ? (
              <ol className="space-y-3">
                {topSlots.map((slot, i) => {
                  const niche = slot.niche as unknown as { name: string } | null
                  const location = slot.location as unknown as { city: string; state: string } | null
                  return (
                    <li key={slot.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{niche?.name}</p>
                          <p className="text-xs text-gray-500">
                            {location?.city}, {location?.state}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-700">
                        {countBySlot[slot.id] ?? 0} leads
                      </span>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-sm text-gray-400">No data yet this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
