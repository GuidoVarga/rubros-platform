import { Business, Category, City, Province } from '../generated/prisma';

export type BusinessEntity = Business & {
  category: CategoryEntity;
  city: CityEntity;
};

export type CityEntity = City & {
  province: ProvinceEntity;
};

export type ProvinceEntity = Province & {
  cities?: CityEntity[];
};

export type CategoryEntity = Category;
