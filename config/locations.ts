export interface LocationConfig {
  city: string
  state: string
  slug: string
  zip_codes: string[]
  lat: number
  lng: number
  county: string
  population: number
}

export const LOCATION_CONFIGS: Record<string, LocationConfig> = {
  'paterson-nj': {
    city: 'Paterson',
    state: 'NJ',
    slug: 'paterson-nj',
    zip_codes: ['07501', '07502', '07503', '07504', '07505'],
    lat: 40.9168,
    lng: -74.1718,
    county: 'Passaic',
    population: 145233,
  },
  'clifton-nj': {
    city: 'Clifton',
    state: 'NJ',
    slug: 'clifton-nj',
    zip_codes: ['07011', '07012', '07013', '07014', '07015'],
    lat: 40.8584,
    lng: -74.1638,
    county: 'Passaic',
    population: 89131,
  },
  'wayne-nj': {
    city: 'Wayne',
    state: 'NJ',
    slug: 'wayne-nj',
    zip_codes: ['07470', '07474'],
    lat: 40.9337,
    lng: -74.2496,
    county: 'Passaic',
    population: 55403,
  },
  'passaic-nj': {
    city: 'Passaic',
    state: 'NJ',
    slug: 'passaic-nj',
    zip_codes: ['07055'],
    lat: 40.8568,
    lng: -74.1285,
    county: 'Passaic',
    population: 70537,
  },
  'hackensack-nj': {
    city: 'Hackensack',
    state: 'NJ',
    slug: 'hackensack-nj',
    zip_codes: ['07601', '07602'],
    lat: 40.8859,
    lng: -74.0435,
    county: 'Bergen',
    population: 45820,
  },
  'newark-nj': {
    city: 'Newark',
    state: 'NJ',
    slug: 'newark-nj',
    zip_codes: ['07101', '07102', '07103', '07104', '07105', '07106'],
    lat: 40.7357,
    lng: -74.1724,
    county: 'Essex',
    population: 311549,
  },
  'jersey-city-nj': {
    city: 'Jersey City',
    state: 'NJ',
    slug: 'jersey-city-nj',
    zip_codes: ['07302', '07304', '07305', '07306', '07307', '07310'],
    lat: 40.7178,
    lng: -74.0431,
    county: 'Hudson',
    population: 292449,
  },
  'hoboken-nj': {
    city: 'Hoboken',
    state: 'NJ',
    slug: 'hoboken-nj',
    zip_codes: ['07030'],
    lat: 40.744,
    lng: -74.0324,
    county: 'Hudson',
    population: 60419,
  },
  'teaneck-nj': {
    city: 'Teaneck',
    state: 'NJ',
    slug: 'teaneck-nj',
    zip_codes: ['07666'],
    lat: 40.8915,
    lng: -74.0146,
    county: 'Bergen',
    population: 40803,
  },
  'bloomfield-nj': {
    city: 'Bloomfield',
    state: 'NJ',
    slug: 'bloomfield-nj',
    zip_codes: ['07003'],
    lat: 40.8068,
    lng: -74.186,
    county: 'Essex',
    population: 52072,
  },
}

export function getLocationConfig(slug: string): LocationConfig | null {
  return LOCATION_CONFIGS[slug] ?? null
}
