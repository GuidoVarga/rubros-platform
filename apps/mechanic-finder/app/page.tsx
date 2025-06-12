import type { Metadata } from "next";
import { MechanicCard } from "@/components/MechanicCard/MechanicCard";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";

import { getBusinesses } from "@/actions/business";
import { PaginatedList } from "@/components/PaginatedList/PaginatedList";
import { getProvinces } from "@/actions/province";
import { ProvinceEntity } from "@rubros/db";

export const metadata: Metadata = {
  title: "Rubros - Encuentra tu Mecánico de Confianza",
  description: "Encuentra los mejores mecánicos en tu zona",
};

interface HomeProps {
  searchParams: Promise<{
    page?: string;
    subCategory?: string;
    search?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page, subCategory, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const itemsPerPage = 16;

  const { businesses, pagination } = await getBusinesses({
    pagination: {
      page: currentPage,
      limit: itemsPerPage,
    },
    filters: {
      subCategoryId: subCategory,
      search: search,
    },
  });

  const provinces: ProvinceEntity[] = await getProvinces();

  console.log('fetched provinces', provinces);

  return (
    <div className="flex flex-col gap-8">
      <section className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Encuentra los mejores servicios en tu zona
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Mecánicos, electricistas, plomeros y más. Compara precios, lee reseñas y contacta directamente.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <LocationFilter provinces={provinces} />
          </div>
        </div>
      </section>
      <section className="container">
        <PaginatedList
          items={businesses}
          renderItem={(business: any) => (
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
    </div>
  );
}