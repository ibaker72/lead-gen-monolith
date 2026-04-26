import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContractorToggleButton } from '@/components/admin/ContractorToggleButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Contractors' }

export default async function AdminContractorsPage() {
  const admin = createAdminClient()

  const { data: contractors } = await admin
    .from('contractors')
    .select(
      `id, company_name, email, phone, plan_tier, is_active, stripe_customer_id, created_at,
      niche_locations(count)`
    )
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
        <p className="text-gray-500 text-sm mt-1">{contractors?.length ?? 0} registered</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Slots</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(contractors ?? []).map((c) => {
              const slotCount = (c.niche_locations as unknown as { count: number }[] | null)?.[0]?.count ?? 0

              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{c.company_name}</p>
                    <p className="text-xs text-gray-400">{c.id.slice(0, 8)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700">{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone ?? '—'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {c.plan_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{slotCount}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'success' : 'danger'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(c.created_at)}
                  </TableCell>
                  <TableCell>
                    <ContractorToggleButton
                      contractorId={c.id}
                      isActive={c.is_active}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
