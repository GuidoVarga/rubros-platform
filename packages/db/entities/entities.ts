import {Business, Category, City, Zone, Location} from "../generated/prisma";

export type BusinessEntity = Business & {
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
