import type { Metadata } from "next";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";

import { getBusinesses, getLocations } from "@/actions/business";
import { PaginatedList } from "@/components/PaginatedList/PaginatedList";
import { AdComponent } from "@/components/ads/ads";

export const metadata: Metadata = {
  title: "Rubros - Encuentra tu Mecánico de Confianza",
  description: "Encuentra los mejores mecánicos en tu zona",
};

interface HomeProps {
  searchParams: {
    page?: string;
    city?: string;
    zone?: string;
    subCategory?: string;
    search?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const { page, city, zone, subCategory, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const itemsPerPage = 16;

  const [{ businesses, pagination }, locations] = await Promise.all([
    getBusinesses({
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
      },
      filters: {
        cityId: city,
        zoneId: zone,
        subCategoryId: subCategory,
        search: search,
      },
    }),
    getLocations(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdComponent type="top" />

      <section className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Encuentra los mejores servicios en tu zona
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Mecánicos, electricistas, plomeros y más. Compara precios, lee reseñas y contacta directamente.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <LocationFilter locations={locations} />
          </div>
        </div>
      </section>

      <section className="container">
        <PaginatedList
          items={businesses}
          renderItem={(business) => (
            <MechanicCard key={business.id} business={business} href={`/mechanic/${business.slug}`} />
          )}
          pagination={{
            currentPage,
            totalPages: pagination.pages,
            totalItems: pagination.total,
            itemsPerPage,
          }}
        />
      </section>

      <section className="container py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Servicios Verificados</h3>
            <p className="text-muted-foreground">
              Todos los servicios son verificados por nuestro equipo.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Reseñas Reales</h3>
            <p className="text-muted-foreground">
              Lee opiniones de clientes reales antes de elegir.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Contacto Directo</h3>
            <p className="text-muted-foreground">
              Contacta directamente con los profesionales sin intermediarios.
            </p>
          </div>
        </div>
      </section>

      <section className="container mb-8">
        <AdComponent type="footer" />
      </section>
    </div>
  );
}