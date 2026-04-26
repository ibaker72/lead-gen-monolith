import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Map, FileText, DollarSign, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/leads', label: 'Leads', icon: FileText },
  { href: '/admin/contractors', label: 'Contractors', icon: Users },
  { href: '/admin/niches', label: 'Geo Slots', icon: Map },
  { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminClient = createAdminClient()
  const { data: adminRow } = await adminClient
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/contractor/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Lead Gen Engine</p>
          <p className="text-sm font-bold text-white mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white font-medium transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
