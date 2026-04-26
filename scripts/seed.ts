/**
 * Seed script — populates niches, locations, and niche_location slots.
 * Run with: npm run seed
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const NICHES = [
  { name: 'HVAC', slug: 'hvac', icon: '❄️', base_lead_price: 75 },
  { name: 'Roofing', slug: 'roofing', icon: '🏠', base_lead_price: 95 },
  { name: 'Plumbing', slug: 'plumbing', icon: '🔧', base_lead_price: 65 },
]

const LOCATIONS = [
  { city: 'Paterson', state: 'NJ', slug: 'paterson-nj', zip_codes: ['07501', '07502', '07503', '07504', '07505'], lat: 40.9168, lng: -74.1718 },
  { city: 'Clifton', state: 'NJ', slug: 'clifton-nj', zip_codes: ['07011', '07012', '07013', '07014', '07015'], lat: 40.8584, lng: -74.1638 },
  { city: 'Wayne', state: 'NJ', slug: 'wayne-nj', zip_codes: ['07470', '07474'], lat: 40.9337, lng: -74.2496 },
  { city: 'Passaic', state: 'NJ', slug: 'passaic-nj', zip_codes: ['07055'], lat: 40.8568, lng: -74.1285 },
  { city: 'Hackensack', state: 'NJ', slug: 'hackensack-nj', zip_codes: ['07601', '07602'], lat: 40.8859, lng: -74.0435 },
  { city: 'Newark', state: 'NJ', slug: 'newark-nj', zip_codes: ['07101', '07102', '07103', '07104', '07105', '07106'], lat: 40.7357, lng: -74.1724 },
  { city: 'Jersey City', state: 'NJ', slug: 'jersey-city-nj', zip_codes: ['07302', '07304', '07305', '07306', '07307', '07310'], lat: 40.7178, lng: -74.0431 },
  { city: 'Hoboken', state: 'NJ', slug: 'hoboken-nj', zip_codes: ['07030'], lat: 40.7440, lng: -74.0324 },
  { city: 'Teaneck', state: 'NJ', slug: 'teaneck-nj', zip_codes: ['07666'], lat: 40.8915, lng: -74.0146 },
  { city: 'Bloomfield', state: 'NJ', slug: 'bloomfield-nj', zip_codes: ['07003'], lat: 40.8068, lng: -74.1860 },
]

async function seed() {
  console.log('🌱 Starting seed...')

  // Upsert niches
  console.log('  → Seeding niches...')
  const { data: niches, error: nichesError } = await supabase
    .from('niches')
    .upsert(NICHES, { onConflict: 'slug' })
    .select()

  if (nichesError) {
    console.error('Failed to seed niches:', nichesError.message)
    process.exit(1)
  }
  console.log(`     ✓ ${niches.length} niches seeded`)

  // Upsert locations
  console.log('  → Seeding locations...')
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .upsert(LOCATIONS, { onConflict: 'slug' })
    .select()

  if (locationsError) {
    console.error('Failed to seed locations:', locationsError.message)
    process.exit(1)
  }
  console.log(`     ✓ ${locations.length} locations seeded`)

  // Build all 30 niche_location combinations
  console.log('  → Seeding niche_locations (30 slots)...')
  const nicheLocationRows = niches.flatMap((niche) =>
    locations.map((location) => ({
      niche_id: niche.id,
      location_id: location.id,
      is_active: true,
      monthly_rate: niche.base_lead_price * 10,
      model_type: 'rank_rent' as const,
    }))
  )

  const { data: nicheLocations, error: nlError } = await supabase
    .from('niche_locations')
    .upsert(nicheLocationRows, { onConflict: 'niche_id,location_id' })
    .select()

  if (nlError) {
    console.error('Failed to seed niche_locations:', nlError.message)
    process.exit(1)
  }
  console.log(`     ✓ ${nicheLocations.length} niche_location slots seeded`)

  console.log('\n✅ Seed complete!')
  console.log(`   Niches:          ${niches.length}`)
  console.log(`   Locations:       ${locations.length}`)
  console.log(`   Niche slots:     ${nicheLocations.length}`)
  console.log('\n   Landing pages available at:')
  niches.slice(0, 2).forEach((n) => {
    locations.slice(0, 3).forEach((l) => {
      console.log(`     /${n.slug}/${l.slug}`)
    })
  })
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
