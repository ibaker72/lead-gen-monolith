import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { NicheSlotRow } from '@/components/admin/NicheSlotRow'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Admin — Geo Slots' }

export default async function AdminNichesPage() {
  const admin = createAdminClient()

  const { data: slots } = await admin
    .from('niche_locations')
    .select(
      `id, is_active, monthly_rate, model_type,
      niche:niches(name, slug),
      location:locations(city, state, slug),
      contractor:contractors(id, company_name)`
    )
    .order('created_at', { ascending: false })

  const { data: contractors } = await admin
    .from('contractors')
    .select('id, company_name')
    .eq('is_active', true)
    .order('company_name')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Geo-Niche Slots</h1>
        <p className="text-gray-500 text-sm mt-1">{slots?.length ?? 0} total slots</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Niche</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(slots ?? []).map((slot) => {
              const niche = slot.niche as unknown as { name: string; slug: string } | null
              const location = slot.location as unknown as { city: string; state: string; slug: string } | null
              const contractor = slot.contractor as unknown as { id: string; company_name: string } | null

              return (
                <NicheSlotRow
                  key={slot.id}
                  slot={{
                    id: slot.id,
                    is_active: slot.is_active,
                    monthly_rate: slot.monthly_rate,
                    model_type: slot.model_type,
                    niche_name: niche?.name ?? '',
                    location_label: location ? `${location.city}, ${location.state}` : '',
                    contractor_id: contractor?.id ?? null,
                    contractor_name: contractor?.company_name ?? null,
                  }}
                  contractors={contractors ?? []}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
