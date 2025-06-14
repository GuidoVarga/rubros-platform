import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProvinceBySlug } from "@/actions/province";
import { getProvinces } from "@/actions/province";
import { getMechanicsCount, getTotalMechanicsInProvince } from "@/actions/business";
import { CitySelector } from "@/components/CitySelector/CitySelector";
import { EmptyState as EmptyStateUI } from "@rubros/ui";
import Link from "next/link";

type Props = {
  params: Promise<{ province: string }>;
  searchParams: Promise<{ page?: string }>;
};

// Generar rutas estáticas para SEO (SSG)
export async function generateStaticParams() {
  try {
    const provinces = await getProvinces();

    return provinces.map((province) => ({
      province: province.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generar metadata para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: provinceSlug } = await params;

  const province = await getProvinceBySlug(provinceSlug);

  if (!province) {
    return {
      title: "Página no encontrada",
    };
  }

  const totalMechanics = await getTotalMechanicsInProvince(province.id);

  return {
    title: `Mecánicos en ${province.name} | Selecciona tu ciudad`,
    description: `Encuentra mecánicos en ${province.name}. ${totalMechanics} talleres en ${province.cities.length} ciudades. Selecciona tu ciudad para ver los mejores talleres cerca de ti.`,
    keywords: [
      `mecánicos ${province.name.toLowerCase()}`,
      `talleres ${province.name.toLowerCase()}`,
      `reparación auto ${province.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Mecánicos en ${province.name}`,
      description: `${totalMechanics} talleres mecánicos en ${province.cities.length} ciudades de ${province.name}`,
      type: "website",
    },
  };
}

export default async function ProvincePage({ params }: Props) {
  const { province: provinceSlug } = await params;

  const province = await getProvinceBySlug(provinceSlug);
  const totalMechanicsInProvince = await getTotalMechanicsInProvince(province?.id || '');

  if (!province) {
    notFound();
  }

  // Obtener conteo de mecánicos por ciudad
  const citiesWithCounts = await Promise.all(
    province.cities.map(async (city) => {
      const mechanicsCount = await getMechanicsCount(city.id);
      return {
        ...city,
        mechanicsCount,
      };
    })
  );

  const totalMechanics = citiesWithCounts.reduce(
    (sum, city) => sum + city.mechanicsCount,
    0
  );

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
                <li className="font-medium text-foreground">{province.name}</li>
              </ol>
            </nav>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Mecánicos en {province.name}
            </h1>
            {province.cities.length > 0 && totalMechanicsInProvince > 0 && (
              <>
                <p className="text-lg leading-8 text-muted-foreground mb-8">
                  {totalMechanics} mecánicos en {province.cities.length} ciudades.
                  Selecciona tu ciudad para encontrar los mejores talleres cerca de ti.
                </p>
                <CitySelector
                  cities={citiesWithCounts}
                  provinceSlug={province.slug}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cities Grid Section */}
      {province.cities.length > 0 && totalMechanicsInProvince > 0 ? (
        <section className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Ciudades disponibles en {province.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citiesWithCounts.map((city) => (
                <a
                  key={city.id}
                  href={`/${province.slug}/${city.slug}`}
                  className="block p-6 bg-card border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary">
                      {city.name}
                    </h3>
                    <span className="text-2xl">🏙️</span>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">
                    {city.mechanicsCount} talleres mecánicos disponibles
                  </p>

                  <div className="flex items-center text-sm text-primary">
                    <span>Ver talleres</span>
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <EmptyStateUI title={`No hay ${!totalMechanicsInProvince ? 'mecánicos' : 'ciudades'} disponibles`} description={`Aún no tenemos ${!totalMechanicsInProvince ? 'mecánicos registrados' : 'ciudades registradas'} en esta provincia.`} linkComponent={
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Volver al inicio
          </Link>
        } />
      )}
    </div>
  );
}