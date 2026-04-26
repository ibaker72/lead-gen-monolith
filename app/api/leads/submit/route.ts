import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runLeadPipeline } from '@/lib/lead-pipeline'
import { isValidPhone } from '@/lib/geo'

const submitSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal('')),
  serviceType: z.string().min(1).max(100),
  nicheSlug: z.string().min(1).max(50),
  locationSlug: z.string().min(1).max(100),
  sourceUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, phone, email, serviceType, nicheSlug, locationSlug, sourceUrl } = parsed.data

  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid US phone number.' },
      { status: 422 }
    )
  }

  // Basic spam heuristics
  if (/https?:\/\//i.test(name) || /https?:\/\//i.test(serviceType)) {
    return NextResponse.json({ success: false, error: 'Invalid submission.' }, { status: 422 })
  }

  const result = await runLeadPipeline({
    name: name.trim(),
    phone,
    email: email || undefined,
    serviceType,
    nicheSlug,
    locationSlug,
    sourceUrl: sourceUrl || `/${nicheSlug}/${locationSlug}`,
  })

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, data: { leadId: result.leadId } })
}
