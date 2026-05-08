export const citiesKeys = {
  all: ['cities'] as const,
  byProvince: (provinceSlug: string) =>
    [...citiesKeys.all, 'byProvince', provinceSlug] as const,
};
