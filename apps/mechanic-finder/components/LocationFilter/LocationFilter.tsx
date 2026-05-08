'use client';

import { useState } from "react";
import { Button, Skeleton } from "@rubros/ui";
import { useRouter } from "next/navigation";
import { ProvinceEntity } from "@rubros/db";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic'
import { SelectOption } from "@rubros/ui/select";
import { useGetCities } from "@/queries/useGetCities/useGetCities";

const Select = dynamic(() => import('@rubros/ui/select'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-10" />
})

type LocationFilterProps = {
  provinces: ProvinceEntity[]
  selectedProvince?: string;
  selectedCity?: string;
  className?: string;
  labelClassName?: string;
  showHelpText?: boolean;
}

export function LocationFilter({
  className,
  labelClassName,
  provinces,
  showHelpText = true,
}: LocationFilterProps) {
  const [currentProvince, setCurrentProvince] = useState<SelectOption | null>(null);
  const [currentCity, setCurrentCity] = useState<SelectOption | null>(null);
  const router = useRouter();

  const { data: cities, isLoading } = useGetCities({
    provinceId: currentProvince?.value,
    enabled: !!currentProvince?.value,
  });

  const provincesOptions: SelectOption[] = provinces.map((province) => ({
    label: province.name,
    value: province.id,
  }));

  const citiesOptions: SelectOption[] = cities?.map((city) => ({
    label: city.name,
    value: city.id,
  })) || [];

  const handleProvinceSelect = (province: any) => {
    setCurrentProvince(province);
    setCurrentCity(null); // Reset city when province changes
  };

  const handleCitySelect = (city: any) => {
    setCurrentCity(city);
  };

  const handleSearch = () => {
    if (currentProvince && currentCity) {
      const provinceSlug = provinces.find(p => p.id === currentProvince.value)?.slug;
      const citySlug = cities?.find(c => c.id === currentCity.value)?.slug;
      router.push(`/${provinceSlug}/${citySlug}`);
    }
  }

  const selectedProvinceName = provincesOptions.find(
    (province) => province.value === currentProvince?.value
  )?.label;

  return (
    <div className={cn("flex flex-col gap-4 items-center", className)}>
      {/* Province Selector */}
      <div className="w-full">
        <label htmlFor="province" className={cn("block text-lg font-medium mb-2 pr-4", labelClassName)}>Provincia</label>
        <Select
          options={provincesOptions}
          value={currentProvince}
          onChange={(province) => handleProvinceSelect(province)}
          placeholder="Selecciona una provincia"
          name="province"
          inputId="province"
        />
      </div>

      {/* City Selector */}
      <div className="w-full">
        <label htmlFor="city" className={cn("block text-lg font-medium mb-2 pr-4", labelClassName)}>Ciudad</label>
        <Select
          options={citiesOptions}
          value={currentCity}
          onChange={(city) => handleCitySelect(city)}
          placeholder="Selecciona una ciudad"
          isLoading={isLoading}
          isDisabled={!currentProvince}
          isSearchable={true}
          name="city"
          noOptionsMessage={() => isLoading ? 'Cargando ciudades...' : 'No hay ciudades disponibles'}
          inputId="city"
        />
      </div>
      <div className="w-full mt-4 pr-4">
        <Button variant="primary" size="lg" onClick={handleSearch} disabled={!currentProvince || !currentCity} className="text-lg">
          Ver talleres
        </Button>
      </div>

      {/* Show current selection */}
      {currentProvince && !currentCity && showHelpText && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedProvinceName}</strong> seleccionada.
            Ahora elige una ciudad para ver los talleres disponibles.
          </p>
        </div>
      )}
    </div>
  );
}