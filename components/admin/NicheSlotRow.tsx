'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface Slot {
  id: string
  is_active: boolean
  monthly_rate: number | null
  model_type: string
  niche_name: string
  location_label: string
  contractor_id: string | null
  contractor_name: string | null
}

interface ContractorOption {
  id: string
  company_name: string
}

interface NicheSlotRowProps {
  slot: Slot
  contractors: ContractorOption[]
}

const MODEL_LABELS: Record<string, string> = {
  rank_rent: 'Rank & Rent',
  pay_per_lead: 'Pay-Per-Lead',
  exclusive: 'Exclusive',
}

export function NicheSlotRow({ slot, contractors }: NicheSlotRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [contractorId, setContractorId] = useState(slot.contractor_id ?? 'none')

  async function assignContractor(newContractorId: string) {
    setContractorId(newContractorId)

    const res = await fetch('/api/admin/niches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: slot.id,
        assigned_contractor_id: newContractorId === 'none' ? null : newContractorId,
      }),
    })
    const json = (await res.json()) as { success: boolean; error?: string }

    if (!json.success) {
      toast.error(json.error ?? 'Update failed')
      return
    }

    toast.success('Slot updated')
    startTransition(() => router.refresh())
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{slot.niche_name}</TableCell>
      <TableCell className="text-sm text-gray-700">{slot.location_label}</TableCell>
      <TableCell>
        <Badge variant="secondary">{MODEL_LABELS[slot.model_type] ?? slot.model_type}</Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-700">
        {slot.monthly_rate ? formatCurrency(slot.monthly_rate) : '—'}
      </TableCell>
      <TableCell>
        <Select
          value={contractorId}
          onValueChange={assignContractor}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Assign contractor..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-gray-400 italic">Unassigned</span>
            </SelectItem>
            {contractors.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant={slot.is_active ? 'success' : 'danger'}>
          {slot.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </TableCell>
    </TableRow>
  )
}
