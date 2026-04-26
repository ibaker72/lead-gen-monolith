export interface NicheConfig {
  slug: string
  name: string
  icon: string
  base_lead_price: number
  serviceTypes: string[]
  seoDescription: string
  heroTagline: string
  ctaText: string
  phoneLabel: string
}

export const NICHE_CONFIGS: Record<string, NicheConfig> = {
  hvac: {
    slug: 'hvac',
    name: 'HVAC',
    icon: '❄️',
    base_lead_price: 75,
    serviceTypes: [
      'AC Repair',
      'AC Installation',
      'Heating Repair',
      'Furnace Installation',
      'Heat Pump Service',
      'Duct Cleaning',
      'Annual Maintenance',
      'Emergency Service',
      'Thermostat Installation',
      'Other',
    ],
    seoDescription:
      'Get free quotes from licensed, insured HVAC contractors in your area. Same-day service available. AC repair, furnace installation, and more.',
    heroTagline: 'Fast, Local HVAC Service — Free Quotes in Minutes',
    ctaText: 'Get My Free HVAC Quote',
    phoneLabel: 'HVAC Emergency Line',
  },
  roofing: {
    slug: 'roofing',
    name: 'Roofing',
    icon: '🏠',
    base_lead_price: 95,
    serviceTypes: [
      'Roof Repair',
      'Full Roof Replacement',
      'Leak Detection',
      'Storm Damage',
      'Gutters & Downspouts',
      'Flat Roof',
      'Shingle Replacement',
      'Roof Inspection',
      'New Construction',
      'Other',
    ],
    seoDescription:
      'Licensed roofing contractors ready to repair or replace your roof. Free inspections, competitive quotes, and local experts you can trust.',
    heroTagline: 'Local Roofers You Can Trust — Free Estimates Today',
    ctaText: 'Get My Free Roofing Estimate',
    phoneLabel: 'Roofing Hotline',
  },
  plumbing: {
    slug: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    base_lead_price: 65,
    serviceTypes: [
      'Drain Clog',
      'Pipe Leak or Burst',
      'Water Heater Repair',
      'Water Heater Installation',
      'Toilet Repair',
      'Faucet Repair',
      'Sewer Line',
      'Gas Line',
      'New Installation',
      'Emergency Service',
      'Other',
    ],
    seoDescription:
      'Licensed plumbers available 24/7 for emergency repairs, drain clogs, water heater issues, and more. Free quotes from local experts.',
    heroTagline: '24/7 Licensed Plumbers — Free Quotes, Fast Response',
    ctaText: 'Get My Free Plumbing Quote',
    phoneLabel: 'Plumbing Emergency Line',
  },
}

export function getNicheConfig(slug: string): NicheConfig | null {
  return NICHE_CONFIGS[slug] ?? null
}
