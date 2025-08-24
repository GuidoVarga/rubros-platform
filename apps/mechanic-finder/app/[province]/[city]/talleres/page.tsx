import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBusinesses, getMechanicsCount } from "@/actions/business";
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
import { Clock, MapPin } from "lucide-react";

type Props = {
  params: Promise<{ province: string; city: string }>;
  searchParams: Promise<{ page?: string; sort?: string; filters?: string, lat?: string, lng?: string }>;
};

export const revalidate = 3600;

// Generar rutas estáticas para SEO (SSG)
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
    console.error("Error generating static params for talleres:", error);
    return [];
  }
}

// Generar metadata para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: provinceSlug, city: citySlug } = await params;

  const [province, city] = await Promise.all([
    getProvinceBySlug(provinceSlug),
    getCityBySlug(citySlug),
  ]);

  if (!province || !city) {
    return {
      title: "Página no encontrada",
    };
  }

  // Verificar que la ciudad pertenece a la provincia
  if (city.province.slug !== provinceSlug) {
    return {
      title: "Página no encontrada",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const mechanicsCount = await getMechanicsCount(city.id);

  return {
    title: `Talleres Mecánicos ${city.name} | ${mechanicsCount} servicios`,
    description: `Encontrá los mejores talleres mecánicos en ${city.name}, ${province.name}. ${mechanicsCount} talleres especializados en tu ciudad con reseñas, horarios y contacto directo.`,
    keywords: [
      `talleres ${city.name.toLowerCase()}`,
      `taller mecánico ${city.name.toLowerCase()}`,
      `talleres mecánicos ${city.name.toLowerCase()}`,
      `reparación auto ${city.name.toLowerCase()}`,
      `reparación moto ${city.name.toLowerCase()}`,
      `servicio 24hs ${city.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Talleres Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
      description: `Los mejores talleres mecánicos de ${city.name}. Compara precios y servicios.`,
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
      title: `Talleres Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
      description: `Los mejores talleres mecánicos de ${city.name}. Compara precios y servicios.`,
      images: [
        {
          url: ORGANIZATION.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/${province.slug}/${city.slug}/talleres/`,
    },
  };
}

export default async function TalleresPage({ params, searchParams }: Props) {
  const { province: provinceSlug, city: citySlug } = await params;
  const { page, sort, filters, lat, lng } = await searchParams;
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

  // Obtener talleres de la ciudad
  const { businesses: mechanics, pagination } = await getBusinesses({
    pagination: {
      page: currentPage,
      limit: ITEMS_PER_PAGE - 1,
    },
    filters: {
      cityId: city.id,
      isOpen: filters === 'isOpen' ? true : undefined,
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
      id: 'talleres',
      href: `/${province.slug}/${city.slug}/talleres`,
      className: 'hover:text-primary-cta-hover',
      content: 'Talleres',
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Talleres Mecánicos en {city.name}
              <span className="block text-3xl text-muted-foreground mt-2">
                {province.name}
              </span>
            </h1>

            <p className="text-lg leading-8 text-muted-foreground">
              {pagination.total} talleres mecánicos encontrados en {city.name}.
              Consulta información de contacto y ubicación disponible.
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
                Talleres Mecánicos en {city.name}
              </h2>
              <Suspense>
                <ResultsHeader
                  businessCount={`Mostrando ${(currentPage - 1) * (ITEMS_PER_PAGE - 1) + 1} - ${Math.min(currentPage * (ITEMS_PER_PAGE - 1), pagination.total)} de ${pagination.total} resultados`}
                  currentSort={sort || 'relevance'}
                  currentFilters={filters || null}
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

            {/* Enlaces internos a páginas especializadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-8">
              <Link href={`/${province.slug}/${city.slug}/talleres/abiertos/`}>
                <div className="border rounded-lg p-6 hover:bg-gray-50 hover:border-primary-cta transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-6 w-6 text-green-600 group-hover:text-green-700" />
                    <h3 className="font-semibold text-lg group-hover:text-primary-cta">Talleres Abiertos Ahora</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Ver solo talleres que podrían estar abiertos en este momento
                  </p>
                </div>
              </Link>
              
              <Link href={`/${province.slug}/${city.slug}/talleres/cerca/`}>
                <div className="border rounded-lg p-6 hover:bg-gray-50 hover:border-primary-cta transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
                    <h3 className="font-semibold text-lg group-hover:text-primary-cta">Talleres Más Cercanos</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Ordenados por distancia desde tu ubicación
                  </p>
                </div>
              </Link>
            </div>
            

            {/* Información adicional sobre talleres en la ciudad */}
            <section className="mt-16 bg-muted/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Guía para encontrar talleres mecánicos en {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Servicios comunes</h3>
                  <p className="text-muted-foreground mb-4">
                    Los talleres mecánicos suelen ofrecer diversos servicios automotrices.
                    Es recomendable consultar directamente con cada taller sobre su disponibilidad
                    y especialidades específicas.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cambio de aceite y filtros</li>
                    <li>• Reparación de frenos y suspensión</li>
                    <li>• Diagnóstico computarizado</li>
                    <li>• Reparación de motor y transmisión</li>
                    <li>• Aire acondicionado automotriz</li>
                    <li>• Alineación y balanceo</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Qué preguntar al contactar</h3>
                  <p className="text-muted-foreground mb-4">
                    Al buscar un taller mecánico en {city.name}, es importante hacer las preguntas correctas
                    para asegurar que el taller pueda atender las necesidades específicas de tu vehículo.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ¿Trabajan con mi marca de vehículo?</li>
                    <li>• ¿Qué servicios específicos ofrecen?</li>
                    <li>• ¿Cuáles son sus horarios de atención?</li>
                    <li>• ¿Proporcionan presupuestos detallados?</li>
                    <li>• ¿Ofrecen garantías en sus trabajos?</li>
                    <li>• ¿Tienen disponibilidad de repuestos?</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Cómo verificar la información de un taller?</div>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos contactar directamente con cada taller para confirmar servicios,
                    horarios y precios, ya que la información puede cambiar sin previo aviso.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿De dónde proviene esta información?</div>
                  <p className="text-sm text-muted-foreground">
                    Los datos mostrados provienen de fuentes públicas como directorios comerciales
                    y plataformas de mapas. Siempre verifica la información directamente.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Qué servicios suelen ofrecer?</div>
                  <p className="text-sm text-muted-foreground">
                    Los servicios varían según cada taller. Algunos se especializan en ciertos tipos
                    de reparación mientras otros ofrecen servicios más generales.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Cómo elegir el mejor taller?</div>
                  <p className="text-sm text-muted-foreground">
                    Considera factores como ubicación, horarios, servicios ofrecidos, y siempre
                    solicita presupuestos detallados antes de autorizar cualquier trabajo.
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