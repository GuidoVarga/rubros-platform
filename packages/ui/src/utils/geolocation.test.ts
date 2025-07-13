import {
  calculateDistance,
  formatDistance,
  type Coordinates,
} from './geolocation';

describe('geolocation utility functions', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const point1: Coordinates = { latitude: 40.7128, longitude: -74.006 }; // New York
      const point2: Coordinates = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

      const distance = calculateDistance(point1, point2);

      // Distance between NYC and LA is approximately 3936 km
      expect(distance).toBeCloseTo(3936, -1); // Allow 10km tolerance
    });

    it('should return 0 for same coordinates', () => {
      const point: Coordinates = { latitude: 40.7128, longitude: -74.006 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const point1: Coordinates = { latitude: -34.6037, longitude: -58.3816 }; // Buenos Aires
      const point2: Coordinates = { latitude: -33.4489, longitude: -70.6693 }; // Santiago

      const distance = calculateDistance(point1, point2);

      // Distance between Buenos Aires and Santiago is approximately 1139 km
      expect(distance).toBeCloseTo(1139, -1); // Allow 10km tolerance
    });

    it('should handle coordinates across the equator', () => {
      const point1: Coordinates = { latitude: 40.7128, longitude: -74.006 }; // New York
      const point2: Coordinates = { latitude: -34.6037, longitude: -58.3816 }; // Buenos Aires

      const distance = calculateDistance(point1, point2);

      // Distance should be positive and reasonable
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(8500, -2); // Allow 100km tolerance
    });

    it('should handle very small distances', () => {
      const point1: Coordinates = { latitude: 40.7128, longitude: -74.006 };
      const point2: Coordinates = { latitude: 40.7129, longitude: -74.0061 };

      const distance = calculateDistance(point1, point2);

      // Very small distance should be close to 0
      expect(distance).toBeLessThan(1);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 1km in meters', () => {
      expect(formatDistance(0.1)).toBe('100m');
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.999)).toBe('999m');
    });

    it('should format distances less than 10km with one decimal', () => {
      expect(formatDistance(1.0)).toBe('1.0km');
      expect(formatDistance(2.5)).toBe('2.5km');
      expect(formatDistance(9.9)).toBe('9.9km');
    });

    it('should format distances 10km and above as whole numbers', () => {
      expect(formatDistance(10.0)).toBe('10km');
      expect(formatDistance(15.7)).toBe('16km');
      expect(formatDistance(100.2)).toBe('100km');
    });

    it('should handle edge cases', () => {
      expect(formatDistance(0)).toBe('0m');
      expect(formatDistance(0.001)).toBe('1m');
      expect(formatDistance(9.95)).toBe('9.9km');
      expect(formatDistance(9.99)).toBe('10.0km');
    });

    it('should handle large distances', () => {
      expect(formatDistance(1000)).toBe('1000km');
      expect(formatDistance(12345.67)).toBe('12346km');
    });
  });

  describe('edge cases', () => {
    it('should handle coordinates at the poles', () => {
      const northPole: Coordinates = { latitude: 90, longitude: 0 };
      const southPole: Coordinates = { latitude: -90, longitude: 0 };

      const distance = calculateDistance(northPole, southPole);

      // Distance between poles should be approximately half the Earth's circumference
      expect(distance).toBeCloseTo(20015, -2); // Allow 100km tolerance
    });

    it('should handle coordinates at the international date line', () => {
      const point1: Coordinates = { latitude: 0, longitude: 179 };
      const point2: Coordinates = { latitude: 0, longitude: -179 };

      const distance = calculateDistance(point1, point2);

      // Should be a short distance, not halfway around the world
      expect(distance).toBeLessThan(500);
    });

    it('should handle very precise coordinates', () => {
      const point1: Coordinates = {
        latitude: 40.712812345,
        longitude: -74.006012345,
      };
      const point2: Coordinates = {
        latitude: 40.712812346,
        longitude: -74.006012346,
      };

      const distance = calculateDistance(point1, point2);

      // Very precise coordinates should still work
      expect(distance).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThan(0.001);
    });
  });
});
