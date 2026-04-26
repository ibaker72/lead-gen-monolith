import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { UrgencyBadge, StatusBadge } from '@/components/contractor/StatusBadge'
import { LeadExportButton } from '@/components/admin/LeadExportButton'
import { AdminLeadFilters } from '@/components/admin/AdminLeadFilters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin — Leads' }

interface PageProps {
  searchParams: {
    niche?: string
    location?: string
    contractor?: string
    status?: string
    urgency?: string
    from?: string
    to?: string
  }
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const admin = createAdminClient()

  let query = admin
    .from('leads')
    .select(
      `id, name, phone, service_type, urgency_label, urgency_score, status, created_at,
      niche_location:niche_locations(
        niche:niches(name, slug),
        location:locations(city, state)
      ),
      contractor:contractors(company_name)`
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (searchParams.status) query = query.eq('status', searchParams.status as 'new' | 'qualified' | 'contacted' | 'sold' | 'rejected')
  if (searchParams.urgency) query = query.eq('urgency_label', searchParams.urgency as 'low' | 'medium' | 'high' | 'emergency')
  if (searchParams.from) query = query.gte('created_at', searchParams.from)
  if (searchParams.to) query = query.lte('created_at', searchParams.to + 'T23:59:59Z')

  const { data: leads } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads?.length ?? 0} total</p>
        </div>
        <LeadExportButton leads={leads ?? []} />
      </div>

      <AdminLeadFilters currentFilters={searchParams} />

      <div className="mt-6 bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(leads ?? []).map((lead) => {
              const nl = lead.niche_location as unknown as {
                niche: { name: string } | null
                location: { city: string; state: string } | null
              } | null
              const contractor = lead.contractor as unknown as { company_name: string } | null

              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <div className="text-xs text-gray-400">{lead.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{lead.service_type}</TableCell>
                  <TableCell className="text-sm text-gray-700">{nl?.niche?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {nl?.location ? `${nl.location.city}, ${nl.location.state}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {contractor?.company_name ?? (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <UrgencyBadge
                      urgency={lead.urgency_label}
                      score={lead.urgency_score}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {(!leads || leads.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p>No leads match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
