import { Badge } from '@/components/ui/badge'
import type { LeadStatus, LeadUrgency } from '@/types/database'

interface UrgencyBadgeProps {
  urgency: LeadUrgency
  score?: number | null
}

export function UrgencyBadge({ urgency, score }: UrgencyBadgeProps) {
  const variants: Record<LeadUrgency, 'emergency' | 'danger' | 'warning' | 'success'> = {
    emergency: 'emergency',
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }

  return (
    <Badge variant={variants[urgency]}>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      {score != null && ` · ${score}/10`}
    </Badge>
  )
}

interface StatusBadgeProps {
  status: LeadStatus
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  qualified: 'Qualified',
  contacted: 'Contacted',
  sold: 'Sold',
  rejected: 'Rejected',
}

const STATUS_VARIANTS: Record<LeadStatus, 'default' | 'secondary' | 'success' | 'danger' | 'outline'> = {
  new: 'default',
  qualified: 'secondary',
  contacted: 'secondary',
  sold: 'success',
  rejected: 'danger',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
