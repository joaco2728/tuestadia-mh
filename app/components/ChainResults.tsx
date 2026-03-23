'use client'

import { ChainResult } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, Link2, Package, CheckCircle2, AlertCircle } from 'lucide-react'

type Props = {
  chains: ChainResult[]
  loading: boolean
  checkIn: string
  checkOut: string
}

export default function ChainResults({ chains, loading, checkIn, checkOut }: Props) {
  const fmt = (d: string) => format(parseISO(d), "d 'de' MMM", { locale: es })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64 mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-40 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="mx-auto mb-4 text-[var(--dusk)]/20" />
        <h3 className="font-display text-3xl text-[var(--dusk)] mb-3" style={{ fontWeight: 300 }}>
          Sin disponibilidad para esas fechas
        </h3>
        <p className="font-body text-sm text-[var(--dusk)]/50">
          Probá con otras fechas o dejanos tu contacto y te avisamos cuando haya lugar.
        </p>
        <button
          className="mt-6 font-body text-sm px-6 py-3 rounded-full text-white"
          style={{ background: 'var(--ocean-deep)' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Cambiar fechas
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-sm uppercase tracking-widest text-[var(--ocean-deep)] mb-2">
          Resultados
        </p>
        <h2 className="font-display text-4xl text-[var(--dusk)]" style={{ fontWeight: 300 }}>
          {fmt(checkIn)} → {fmt(checkOut)}
        </h2>
        <p className="font-body text-sm text-[var(--dusk)]/50 mt-1">
          Encontramos {chains.length} combinación{chains.length !== 1 ? 'es' : ''} para tu estadía completa
        </p>
      </div>

      <div className="space-y-5">
        {chains.map((chain, i) => (
          <ChainCard key={i} chain={chain} index={i} fmt={fmt} />
        ))}
      </div>
    </div>
  )
}

function ChainCard({
  chain,
  index,
  fmt,
}: {
  chain: ChainResult
  index: number
  fmt: (d: string) => string
}) {
  const isSingle = chain.segments.length === 1

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-up border border-[var(--dusk)]/5"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
    >
      {/* Badge */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <div className="flex items-center gap-2">
          {isSingle ? (
            <span className="flex items-center gap-1 font-body text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 size={12} /> Una sola propiedad
            </span>
          ) : (
            <span className="flex items-center gap-1 font-body text-xs font-medium text-[var(--ocean-deep)] bg-blue-50 px-3 py-1 rounded-full">
              <Link2 size={12} /> {chain.segments.length} propiedades encadenadas
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-[var(--dusk)]/40">{chain.total_nights} noches</p>
          <p className="font-display text-2xl text-[var(--dusk)]" style={{ fontWeight: 400 }}>
            ${chain.total_price.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Segments */}
      <div className="px-6 py-5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          {chain.segments.map((seg, si) => (
            <div key={si} className="flex items-center gap-3 flex-1">
              {/* Segment card */}
              <div
                className="flex-1 rounded-xl p-4"
                style={{ background: 'var(--cream)', border: '1px solid rgba(26,31,46,0.06)' }}
              >
                <div className="flex gap-3">
                  <img
                    src={seg.property.images?.[0] || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80`}
                    alt={seg.property.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-base text-[var(--dusk)] truncate" style={{ fontWeight: 400 }}>
                      {seg.property.name}
                    </p>
                    <p className="font-body text-xs text-[var(--dusk)]/50 mb-2">
                      {fmt(seg.from)} → {fmt(seg.to)}
                    </p>
                    <p className="font-body text-xs font-medium text-[var(--ocean-deep)]">
                      {seg.nights} noche{seg.nights !== 1 ? 's' : ''} · ${seg.subtotal.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow between segments */}
              {si < chain.segments.length - 1 && (
                <div className="flex flex-col items-center gap-1 text-[var(--dusk)]/20">
                  <Package size={14} />
                  <ArrowRight size={16} />
                  <p className="font-body text-[10px] text-[var(--dusk)]/40 whitespace-nowrap">traslado</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-5 flex items-center justify-between">
        {!isSingle && (
          <p className="font-body text-xs text-[var(--dusk)]/40 flex items-center gap-1">
            <Package size={11} />
            Incluye traslado de equipaje entre propiedades
          </p>
        )}
        <button
          className="ml-auto font-body text-sm font-medium px-6 py-2.5 rounded-full text-white transition-all hover:opacity-90"
          style={{ background: 'var(--ocean-deep)' }}
        >
          Consultar disponibilidad
        </button>
      </div>
    </div>
  )
}
