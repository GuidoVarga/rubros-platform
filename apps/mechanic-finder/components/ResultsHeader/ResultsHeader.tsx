'use client';

import { SortSelector, type SortOption } from '../SortSelector';
import { FilterSelector } from '../FilterSelector';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGeolocation } from '@rubros/ui/utils';

type ResultsHeaderProps = {
  businessCount: string;
  currentSort: string;
  currentFilters?: string | null;
  showFilters?: boolean;
};

export function ResultsHeader({
  businessCount,
  currentSort,
  currentFilters,
  showFilters = true,
}: ResultsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { coordinates: userLocation } = useGeolocation();

  const handleSortChange = (sortBy: SortOption) => {
    const params = new URLSearchParams(searchParams);

    if (sortBy === 'distance') {
      params.set('sort', 'distance');
      params.set('lat', userLocation?.latitude.toString() || '');
      params.set('lng', userLocation?.longitude.toString() || '');
    } else {
      params.delete('sort');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newUrl);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-600">
          {businessCount}
        </div>

        <SortSelector
          onSortChange={handleSortChange}
          initialValue={currentSort as SortOption}
        />
      </div>

 {showFilters &&     <div className="flex items-center justify-start">
        <FilterSelector
          initialValue={currentFilters}
        />
      </div>}
    </div>
  );
}