'use client';

import { useState, useEffect } from "react";
import { ComboBox, ComboBoxOption } from "@rubros/ui";
import { useRouter } from "next/navigation";
import { getCitiesByProvince } from "@/actions/cities";
import { CityEntity, ProvinceEntity } from "@rubros/db";
import { cn } from "@/lib/utils";

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
  selectedProvince,
  selectedCity
}: LocationFilterProps) {
  const [cities, setCities] = useState<CityEntity[]>([]);
  const [currentProvince, setCurrentProvince] = useState(selectedProvince || '');
  const [currentCity, setCurrentCity] = useState(selectedCity || '');
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const provincesOptions: ComboBoxOption[] = provinces.map((province) => ({
    label: province.name,
    value: province.id,
  }));

  const citiesOptions: ComboBoxOption[] = cities.map((city) => ({
    label: city.name,
    value: city.id,
  }));

  // Cargar ciudades cuando cambia la provincia
  useEffect(() => {
    const loadCities = async () => {
      try {
        const province = provincesOptions.find(p => p.value === currentProvince);
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
      setCurrentCity("");
    }
  }, [currentProvince, provinces]);

  const handleProvinceSelect = (provinceId: string) => {
    console.log('provinceId', provinceId);
    setCurrentProvince(provinceId);
    setCurrentCity(""); // Reset city when province changes
    setProvinceOpen(false);
  };

  const handleCitySelect = (cityId: string) => {
    setCurrentCity(cityId);
    setCityOpen(false);

    // Navigate to the province/city page
    if (currentProvince && cityId) {
      const citySlug = cities.find(c => c.id === cityId)?.slug;
      const provinceSlug = provinces.find(p => p.id === currentProvince)?.slug;
      router.push(`/${provinceSlug}/${citySlug}`);
    }
  };

  const selectedProvinceName = provincesOptions.find(
    (province) => province.value === currentProvince
  )?.label;

  return (
    <div className={cn("flex flex-row gap-4 items-center", className)}>
      {/* Province Selector */}
      <div>
        <label className={cn("block text-sm font-medium mb-2", labelClassName)}>Provincia</label>
        <ComboBox
          onChange={handleProvinceSelect}
          options={provincesOptions}
          value={currentProvince}
          isOpen={provinceOpen}
          setIsOpen={setProvinceOpen}
          placeholder="Selecciona una provincia"
        />
      </div>

      {/* City Selector */}
      <div>
        <label className={cn("block text-sm font-medium mb-2", labelClassName)}>Ciudad</label>
        <ComboBox
          onChange={handleCitySelect}
          options={citiesOptions}
          value={currentCity}
          isOpen={cityOpen}
          setIsOpen={setCityOpen}
          placeholder="Selecciona una ciudad"
          searchPlaceholder="Buscar ciudad..."
          emptyMessage="No se encontraron ciudades."
          disabled={!currentProvince}
        />
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