import {
  parseBusinessHours,
  getBusinessHoursString,
  isOpenNow,
  parseOpeningHours,
  type HourEntry,
  type GroupedHours,
} from './hours';

describe('hours utility functions', () => {
  describe('parseBusinessHours', () => {
    it('should return empty array for null/undefined input', () => {
      expect(parseBusinessHours(null)).toEqual([]);
      expect(parseBusinessHours(undefined)).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(parseBusinessHours([])).toEqual([]);
    });

    it('should return ["Cerrado"] for all closed days', () => {
      const closedHours: HourEntry[] = [
        { day: 'lunes', times: ['Cerrado'] },
        { day: 'martes', times: ['Cerrado'] },
      ];
      expect(parseBusinessHours(closedHours)).toEqual(['Cerrado']);
    });

    it('should handle single day with single time range', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle single day with multiple time ranges', () => {
      const hours: HourEntry[] = [
        {
          day: 'lunes',
          times: ['9:00 a. m. - 12:00 p. m.', '2:00 p. m. - 5:00 p. m.'],
        },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes de 9:00 a. m. a 12:00 p. m., 2:00 p. m. a 5:00 p. m.',
      ]);
    });

    it('should group consecutive days with same hours', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'miercoles', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes a miercoles de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle non-consecutive days with same hours', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'miercoles', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'viernes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes, miercoles y viernes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle mixed consecutive and non-consecutive days', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'jueves', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'viernes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes a martes y jueves a viernes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle different hours for different days', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['10:00 a. m. - 6:00 p. m.'] },
      ];
      const result = parseBusinessHours(hours);
      expect(result).toHaveLength(2);
      expect(result).toContain('Lunes de 9:00 a. m. a 5:00 p. m.');
      expect(result).toContain('Martes de 10:00 a. m. a 6:00 p. m.');
    });

    it('should clean time format properly', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00a.m.-5:00p.m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes de 9:00a.m. a 5:00p.m.',
      ]);
    });

    it('should handle days with accents', () => {
      const hours: HourEntry[] = [
        { day: 'miércoles', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'sábado', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Miércoles y sábado de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should filter out closed days', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['Cerrado'] },
        { day: 'miercoles', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes y miercoles de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle empty times array', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: [] },
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Martes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle all days of the week', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'miercoles', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'jueves', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'viernes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'sabado', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'domingo', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes a domingo de 9:00 a. m. a 5:00 p. m.',
      ]);
    });
  });

  describe('getBusinessHoursString', () => {
    it('should return default message for null/undefined input', () => {
      expect(getBusinessHoursString(null)).toBe('Horarios no disponibles');
      expect(getBusinessHoursString(undefined)).toBe('Horarios no disponibles');
    });

    it('should return default message for empty array', () => {
      expect(getBusinessHoursString([])).toBe('Horarios no disponibles');
    });

    it('should return "Cerrado" for all closed days', () => {
      const closedHours: HourEntry[] = [{ day: 'lunes', times: ['Cerrado'] }];
      expect(getBusinessHoursString(closedHours)).toBe('Cerrado');
    });

    it('should join multiple hour entries with periods', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['10:00 a. m. - 6:00 p. m.'] },
      ];
      const result = getBusinessHoursString(hours);
      expect(result).toContain('Lunes de 9:00 a. m. a 5:00 p. m.');
      expect(result).toContain('Martes de 10:00 a. m. a 6:00 p. m.');
      expect(result).toContain('. ');
    });

    it('should handle single hour entry', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(getBusinessHoursString(hours)).toBe(
        'Lunes de 9:00 a. m. a 5:00 p. m.'
      );
    });
  });

  describe('isOpenNow', () => {
    // Mock Date for consistent testing
    const mockDate = new Date('2024-01-15T14:30:00'); // Monday 2:30 PM

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return undefined for null/undefined input', () => {
      expect(isOpenNow(null)).toBe(undefined);
      expect(isOpenNow(undefined)).toBe(undefined);
    });

    it('should return undefined for empty array', () => {
      expect(isOpenNow([])).toBe(undefined);
    });

    it('should return false if no hours for current day', () => {
      const hours: HourEntry[] = [
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(isOpenNow(hours)).toBe(false);
    });

    it('should return false if closed on current day', () => {
      const hours: HourEntry[] = [{ day: 'lunes', times: ['Cerrado'] }];
      expect(isOpenNow(hours)).toBe(false);
    });

    it('should return true if currently open', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9 a. m. - 5 p. m.'] },
      ];
      expect(isOpenNow(hours)).toBe(true);
    });

    it('should return false if currently closed', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9 a. m. - 12 p. m.'] },
      ];
      expect(isOpenNow(hours)).toBe(false);
    });

    it('should handle multiple time ranges', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9 a. m. - 12 p. m.', '1 p. m. - 5 p. m.'] },
      ];
      const hours2: HourEntry[] = [
        { day: 'lunes', times: ['9 a. m.-6:30 p. m.'] },
      ];
      // At 2:30 PM, should be open (in second range: 1 PM - 5 PM)
      expect(isOpenNow(hours)).toBe(true);
      expect(isOpenNow(hours2)).toBe(true);
    });

    it('should handle invalid time format', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['invalid time format'] },
      ];
      expect(isOpenNow(hours)).toBe(false);
    });

    it('should handle empty times array', () => {
      const hours: HourEntry[] = [{ day: 'lunes', times: [] }];
      expect(isOpenNow(hours)).toBe(false);
    });

    // Tests for time formats with minutes
    describe('time formats with minutes', () => {
      it('should handle time with minutes - currently open', () => {
        // Mock Monday 10:00 AM (should be open for 8:30 AM - 7 PM)
        const mockDate = new Date('2024-01-15T10:00:00'); // Monday 10:00 AM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8:30 a. m. a 7 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle time with minutes - currently closed (before opening)', () => {
        // Mock Monday 8:00 AM (should be closed for 8:30 AM - 7 PM)
        const mockDate = new Date('2024-01-15T08:00:00'); // Monday 8:00 AM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8:30 a. m. a 7 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(false);
      });

      it('should handle time with minutes - currently closed (after closing)', () => {
        // Mock Monday 7:30 PM (should be closed for 8:30 AM - 7 PM)
        const mockDate = new Date('2024-01-15T19:30:00'); // Monday 7:30 PM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8:30 a. m. a 7 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(false);
      });

      it('should handle time with minutes in different format', () => {
        // Mock Monday 10:30 AM (should be open for 9:15 AM - 6:45 PM)
        const mockDate = new Date('2024-01-15T10:30:00'); // Monday 10:30 AM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['9:15 a. m.-6:45 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle mixed format - hours without minutes vs hours with minutes', () => {
        // Mock Monday 8:45 AM (should be open for 8 AM - 12:30 PM)
        const mockDate = new Date('2024-01-15T08:45:00'); // Monday 8:45 AM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8 a. m.-12:30 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle format with spaces - "9:00 a. m. - 5:00 p. m."', () => {
        // Mock Monday 2:30 PM (should be open for 9:00 AM - 5:00 PM)
        const mockDate = new Date('2024-01-15T14:30:00'); // Monday 2:30 PM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle edge case - exactly at opening time with minutes', () => {
        // Mock Monday 8:30 AM (should be open for 8:30 AM - 7 PM)
        const mockDate = new Date('2024-01-15T08:30:00'); // Monday 8:30 AM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8:30 a. m. a 7 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle edge case - exactly at closing time with minutes', () => {
        // Mock Monday 7:00 PM (should be closed for 8:30 AM - 7 PM)
        const mockDate = new Date('2024-01-15T19:00:00'); // Monday 7:00 PM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          { day: 'lunes', times: ['8:30 a. m. a 7 p. m.'] },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle multiple time ranges with minutes', () => {
        // Mock Monday 2:30 PM (should be open for second range 2:00 PM - 6:30 PM)
        const mockDate = new Date('2024-01-15T14:30:00'); // Monday 2:30 PM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          {
            day: 'lunes',
            times: ['8:30 a. m. - 12:00 p. m.', '2:00 p. m. - 6:30 p. m.'],
          },
        ];
        expect(isOpenNow(hours)).toBe(true);
      });

      it('should handle time gap between ranges with minutes', () => {
        // Mock Monday 1:30 PM (should be closed between ranges)
        const mockDate = new Date('2024-01-15T13:30:00'); // Monday 1:30 PM
        jest.setSystemTime(mockDate);

        const hours: HourEntry[] = [
          {
            day: 'lunes',
            times: ['8:30 a. m. - 12:00 p. m.', '2:00 p. m. - 6:30 p. m.'],
          },
        ];
        expect(isOpenNow(hours)).toBe(false);
      });
    });
  });

  describe('parseOpeningHours', () => {
    it('should return empty string for null input', () => {
      expect(parseOpeningHours(null)).toBe('');
    });

    it('should replace dash with "a"', () => {
      expect(parseOpeningHours('9:00-17:00')).toBe('9:00 a 17:00');
    });

    it('should handle already formatted string', () => {
      expect(parseOpeningHours('9:00 a 17:00')).toBe('9:00 a 17:00');
    });

    it('should handle multiple dashes', () => {
      expect(parseOpeningHours('9:00-12:00-17:00')).toBe('9:00 a 12:00-17:00');
    });

    it('should handle empty string', () => {
      expect(parseOpeningHours('')).toBe('');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed HourEntry objects', () => {
      const malformedHours = [
        { day: '', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'lunes', times: null as any },
      ];
      expect(() => parseBusinessHours(malformedHours)).not.toThrow();
    });

    it('should handle mixed case day names', () => {
      const hours: HourEntry[] = [
        { day: 'LUNES', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'Martes', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'LUNES a Martes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle irregular spacing in times', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['  9:00   a.   m.   -   5:00   p.   m.  '] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes de 9:00 a. m. a 5:00 p. m.',
      ]);
    });

    it('should handle very long day ranges', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'martes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'jueves', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'viernes', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'sabado', times: ['9:00 a. m. - 5:00 p. m.'] },
        { day: 'domingo', times: ['9:00 a. m. - 5:00 p. m.'] },
      ];
      expect(parseBusinessHours(hours)).toEqual([
        'Lunes a martes y jueves a domingo de 9:00 a. m. a 5:00 p. m.',
      ]);
    });
  });
});
