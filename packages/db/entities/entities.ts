import { Business, Category, City, Province } from '../generated/prisma';

export type BusinessEntity = Business & {
  category: CategoryEntity;
  city: CityEntity & { province: ProvinceEntity };
};

export type CityEntity = Pick<City, 'id' | 'name' | 'slug'> &
  Partial<Pick<City, 'postalCode'>>;

export type ProvinceEntity = Pick<Province, 'id' | 'name' | 'slug'>;
export type CategoryEntity = Pick<Category, 'id' | 'name' | 'slug'>;
