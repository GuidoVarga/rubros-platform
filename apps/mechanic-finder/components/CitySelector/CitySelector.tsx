'use client';

import { useState } from "react";
import { Button, Skeleton } from "@rubros/ui";
import { useRouter } from "next/navigation";
import { CityEntity } from "@rubros/db";
import dynamic from 'next/dynamic'
import { SelectOption } from "@rubros/ui/select";

const Select = dynamic(() => import('@rubros/ui/select'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-10" />
})

type CitySelectorProps = {
  cities: CityEntity[];
  provinceSlug: string;
}

export function CitySelector({ cities, provinceSlug }: CitySelectorProps) {
  const [selectedCity, setSelectedCity] = useState<SelectOption | undefined>(undefined);
  const router = useRouter();

  const handleSelect = (city: any) => {
    setSelectedCity(city);
  };

  const handleSearch = () => {
    const citySlug = cities.find(city => city?.id === selectedCity?.value)?.slug;
    router.push(`/${provinceSlug}/${citySlug}`);
  };

  const citiesOptions: SelectOption[] = cities.map((city) => ({
    label: city.name,
    value: city.id,
  }));

  return (

    <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
      <div className="pr-2">
        <h3 className="text-lg font-semibold mb-4">
          Selecciona tu ciudad
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Elige la ciudad donde necesitas un mecánico
        </p>
      </div>
      <div>
        <Select
          options={citiesOptions}
          value={selectedCity}
          onChange={(city) => handleSelect(city)}
          placeholder="Selecciona una ciudad"
          isSearchable={true}
        />
        <div className="pr-5">

          <Button variant="primary" size="lg" onClick={handleSearch} disabled={!selectedCity} className="text-lg mt-5">
            Ver talleres
          </Button>
        </div>
      </div>
    </div>

  );
}