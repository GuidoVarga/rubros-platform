import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBusinesses } from "@/actions/business";
import { getProvinceBySlug } from "@/actions/province";
import { getCityBySlug } from "@/actions/cities";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { PaginatedList } from "@/components/PaginatedList/PaginatedList";
import { prisma } from "@/lib/db";
import { BusinessEntity } from "@rubros/db/entities";
import { Categories } from "@rubros/db";

type Props = {
  params: Promise<{ province: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
};

// Generar rutas estáticas para SEO (SSG)
export async function generateStaticParams() {
  try {
    const provinces = await prisma.province.findMany({
      where: { status: true },
      include: {
        cities: {
          where: { status: true },
          select: { slug: true },
        },
      },
    });

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

// Función auxiliar para contar mecánicos
async function getMechanicsCount(cityId: string) {
  try {
    return await prisma.business.count({
      where: {
        cityId,
        status: true,
        category: {
          slug: Categories.MECHANICS,
        },
      },
    });
  } catch (error) {
    console.error("Error counting mechanics:", error);
    return 0;
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const { province: provinceSlug, city: citySlug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const itemsPerPage = 16;

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
      limit: itemsPerPage,
    },
    filters: {
      cityId: city.id,
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="mb-4 text-sm text-muted-foreground">
              <ol className="flex items-center justify-center space-x-2">
                <li>
                  <a href="/" className="hover:text-foreground">
                    Inicio
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href={`/${province.slug}`} className="hover:text-foreground">
                    {province.name}
                  </a>
                </li>
                <li>/</li>
                <li className="font-medium text-foreground">{city.name}</li>
              </ol>
            </nav>

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
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Talleres Mecánicos en {city.name}
              </h2>
              <p className="text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} resultados
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
                itemsPerPage,
              }}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              No hay mecánicos en {city.name}
            </h2>
            <p className="text-muted-foreground mb-6">
              Aún no tenemos talleres registrados en esta ciudad.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Ver todos los mecánicos
            </a>
          </div>
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