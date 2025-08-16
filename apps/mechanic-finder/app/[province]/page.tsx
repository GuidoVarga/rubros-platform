import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProvinceBySlug } from "@/actions/province";
import { getProvinces } from "@/actions/province";
import { getTotalMechanicsInProvince } from "@/actions/business";
import { getTopCitiesByMechanicsCount } from "@/actions/cities";
import { CitySelector } from "@/components/CitySelector/CitySelector";
import { Breadcrumb, BreadcrumbProps, EmptyState as EmptyStateUI } from "@rubros/ui";
import { AdComponent } from "@/components/ads/ads";
import Link from "next/link";
import { ORGANIZATION } from "@/constants/org";
import { Suspense } from "react";
import { ADSENSE_SLOTS } from "@rubros/ui/constants";

type Props = {
  params: Promise<{ province: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const revalidate = 3600;

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const totalMechanics = await getTotalMechanicsInProvince(province.id);

  return {
    title: `Mecánicos en ${province.name} | Selecciona tu ciudad`,
    description: `Encontrá los mejores mecánicos en ${province.name}. ${totalMechanics} talleres en ${province.cities.length} ciudades. Selecciona tu ciudad para ver los mejores talleres cerca de vos.`,
    keywords: [
      `mecánicos ${province.name.toLowerCase()}`,
      `talleres ${province.name.toLowerCase()}`,
      `reparación auto ${province.name.toLowerCase()}`,
      `reparación moto ${province.name.toLowerCase()}`,
      `servicio 24hs ${province.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Mecánicos en ${province.name}`,
      description: `${totalMechanics} talleres mecánicos en ${province.cities.length} ciudades de ${province.name}`,
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
      title: `Mecánicos en ${province.name}`,
      description: `${totalMechanics} talleres mecánicos en ${province.cities.length} ciudades de ${province.name}`,
      images: [
        {
          url: ORGANIZATION.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/${province.slug}/`,
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

  // Obtener ciudades destacadas ordenadas por cantidad de mecánicos (máximo 12)
  const citiesWithCounts = await getTopCitiesByMechanicsCount(province.id, 12);

  const totalMechanics = citiesWithCounts.reduce(
    (sum, city) => sum + city.mechanicsCount,
    0
  );

  const breadcrumbElements: BreadcrumbProps['elements'] = [
    {
      id: 'inicio',
      href: '/',
      className: 'hover:text-primary-cta-hover',
      content: 'Inicio',
    },
    {
      id: 'provincia',
      content: <span className="font-medium text-foreground">{province.name}</span>,
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
              Mecánicos en {province.name}
            </h1>
            {province.cities.length > 0 && totalMechanicsInProvince > 0 && (
              <>
                <p className="text-lg leading-8 text-muted-foreground mb-8">
                  {totalMechanics} mecánicos en {province.cities.length} ciudades.
                  Selecciona tu ciudad para ver talleres disponibles en tu zona.
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
        <>
          <section className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Ciudades Destacadas con Más Talleres en {province.name}
              </h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubrí las principales ciudades de {province.name} con la mayor concentración de talleres mecánicos especializados.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citiesWithCounts.map((city, index) => (
                  <a
                    key={city.id}
                    href={`/${province.slug}/${city.slug}`}
                    className="block p-6 bg-card border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-lg font-semibold group-hover:text-primary">
                        {city.name}
                      </div>
                      <span className="text-2xl">🔧</span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3">
                      {city.mechanicsCount} talleres especializados
                    </p>

                    <div className="flex items-center text-sm text-primary">
                      <span>Explorar talleres</span>
                      <span className="ml-2 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <Suspense>
            <div className="mt-16">
              <AdComponent type={ADSENSE_SLOTS.LANDING} />
            </div>
          </Suspense>

          {/* Información sobre mecánicos en la provincia */}
          <section className="container mt-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Información sobre Talleres Mecánicos en {province.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Servicios comunes</h3>
                  <p className="text-muted-foreground mb-4">
                    Los talleres mecánicos suelen ofrecer diversos servicios para el mantenimiento
                    y reparación de vehículos. Es recomendable consultar directamente con cada taller
                    sobre su disponibilidad y especialidades.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Mantenimiento preventivo y correctivo</li>
                    <li>• Reparación de motores y transmisiones</li>
                    <li>• Sistemas de frenos y suspensión</li>
                    <li>• Diagnóstico computarizado</li>
                    <li>• Servicios de electricidad automotriz</li>
                    <li>• Reparación de aire acondicionado</li>
                  </ul>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-4">Información del directorio</h3>
                  <p className="text-muted-foreground mb-4">
                    Nuestro directorio recopila información pública disponible de talleres mecánicos
                    en {province.name}. Los datos se actualizan regularmente desde fuentes públicas.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• {province.cities.length} ciudades con información</li>
                    <li>• {totalMechanics} talleres registrados</li>
                    <li>• Datos de fuentes públicas</li>
                    <li>• Información de contacto cuando disponible</li>
                    <li>• Actualización regular de datos</li>
                    <li>• Acceso gratuito al directorio</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/30 p-8 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">
                  Cómo usar el directorio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Selecciona tu ciudad</h4>
                    <p className="text-sm text-muted-foreground">
                      Elige la ciudad de {province.name} donde necesitas encontrar un taller mecánico.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Revisa la información</h4>
                    <p className="text-sm text-muted-foreground">
                      Consulta los datos disponibles: ubicación, horarios y contacto cuando esté disponible públicamente.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Contacta directamente</h4>
                    <p className="text-sm text-muted-foreground">
                      Llama o visita el taller para confirmar servicios, precios y disponibilidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) :
        <EmptyStateUI title={`No hay ${!totalMechanicsInProvince ? 'mecánicos' : 'ciudades'} disponibles`} description={`Aún no tenemos ${!totalMechanicsInProvince ? 'mecánicos registrados' : 'ciudades registradas'} en esta provincia.`} linkComponent={
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Volver al inicio
          </Link>
        } />
      }
    </div>
  );
}