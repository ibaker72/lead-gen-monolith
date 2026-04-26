'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const settingsSchema = z.object({
  company_name: z.string().min(2, 'Company name required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
})

type SettingsValues = z.infer<typeof settingsSchema>

interface ContractorSettingsFormProps {
  contractor: {
    id: string
    company_name: string
    phone: string | null
    email: string
  }
}

export function ContractorSettingsForm({ contractor }: ContractorSettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: contractor.company_name,
      phone: contractor.phone ?? '',
      email: contractor.email,
    },
  })

  async function onSubmit(data: SettingsValues) {
    const supabase = createClient()
    const { error } = await supabase
      .from('contractors')
      .update({
        company_name: data.company_name,
        phone: data.phone,
        email: data.email,
      })
      .eq('id', contractor.id)

    if (error) {
      toast.error('Failed to save settings.')
      return
    }

    toast.success('Settings saved.')
    startTransition(() => router.refresh())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" {...register('company_name')} />
            {errors.company_name && (
              <p className="text-xs text-red-600">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting || !isDirty || isPending}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
