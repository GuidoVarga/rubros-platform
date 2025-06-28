import { Business, Category, City, Province } from '../generated/prisma';

export type BusinessEntity = Business & {
  category: CategoryEntity;
  city: CityEntity;
};

export type CityEntity = Pick<City, 'id' | 'name' | 'slug'>;

export type ProvinceEntity = Pick<Province, 'id' | 'name' | 'slug'>;
export type CategoryEntity = Pick<Category, 'id' | 'name' | 'slug'>;
