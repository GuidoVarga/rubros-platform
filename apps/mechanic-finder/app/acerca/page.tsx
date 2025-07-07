import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, Button } from '@rubros/ui';
import { CheckCircle, Users, Shield, MapPin, Phone } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return {
    title: 'Acerca de Nosotros - Encontrá Mecánico',
    description: 'Conocé más sobre Encontrá Mecánico, el directorio más completo para encontrar talleres mecánicos en Argentina.',
    keywords: ['encontra mecánico', 'sobre nosotros', 'directorio mecánicos', 'argentina', 'talleres'],
    alternates: {
      canonical: `${baseUrl}/acerca`,
    },
  };
}

export default function AboutPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Acerca de Encontrá Mecánico</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Somos el <strong>directorio más completo de Argentina</strong> para encontrar
            <strong> talleres mecánicos y servicios automotrices</strong>. Nuestra misión es hacer que encontrar
            un servicio mecánico cerca tuyo sea fácil, rápido y accesible.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Talleres listados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">50+</h3>
              <p className="text-muted-foreground">Ciudades cubiertas</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">100%</h3>
              <p className="text-muted-foreground">Información pública</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="prose prose-gray max-w-none mb-16">
          <h2 className="text-3xl font-bold mb-6">Nuestra historia</h2>

          <p className="text-base leading-relaxed mb-6">
            <strong>Encontrá Mecánico</strong> nació de la necesidad de crear un directorio centralizado
            donde los conductores argentinos puedan encontrar fácilmente <strong>talleres mecánicos y servicios automotrices</strong>.
            Sabemos lo difícil que puede ser encontrar un mecánico cuando tu vehículo tiene una avería
            inesperada o necesita mantenimiento preventivo.
          </p>

          <p className="text-base leading-relaxed mb-6">
            Nuestro equipo recopila y organiza información pública disponible en internet para crear
            el directorio más completo de <strong>talleres mecánicos</strong> en Buenos Aires, Córdoba,
            Rosario y otras ciudades importantes de Argentina.
          </p>

          <h3 className="text-2xl font-bold mb-4">¿Cómo funciona nuestro directorio?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 not-prose">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Recopilación de datos públicos</h4>
                <p className="text-sm text-muted-foreground">
                  Recolectamos información de talleres desde fuentes públicas como directorios comerciales,
                  sitios web oficiales y plataformas de mapas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Cobertura nacional</h4>
                <p className="text-sm text-muted-foreground">
                  Tenemos información de talleres en las principales ciudades de Argentina,
                  desde CABA hasta provincias del interior.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Contacto directo</h4>
                <p className="text-sm text-muted-foreground">
                  Cuando la información está disponible públicamente, facilitamos el contacto directo
                  entre conductores y talleres.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Servicio gratuito</h4>
                <p className="text-sm text-muted-foreground">
                  El acceso a nuestro directorio es completamente gratuito para todos los usuarios.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4">Servicios que podés encontrar</h3>

          <p className="text-base leading-relaxed mb-4">
            Nuestro directorio incluye información de talleres especializados en diversos servicios automotrices:
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 list-none">
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Mecánica general para autos y motos</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Cambio de aceite y filtros</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Reparación de frenos y suspensión</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Diagnóstico computarizado</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Reparación de motor y transmisión</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Aire acondicionado automotriz</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Servicio de grúa y auxilio mecánico</li>
            <li className="flex items-center"><span className="mr-2 text-primary">✓</span> Servicios 24 horas</li>
          </ul>

          <h3 className="text-2xl font-bold mb-4">Información importante</h3>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Encontrá Mecánico</strong> funciona como un directorio informativo que recopila datos públicos
              disponibles en internet. No somos responsables de la exactitud, actualización o calidad de los servicios listados.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Recomendación:</strong> Siempre verificá la información directamente con cada taller antes de
              solicitar servicios. Los datos de contacto y horarios pueden cambiar sin previo aviso.
            </p>
          </div>

          <p className="text-base leading-relaxed mb-6">
            Nuestro objetivo es facilitar el acceso a información de <strong>talleres mecánicos</strong> en Argentina,
            pero cada usuario es responsable de verificar la calidad y confiabilidad de los servicios antes de contratarlos.
          </p>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">¿Necesitás un mecánico ahora?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Explorá nuestro directorio y encontrá talleres mecánicos en tu zona. Información actualizada
              de fuentes públicas disponible las 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <MapPin className="h-4 w-4 mr-2" />
                  Explorar Directorio
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contacto">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactanos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}