import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, CreditCard, Settings, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/contractor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contractor/billing', label: 'Billing', icon: CreditCard },
  { href: '/contractor/settings', label: 'Settings', icon: Settings },
]

async function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500 hover:text-red-600">
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </form>
  )
}

export default async function ContractorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()
  const { data: contractor } = await adminClient
    .from('contractors')
    .select('company_name, plan_tier, is_active')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Lead Gen Engine</p>
          <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
            {contractor?.company_name ?? 'Contractor'}
          </p>
          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full capitalize">
            {contractor?.plan_tier ?? 'free'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1" aria-label="Contractor navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
