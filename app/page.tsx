'use client'

import { useState } from 'react'
import SearchBar from './components/SearchBar'
import PropertyGrid from './components/PropertyGrid'
import ChainResults from './components/ChainResults'
import Navbar from './components/Navbar'
import { ChainResult } from '@/lib/supabase'

export default function Home() {
  const [searchDates, setSearchDates] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [chains, setChains] = useState<ChainResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (checkIn: string, checkOut: string) => {
    setLoading(true)
    setSearched(true)
    setSearchDates({ checkIn, checkOut })
    setChains([])

    try {
      const res = await fetch(`/api/chain?checkIn=${checkIn}&checkOut=${checkOut}`)
      const data = await res.json()
      setChains(data.chains || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(160deg, #0a3b6d 0%, #1a1f2e 50%, #0a3b6d 100%)',
          }}
        />
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 z-0 opacity-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z" fill="#e8d5b0"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p
            className="font-display text-[var(--sand-warm)] text-lg italic mb-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            Monte Hermoso
          </p>
          <h1
            className="font-display text-white opacity-0 animate-fade-up"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              lineHeight: 1.05,
              fontWeight: 300,
              animationDelay: '0.2s',
              animationFillMode: 'forwards',
            }}
          >
            Cuando todo está lleno,<br />
            <em style={{ color: 'var(--sand-warm)' }}>nosotros te hacemos lugar.</em>
          </h1>
          <p
            className="font-body text-white/60 text-lg mt-6 mb-12 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
          >
            Combinamos propiedades para que tengas tus vacaciones completas,
            aunque no haya un solo lugar disponible.
          </p>

          {/* Search */}
          <div
            className="opacity-0 animate-fade-up"
            style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
          >
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </div>
      </section>

      {/* Results or Listings */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        {searched ? (
          <ChainResults
            chains={chains}
            loading={loading}
            checkIn={searchDates?.checkIn || ''}
            checkOut={searchDates?.checkOut || ''}
          />
        ) : (
          <>
            <div className="mb-10">
              <p className="font-body text-sm uppercase tracking-widest text-[var(--ocean-deep)] mb-2">
                Propiedades disponibles
              </p>
              <h2 className="font-display text-4xl text-[var(--dusk)]" style={{ fontWeight: 300 }}>
                Alojamientos en Monte Hermoso
              </h2>
            </div>
            <PropertyGrid />
          </>
        )}
      </section>

      {/* How it works */}
      <section className="bg-[var(--dusk)] py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-sm uppercase tracking-widest text-[var(--sand-warm)] mb-4 text-center">
            ¿Cómo funciona?
          </p>
          <h2
            className="font-display text-white text-center mb-16"
            style={{ fontSize: '2.8rem', fontWeight: 300 }}
          >
            Tu estadía completa, sin importar qué
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Elegís tus fechas',
                desc: 'Ingresás el período completo que querés para tus vacaciones, sin límites.',
              },
              {
                num: '02',
                title: 'Armamos la combinación',
                desc: 'Nuestro sistema encuentra propiedades disponibles y las encadena para cubrir toda tu estadía.',
              },
              {
                num: '03',
                title: 'Te mudamos nosotros',
                desc: 'Nos encargamos del traslado de tu equipaje entre propiedades. Vos solo disfrutás.',
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div
                  className="font-display text-6xl mb-4"
                  style={{ color: 'var(--sand-warm)', opacity: 0.3, fontWeight: 300 }}
                >
                  {step.num}
                </div>
                <h3 className="font-display text-white text-2xl mb-3" style={{ fontWeight: 400 }}>
                  {step.title}
                </h3>
                <p className="font-body text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--dusk)] border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-white/40 italic text-lg">Encadenados</span>
          <p className="font-body text-white/30 text-sm">
            Monte Hermoso, Buenos Aires · Temporada 2025/2026
          </p>
        </div>
      </footer>
    </main>
  )
}
