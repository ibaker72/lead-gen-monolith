'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ContractorToggleButton({
  contractorId,
  isActive,
}: {
  contractorId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [active, setActive] = useState(isActive)
  const [isPending, startTransition] = useTransition()

  async function toggle() {
    const res = await fetch('/api/admin/contractors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': '' },
      body: JSON.stringify({ contractorId, is_active: !active }),
    })
    const json = (await res.json()) as { success: boolean; error?: string }

    if (!json.success) {
      toast.error(json.error ?? 'Update failed')
      return
    }

    setActive(!active)
    toast.success(`Contractor ${!active ? 'activated' : 'deactivated'}`)
    startTransition(() => router.refresh())
  }

  return (
    <Button
      variant={active ? 'destructive' : 'default'}
      size="sm"
      onClick={toggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : active ? (
        'Deactivate'
      ) : (
        'Activate'
      )}
    </Button>
  )
}
