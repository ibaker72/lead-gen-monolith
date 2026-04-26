import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContractorSettingsForm } from '@/components/contractor/ContractorSettingsForm'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: contractor } = await admin
    .from('contractors')
    .select('id, company_name, phone, email')
    .eq('user_id', user.id)
    .single()

  if (!contractor) redirect('/auth/login')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Update your company profile</p>
      </div>
      <ContractorSettingsForm contractor={contractor} />
    </div>
  )
}
