'use client';

import { useState, useEffect } from "react";
import { Button, SelectOption, Skeleton } from "@rubros/ui";
import { useRouter } from "next/navigation";
import { getCitiesByProvince } from "@/actions/cities";
import { CityEntity, ProvinceEntity } from "@rubros/db";
import { cn } from "@/lib/utils";

import dynamic from 'next/dynamic'

const Select = dynamic(() => import('@rubros/ui').then(mod => mod.Select), { ssr: false, loading: () => <Skeleton className="w-full h-10" /> })


type LocationFilterProps = {
  provinces: ProvinceEntity[]
  selectedProvince?: string;
  selectedCity?: string;
  className?: string;
  labelClassName?: string;
}

export function LocationFilter({
  className,
  labelClassName,
  provinces,
}: LocationFilterProps) {
  const [cities, setCities] = useState<CityEntity[]>([]);
  const [currentProvince, setCurrentProvince] = useState<SelectOption | undefined>(undefined);
  const [currentCity, setCurrentCity] = useState<SelectOption | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const provincesOptions: SelectOption[] = provinces.map((province) => ({
    label: province.name,
    value: province.id,
  }));

  const citiesOptions: SelectOption[] = cities.map((city) => ({
    label: city.name,
    value: city.id,
  }));

  // Cargar ciudades cuando cambia la provincia
  useEffect(() => {
    const loadCities = async () => {
      try {
        const province = provincesOptions.find(p => p.value === currentProvince?.value);
        if (province) {
          const citiesData = await getCitiesByProvince(province.value);
          setCities(citiesData);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    if (currentProvince) {
      loadCities()
    }
    else {
      setCities([]);
      setCurrentCity(undefined);
    }
  }, [currentProvince, provinces]);

  const handleProvinceSelect = (province: any) => {
    setCurrentProvince(province);
    setCurrentCity(undefined); // Reset city when province changes
  };

  const handleCitySelect = (city: any) => {
    setCurrentCity(city);
  };

  const handleSearch = () => {
    if (currentProvince && currentCity) {
      const provinceSlug = provinces.find(p => p.id === currentProvince.value)?.slug;
      const citySlug = cities.find(c => c.id === currentCity.value)?.slug;
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
          isLoading={loading}
          isDisabled={!currentProvince}
          isSearchable={true}
          name="city"
        />
      </div>
      <div className="w-full mt-4 pr-4">
        <Button variant="primary" size="lg" onClick={handleSearch} disabled={!currentProvince || !currentCity} className="text-lg">
          Ver talleres
        </Button>
      </div>

      {/* Show current selection */}
      {currentProvince && !currentCity && (
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