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

export default async function Home() {
  const provinces: ProvinceEntity[] = await getProvinces();

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
        </div>
      </section>
      <section className="container bg-muted/30 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mt-8 w-full">
            <LocationFilter provinces={provinces} className="flex-col" />
          </div>
        </div>
      </section>
    </div>
  );
}