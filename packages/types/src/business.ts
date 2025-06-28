export type BusinessOrderBy = {
  field: "name" | "createdAt";
  direction: "asc" | "desc";
};

export type BusinessFilters = {
  categoryId?: string;
  cityId?: string;
  zoneId?: string;
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
};

export type PaginationResult = {
  total: number;
  pages: number;
  current: number;
};

export interface Zone {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  zones: Zone[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  location: {
    city: {
      name: string;
      slug: string;
    };
    zone: {
      name: string;
      slug: string;
    };
  };
}
