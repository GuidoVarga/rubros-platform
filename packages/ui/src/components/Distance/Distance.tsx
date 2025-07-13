'use client';
import { calculateDistance, formatDistance } from "../../utils/geolocation";
import { useGeolocation } from "../../utils/useGeolocation";
import { Navigation } from "lucide-react";

type DistanceProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
}

export const Distance = (props: DistanceProps) => {
  const { latitude, longitude } = props;

  const { coordinates: userLocation } = useGeolocation();

  console.log('userLocation ', userLocation);
  console.log('latitude ', latitude);
  console.log('longitude ', longitude);

  const distance = userLocation && latitude && longitude
    ? formatDistance(calculateDistance(userLocation, { latitude, longitude }))
    : null;

  console.log('distance ', distance);
  return (
    distance ? (
      <div className="flex items-center gap-2" >
        <div>
          <Navigation className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-blue-600">{`A ${distance} de distancia`}</span>
      </div >
    ) : null
  )
}
