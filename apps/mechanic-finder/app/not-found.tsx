import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@rubros/ui'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Página no encontrada - Encontrá Mecánico',
  description: 'La página que buscas no existe. Volvé al directorio de mecánicos y talleres en Argentina.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Página no encontrada
          </h1>
          <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}