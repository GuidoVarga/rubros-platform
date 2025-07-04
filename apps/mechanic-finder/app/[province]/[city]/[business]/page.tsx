import { Metadata } from 'next'
import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle, Breadcrumb } from '@rubros/ui'
import { MapPin, Phone, Mail, Globe, Clock, Share2, Facebook, Twitter } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/actions/business'
import { getOpenDays } from '@rubros/ui/utils'

type Props = {
  params: Promise<{ province: string; city: string; business: string }>;
}

export const revalidate = 3600;

// Simple social share component inline
const SocialShare = ({ url, title, description, className }: { url: string; title: string; description?: string; className?: string }) => {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Compartir:</span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" asChild>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook">
            <Facebook className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Twitter">
            <Twitter className="h-4 w-4" />
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
      siteName: 'Encontra Mecánico',
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

  const business = await getBusinessBySlug(businessSlug)

  if (!business) {
    notFound()
  }

  const breadcrumbElements = [
    { id: 'home', content: 'Inicio', href: '/' },
    { id: 'province', content: business.city?.province?.name || '', href: `/${province}` },
    { id: 'city', content: business.city?.name || '', href: `/${province}/${city}` },
    { id: 'category', content: 'Mecánicos', href: `/${province}/${city}/mecanicos` },
    { id: 'business', content: business.name },
  ];

  const openDays = getOpenDays(business.closedOn);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const currentUrl = `${baseUrl}/${province}/${city}/${businessSlug}`;

  return (
    <div className="container py-8">
      <Breadcrumb elements={breadcrumbElements} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{openDays}</span>
                  </div>
                )}
                {business.openingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{business.openingHours}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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
      </div>
    </div>
  )
}