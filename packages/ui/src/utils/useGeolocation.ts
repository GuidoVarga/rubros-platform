'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentPosition,
  type Coordinates,
  type GeolocationState,
} from './geolocation';

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const coordinates = await getCurrentPosition();

        if (isMounted) {
          setState({
            coordinates,
            error: null,
            loading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            coordinates: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false,
          });
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
