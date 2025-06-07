import {LocationEntity} from "../entities";

export const getLocationName = (location: LocationEntity) => {
  return location.city?.name || location.zone?.name || "";
};
