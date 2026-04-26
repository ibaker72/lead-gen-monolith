'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Lead {
  id: string
  name: string
  phone: string
  service_type: string
  urgency_label: string
  urgency_score: number | null
  status: string
  created_at: string
}

function toCSV(leads: Lead[]): string {
  const headers = ['ID', 'Name', 'Phone', 'Service', 'Urgency', 'Score', 'Status', 'Received']
  const rows = leads.map((l) => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    l.phone,
    `"${l.service_type.replace(/"/g, '""')}"`,
    l.urgency_label,
    l.urgency_score ?? '',
    l.status,
    new Date(l.created_at).toISOString(),
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function LeadExportButton({ leads }: { leads: Lead[] }) {
  function handleExport() {
    const csv = toCSV(leads)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={leads.length === 0}>
      <Download className="w-4 h-4 mr-2" aria-hidden="true" />
      Export CSV
    </Button>
  )
}
