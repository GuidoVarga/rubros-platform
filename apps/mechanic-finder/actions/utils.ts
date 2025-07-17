import type { BusinessFilters } from '@/types/business';

export function buildWhereClause(filters?: BusinessFilters) {
  if (!filters) return {};

  const where: any = {};

  if (filters.subCategoryId) {
    where.subCategoryId = filters.subCategoryId;
  }

  if (filters.cityId) {
    where.cityId = filters.cityId;
  }

  if (filters.provinceId) {
    where.city = {
      provinceId: filters.provinceId,
    };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Note: isOpen filter is applied in post-processing
  // since it requires calculating current time against business hours
  // The actual filtering happens after the database query

  return where;
}
