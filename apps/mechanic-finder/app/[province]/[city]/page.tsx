import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBusinesses, getMechanicsCount } from "@/actions/business";
import { getProvinceBySlug, getProvinces } from "@/actions/province";
import { getCityBySlug } from "@/actions/cities";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { PaginatedList } from "@/components/PaginatedList/PaginatedList";
import { BusinessEntity, ProvinceEntity } from "@rubros/db/entities";
import { ITEMS_PER_PAGE } from "@/constants/pagination";
import Link from "next/link";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Breadcrumb, BreadcrumbProps } from "@rubros/ui";
import { ORGANIZATION } from "@/constants/org";

type Props = {
  params: Promise<{ province: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
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
    console.error("Error generating static params:", error);
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

  const mechanicsCount = await getMechanicsCount(city.id);

  return {
    title: `Mecánicos ${city.name} | ${mechanicsCount} talleres`,
    description: `Encontrá los mejores mecánicos en ${city.name}, ${province.name}. ${mechanicsCount} talleres en tu ciudad con reseñas, horarios y contacto directo.`,
    keywords: [
      `mecánicos ${city.name.toLowerCase()}`,
      `taller mecánico ${city.name.toLowerCase()}`,
      `reparación auto ${city.name.toLowerCase()}`,
      `reparación moto ${city.name.toLowerCase()}`,
      `servicio 24hs ${city.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
      description: `Los mejores mecánicos de ${city.name}. Compara precios y servicios.`,
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
      title: `Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
      description: `Los mejores mecánicos de ${city.name}. Compara precios y servicios.`,
      images: [
        {
          url: ORGANIZATION.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { province: provinceSlug, city: citySlug } = await params;
  const { page } = await searchParams;
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

  // Obtener mecánicos de la ciudad
  const { businesses: mechanics, pagination } = await getBusinesses({
    pagination: {
      page: currentPage,
      limit: ITEMS_PER_PAGE - 1,
    },
    filters: {
      cityId: city.id,
    },
  });

  const provinces: ProvinceEntity[] = await getProvinces();

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
              Mecánicos en {city.name}
              <span className="block text-3xl text-muted-foreground mt-2">
                {province.name}
              </span>
            </h1>

            <p className="text-lg leading-8 text-muted-foreground">
              {pagination.total} mecánicos encontrados en {city.name}.
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
              <p className="text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * (ITEMS_PER_PAGE - 1), pagination.total)} de {pagination.total} resultados
              </p>
            </div>
            <PaginatedList
              items={mechanics}
              renderItem={(mechanic: BusinessEntity) => (
                <MechanicCard
                  key={mechanic.id}
                  business={mechanic}
                  href={`/${province.slug}/${city.slug}/${mechanic.slug}`}
                />
              )}
              pagination={{
                currentPage,
                totalPages: pagination.pages,
                totalItems: pagination.total,
                itemsPerPage: ITEMS_PER_PAGE - 1,
              }}
            />

            {/* Información adicional sobre mecánicos en la ciudad */}
            <section className="mt-16 bg-muted/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Guía para encontrar mecánicos en {city.name}</h2>
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
                    Al buscar un mecánico en {city.name}, es importante hacer las preguntas correctas
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
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes sobre mecánicos en {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Cómo verificar la información de un taller?</h3>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos contactar directamente con cada taller para confirmar servicios,
                    horarios y precios, ya que la información puede cambiar sin previo aviso.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿De dónde proviene esta información?</h3>
                  <p className="text-sm text-muted-foreground">
                    Los datos mostrados provienen de fuentes públicas como directorios comerciales
                    y plataformas de mapas. Siempre verifica la información directamente.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Qué servicios suelen ofrecer?</h3>
                  <p className="text-sm text-muted-foreground">
                    Los servicios varían según cada taller. Algunos se especializan en ciertos tipos
                    de reparación mientras otros ofrecen servicios más generales.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Cómo elegir el mejor taller?</h3>
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
      {province.cities.length > 1 && (
        <section className="container">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Otras ciudades en {province.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {province.cities
                .filter((relatedCity) => relatedCity.slug !== city.slug)
                .map((relatedCity) => (
                  <a
                    key={relatedCity.id}
                    href={`/${province.slug}/${relatedCity.slug}`}
                    className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {relatedCity.name}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}