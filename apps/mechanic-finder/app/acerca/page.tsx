import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@rubros/ui';
import { CheckCircle, Users, Shield, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Acerca de Nosotros - Encontra Mecánico',
  description: 'Conocé más sobre Encontra Mecánico, la plataforma líder para conectar conductores con mecánicos verificados en Argentina.',
  keywords: ['encontra mecánico', 'sobre nosotros', 'mecánicos verificados', 'argentina', 'talleres'],
};

export default function AboutPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Acerca de Encontra Mecánico</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Somos la plataforma líder en Argentina que conecta conductores con <strong>mecánicos verificados</strong> y
            <strong> talleres de confianza</strong>. Nuestra misión es hacer que encontrar un buen servicio mecánico
            sea fácil, rápido y seguro.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Mecánicos verificados</p>
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
              <p className="text-muted-foreground">Talleres verificados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="prose prose-gray max-w-none mb-16">
          <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>

          <p className="text-base leading-relaxed mb-6">
            <strong>Encontra Mecánico</strong> nació de la necesidad de conectar a conductores argentinos con
            <strong> servicios mecánicos de calidad</strong>. Sabemos lo difícil que puede ser encontrar un mecánico de confianza,
            especialmente cuando tu vehículo tiene una avería inesperada o necesita mantenimiento preventivo.
          </p>

          <p className="text-base leading-relaxed mb-6">
            Nuestro equipo está compuesto por expertos en el sector automotriz y tecnología, con años de experiencia
            ayudando a conductores a encontrar los mejores <strong>talleres mecánicos</strong> en Buenos Aires, Córdoba,
            Rosario y otras ciudades importantes de Argentina.
          </p>

          <h3 className="text-2xl font-bold mb-4">¿Qué nos hace diferentes?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 not-prose">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Verificación Rigurosa</h4>
                <p className="text-sm text-muted-foreground">
                  Cada mecánico pasa por un proceso de verificación que incluye revisión de documentación,
                  experiencia y testimonios de clientes anteriores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Cobertura Nacional</h4>
                <p className="text-sm text-muted-foreground">
                  Tenemos presencia en las principales ciudades de Argentina, desde CABA hasta provincias del interior.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Contacto Directo</h4>
                <p className="text-sm text-muted-foreground">
                  Facilitamos el contacto directo entre conductores y mecánicos, sin intermediarios ni comisiones extra.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Servicio Gratuito</h4>
                <p className="text-sm text-muted-foreground">
                  La búsqueda y contacto con mecánicos es completamente gratuita para todos los usuarios.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4">Servicios que cubrimos</h3>

          <p className="text-base leading-relaxed mb-4">
            Nuestra red incluye especialistas en diversos tipos de servicios automotrices:
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

          <h3 className="text-2xl font-bold mb-4">Compromiso con la Calidad</h3>

          <p className="text-base leading-relaxed mb-6">
            En <strong>Encontra Mecánico</strong> entendemos que tu vehículo es una inversión importante. Por eso, trabajamos únicamente
            con <strong>talleres mecánicos</strong> que demuestran experiencia, profesionalismo y compromiso con la satisfacción del cliente.
          </p>

          <p className="text-base leading-relaxed mb-6">
            Realizamos seguimientos periódicos y mantenemos estándares altos de calidad para asegurar que cada conductor
            encuentre exactamente el servicio que necesita, ya sea para mantenimiento preventivo o reparaciones de emergencia.
          </p>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">¿Necesitás un mecánico ahora?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Encontrá el servicio mecánico perfecto en tu zona. Buscá por ubicación, compará opciones y contactá directamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <MapPin className="h-4 w-4 mr-2" />
                  Buscar Mecánicos
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