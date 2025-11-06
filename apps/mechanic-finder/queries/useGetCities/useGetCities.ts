import { useQuery } from '@tanstack/react-query';
import { getCitiesByProvince } from '@/actions/cities';
import { citiesKeys } from './keys';
import { staticDataQueryConfig } from '../config';

type UseGetCitiesOptions = {
  provinceId?: string;
  enabled?: boolean;
};

export function useGetCities({
  provinceId,
  enabled = true,
}: UseGetCitiesOptions) {
  return useQuery({
    queryKey: citiesKeys.byProvince(provinceId || ''),
    queryFn: async () => {
      const cities = await getCitiesByProvince(provinceId || '');
      return cities;
    },
    enabled: enabled && !!provinceId,
    ...staticDataQueryConfig,
  });
}
