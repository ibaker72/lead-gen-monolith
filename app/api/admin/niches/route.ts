import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

const patchSchema = z.object({
  slotId: z.string().uuid(),
  assigned_contractor_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
  monthly_rate: z.number().positive().nullable().optional(),
  model_type: z.enum(['rank_rent', 'pay_per_lead', 'exclusive']).optional(),
})

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('niche_locations')
    .select(
      `*, niche:niches(name, slug), location:locations(city, state, slug), contractor:contractors(company_name)`
    )
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 422 })
  }

  const { slotId, ...updates } = parsed.data
  const admin = createAdminClient()

  const { error } = await admin.from('niche_locations').update(updates).eq('id', slotId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
