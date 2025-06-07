import {
  Business,
  Category,
  City,
  Zone,
  Location,
} from "@rubros/db/generated/prisma";

export type BusinessEntity = Omit<Business, "categoryId" | "locationId"> & {
  category: CategoryEntity;
  location: LocationEntity;
};

export type CityEntity = City;

export type ZoneEntity = Zone;

export type LocationEntity = Location & {
  city?: City;
  zone?: Zone;
};

export type CategoryEntity = Category;
