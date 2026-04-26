'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'

export function BillingPortalButton({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })
      const json = (await res.json()) as { success: boolean; data?: { url: string } }
      if (json.success && json.data?.url) {
        window.location.href = json.data.url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
      {loading ? (
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
      ) : (
        <ExternalLink className="w-3 h-3 mr-1.5" aria-hidden="true" />
      )}
      Manage Billing
    </Button>
  )
}
