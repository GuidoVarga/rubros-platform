export type BusinessOrderBy = {
  field: 'name' | 'createdAt' | 'googleMapsRating' | 'distance';
  direction: 'asc' | 'desc';
};

export type BusinessFilters = {
  subCategoryId?: string;
  cityId?: string;
  provinceId?: string;
  search?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type GetBusinessesParams = {
  filters?: BusinessFilters;
  orderBy?: BusinessOrderBy;
  pagination?: PaginationParams;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDistance?: number;
};
