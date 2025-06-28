import Link from 'next/link'
import { Button } from '@rubros/ui'
import { ArrowLeft } from 'lucide-react'

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