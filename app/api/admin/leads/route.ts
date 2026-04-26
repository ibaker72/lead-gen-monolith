import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  return data ? user : null
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const admin = createAdminClient()

  let query = admin
    .from('leads')
    .select(
      `*, niche_location:niche_locations(
        niche:niches(name, slug),
        location:locations(city, state)
      ), contractor:contractors(company_name)`
    )
    .order('created_at', { ascending: false })
    .limit(500)

  const status = searchParams.get('status')
  const urgency = searchParams.get('urgency')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (status) query = query.eq('status', status as 'new' | 'qualified' | 'contacted' | 'sold' | 'rejected')
  if (urgency) query = query.eq('urgency_label', urgency as 'low' | 'medium' | 'high' | 'emergency')
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to + 'T23:59:59Z')

  const { data, error } = await query

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
