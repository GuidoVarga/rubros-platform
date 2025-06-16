import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBusinesses, getMechanicsCount } from "@/actions/business";
import { getProvinceBySlug, getProvinces } from "@/actions/province";
import { getCityBySlug } from "@/actions/cities";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { PaginatedList } from "@/components/PaginatedList/PaginatedList";
import { prisma } from "@/lib/db";
import { BusinessEntity, ProvinceEntity } from "@rubros/db/entities";
import { ITEMS_PER_PAGE } from "@/constants/pagination";
import Link from "next/link";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { Breadcrumb } from "@rubros/ui";

type Props = {
  params: Promise<{ province: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
};

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
    title: `Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
    description: `Encuentra los mejores mecánicos en ${city.name}, ${province.name}. ${mechanicsCount} talleres verificados con precios, horarios y contacto directo.`,
    keywords: [
      `mecánicos ${city.name.toLowerCase()}`,
      `taller mecánico ${city.name.toLowerCase()}`,
      `reparación auto ${city.name.toLowerCase()}`,
      `mecánicos ${province.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Mecánicos en ${city.name}, ${province.name} | ${mechanicsCount} talleres`,
      description: `Los mejores mecánicos de ${city.name}. Compara precios y servicios.`,
      type: "website",
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

  const breadcrumbElements = [
    <Link href="/" className="hover:text-primary-cta-hover">
      Inicio
    </Link>,
    <Link href={`/${province.slug}`} className="hover:text-primary-cta-hover">
      {province.name}
    </Link>,
    <span className="font-medium text-foreground">{city.name}</span>,
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Breadcrumb elements={breadcrumbElements} />
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
            <LocationFilter provinces={provinces} className="items-end mb-10 lg:flex-row" />
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
                  href={`/mechanic/${mechanic.slug}`}
                />
              )}
              pagination={{
                currentPage,
                totalPages: pagination.pages,
                totalItems: pagination.total,
                itemsPerPage: ITEMS_PER_PAGE - 1,
              }}
            />
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