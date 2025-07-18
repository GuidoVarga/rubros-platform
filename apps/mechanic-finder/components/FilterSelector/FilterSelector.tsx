'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { trackFilterUse } from '@/lib/analytics';

type FilterSelectorProps = {
  onFilterChange?: (filters: string | null) => void;
  className?: string;
  initialValue?: string | null;
};

export function FilterSelector({ onFilterChange, className, initialValue = null }: FilterSelectorProps) {
  const [isOpenFilter, setIsOpenFilter] = useState(initialValue === 'isOpen');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update internal state when initialValue changes
  useEffect(() => {
    setIsOpenFilter(initialValue === 'isOpen');
  }, [initialValue]);

  const handleFilterChange = (checked: boolean) => {
    setIsOpenFilter(checked);

    // Track filter usage
    trackFilterUse('isOpen', checked ? 'enabled' : 'disabled');

    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.set('filters', 'isOpen');
    } else {
      params.delete('filters');
    }

    // Reset to first page when changing filters
    params.delete('page');

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newUrl);

    if (onFilterChange) {
      onFilterChange(checked ? 'isOpen' : null);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isOpenFilter}
          onChange={(e) => handleFilterChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Solo abiertos ahora
        </span>
      </label>
    </div>
  );
}