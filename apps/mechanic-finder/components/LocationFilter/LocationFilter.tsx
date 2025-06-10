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

type Location = {
  id: string;
  name: string;
  slug: string;
};

interface LocationFilterProps {
  locations: Location[];
  selectedLocation?: string;
}

export function LocationFilter({ locations, selectedLocation }: LocationFilterProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (currentValue: string) => {
    setOpen(false);
    router.push(`/${currentValue}`);
  };

  const selectedLocationName = locations.find(
    (location) => location.slug === selectedLocation
  )?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLocationName ?? "Selecciona una zona"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar zona..." />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location.id}
                value={location.slug}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedLocation === location.slug ? "opacity-100" : "opacity-0"
                  )}
                />
                {location.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}