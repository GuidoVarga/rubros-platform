'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LeafletEvent } from 'leaflet'
import { cn } from '../../lib/utils'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

import { LatLngExpression as LeafletLatLngExpression } from 'leaflet';

export type LatLngExpression = LeafletLatLngExpression;

export type MapMarker = {
  id: string;
  position: LatLngExpression;
  title: string;
  description?: string;
  onClick?: () => void;
};

export type MapProps = {
  markers?: MapMarker[];
  center?: LatLngExpression;
  zoom?: number;
  showCurrentLocation?: boolean;
  onCurrentLocationChange?: (position: LatLngExpression) => void;
  className?: string;
};


// Fix for default marker icons in react-leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function CurrentLocationMarker({ onPositionChange }: { onPositionChange?: (position: LatLngExpression) => void }) {
  const [position, setPosition] = useState<LatLngExpression | null>(null)
  const map = useMap()

  useEffect(() => {
    map.locate().on('locationfound', function (e: LeafletEvent & { latlng: { lat: number; lng: number } }) {
      setPosition([e.latlng.lat, e.latlng.lng])
      if (onPositionChange) {
        onPositionChange([e.latlng.lat, e.latlng.lng])
      }
      map.flyTo(e.latlng, map.getZoom())
    })
  }, [map, onPositionChange])

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  )
}

const Map = ({
  markers = [],
  center = [-34.6037, -58.3816], // Default to Buenos Aires
  zoom = 13,
  showCurrentLocation = false,
  onCurrentLocationChange,
  className,
}: MapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={cn('h-full w-full rounded-lg', className)}
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showCurrentLocation && (
        <CurrentLocationMarker onPositionChange={onCurrentLocationChange} />
      )}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={defaultIcon}
          eventHandlers={{
            click: marker.onClick,
          }}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{marker.title}</h3>
              {marker.description && (
                <p className="text-sm text-muted-foreground mt-1">{marker.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
};

export default Map;