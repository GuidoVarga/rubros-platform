'use client';

import { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '@rubros/ui/utils';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'relevance' | 'distance';

type SortSelectorProps = {
  onSortChange: (sortBy: SortOption) => void;
  className?: string;
  initialValue?: SortOption;
  paramLatitude?: number;
  paramLongitude?: number;
};

const sortOptions = [
  {
    value: 'relevance' as const,
    label: 'Más relevantes',
    description: 'Ordenado por popularidad y calificación'
  },
  {
    value: 'distance' as const,
    label: 'Cerca mío',
    description: 'Ordenado por distancia a tu ubicación'
  }
];

export function SortSelector({ onSortChange, className, paramLatitude, paramLongitude, initialValue = 'relevance' }: SortSelectorProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const { coordinates: userLocation, error: locationError } = useGeolocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available options based on geolocation availability
  const availableOptions = sortOptions.filter(option => {
    if (option.value === 'distance') {
      return (userLocation !== null && !locationError) || (paramLatitude && paramLongitude);
    }
    return true;
  });

  const handleSortChange = (value: SortOption) => {
    setSelectedSort(value);
    onSortChange(value);
  };

  // Reset to relevance if distance is selected but location is lost
  useEffect(() => {
    if (selectedSort === 'distance' && (!userLocation && (!paramLatitude || !paramLongitude))) {
      setSelectedSort('relevance');
      onSortChange('relevance');
    }
  }, [userLocation, locationError, selectedSort, onSortChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = availableOptions.find(option => option.value === selectedSort);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Ordenar por:
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-lg bg-background hover:bg-muted transition-colors min-w-[160px]"
        >
          <span>{selectedOption?.label || 'Seleccionar'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-background border rounded-lg shadow-lg z-10">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  handleSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedSort === option.value ? 'bg-muted font-medium' : ''
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSort === 'distance' && userLocation && (
        <span className="text-xs text-green-600 hidden sm:inline">
          📍 Usando tu ubicación
        </span>
      )}
      {selectedSort === 'distance' && locationError && (
        <span className="text-xs text-red-600 hidden sm:inline">
          ⚠️ Ubicación no disponible
        </span>
      )}
    </div>
  );
}