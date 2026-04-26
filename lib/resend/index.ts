import { Resend } from 'resend'
import type { Lead } from '@/types/database'

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Missing RESEND_API_KEY')
  return new Resend(key)
}

function urgencyColor(label: string): string {
  const map: Record<string, string> = {
    emergency: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a',
  }
  return map[label] ?? '#6b7280'
}

export async function sendLeadNotificationEmail(params: {
  contractorEmail: string
  contractorName: string
  lead: Lead
  nicheName: string
  city: string
  state: string
}): Promise<void> {
  const resend = getResendClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const deepLink = `${appUrl}/contractor/leads/${params.lead.id}`
  const color = urgencyColor(params.lead.urgency_label)

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: #1d4ed8; padding: 24px 32px;">
          <p style="margin: 0; color: #bfdbfe; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Lead Gen Engine</p>
          <h1 style="margin: 8px 0 0; color: white; font-size: 22px; font-weight: 700;">New ${params.nicheName} Lead</h1>
        </div>

        <!-- Urgency Badge -->
        <div style="padding: 20px 32px 0;">
          <span style="display: inline-block; background: ${color}; color: white; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 999px;">
            ${params.lead.urgency_label} urgency · score ${params.lead.urgency_score ?? 'N/A'}/10
          </span>
        </div>

        <!-- Lead Info -->
        <div style="padding: 20px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280; width: 140px;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 600; color: #111827;">${params.lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 600; color: #111827;">${params.lead.phone}</td>
            </tr>
            ${params.lead.email ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111827;">${params.lead.email}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">Service</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 600; color: #111827;">${params.lead.service_type}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Location</td>
              <td style="padding: 10px 0; font-size: 14px; color: #111827;">${params.city}, ${params.state}</td>
            </tr>
          </table>
        </div>

        <!-- AI Summary -->
        ${params.lead.ai_summary ? `
        <div style="margin: 0 32px 24px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.05em;">AI Assessment</p>
          <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6;">${params.lead.ai_summary}</p>
        </div>` : ''}

        <!-- CTA -->
        <div style="padding: 0 32px 32px; text-align: center;">
          <a href="${deepLink}" style="display: inline-block; background: #1d4ed8; color: white; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            View Lead &amp; Take Action →
          </a>
          <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">Received ${new Date(params.lead.created_at).toLocaleString()}</p>
        </div>

      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: 'Lead Gen Engine <leads@noreply.leadgenengine.com>',
    to: params.contractorEmail,
    subject: `🔔 New ${params.lead.urgency_label.toUpperCase()} Lead: ${params.nicheName} in ${params.city}, ${params.state}`,
    html,
  })
}
