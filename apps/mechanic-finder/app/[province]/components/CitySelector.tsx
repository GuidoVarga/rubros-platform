'use client';

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@rubros/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@rubros/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rubros/ui";
import { useRouter } from "next/navigation";

type CityWithCount = {
  id: string;
  name: string;
  slug: string;
  mechanicsCount: number;
};

interface CitySelectorProps {
  cities: CityWithCount[];
  provinceSlug: string;
}

export function CitySelector({ cities, provinceSlug }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const router = useRouter();

  const handleSelect = (citySlug: string) => {
    setSelectedCity(citySlug);
    setOpen(false);
    router.push(`/${provinceSlug}/${citySlug}`);
  };

  const selectedCityData = cities.find(city => city.slug === selectedCity);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCityData
            ? `${selectedCityData.name} (${selectedCityData.mechanicsCount} talleres)`
            : "Selecciona una ciudad"
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar ciudad..." />
          <CommandEmpty>No se encontraron ciudades.</CommandEmpty>
          <CommandGroup>
            {cities.map((city) => (
              <CommandItem
                key={city.id}
                value={city.slug}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCity === city.slug ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center justify-between w-full">
                  <span>{city.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {city.mechanicsCount} talleres
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}