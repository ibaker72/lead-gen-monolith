'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, CheckCircle2, Lock, Loader2 } from 'lucide-react'

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    ),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  serviceType: z.string().min(1, 'Please select a service'),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  nicheSlug: string
  locationSlug: string
  serviceTypes: string[]
  ctaText: string
  city: string
}

export function QuoteForm({ nicheSlug, locationSlug, serviceTypes, ctaText, city }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
  })

  async function onSubmit(data: QuoteFormValues) {
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          nicheSlug,
          locationSlug,
          sourceUrl: window.location.href,
        }),
      })

      const json = (await res.json()) as { success: boolean; data?: { leadId: string }; error?: string }

      if (!json.success) {
        toast.error(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setLeadId(json.data?.leadId ?? null)
      setSubmitted(true)
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          A licensed local expert will call you within <strong>60 minutes</strong>. We also sent a
          confirmation text to your phone.
        </p>
        {leadId && (
          <p className="mt-4 text-xs text-gray-400">Reference: #{leadId.slice(0, 8).toUpperCase()}</p>
        )}
      </div>
    )
  }

  return (
    <form
      id="quote-form"
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5"
      noValidate
    >
      <div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 mb-3">
          No obligation · Free · Takes 60 seconds
        </div>
        <h2 className="text-xl font-bold text-gray-900">Get Your Free Quote</h2>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          placeholder="John Smith"
          autoComplete="name"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(973) 555-0100"
          autoComplete="tel"
          {...register('phone')}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-xs text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="serviceType">Service Needed</Label>
        <Select onValueChange={(val) => setValue('serviceType', val, { shouldValidate: true })}>
          <SelectTrigger id="serviceType" aria-invalid={!!errors.serviceType}>
            <SelectValue placeholder="Select a service..." />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((svc) => (
              <SelectItem key={svc} value={svc}>
                {svc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p className="text-xs text-red-600" role="alert">
            {errors.serviceType.message}
          </p>
        )}
      </div>

      <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 flex items-center justify-center gap-1.5">
        <Bell className="w-3.5 h-3.5" aria-hidden="true" />
        12 homeowners requested quotes in {city} today
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md h-12"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          ctaText
        )}
      </Button>

      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" aria-hidden="true" /> Your info is private · We never sell your data
      </p>
    </form>
  )
}
