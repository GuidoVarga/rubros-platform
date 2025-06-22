import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@rubros/db'
import { Button, Card, CardContent, CardHeader, CardTitle, Breadcrumb } from '@rubros/ui'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'
import { generateLocalBusinessSchema } from '../../../../lib/schema'
import { ORGANIZATION } from '@/constants/org'
import { CustomMap } from '@/components/CustomMap/CustomMap'
import { LatLngExpression } from '@rubros/ui/map'
import { getBusinessBySlug } from '@/actions/business'

type Props = {
  params: Promise<{ province: string; city: string; business: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

  const { province, city, business: businessSlug } = await params;

  const business = await prisma.business.findFirst({
    where: {
      slug: businessSlug,
      city: {
        slug: city,
        province: {
          slug: province,
        },
      },
    },
    include: {
      city: {
        include: {
          province: true,
        },
      },
    },
  })


  if (!business) {
    return {}
  }

  const businessUrl = `${baseUrl}/${province}/${city}/${businessSlug}`

  const schema = generateLocalBusinessSchema({
    name: business.name,
    description: business.description || undefined,
    address: business.address || undefined,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    url: businessUrl,
    openingHours: business?.openingHours || undefined,
  })

  return {
    title: `${business.name} - Taller Mecánico en ${business.city.name}, ${business.city.province.name}`,
    description: business.description || `${business.name} es un taller mecánico ubicado en ${business.city.name}, ${business.city.province.name}. Contacta directamente para consultas y presupuestos.`,
    openGraph: {
      title: `${business.name} - Taller Mecánico en ${business.city.name}, ${business.city.province.name}`,
      description: business.description || `${business.name} es un taller mecánico ubicado en ${business.city.name}, ${business.city.province.name}. Contacta directamente para consultas y presupuestos.`,
      images: [
        {
          url: ORGANIZATION.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.name} - Taller Mecánico en ${business.city.name}, ${business.city.province.name}`,
      description: business.description || `${business.name} es un taller mecánico ubicado en ${business.city.name}, ${business.city.province.name}. Contacta directamente para consultas y presupuestos.`,
      images: [
        {
          url: ORGANIZATION.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: businessUrl,
    },
    other: {
      'script:ld+json': JSON.stringify(schema),
    },
  }
}

export default async function BusinessPage({ params }: Props) {
  const { business: businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug);

  if (!business) {
    notFound()
  }

  // Extract coordinates from address using a geocoding service
  // For now, we'll use a default location
  console.log('business', business);
  const location = business.latitude && business.longitude ? [business.latitude, business.longitude] : [-34.6037, -58.3816] // Default to Buenos Aires

  console.log('location', location);

  const breadcrumbItems = [
    {
      id: 'home',
      href: '/',
      className: 'hover:text-primary',
      content: 'Inicio',
    },
    {
      id: 'province',
      href: `/${business.city.province.slug}`,
      className: 'hover:text-primary',
      content: business.city.province.name,
    },
    {
      id: 'city',
      href: `/${business.city.province.slug}/${business.city.slug}`,
      className: 'hover:text-primary',
      content: business.city.name,
    },
    {
      id: 'business',
      content: <span className="font-medium text-foreground">{business.name}</span>,
    },
  ]

  console.log('business', business);

  return (
    <div className="container py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb elements={breadcrumbItems} renderLink={({ href, children, className }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )} />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{business.city.name}, {business.city.province.name}</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Acerca del Taller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {business.description || 'No hay descripción disponible.'}
              </p>
            </CardContent>
          </Card>

          {/* Map Card */}
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
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.address && (
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${business.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${business.email}`}
                    className="hover:text-primary transition-colors"
                  >
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
                    className="hover:text-primary transition-colors"
                  >
                    Visitar sitio web
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Card */}
          <Card>
            <CardHeader>
              <CardTitle>Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-muted-foreground">{business.category.name}</span>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {business.phone && (
              <Button className="w-full" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            )}
            {business.email && (
              <Button variant="outline" className="w-full" size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Enviar email
              </Button>
            )}
            {
              business.googleMapsLink && (
                <div className="mt-4">
                  <a href={business.googleMapsLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full" size="lg">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver en Google Maps
                    </Button>
                  </a>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}