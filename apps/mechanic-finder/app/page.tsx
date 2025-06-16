import type { Metadata } from "next";
import { getProvinces } from "@/actions/province";
import { ProvinceEntity } from "@rubros/db";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";

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
            <LocationFilter provinces={provinces} />
          </div>
        </div>
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
    </div>
  );
}