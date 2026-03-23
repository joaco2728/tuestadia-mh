import { Property, Availability, ChainResult } from './supabase'
import { eachDayOfInterval, format, parseISO, differenceInDays } from 'date-fns'

type PropertyWithAvailability = Property & {
  availableDates: Set<string>
}

/**
 * Dado un rango de fechas y propiedades con su disponibilidad,
 * encuentra combinaciones que cubran toda la estadía.
 *
 * Estrategia:
 * 1. Para cada fecha del rango, filtrar propiedades disponibles.
 * 2. Construir "segmentos" consecutivos por propiedad.
 * 3. Encontrar la combinación con menos cambios posibles.
 */
export function findChains(
  checkIn: string,
  checkOut: string,
  properties: PropertyWithAvailability[]
): ChainResult[] {
  const allDates = eachDayOfInterval({
    start: parseISO(checkIn),
    end: parseISO(checkOut),
  })
    .slice(0, -1) // las noches son las fechas menos el último día
    .map(d => format(d, 'yyyy-MM-dd'))

  if (allDates.length === 0) return []

  // Para cada fecha, qué propiedades están disponibles
  const dateToProperties: Record<string, Property[]> = {}
  for (const date of allDates) {
    dateToProperties[date] = properties.filter(p => p.availableDates.has(date))
  }

  // Verificar si hay alguna fecha sin disponibilidad
  const hasGap = allDates.some(d => dateToProperties[d].length === 0)
  if (hasGap) return []

  // Algoritmo greedy: intentar cubrir el mayor bloque posible con cada propiedad
  const chains: ChainResult[] = []

  // Opción 1: una sola propiedad si cubre todo
  for (const property of properties) {
    if (allDates.every(d => property.availableDates.has(d))) {
      chains.push(buildChain([{ property, dates: allDates }], false))
    }
  }

  // Opción 2: encadenamientos de 2 propiedades
  if (chains.length === 0 || true) {
    for (let i = 0; i < properties.length; i++) {
      const propA = properties[i]
      // Encontrar el bloque más largo que cubre propA desde el inicio
      const blockA = getLongestBlockFrom(propA, allDates, 0)
      if (blockA.length === 0) continue
      if (blockA.length === allDates.length) continue // ya cubierto arriba

      const startB = blockA.length
      for (let j = 0; j < properties.length; j++) {
        if (i === j) continue
        const propB = properties[j]
        const blockB = getLongestBlockFrom(propB, allDates, startB)
        if (blockB.length === 0) continue
        if (startB + blockB.length < allDates.length) {
          // Intentar un tercer segmento
          const startC = startB + blockB.length
          for (let k = 0; k < properties.length; k++) {
            if (k === i || k === j) continue
            const propC = properties[k]
            const blockC = getLongestBlockFrom(propC, allDates, startC)
            if (startC + blockC.length >= allDates.length) {
              chains.push(buildChain([
                { property: propA, dates: blockA },
                { property: propB, dates: blockB },
                { property: propC, dates: blockC.slice(0, allDates.length - startC) },
              ], false))
            }
          }
        } else {
          chains.push(buildChain([
            { property: propA, dates: blockA },
            { property: propB, dates: blockB.slice(0, allDates.length - startB) },
          ], false))
        }
      }
    }
  }

  // Deduplicar y ordenar por cantidad de segmentos (menos cambios primero)
  const seen = new Set<string>()
  const unique = chains.filter(c => {
    const key = c.segments.map(s => `${s.property.id}:${s.from}`).join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique
    .sort((a, b) => a.segments.length - b.segments.length)
    .slice(0, 5) // máximo 5 opciones
}

function getLongestBlockFrom(
  property: PropertyWithAvailability,
  allDates: string[],
  startIndex: number
): string[] {
  const block: string[] = []
  for (let i = startIndex; i < allDates.length; i++) {
    if (property.availableDates.has(allDates[i])) {
      block.push(allDates[i])
    } else {
      break
    }
  }
  return block
}

function buildChain(
  segments: { property: Property; dates: string[] }[],
  hasGaps: boolean
): ChainResult {
  return {
    segments: segments.map(s => ({
      property: s.property,
      from: s.dates[0],
      to: format(
        new Date(new Date(s.dates[s.dates.length - 1]).getTime() + 86400000),
        'yyyy-MM-dd'
      ),
      nights: s.dates.length,
      subtotal: s.dates.length * s.property.price_per_night,
    })),
    total_nights: segments.reduce((acc, s) => acc + s.dates.length, 0),
    total_price: segments.reduce(
      (acc, s) => acc + s.dates.length * s.property.price_per_night,
      0
    ),
    has_gaps: hasGaps,
  }
}
