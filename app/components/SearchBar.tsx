'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

type Props = {
  onSearch: (checkIn: string, checkOut: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = () => {
    setError('')
    if (!checkIn || !checkOut) {
      setError('Seleccioná las fechas de entrada y salida.')
      return
    }
    if (checkIn >= checkOut) {
      setError('La salida debe ser posterior a la entrada.')
      return
    }
    onSearch(checkIn, checkOut)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        {/* Check-in */}
        <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
          <label className="block font-body text-xs uppercase tracking-widest text-white/50 mb-1">
            Llegada
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            className="w-full bg-transparent font-body text-white text-lg focus:outline-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Check-out */}
        <div className="flex-1 p-4 border-b md:border-b-0 border-white/10">
          <label className="block font-body text-xs uppercase tracking-widest text-white/50 mb-1">
            Salida
          </label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            className="w-full bg-transparent font-body text-white text-lg focus:outline-none cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-4 font-body font-medium text-white transition-all disabled:opacity-60"
          style={{ background: 'var(--ocean-deep)', minWidth: '140px' }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#0c4d8a' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ocean-deep)' }}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <p className="font-body text-sm text-red-300 mt-3 text-center">{error}</p>
      )}
    </div>
  )
}
