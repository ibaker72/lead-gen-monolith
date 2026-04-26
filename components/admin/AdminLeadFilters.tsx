'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminLeadFiltersProps {
  currentFilters: {
    status?: string
    urgency?: string
    from?: string
    to?: string
  }
}

export function AdminLeadFilters({ currentFilters }: AdminLeadFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (currentFilters.status) params.set('status', currentFilters.status)
    if (currentFilters.urgency) params.set('urgency', currentFilters.urgency)
    if (currentFilters.from) params.set('from', currentFilters.from)
    if (currentFilters.to) params.set('to', currentFilters.to)

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    router.push(pathname)
  }

  const hasFilters = currentFilters.status || currentFilters.urgency || currentFilters.from || currentFilters.to

  return (
    <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border">
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Status</Label>
        <Select
          defaultValue={currentFilters.status ?? 'all'}
          onValueChange={(v) => applyFilter('status', v)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Urgency</Label>
        <Select
          defaultValue={currentFilters.urgency ?? 'all'}
          onValueChange={(v) => applyFilter('urgency', v)}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">From</Label>
        <Input
          type="date"
          defaultValue={currentFilters.from ?? ''}
          className="h-9 w-36"
          onChange={(e) => applyFilter('from', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">To</Label>
        <Input
          type="date"
          defaultValue={currentFilters.to ?? ''}
          className="h-9 w-36"
          onChange={(e) => applyFilter('to', e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-500">
          Clear filters
        </Button>
      )}
    </div>
  )
}
