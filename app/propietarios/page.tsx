'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PropietariosPage() {
  const [form, setForm] = useState({
    name: '', address: '', bedrooms: '', bathrooms: '',
    capacity: '', price_per_night: '', owner_name: '', owner_phone: '', description: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.owner_name || !form.owner_phone) {
      setError('Completá al menos nombre de la propiedad, tu nombre y teléfono.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.from('properties').insert([{
      name: form.name,
      address: form.address,
      bedrooms: parseInt(form.bedrooms) || 1,
      bathrooms: parseInt(form.bathrooms) || 1,
      capacity: parseInt(form.capacity) || 2,
      price_per_night: parseInt(form.price_per_night) || 0,
      owner_name: form.owner_name,
      owner_phone: form.owner_phone,
      description: form.description,
      images: [],
      amenities: [],
    }])
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="text-center max-w-md">
          <CheckCircle2 size={48} className="mx-auto mb-6 text-emerald-500" />
          <h2 className="font-display text-4xl text-[var(--dusk)] mb-3" style={{ fontWeight: 300 }}>
            ¡Gracias!
          </h2>
          <p className="font-body text-[var(--dusk)]/60 mb-8">
            Recibimos tu propiedad. Te contactamos en las próximas horas para coordinar los detalles de la temporada.
          </p>
          <Link href="/" className="font-body text-sm text-[var(--ocean-deep)] flex items-center justify-center gap-1 hover:underline">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-20" style={{ background: 'var(--cream)' }}>
      <div className="max-w-xl mx-auto">
        <Link href="/" className="font-body text-sm text-[var(--dusk)]/50 flex items-center gap-1 mb-10 hover:text-[var(--dusk)] transition-colors">
          <ArrowLeft size={14} /> Volver
        </Link>

        <p className="font-body text-sm uppercase tracking-widest text-[var(--ocean-deep)] mb-3">
          Para propietarios
        </p>
        <h1 className="font-display text-5xl text-[var(--dusk)] mb-2" style={{ fontWeight: 300 }}>
          Sumá tu propiedad
        </h1>
        <p className="font-body text-[var(--dusk)]/50 mb-10 text-sm">
          Monetizá los días sueltos entre reservas. Nosotros los encadenamos con otras propiedades para que nadie pierda ingresos.
        </p>

        <div className="space-y-4">
          {[
            { label: 'Nombre de la propiedad *', key: 'name', placeholder: 'Ej: Casa La Dunas' },
            { label: 'Dirección', key: 'address', placeholder: 'Calle y número, Monte Hermoso' },
            { label: 'Tu nombre *', key: 'owner_name', placeholder: 'Nombre completo' },
            { label: 'Tu teléfono (WhatsApp) *', key: 'owner_phone', placeholder: '+54 291 ...' },
            { label: 'Precio por noche (ARS)', key: 'price_per_night', placeholder: '100000', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/50 mb-1 block">
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl font-body text-sm bg-white border border-[var(--dusk)]/10 focus:border-[var(--ocean-deep)] focus:outline-none transition-colors"
              />
            </div>
          ))}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Habitaciones', key: 'bedrooms' },
              { label: 'Baños', key: 'bathrooms' },
              { label: 'Capacidad', key: 'capacity' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/50 mb-1 block">
                  {f.label}
                </label>
                <input
                  type="number"
                  min="1"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-body text-sm bg-white border border-[var(--dusk)]/10 focus:border-[var(--ocean-deep)] focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/50 mb-1 block">
              Descripción breve
            </label>
            <textarea
              rows={3}
              placeholder="Contá algo de la propiedad..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl font-body text-sm bg-white border border-[var(--dusk)]/10 focus:border-[var(--ocean-deep)] focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && <p className="font-body text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-body font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--ocean-deep)' }}
          >
            {loading ? 'Enviando...' : 'Registrar mi propiedad'}
          </button>
        </div>
      </div>
    </main>
  )
}
