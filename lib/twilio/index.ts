import twilio from 'twilio'

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials')
  }

  return twilio(accountSid, authToken)
}

export async function sendSMS(params: { to: string; body: string }): Promise<void> {
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!from) throw new Error('Missing TWILIO_PHONE_NUMBER')

  const client = getTwilioClient()
  await client.messages.create({
    body: params.body,
    from,
    to: params.to,
  })
}

export async function sendHomeownerConfirmation(params: {
  phone: string
  name: string
  nicheName: string
}): Promise<void> {
  await sendSMS({
    to: params.phone,
    body: `Hi ${params.name}! We received your ${params.nicheName} request. A licensed local expert will call you within 60 minutes. Questions? Reply STOP to opt out.`,
  })
}

export async function sendContractorEmergencyAlert(params: {
  phone: string
  leadName: string
  serviceType: string
  city: string
  leadId: string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  await sendSMS({
    to: params.phone,
    body: `🚨 EMERGENCY LEAD: ${params.leadName} needs ${params.serviceType} in ${params.city}. Act now: ${appUrl}/contractor/leads/${params.leadId}`,
  })
}
