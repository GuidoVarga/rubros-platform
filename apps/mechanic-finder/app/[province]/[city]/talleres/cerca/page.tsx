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
import { MapPin } from "lucide-react";
import { GeolocationButton } from "@/components/GeolocationButton";
import { getCityCoordinates } from "@/constants/cities-coords";

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
    console.error("Error generating static params for talleres cerca:", error);
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
  
  // CRITICAL: Get total businesses count for conditional indexing
  const totalCount = await getMechanicsCount(city.id);
  const robots = totalCount < 5 ? 'noindex,follow' : 'index,follow';
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  
  return {
    title: `Talleres cerca de ${city.name} | ${totalCount} por distancia`,
    description: `Encontrá talleres mecánicos más cercanos en ${city.name}, ${province.name}. ${totalCount} talleres ordenados por distancia según información de fuentes públicas. Verificá ubicaciones directamente.`,
    keywords: [
      `talleres cerca ${city.name.toLowerCase()}`,
      `taller cerca ${city.name.toLowerCase()}`,
      `taller cerca de mí ${city.name.toLowerCase()}`,
      `taller mecánico cercano ${city.name.toLowerCase()}`,
      `taller más cercano ${city.name.toLowerCase()}`,
    ],
    robots,
    alternates: {
      canonical: `${baseUrl}/${province.slug}/${city.slug}/talleres/cerca/`,
    },
    openGraph: {
      title: `Talleres cerca de ${city.name}`,
      description: `${totalCount} talleres mecánicos ordenados por distancia en ${city.name}`,
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
      title: `Talleres cerca de ${city.name}`,
      description: `${totalCount} talleres mecánicos ordenados por distancia en ${city.name}`,
      images: [ORGANIZATION.logo],
    },
  };
}

export default async function TalleresCercaPage({ params, searchParams }: Props) {
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

  // CRITICAL: Always use distance ordering for cerca pages
  const orderBy = { field: 'distance' as const, direction: 'asc' as const };

  // CRITICAL: Progressive Enhancement location strategy
  let userLocation;
  
  if (lat && lng) {
    // Use exact user coordinates from geolocation
    userLocation = {
      latitude: Number(lat),
      longitude: Number(lng)
    };
  } else {
    // Fallback to city center coordinates (works without JavaScript)
    const cityCoords = getCityCoordinates(city.slug);
    userLocation = {
      latitude: cityCoords.lat,
      longitude: cityCoords.lng
    };
  }

  // Fetch businesses ordered by distance
  const { businesses: mechanics, pagination } = await getBusinesses({
    pagination: {
      page: currentPage,
      limit: ITEMS_PER_PAGE - 1,
    },
    filters: {
      cityId: city.id,
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
    {
      id: 'cerca',
      href: `/${province.slug}/${city.slug}/talleres/cerca`,
      className: 'hover:text-primary-cta-hover',
      content: 'Cerca',
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
              <MapPin className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Talleres cerca de {city.name}
                <span className="block text-3xl text-muted-foreground mt-2">
                  {province.name}
                </span>
              </h1>
            </div>

            <p className="text-lg leading-8 text-muted-foreground">
              {pagination.total} talleres ordenados por distancia en {city.name}.
              Información de fuentes públicas • Verificá ubicaciones directamente.
            </p>
            
            {/* Progressive Enhancement: Geolocation */}
            <GeolocationButton 
              hasUserLocation={!!(lat && lng)}
              currentPath={`/${province.slug}/${city.slug}/talleres/cerca`}
              cityName={city.name}
            />
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
                Talleres Más Cercanos en {city.name}
              </h2>
              <Suspense>
                <ResultsHeader
                  businessCount={`Mostrando ${(currentPage - 1) * (ITEMS_PER_PAGE - 1) + 1} - ${Math.min(currentPage * (ITEMS_PER_PAGE - 1), pagination.total)} de ${pagination.total} resultados`}
                  currentSort="distance"
                  showFilters={true}
                  showSort={false}
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

            {/* Información adicional sobre talleres cercanos */}
            <section className="mt-16 bg-muted/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Encontrar talleres cerca en {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">¿Cómo se calcula la distancia?</h3>
                  <p className="text-muted-foreground mb-4">
                    Las distancias se calculan según información de fuentes públicas y coordenadas aproximadas.
                    Para mayor precisión, usá tu ubicación exacta.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Distancia en línea recta (no por calles)</li>
                    <li>• Coordenadas de fuentes públicas</li>
                    <li>• Ordenamiento automático por proximidad</li>
                    <li>• Opción de geolocalización precisa</li>
                    <li>• Verificá rutas reales en mapas</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Consejos para elegir</h3>
                  <p className="text-muted-foreground mb-4">
                    La proximidad es importante, pero también considerá otros factores
                    como horarios, servicios y especialidades del taller.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verificar horarios de atención</li>
                    <li>• Consultar servicios específicos</li>
                    <li>• Preguntar por disponibilidad</li>
                    <li>• Considerar especialización del taller</li>
                    <li>• Comparar con otros talleres cercanos</li>
                  </ul>
                </div>
              </div>
              
              {/* Disclaimer importante */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded mt-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Las distancias mostradas son aproximadas y se basan en coordenadas de fuentes públicas. 
                      Para rutas exactas y tiempos de viaje reales, consultá aplicaciones de mapas especializadas.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas sobre ubicación y distancias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Cómo funciona "Usar mi ubicación"?</div>
                  <p className="text-sm text-muted-foreground">
                    Tu navegador solicitará permiso para acceder a tu ubicación GPS, permitiendo 
                    calcular distancias más precisas a cada taller mecánico.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Son exactas las distancias?</div>
                  <p className="text-sm text-muted-foreground">
                    Las distancias son aproximadas y se calculan en línea recta. Para rutas exactas 
                    por calles y tiempo de viaje, usá aplicaciones de mapas especializadas.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿De dónde vienen las coordenadas?</div>
                  <p className="text-sm text-muted-foreground">
                    Las ubicaciones de los talleres provienen de fuentes públicas como directorios 
                    comerciales. Siempre verificá la dirección exacta con el taller.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="font-semibold mb-2">¿Qué pasa si no encuentro el taller?</div>
                  <p className="text-sm text-muted-foreground">
                    Las direcciones pueden haber cambiado. Contactá directamente al taller 
                    para confirmar su ubicación actual antes de dirigirte al lugar.
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