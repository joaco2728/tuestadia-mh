import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findChains } from '@/lib/chain'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Traer todas las propiedades
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')

  if (propError) {
    return NextResponse.json({ error: propError.message }, { status: 500 })
  }

  // Traer disponibilidades en el rango pedido
  const { data: availabilities, error: availError } = await supabase
    .from('availability')
    .select('*')
    .gte('date', checkIn)
    .lt('date', checkOut)
    .eq('is_available', true)

  if (availError) {
    return NextResponse.json({ error: availError.message }, { status: 500 })
  }

  // Construir mapa property_id → Set<date>
  const availMap: Record<string, Set<string>> = {}
  for (const a of availabilities || []) {
    if (!availMap[a.property_id]) availMap[a.property_id] = new Set()
    availMap[a.property_id].add(a.date)
  }

  const propertiesWithAvail = (properties || []).map(p => ({
    ...p,
    availableDates: availMap[p.id] || new Set<string>(),
  }))

  const chains = findChains(checkIn, checkOut, propertiesWithAvail)

  return NextResponse.json({ chains })
}
