import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Encadenados — Monte Hermoso',
  description: 'Cuando todo está lleno, nosotros te hacemos lugar.',
  openGraph: {
    title: 'Encadenados — Monte Hermoso',
    description: 'Cuando todo está lleno, nosotros te hacemos lugar.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
