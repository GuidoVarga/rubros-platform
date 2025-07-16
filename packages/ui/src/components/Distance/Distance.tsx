'use client';
import { calculateDistance, formatDistance } from "../../utils/geolocation";
import { useGeolocation } from "../../utils/useGeolocation";
import { Navigation } from "lucide-react";

type DistanceProps = {
  distance?: number | null;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
}

export const Distance = (props: DistanceProps) => {
  const { distance, latitude, longitude } = props;

  const { coordinates: userLocation } = useGeolocation();

  console.log('userLocation ', userLocation);

  const parsedDistance = distance || (userLocation && latitude && longitude
    ? formatDistance(calculateDistance(userLocation, { latitude, longitude }))
    : null)

  return (
    <div>
      <span>User location {userLocation?.latitude} {userLocation?.longitude}</span>
      {distance ? (
        <div className="flex items-center gap-2" >
          <div>
            <Navigation className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-base font-medium text-blue-600">{`A ${parsedDistance} de distancia`}</span>
        </div >
      ) : null}
    </div>
  )
}
