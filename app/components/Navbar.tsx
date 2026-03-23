'use client'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex justify-between items-center">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,59,109,0.6), transparent)',
          backdropFilter: 'blur(0px)',
        }}
      />
      <span
        className="relative font-display text-white text-2xl italic"
        style={{ fontWeight: 300, letterSpacing: '-0.01em' }}
      >
        Encadenados
      </span>
      <div className="relative flex items-center gap-6">
        <a
          href="#propiedades"
          className="font-body text-white/70 text-sm hover:text-white transition-colors"
        >
          Propiedades
        </a>
        <a
          href="/propietarios"
          className="font-body text-sm px-4 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all"
        >
          Soy propietario
        </a>
      </div>
    </nav>
  )
}
