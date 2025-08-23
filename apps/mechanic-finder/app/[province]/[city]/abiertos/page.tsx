import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBusinesses, getOpenBusinessesCount } from "@/actions/business";
import { getProvinceBySlug, getProvinces } from "@/actions/province";
import { getCityBySlug, getRelatedCitiesByMechanicsCount } from "@/actions/cities";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { BusinessEntity, ProvinceEntity } from "@rubros/db/entities";
import { ITEMS_PER_PAGE } from "@/constants/pagination";
import Link from "next/link";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Breadcrumb, BreadcrumbProps, PaginatedList } from "@rubros/ui";
import { ORGANIZATION } from "@/constants/org";
import { AdComponent, AdComponentProps } from "@/components/ads/ads";
import { CustomPaginationBar } from "@/components/PaginationBar/PaginationBar";
import { ResultsHeader } from "@/components/ResultsHeader";
import { Suspense } from "react";
import { Clock } from "lucide-react";

type Props = {
  params: Promise<{ province: string; city: string }>;
  searchParams: Promise<{ page?: string; sort?: string; filters?: string, lat?: string, lng?: string }>;
};

export const revalidate = 3600; // 1 hora

export async function generateStaticParams() {
  try {
    const provinces = await getProvinces({ includeCities: true });

    const params = provinces.flatMap((province) =>
      province.cities.map((city) => ({
        province: province.slug,
        city: city.slug,
      }))
    );

    return params;
  } catch (error) {
    console.error("Error generating static params for abiertos:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: provinceSlug, city: citySlug } = await params;
  
  const [province, city] = await Promise.all([
    getProvinceBySlug(provinceSlug),
    getCityBySlug(citySlug),
  ]);
  
  if (!province || !city) {
    return { title: "Página no encontrada" };
  }
  
  // CRITICAL: Get open businesses count for conditional indexing
  const openCount = await getOpenBusinessesCount(city.id);
  const robots = openCount < 5 ? 'noindex,follow' : 'index,follow';
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  
  return {
    title: `Mecánicos abiertos en ${city.name} | ${openCount} talleres disponibles`,
    description: `Encontrá mecánicos que podrían estar abiertos ahora en ${city.name}, ${province.name}. ${openCount} talleres según información de fuentes públicas. Verificá horarios directamente con cada taller.`,
    keywords: [
      `mecánicos abiertos ${city.name.toLowerCase()}`,
      `talleres abiertos ${city.name.toLowerCase()}`,
      `mecánico ${city.name.toLowerCase()} horarios`,
      `taller mecánico abierto ahora ${city.name.toLowerCase()}`,
    ],
    robots,
    alternates: {
      canonical: `${baseUrl}/${province.slug}/${city.slug}/abiertos/`,
    },
    openGraph: {
      title: `Mecánicos abiertos en ${city.name}`,
      description: `${openCount} talleres mecánicos abiertos ahora en ${city.name}`,
      type: "website",
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
      title: `Mecánicos abiertos en ${city.name}`,
      description: `${openCount} talleres mecánicos abiertos ahora en ${city.name}`,
      images: [ORGANIZATION.logo],
    },
  };
}

export default async function AbiertosPage({ params, searchParams }: Props) {
  const { province: provinceSlug, city: citySlug } = await params;
  const { page, sort, lat, lng } = await searchParams;
  const currentPage = Number(page) || 1;

  const [province, city] = await Promise.all([
    getProvinceBySlug(provinceSlug),
    getCityBySlug(citySlug),
  ]);

  if (!province || !city) {
    notFound();
  }

  // Verificar que la ciudad pertenece a la provincia
  if (city.province.slug !== provinceSlug) {
    notFound();
  }

  // Determine sort order
  const orderBy = sort === 'distance'
    ? { field: 'distance' as const, direction: 'asc' as const }
    : { field: 'googleMapsRating' as const, direction: 'desc' as const };

  // Build userLocation if lat/lng are provided
  const userLocation = lat && lng ? {
    latitude: Number(lat),
    longitude: Number(lng),
  } : undefined;

  // CRITICAL: Fetch only open businesses
  const { businesses: mechanics, pagination } = await getBusinesses({
    pagination: {
      page: currentPage,
      limit: ITEMS_PER_PAGE - 1,
    },
    filters: {
      cityId: city.id,
      isOpen: true, // CRITICAL: Only open businesses
    },
    orderBy,
    userLocation,
  });

  const [provinces, relatedCities] = await Promise.all([
    getProvinces(),
    getRelatedCitiesByMechanicsCount(province.id, city.id, 12)
  ]);

  const breadcrumbElements: BreadcrumbProps['elements'] = [
    {
      id: 'inicio',
      href: '/',
      className: 'hover:text-primary-cta-hover',
      content: 'Inicio',
    },
    {
      id: 'provincia',
      href: `/${province.slug}`,
      className: 'hover:text-primary-cta-hover',
      content: province.name,
    },
    {
      id: 'ciudad',
      href: `/${province.slug}/${city.slug}`,
      className: 'hover:text-primary-cta-hover',
      content: city.name,
    },
    {
      id: 'abiertos',
      href: `/${province.slug}/${city.slug}/abiertos`,
      className: 'hover:text-primary-cta-hover',
      content: 'Abiertos',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Breadcrumb elements={breadcrumbElements} renderLink={({ href, children, className }) => (
              <Link href={href} className={className}>
                {children}
              </Link>
            )} />
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Mecánicos abiertos en {city.name}
                <span className="block text-3xl text-muted-foreground mt-2">
                  {province.name}
                </span>
              </h1>
            </div>

            <p className="text-lg leading-8 text-muted-foreground">
              {pagination.total} mecánicos que podrían estar abiertos en {city.name}.
              Información de fuentes públicas • Verificá horarios directamente.
            </p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container">
        {mechanics.length > 0 ? (
          <>
            <LocationFilter provinces={provinces} showHelpText={false} className="items-end mb-10 lg:flex-row" />
            <div className="mb-6 mt-12">
              <h2 className="text-2xl font-semibold mb-2">
                Talleres Abiertos en {city.name}
              </h2>
              <Suspense>
                <ResultsHeader
                  businessCount={`Mostrando ${(currentPage - 1) * (ITEMS_PER_PAGE - 1) + 1} - ${Math.min(currentPage * (ITEMS_PER_PAGE - 1), pagination.total)} de ${pagination.total} resultados`}
                  currentSort={sort || 'relevance'}
                  showFilters={false}
                />
              </Suspense>
            </div>
            <div className="space-y-8">
              <PaginatedList
                items={mechanics}
                renderItem={(mechanic: BusinessEntity) => (
                  <MechanicCard
                    key={mechanic.id}
                    business={mechanic}
                    href={`/${province.slug}/${city.slug}/${mechanic.slug}`}
                  />
                )}
                renderAd={({ type, style }) => <AdComponent type={type as AdComponentProps['type']} style={style} />}
                itemsPerPage={ITEMS_PER_PAGE - 1}
              />
              <CustomPaginationBar
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={ITEMS_PER_PAGE - 1}
              />
            </div>

            {/* Información adicional sobre mecánicos abiertos */}
            <section className="mt-16 bg-muted/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Encontrar mecánicos abiertos en {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">¿Qué considerar?</h3>
                  <p className="text-muted-foreground mb-4">
                    Los horarios pueden variar según el día, temporada o circunstancias especiales.
                    Siempre es recomendable verificar antes de dirigirse al taller.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Llamar antes de ir al taller</li>
                    <li>• Preguntar por disponibilidad inmediata</li>
                    <li>• Consultar sobre servicios de emergencia</li>
                    <li>• Verificar si atienden tu tipo de vehículo</li>
                    <li>• Preguntar por tiempos de espera</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Servicios de emergencia</h3>
                  <p className="text-muted-foreground mb-4">
                    Para emergencias automotrices, algunos talleres ofrecen servicios especiales
                    o atención fuera de horario. Consultá directamente con cada taller.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Servicios 24 horas</li>
                    <li>• Atención de emergencias</li>
                    <li>• Grúa y auxilio mecánico</li>
                    <li>• Diagnóstico rápido</li>
                    <li>• Reparaciones urgentes</li>
                  </ul>
                </div>
              </div>
              
              {/* Disclaimer importante */}
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded mt-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Los horarios mostrados provienen de fuentes públicas y pueden no estar actualizados. 
                      Siempre verificá directamente con el taller antes de tu visita, especialmente para emergencias.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas sobre talleres abiertos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Cómo verificar si están abiertos?</div>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos llamar directamente al taller para confirmar horarios actuales,
                    ya que pueden cambiar sin previo aviso o por circunstancias especiales.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿De dónde vienen estos horarios?</div>
                  <p className="text-sm text-muted-foreground">
                    Los datos provienen de fuentes públicas como directorios comerciales
                    y plataformas de mapas. No verificamos directamente con cada taller.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Qué pasa si llego y está cerrado?</div>
                  <p className="text-sm text-muted-foreground">
                    Los horarios pueden cambiar. Te sugerimos tener una lista de talleres alternativos
                    y siempre confirmar por teléfono antes de dirigirte al lugar.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Hay talleres 24 horas?</div>
                  <p className="text-sm text-muted-foreground">
                    Algunos talleres ofrecen servicios de emergencia 24hs. Esta información
                    específica debe consultarse directamente con cada taller.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <EmptyState cityName={city.name} />
        )}
      </section>

      {/* Related Cities Section */}
      {relatedCities.length > 0 && (
        <section className="container">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-xl font-semibold mb-4">
              Otras Ciudades Destacadas en {province.name}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Explorá talleres mecánicos en las principales ciudades de {province.name} ordenadas por cantidad de servicios.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedCities.map((relatedCity, index) => (
                <a
                  key={relatedCity.id}
                  href={`/${province.slug}/${relatedCity.slug}`}
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors relative group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {relatedCity.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {relatedCity.mechanicsCount} talleres
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 