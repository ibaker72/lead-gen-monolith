import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreLead } from '@/lib/anthropic'

const scoreSchema = z.object({
  nicheName: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  serviceType: z.string().min(1),
  leadName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  // Internal route — validate with ADMIN_SECRET header
  const secret = req.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = scoreSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 422 })
  }

  try {
    const result = await scoreLead(parsed.data)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[/api/leads/score]', err)
    return NextResponse.json({ success: false, error: 'AI scoring failed' }, { status: 500 })
  }
}
