import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Property = {
  id: string
  name: string
  description: string
  address: string
  capacity: number
  bedrooms: number
  bathrooms: number
  price_per_night: number
  amenities: string[]
  images: string[]
  owner_name: string
  owner_phone: string
  created_at: string
}

export type Availability = {
  id: string
  property_id: string
  date: string          // formato YYYY-MM-DD
  is_available: boolean
}

export type ChainResult = {
  segments: {
    property: Property
    from: string
    to: string
    nights: number
    subtotal: number
  }[]
  total_nights: number
  total_price: number
  has_gaps: boolean
}
