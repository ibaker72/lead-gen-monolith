import Anthropic from '@anthropic-ai/sdk'
import type { LeadUrgency } from '@/types/database'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface LeadScoreResult {
  urgency_score: number
  urgency_label: LeadUrgency
  ai_summary: string
}

export async function scoreLead(params: {
  nicheName: string
  city: string
  state: string
  serviceType: string
  leadName: string
}): Promise<LeadScoreResult> {
  const userPrompt = `
Niche: ${params.nicheName}
Location: ${params.city}, ${params.state}
Service requested: ${params.serviceType}
Customer name: ${params.leadName}

Analyze this lead and return a JSON object ONLY. No markdown, no explanation, just raw JSON.
`.trim()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: `You are a lead qualification AI for a home services lead generation platform.

Analyze the provided lead data and return a JSON object with exactly these fields:
{
  "urgency_score": <number 1-10>,
  "urgency_label": <"low"|"medium"|"high"|"emergency">,
  "ai_summary": "<2 sentences max, written directly for the contractor, describing what this customer likely needs and how quickly to respond>"
}

Urgency scoring guide:
- 10: AC failure in summer heat, active water flooding, gas leak
- 9: Active roof leak in rain, burst pipe, no heat in winter
- 7-8: Significant malfunction, impacting daily life, needs repair within 24 hours
- 5-6: Service needed within the week, some inconvenience
- 3-4: Getting quotes for an upcoming project, not urgent
- 1-2: Annual maintenance, general inquiry, future planning

Return ONLY valid JSON. No markdown fences, no extra text.`,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  const parsed = JSON.parse(rawText) as {
    urgency_score: number
    urgency_label: string
    ai_summary: string
  }

  const urgency_score = Math.min(10, Math.max(1, Math.round(parsed.urgency_score)))
  const urgency_label = (['low', 'medium', 'high', 'emergency'].includes(parsed.urgency_label)
    ? parsed.urgency_label
    : 'medium') as LeadUrgency

  return {
    urgency_score,
    urgency_label,
    ai_summary: parsed.ai_summary ?? '',
  }
}
