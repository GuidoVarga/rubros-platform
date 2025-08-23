'use client';

import { MapPin } from "lucide-react";
import { useState } from "react";

export type GeolocationButtonProps = {
  hasUserLocation: boolean;
  currentPath: string;
  cityName: string;
  redirectFunction?: (path: string) => void;
};

export function GeolocationButton({ hasUserLocation, currentPath, cityName, redirectFunction = (path: string) => {
  window.location.href = path;
} }: GeolocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        redirectFunction(`${currentPath}?lat=${latitude}&lng=${longitude}`);
      },
      (error) => {
        setIsLoading(false);
        console.error('Error getting location:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible');
            break;
          case error.TIMEOUT:
            setError('Tiempo de espera agotado');
            break;
          default:
            setError('Error obteniendo ubicación');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  if (hasUserLocation) {
    return (
      <div className="mt-4">
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2 inline-block">
          ✓ Usando tu ubicación exacta para calcular distancias
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button 
        onClick={handleUseLocation}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MapPin className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
        {isLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación exacta'}
      </button>
      
      <p className="text-xs text-muted-foreground mt-2">
        {isLoading 
          ? 'Esperando permisos de ubicación...'
          : `Para obtener distancias más precisas desde tu ubicación actual. Actualmente usando centro de ${cityName}.`
        }
      </p>
      
      {error && (
        <p className="text-xs text-red-600 mt-2 bg-red-50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
} 