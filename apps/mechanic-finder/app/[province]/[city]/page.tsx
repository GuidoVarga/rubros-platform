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
              Compara servicios, precios y contacta directamente.
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
              <h2 className="text-2xl font-bold mb-6">¿Por qué elegir un mecánico en {city.name}?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Servicios Disponibles</h3>
                  <p className="text-muted-foreground mb-4">
                    Los talleres mecánicos en {city.name} ofrecen una amplia gama de servicios automotrices.
                    Desde mantenimiento preventivo hasta reparaciones complejas, encontrarás profesionales
                    capacitados para atender tu vehículo.
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
                  <h3 className="text-lg font-semibold mb-3">Cómo Elegir el Mejor Taller</h3>
                  <p className="text-muted-foreground mb-4">
                    Al buscar un mecánico en {city.name}, es importante considerar varios factores para
                    asegurar que recibas el mejor servicio para tu vehículo.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verifica la experiencia y certificaciones</li>
                    <li>• Consulta horarios de atención</li>
                    <li>• Pregunta sobre garantías de trabajo</li>
                    <li>• Solicita presupuestos detallados</li>
                    <li>• Confirma la disponibilidad de repuestos</li>
                    <li>• Evalúa la ubicación y accesibilidad</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes sobre Mecánicos en {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Cuál es el costo promedio de los servicios?</h3>
                  <p className="text-sm text-muted-foreground">
                    Los precios varían según el tipo de servicio y la complejidad del trabajo.
                    Te recomendamos solicitar presupuestos a varios talleres en {city.name} para comparar.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Hay talleres que trabajen los fines de semana?</h3>
                  <p className="text-sm text-muted-foreground">
                    Algunos talleres en {city.name} ofrecen servicios los sábados y algunos incluso los domingos.
                    Verifica los horarios de cada taller en su información de contacto.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Ofrecen servicio de grúa o auxilio mecánico?</h3>
                  <p className="text-sm text-muted-foreground">
                    Muchos talleres en {city.name} cuentan con servicio de grúa y auxilio mecánico las 24 horas.
                    Contacta directamente para confirmar disponibilidad.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">¿Trabajan con todas las marcas de vehículos?</h3>
                  <p className="text-sm text-muted-foreground">
                    La mayoría de los mecánicos en {city.name} están capacitados para trabajar con diversas marcas.
                    Algunos se especializan en marcas específicas para brindar un servicio más especializado.
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