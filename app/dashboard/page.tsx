'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LogOut, ChevronLeft, ChevronRight, Loader2,
  TrendingUp, CalendarDays, DollarSign, AlertCircle, X, Check
} from 'lucide-react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isToday, parseISO,
  addDays, isBefore, isAfter, startOfDay
} from 'date-fns'
import { es } from 'date-fns/locale'

type DayData = {
  date: string
  price: number | null
  is_available: boolean
  isException: boolean
}

type Property = {
  id: string
  name: string
  address: string
  base_price: number
  images: string[]
}

type Metrics = {
  occupancyPct: number
  freeDays: number
  projectedRevenue: number
  daysWithoutPrice: number
}

export default function OwnerDashboard() {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState<Record<string, DayData>>({})
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [basePrice, setBasePrice] = useState('')
  const [savingBase, setSavingBase] = useState(false)

  // Selección de rango
  const [selecting, setSelecting] = useState(false)
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  // Modal de edición
  const [showModal, setShowModal] = useState(false)
  const [modalPrice, setModalPrice] = useState('')
  const [modalAvailable, setModalAvailable] = useState(true)
  const [savingModal, setSavingModal] = useState(false)

  useEffect(() => { init() }, [])
  useEffect(() => { if (property) loadDayData() }, [property, currentMonth])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }

    const { data: props } = await supabase
      .from('properties')
      .select('id, name, address, base_price, images')
      .limit(1)
      .single()

    if (props) {
      setProperty(props)
      setBasePrice(props.base_price?.toString() || '')
    }
    setLoading(false)
  }

  const loadDayData = useCallback(async () => {
    if (!property) return

    // Cargar excepciones del mes visible + 90 días para métricas
    const today = startOfDay(new Date())
    const ninetyDaysLater = addDays(today, 90)

    const { data: exceptions } = await supabase
      .from('price_exceptions')
      .select('*')
      .eq('property_id', property.id)
      .gte('date', format(today, 'yyyy-MM-dd'))
      .lte('date', format(ninetyDaysLater, 'yyyy-MM-dd'))

    // Construir mapa de días
    const map: Record<string, DayData> = {}
    const next90 = eachDayOfInterval({ start: today, end: ninetyDaysLater })

    for (const day of next90) {
      const key = format(day, 'yyyy-MM-dd')
      const exc = exceptions?.find(e => e.date === key)
      map[key] = {
        date: key,
        price: exc?.price ?? null,
        is_available: exc?.is_available ?? true,
        isException: !!exc,
      }
    }
    setDayData(map)

    // Calcular métricas
    const occupied = next90.filter(d => {
      const k = format(d, 'yyyy-MM-dd')
      return map[k] && !map[k].is_available
    })
    const free = next90.filter(d => {
      const k = format(d, 'yyyy-MM-dd')
      return !map[k] || map[k].is_available
    })
    const withoutPrice = next90.filter(d => {
      const k = format(d, 'yyyy-MM-dd')
      return map[k]?.is_available && map[k]?.price === null && !property.base_price
    })
    const projected = free.reduce((acc, d) => {
      const k = format(d, 'yyyy-MM-dd')
      const price = map[k]?.price ?? property.base_price ?? 0
      return acc + price
    }, 0)

    setMetrics({
      occupancyPct: Math.round((occupied.length / next90.length) * 100),
      freeDays: free.length,
      projectedRevenue: projected,
      daysWithoutPrice: withoutPrice.length,
    })
  }, [property])

  const saveBasePrice = async () => {
    if (!property || !basePrice) return
    setSavingBase(true)
    await supabase
      .from('properties')
      .update({ base_price: parseInt(basePrice) })
      .eq('id', property.id)
    setProperty(p => p ? { ...p, base_price: parseInt(basePrice) } : p)
    setSavingBase(false)
    loadDayData()
  }

  const handleDayClick = (dateStr: string) => {
    const day = parseISO(dateStr)
    if (isBefore(day, startOfDay(new Date()))) return

    if (!selecting || !rangeStart) {
      setRangeStart(dateStr)
      setRangeEnd(null)
      setSelecting(true)
    } else {
      const end = dateStr < rangeStart ? rangeStart : dateStr
      const start = dateStr < rangeStart ? dateStr : rangeStart
      setRangeStart(start)
      setRangeEnd(end)
      setSelecting(false)
      // Abrir modal con los valores del primer día del rango
      const firstDay = dayData[start]
      setModalPrice(firstDay?.price?.toString() || basePrice || '')
      setModalAvailable(firstDay?.is_available ?? true)
      setShowModal(true)
    }
  }

  const saveRange = async () => {
    if (!property || !rangeStart) return
    setSavingModal(true)

    const end = rangeEnd || rangeStart
    const days = eachDayOfInterval({
      start: parseISO(rangeStart),
      end: parseISO(end),
    })

    const upserts = days.map(d => ({
      property_id: property.id,
      date: format(d, 'yyyy-MM-dd'),
      price: modalPrice ? parseInt(modalPrice) : null,
      is_available: modalAvailable,
    }))

    await supabase.from('price_exceptions').upsert(upserts, {
      onConflict: 'property_id,date'
    })

    setSavingModal(false)
    setShowModal(false)
    setRangeStart(null)
    setRangeEnd(null)
    loadDayData()
  }

  const cancelSelection = () => {
    setSelecting(false)
    setRangeStart(null)
    setRangeEnd(null)
    setShowModal(false)
  }

  // Días del mes actual para el calendario
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startWeekday = monthStart.getDay()

  const isInRange = (dateStr: string) => {
    if (!rangeStart) return false
    const end = rangeEnd || hoverDate || rangeStart
    const lo = rangeStart < end ? rangeStart : end
    const hi = rangeStart < end ? end : rangeStart
    return dateStr >= lo && dateStr <= hi
  }

  const getDayStyle = (dateStr: string) => {
    const data = dayData[dateStr]
    const inRange = isInRange(dateStr)
    const isStart = dateStr === rangeStart
    const past = isBefore(parseISO(dateStr), startOfDay(new Date()))

    if (past) return 'bg-transparent text-[var(--dusk)]/20 cursor-not-allowed'
    if (isStart) return 'bg-[var(--ocean-deep)] text-white font-medium cursor-pointer'
    if (inRange) return 'bg-[var(--ocean-deep)]/20 text-[var(--dusk)] cursor-pointer'
    if (!data || data.is_available) {
      if (data?.price && data.price !== property?.base_price)
        return 'bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100'
      return 'bg-emerald-50 text-emerald-800 cursor-pointer hover:bg-emerald-100'
    }
    return 'bg-red-50 text-red-400 cursor-pointer hover:bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <Loader2 size={24} className="animate-spin text-[var(--dusk)]/30" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <p className="font-display text-2xl text-[var(--dusk)]/40" style={{ fontWeight: 300 }}>
            No tenés propiedades asignadas todavía.
          </p>
          <p className="font-body text-sm text-[var(--dusk)]/30 mt-2">
            Contactá al administrador.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--dusk)' }} className="px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-display text-white text-2xl italic" style={{ fontWeight: 300 }}>
            {property.name}
          </span>
          <p className="font-body text-white/30 text-xs mt-0.5">{property.address}</p>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }}
          className="flex items-center gap-1 font-body text-xs text-white/50 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Salir
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <MetricCard
              icon={<CalendarDays size={16} className="text-[var(--ocean-deep)]" />}
              label="Ocupación 90 días"
              value={`${metrics.occupancyPct}%`}
              sub="de los días"
            />
            <MetricCard
              icon={<CalendarDays size={16} className="text-emerald-600" />}
              label="Días libres"
              value={metrics.freeDays.toString()}
              sub="próximos 90 días"
            />
            <MetricCard
              icon={<TrendingUp size={16} className="text-amber-600" />}
              label="Ingreso proyectado"
              value={`$${(metrics.projectedRevenue / 1000).toFixed(0)}k`}
              sub="días libres x precio"
            />
            {metrics.daysWithoutPrice > 0 ? (
              <div
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => setCurrentMonth(new Date())}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="font-body text-xs text-amber-700 uppercase tracking-widest">Atención</span>
                </div>
                <p className="font-display text-2xl text-amber-800" style={{ fontWeight: 400 }}>
                  {metrics.daysWithoutPrice}
                </p>
                <p className="font-body text-xs text-amber-600">días sin precio</p>
              </div>
            ) : (
              <MetricCard
                icon={<DollarSign size={16} className="text-emerald-600" />}
                label="Precio configurado"
                value="✓"
                sub="todos los días"
              />
            )}
          </div>
        )}

        {/* Precio base */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm flex items-center gap-4">
          <div className="flex-1">
            <p className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/40 mb-1">
              Precio base por noche
            </p>
            <p className="font-body text-xs text-[var(--dusk)]/40">
              Se aplica a todos los días sin precio especial
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-[var(--dusk)]/50">$</span>
            <input
              type="number"
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              className="w-32 px-3 py-2 rounded-xl font-body text-sm border border-[var(--dusk)]/10 focus:border-[var(--ocean-deep)] focus:outline-none text-right"
              placeholder="120000"
            />
            <button
              onClick={saveBasePrice}
              disabled={savingBase}
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-body text-sm text-white disabled:opacity-50"
              style={{ background: 'var(--ocean-deep)' }}
            >
              {savingBase ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Guardar
            </button>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {/* Nav del mes */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-2 rounded-full hover:bg-[var(--dusk)]/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-display text-xl text-[var(--dusk)] capitalize" style={{ fontWeight: 400 }}>
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-2 rounded-full hover:bg-[var(--dusk)]/5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Instrucción */}
          <p className="font-body text-xs text-[var(--dusk)]/40 text-center mb-4">
            {selecting
              ? '📅 Hacé click en el día final del rango'
              : 'Hacé click en un día para seleccionarlo, o en dos días para un rango'}
          </p>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center font-body text-xs text-[var(--dusk)]/30 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const data = dayData[dateStr]
              const price = data?.price ?? property.base_price

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => selecting && setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    relative rounded-lg p-1 text-center transition-all select-none
                    ${getDayStyle(dateStr)}
                    ${isToday(day) ? 'ring-2 ring-[var(--ocean-deep)]' : ''}
                  `}
                >
                  <p className="font-body text-sm leading-tight">{format(day, 'd')}</p>
                  {price > 0 && isSameMonth(day, currentMonth) && (
                    <p className="font-body text-[9px] leading-tight opacity-60 hidden md:block">
                      ${(price / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[var(--dusk)]/5">
            {[
              { color: 'bg-emerald-100', label: 'Disponible' },
              { color: 'bg-amber-100', label: 'Precio especial' },
              { color: 'bg-red-100', label: 'No disponible' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="font-body text-xs text-[var(--dusk)]/40">{l.label}</span>
              </div>
            ))}
            {selecting && (
              <button
                onClick={cancelSelection}
                className="ml-auto font-body text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} /> Cancelar selección
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal edición de rango */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0"
          style={{ background: 'rgba(26,31,46,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-[var(--dusk)]" style={{ fontWeight: 400 }}>
                {rangeEnd && rangeEnd !== rangeStart
                  ? `${format(parseISO(rangeStart!), "d MMM", { locale: es })} → ${format(parseISO(rangeEnd), "d MMM", { locale: es })}`
                  : format(parseISO(rangeStart!), "d 'de' MMMM", { locale: es })
                }
              </h3>
              <button onClick={cancelSelection}>
                <X size={18} className="text-[var(--dusk)]/30" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Disponibilidad */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--dusk)]/10">
                <div>
                  <p className="font-body text-sm font-medium text-[var(--dusk)]">Disponible</p>
                  <p className="font-body text-xs text-[var(--dusk)]/40">
                    {modalAvailable ? 'Los turistas pueden reservar' : 'Fechas bloqueadas'}
                  </p>
                </div>
                <button
                  onClick={() => setModalAvailable(a => !a)}
                  className={`w-12 h-6 rounded-full transition-all relative ${modalAvailable ? 'bg-emerald-500' : 'bg-[var(--dusk)]/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${modalAvailable ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Precio */}
              {modalAvailable && (
                <div>
                  <label className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/40 mb-1 block">
                    Precio por noche (ARS)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-[var(--dusk)]/40">$</span>
                    <input
                      type="number"
                      value={modalPrice}
                      onChange={e => setModalPrice(e.target.value)}
                      placeholder={`${property.base_price || 'precio base'}`}
                      className="flex-1 px-4 py-3 rounded-xl font-body text-sm border border-[var(--dusk)]/10 focus:border-[var(--ocean-deep)] focus:outline-none"
                    />
                  </div>
                  {!modalPrice && (
                    <p className="font-body text-xs text-[var(--dusk)]/30 mt-1">
                      Vacío = usa precio base (${property.base_price?.toLocaleString('es-AR')})
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={saveRange}
                disabled={savingModal}
                className="w-full py-3 rounded-xl font-body font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--ocean-deep)' }}
              >
                {savingModal ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {savingModal ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function MetricCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-body text-xs uppercase tracking-widest text-[var(--dusk)]/40 leading-tight">
          {label}
        </span>
      </div>
      <p className="font-display text-3xl text-[var(--dusk)]" style={{ fontWeight: 300 }}>
        {value}
      </p>
      <p className="font-body text-xs text-[var(--dusk)]/30 mt-0.5">{sub}</p>
    </div>
  )
}