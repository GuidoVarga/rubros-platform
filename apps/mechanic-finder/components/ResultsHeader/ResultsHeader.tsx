'use client';

import { SortSelector, type SortOption } from '../SortSelector';
import { useRouter, useSearchParams } from 'next/navigation';

type ResultsHeaderProps = {
  businessCount: string;
  currentSort: string;
};

export function ResultsHeader({
  businessCount,
  currentSort,
}: ResultsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (sortBy: SortOption) => {
    const params = new URLSearchParams(searchParams);

    if (sortBy === 'distance') {
      params.set('sort', 'distance');
    } else {
      params.delete('sort');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newUrl);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="text-sm text-gray-600">
        {businessCount}
      </div>

      <SortSelector
        onSortChange={handleSortChange}
        initialValue={currentSort as SortOption}
      />
    </div>
  );
}