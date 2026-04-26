import type { NicheLocationWithRelations } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ResolvedSlot {
  nicheLocationId: string
  contractorId: string | null
  contractorEmail: string | null
  contractorPhone: string | null
  contractorCompanyName: string | null
  modelType: string
  nicheName: string
  city: string
  state: string
}

export async function resolveNicheLocation(
  nicheSlug: string,
  locationSlug: string
): Promise<ResolvedSlot | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('niche_locations')
    .select(
      `
      id,
      model_type,
      assigned_contractor_id,
      niche:niches(name, slug),
      location:locations(city, state, slug),
      contractor:contractors(id, email, phone, company_name)
    `
    )
    .eq('is_active', true)
    .filter('niche.slug', 'eq', nicheSlug)
    .filter('location.slug', 'eq', locationSlug)
    .maybeSingle()

  if (error || !data) return null

  const nl = data as unknown as NicheLocationWithRelations

  return {
    nicheLocationId: nl.id,
    contractorId: nl.contractor?.id ?? null,
    contractorEmail: nl.contractor?.email ?? null,
    contractorPhone: nl.contractor?.phone ?? null,
    contractorCompanyName: nl.contractor?.company_name ?? null,
    modelType: nl.model_type,
    nicheName: nl.niche?.name ?? '',
    city: nl.location?.city ?? '',
    state: nl.location?.state ?? '',
  }
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export function isValidPhone(phone: string): boolean {
  return toE164(phone) !== null
}
