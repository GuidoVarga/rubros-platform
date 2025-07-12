import { Metadata } from 'next'
import { Button, Card, CardContent, CardHeader, CardTitle, Breadcrumb, SkeletonCard } from '@rubros/ui'
import { MapPin, Phone, Mail, Globe, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/actions/business'
import { getOpenDays, HourEntry } from '@rubros/ui/utils'
import { generateLocalBusinessSchema } from '@/lib/schema'
import { CustomMap } from '@/components/CustomMap/CustomMap'
import { LatLngExpression } from '@rubros/ui/map'
import { Suspense } from 'react'
import Image from 'next/image'

type Props = {
  params: Promise<{ province: string; city: string; business: string }>;
}

export const revalidate = 3600;

// Simple social share component inline
const SocialShare = ({ url, title, description, className }: { url: string; title: string; description?: string; className?: string }) => {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Compartir:</span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" asChild>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook">
            <Image width={16} height={16} src="/facebook.svg" alt="Facebook" className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" aria-label="Compartir en X">
            <Image width={16} height={16} src="/x.svg" alt="X" className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, city, business: businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug)

  if (!business) {
    return {
      title: 'Negocio no encontrado',
      description: 'El negocio que buscas no existe.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const canonicalUrl = `${baseUrl}/${province}/${city}/${businessSlug}`;

  return {
    title: `${business.name} - ${business.city?.name}, ${business.city?.province?.name}`,
    description: business.description || `${business.name} en ${business.city?.name}, ${business.city?.province?.name}. Contacta directamente para más información.`,
    keywords: [
      business.name,
      'mecánico',
      business.city?.name || '',
      business.city?.province?.name || '',
      'taller',
      'reparación',
      'servicio automotriz'
    ],
    openGraph: {
      title: `${business.name} - ${business.city?.name}`,
      description: business.description || `${business.name} en ${business.city?.name}, ${business.city?.province?.name}`,
      url: canonicalUrl,
      siteName: 'Encontrá Mecánico',
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} - ${business.city?.name}`,
      description: business.description || `${business.name} en ${business.city?.name}`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function BusinessPage({ params }: Props) {
  const { province, city, business: businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug);

  if (!business) {
    notFound()
  }

  const location = business.latitude && business.longitude ? [business.latitude, business.longitude] : [-34.6037, -58.3816]

  const breadcrumbElements = [
    { id: 'home', content: 'Inicio', href: '/' },
    { id: 'province', content: business.city?.province?.name || '', href: `/${province}` },
    { id: 'city', content: business.city?.name || '', href: `/${province}/${city}` },
    { id: 'category', content: 'Mecánicos', href: `/${province}/${city}/mecanicos` },
    { id: 'business', content: business.name },
  ];

  const openDays = getOpenDays(business.closedOn, business.openingHours, business.hours as HourEntry[])
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const currentUrl = `${baseUrl}/${province}/${city}/${businessSlug}`;

  const jsonLd = generateLocalBusinessSchema({ url: currentUrl, ...business });

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <div className="container py-8">
        <Breadcrumb elements={breadcrumbElements} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{business.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {business.city?.name}, {business.city?.province?.name}
                    </p>
                  </div>
                  <SocialShare
                    url={currentUrl}
                    title={`${business.name} - Mecánico en ${business.city?.name}`}
                    description={business.description || `Contacta con ${business.name} para servicios de mecánica en ${business.city?.name}`}
                    className="flex-shrink-0"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.description && (
                  <p className="text-muted-foreground leading-relaxed">{business.description}</p>
                )}

                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                        {business.email}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}
                  {openDays && (
                    <div>
                      {openDays.map((day) => (
                        <div key={day} className="flex items-center gap-2 mt-2 first:mt-0">
                          <div>
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="break-words min-w-0">{day}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 flex-wrap">
                  {business.phone && (
                    <Button asChild>
                      <a href={`tel:${business.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </a>
                    </Button>
                  )}
                  {business.website && (
                    <Button variant="outline" asChild>
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Sitio web
                      </a>
                    </Button>
                  )}
                  {
                    business.googleMapsLink && (
                      <Button variant="secondary" asChild>
                        <a href={business.googleMapsLink} target="_blank" rel="noopener noreferrer">
                          <MapPin className="h-4 w-4 mr-2" />
                          Ver en Google Maps
                        </a>
                      </Button>
                    )
                  }
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.phone && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Teléfono</span>
                    <p className="font-medium">{business.phone}</p>
                  </div>
                )}
                {business.email && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email</span>
                    <p className="font-medium">{business.email}</p>
                  </div>
                )}
                {business.address && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Dirección</span>
                    <p className="font-medium">{business.address}</p>
                  </div>
                )}
                {openDays && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Días de atención</span>
                    <p className="font-medium">{openDays}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map Card */}
        <Suspense fallback={<SkeletonCard />}>
          <section className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent className="sm:h-[500px] h-[300px]">
                <CustomMap
                  center={location as LatLngExpression}
                  zoom={15}
                  markers={[
                    {
                      id: business.id,
                      position: location as LatLngExpression,
                      title: business.name,
                      description: business.address || undefined,
                      link: business.googleMapsLink || undefined,
                    },
                  ]}
                  showCurrentLocation
                />
              </CardContent>
            </Card>
          </section>
        </Suspense>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          {/* Información adicional */}
          <Card className="lg:col-span-2 space-y-6">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Esta información proviene de fuentes públicas disponibles en internet.
                Te recomendamos contactar directamente con el taller para confirmar servicios,
                horarios y disponibilidad.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Información actualizada regularmente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Datos de fuentes públicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Contacto directo recomendado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consejos generales */}
          <Card>
            <CardHeader>
              <CardTitle>Consejos para Elegir un Taller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Consulta servicios:</strong> Pregunta qué servicios ofrecen y si trabajan con tu marca de vehículo.
                </p>
                <p>
                  <strong>Solicita presupuesto:</strong> Pide un presupuesto detallado antes de autorizar cualquier trabajo.
                </p>
                <p>
                  <strong>Verifica horarios:</strong> Confirma los horarios de atención y disponibilidad para tu vehículo.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sección de información general */}
      <section className="mt-16 bg-muted/30 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Servicios Mecánicos Comunes en {business.city?.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Servicios típicos de talleres</h3>
            <p className="text-muted-foreground mb-4">
              Los talleres mecánicos en {business.city?.name} suelen ofrecer diversos servicios automotrices.
              Es recomendable consultar directamente con cada taller sobre su disponibilidad y especialidades.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mantenimiento preventivo general</li>
              <li>• Diagnóstico y reparaciones básicas</li>
              <li>• Servicios de cambio de aceite</li>
              <li>• Reparación de frenos y suspensión</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Qué preguntar al contactar</h3>
            <p className="text-muted-foreground mb-4">
              Al contactar cualquier taller mecánico, es importante hacer las preguntas correctas
              para asegurar que puedan atender las necesidades específicas de tu vehículo.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ¿Trabajan con mi marca de vehículo?</li>
              <li>• ¿Qué servicios específicos ofrecen?</li>
              <li>• ¿Cuáles son sus horarios de atención?</li>
              <li>• ¿Proporcionan presupuestos sin costo?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes generales */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">¿Cómo verificar la información del taller?</h3>
            <p className="text-sm text-muted-foreground">
              Recomendamos contactar directamente con el taller para confirmar horarios, servicios
              y disponibilidad, ya que la información puede cambiar sin previo aviso.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">¿De dónde proviene esta información?</h3>
            <p className="text-sm text-muted-foreground">
              Los datos mostrados provienen de fuentes públicas disponibles en internet como
              directorios comerciales y plataformas de mapas.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">¿Puedo confiar en esta información?</h3>
            <p className="text-sm text-muted-foreground">
              Esta plataforma funciona como un directorio informativo. Siempre verifica la
              información directamente con el taller antes de solicitar servicios.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">¿Qué hacer si la información está incorrecta?</h3>
            <p className="text-sm text-muted-foreground">
              Si encuentras información incorrecta o desactualizada, puedes contactarnos
              para reportar el problema y trabajaremos para corregirlo.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}