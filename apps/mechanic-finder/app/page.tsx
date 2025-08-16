import type { Metadata } from "next";
import { getProvinces } from "@/actions/province";
import { ProvinceEntity } from "@rubros/db";
import { LocationFilter } from "@/components/LocationFilter/LocationFilter";
import { ORGANIZATION } from "@/constants/org";
import { Button } from '@rubros/ui';
import Link from 'next/link';
import { MapPin, Phone, Clock, Star, Search, Users, Shield } from 'lucide-react';
import { Suspense } from "react";
import { AdComponent } from "@/components/ads/ads";
import { ADSENSE_SLOTS } from "@rubros/ui/constants";

export const metadata: Metadata = {
  title: `${ORGANIZATION.name} - ${ORGANIZATION.shortDescription}`,
  description: ORGANIZATION.description,
};

export default async function Home() {
  const provinces: ProvinceEntity[] = await getProvinces();

  return (
    <div className="container py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Encontrá <span className="text-primary">Mecánicos</span> en tu Zona
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          La plataforma más completa para encontrar <strong>talleres mecánicos</strong> y
          <strong> servicios automotrices</strong> cerca tuyo. Información actualizada de mecánicos
          en toda Argentina, disponible las 24 horas.
        </p>
      </section>
      <section className="container bg-muted/30 pt-4 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mt-8 w-full">
            <LocationFilter provinces={provinces} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-16">
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">19000+</h2>
          <p className="text-muted-foreground">Talleres listados</p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">600+</h2>
          <p className="text-muted-foreground">Ciudades cubiertas</p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">24/7</h2>
          <p className="text-muted-foreground">Disponibilidad</p>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Buscá por ubicación</h3>
            <p className="text-muted-foreground">
              Ingresá tu provincia y ciudad para encontrar <strong>mecánicos cerca tuyo</strong>.
              Nuestro directorio incluye información pública de talleres en toda Argentina.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Explorá las opciones</h3>
            <p className="text-muted-foreground">
              Revisá la información disponible de cada taller: servicios, horarios, ubicación y datos de contacto
              cuando estén disponibles públicamente.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Contactá directamente</h3>
            <p className="text-muted-foreground">
              Cuando la información de contacto esté disponible, podés comunicarte directamente con el
              <strong> taller mecánico</strong> para consultar precios y agendar tu servicio.
            </p>
          </div>
        </div>
      </section>

      <Suspense>
        <section className="w-full flex justify-center">
          <AdComponent type={ADSENSE_SLOTS.LIST} />
        </section>
      </Suspense>

      {/* Services Section */}
      <section className="mt-16 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Servicios que podés encontrar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            'Mecánica General',
            'Cambio de Aceite',
            'Reparación de Frenos',
            'Diagnóstico Computarizado',
            'Aire Acondicionado',
            'Alineación y Balanceo',
            'Servicio de Grúa',
            'Mecánica de Motos'
          ].map((service) => (
            <div key={service} className="bg-muted p-4 rounded-lg text-center">
              <p className="font-medium">{service}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir Encontrá Mecánico?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <Search className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Búsqueda Fácil y Rápida</h3>
              <p className="text-muted-foreground">
                Encontrá <strong>mecánicos y talleres</strong> en tu zona de manera simple y eficiente.
                Nuestro directorio se actualiza constantemente con información pública disponible.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Cobertura Nacional</h3>
              <p className="text-muted-foreground">
                Desde Buenos Aires hasta las provincias del interior, tenemos información de
                <strong> talleres mecánicos</strong> en las principales ciudades de Argentina.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Contacto Directo</h3>
              <p className="text-muted-foreground">
                Cuando esté disponible, podés contactar directamente con los talleres sin intermediarios.
                La información de contacto proviene de fuentes públicas.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Disponible 24/7</h3>
              <p className="text-muted-foreground">
                Accedé a nuestro directorio en cualquier momento del día. Ideal para emergencias
                o cuando necesités encontrar un <strong>mecánico de urgencia</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="mb-16 bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Información importante</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Los datos mostrados en esta plataforma son de carácter público y han sido recopilados de diversas
          fuentes de internet como directorios comerciales, sitios web oficiales y plataformas de mapas.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Encontrá Mecánico</strong> actúa como un directorio informativo y no garantiza la exactitud,
          actualización o calidad de los servicios listados. Recomendamos verificar la información directamente
          con cada establecimiento antes de solicitar servicios.
        </p>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/5 p-8 rounded-lg">
        <h3 className="text-3xl font-bold mb-4">¿Necesitás un mecánico ahora?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Empezá tu búsqueda seleccionando tu provincia y encontrá el <strong>taller mecánico </strong>
          más cercano a tu ubicación. Información actualizada las 24 horas.
        </p>
        <Button size="lg" asChild>
          <Link href="/buenos-aires">
            <MapPin className="h-4 w-4 mr-2" />
            Comenzar Búsqueda
          </Link>
        </Button>
      </section>
    </div>
  );
}