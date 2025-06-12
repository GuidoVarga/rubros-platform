'use client';

import { useState, useEffect } from "react";
import { ComboBox, ComboBoxOption } from "@rubros/ui";
import { useRouter } from "next/navigation";
import { getCitiesByProvince } from "@/actions/cities";
import { ProvinceEntity } from "@rubros/db";

type LocationFilterProps = {
  provinces: ProvinceEntity[]
  selectedProvince?: string;
  selectedCity?: string;
}

export function LocationFilter({ provinces, selectedProvince, selectedCity }: LocationFilterProps) {
  const [citiesOptions, setCitiesOptions] = useState<ComboBoxOption[]>([]);
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

  // Cargar ciudades cuando cambia la provincia
  useEffect(() => {
    const loadCities = async () => {
      if (currentProvince) {
        try {
          const province = provincesOptions.find(p => p.value === currentProvince);
          if (province) {
            const citiesData = await getCitiesByProvince(province.value);
            setCitiesOptions(citiesData.map((city) => ({
              label: city.name,
              value: city.id,
            })));
          }
        } catch (error) {
          console.error("Error loading cities:", error);
        }
      } else {
        setCitiesOptions([]);
        setCurrentCity("");
      }
    };

    if (provinces.length > 0) {
      loadCities();
    }
  }, [currentProvince, provinces]);

  const handleProvinceSelect = (provinceSlug: string) => {
    console.log('provinceSlug', provinceSlug);
    setCurrentProvince(provinceSlug);
    setCurrentCity(""); // Reset city when province changes
    setProvinceOpen(false);
  };

  const handleCitySelect = (citySlug: string) => {
    setCurrentCity(citySlug);
    setCityOpen(false);

    // Navigate to the province/city page
    if (currentProvince && citySlug) {
      router.push(`/${currentProvince}/${citySlug}`);
    }
  };

  const selectedProvinceName = provincesOptions.find(
    (province) => province.value === currentProvince
  )?.label;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
        <div className="h-10 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Province Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Provincia</label>
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
        <label className="block text-sm font-medium mb-2">Ciudad</label>
        <ComboBox
          onChange={handleCitySelect}
          options={citiesOptions}
          value={currentCity}
          isOpen={cityOpen}
          setIsOpen={setCityOpen}
          placeholder="Selecciona una ciudad"
          searchPlaceholder="Buscar ciudad..."
          emptyMessage="No se encontraron ciudades."
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