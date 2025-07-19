import { isOpenNow } from '../hours';
import type { HourEntry } from '../hours';

// Mock Date para controlar el tiempo en los tests
const mockDate = (dateString: string) => {
  const fixedDate = new Date(dateString);

  const originalDate = global.Date;

  // Mock para Jest
  jest.useFakeTimers();
  jest.setSystemTime(fixedDate);

  return () => {
    jest.useRealTimers();
  };
};

describe('isOpenNow', () => {
  afterEach(() => {
    // Restaurar Date original después de cada test
    jest.useRealTimers();
  });

  describe('Input validation', () => {
    it('should return undefined for null input', () => {
      expect(isOpenNow(null)).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      expect(isOpenNow(undefined)).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      expect(isOpenNow([])).toBeUndefined();
    });

    it('should return undefined for non-array input', () => {
      expect(isOpenNow('invalid' as any)).toBeUndefined();
    });
  });

  describe('Closed scenarios', () => {
    const hours: HourEntry[] = [
      { day: 'lunes', times: ['9 a. m.-5 p. m.'] },
      { day: 'domingo', times: ['Cerrado'] },
      { day: 'martes', times: ['closed'] },
      { day: 'miercoles', times: [] },
    ];

    it('should return false when explicitly closed (Spanish)', () => {
      const restore = mockDate('2024-01-07T15:00:00'); // Domingo 3 PM
      expect(isOpenNow(hours)).toBe(false);
      restore();
    });

    it('should return false when explicitly closed (English)', () => {
      const restore = mockDate('2024-01-02T15:00:00'); // Martes 3 PM
      expect(isOpenNow(hours)).toBe(false);
      restore();
    });

    it('should return false when no times defined', () => {
      const restore = mockDate('2024-01-03T15:00:00'); // Miércoles 3 PM
      expect(isOpenNow(hours)).toBe(false);
      restore();
    });

    it('should return false when day not found', () => {
      const restore = mockDate('2024-01-04T15:00:00'); // Jueves 3 PM (no definido)
      expect(isOpenNow(hours)).toBe(false);
      restore();
    });
  });

  describe('Accent handling in day names', () => {
    const hoursWithAccents: HourEntry[] = [
      { day: 'sábado', times: ['10 a. m.-8 p. m.'] },
      { day: 'miércoles', times: ['9 a. m.-6 p. m.'] },
    ];

    const hoursWithoutAccents: HourEntry[] = [
      { day: 'sabado', times: ['10 a. m.-8 p. m.'] },
      { day: 'miercoles', times: ['9 a. m.-6 p. m.'] },
    ];

    it('should handle sábado with accent', () => {
      const restore = mockDate('2024-01-06T13:20:00'); // Sábado 1:20 PM
      expect(isOpenNow(hoursWithAccents)).toBe(true);
      restore();
    });

    it('should handle sabado without accent', () => {
      const restore = mockDate('2024-01-06T13:20:00'); // Sábado 1:20 PM
      expect(isOpenNow(hoursWithoutAccents)).toBe(true);
      restore();
    });

    it('should handle miércoles with accent', () => {
      const restore = mockDate('2024-01-03T11:00:00'); // Miércoles 11:00 AM
      expect(isOpenNow(hoursWithAccents)).toBe(true);
      restore();
    });

    it('should handle miercoles without accent', () => {
      const restore = mockDate('2024-01-03T11:00:00'); // Miércoles 11:00 AM
      expect(isOpenNow(hoursWithoutAccents)).toBe(true);
      restore();
    });
  });

  describe('Original failing case', () => {
    const originalCase: HourEntry[] = [
      { day: 'lunes', times: ['2-7 p. m.'] },
      { day: 'martes', times: ['2-7:30 p. m.'] },
      { day: 'miercoles', times: ['2-7:30 p. m.'] },
      { day: 'jueves', times: ['2-7:30 p. m.'] },
      { day: 'viernes', times: ['2-7:30 p. m.'] },
      { day: 'sabado', times: ['10 a. m.-8 p. m.'] },
      { day: 'domingo', times: ['Cerrado'] },
    ];

    it('should return true for Saturday 1:20 PM with "10 a. m.-8 p. m."', () => {
      const restore = mockDate('2024-01-06T13:20:00'); // Sábado 1:20 PM
      expect(isOpenNow(originalCase)).toBe(true);
      restore();
    });

    it('should return true for Monday 3:00 PM with "2-7 p. m."', () => {
      const restore = mockDate('2024-01-01T15:00:00'); // Lunes 3:00 PM
      expect(isOpenNow(originalCase)).toBe(true);
      restore();
    });

    it('should return false for Monday 1:00 PM with "2-7 p. m." (too early)', () => {
      const restore = mockDate('2024-01-01T13:00:00'); // Lunes 1:00 PM
      expect(isOpenNow(originalCase)).toBe(false);
      restore();
    });

    it('should return false for Monday 8:00 PM with "2-7 p. m." (too late)', () => {
      const restore = mockDate('2024-01-01T20:00:00'); // Lunes 8:00 PM
      expect(isOpenNow(originalCase)).toBe(false);
      restore();
    });

    it('should return false for Sunday (explicitly closed)', () => {
      const restore = mockDate('2024-01-07T15:00:00'); // Domingo 3:00 PM
      expect(isOpenNow(originalCase)).toBe(false);
      restore();
    });
  });

  describe('Time format patterns', () => {
    describe('Pattern 1: "X a. m.-Y p. m." (AM to PM)', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['8 a. m.-5 p. m.'] },
        { day: 'martes', times: ['9:30 a. m.-6:15 p. m.'] },
        { day: 'miercoles', times: ['10:00 a. m.-7:00 p. m.'] },
      ];

      it('should work with "8 a. m.-5 p. m." during business hours', () => {
        const restore = mockDate('2024-01-01T12:00:00'); // Lunes 12:00 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should work with "9:30 a. m.-6:15 p. m." with minutes', () => {
        const restore = mockDate('2024-01-02T14:30:00'); // Martes 2:30 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should return false before opening time', () => {
        const restore = mockDate('2024-01-01T07:00:00'); // Lunes 7:00 AM
        expect(isOpenNow(hours)).toBe(false);
        restore();
      });

      it('should return false after closing time', () => {
        const restore = mockDate('2024-01-01T18:00:00'); // Lunes 6:00 PM
        expect(isOpenNow(hours)).toBe(false);
        restore();
      });
    });

    describe('Pattern 2: "X-Y p. m." (PM only at end)', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['2-7 p. m.'] },
        { day: 'martes', times: ['1-9 p. m.'] },
        { day: 'miercoles', times: ['3:30-8:45 p. m.'] },
      ];

      it('should work with "2-7 p. m." format', () => {
        const restore = mockDate('2024-01-01T16:00:00'); // Lunes 4:00 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should work with minutes "3:30-8:45 p. m."', () => {
        const restore = mockDate('2024-01-03T20:00:00'); // Miércoles 8:00 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should return false before 2 PM', () => {
        const restore = mockDate('2024-01-01T13:00:00'); // Lunes 1:00 PM
        expect(isOpenNow(hours)).toBe(false);
        restore();
      });

      it('should return false after 7 PM', () => {
        const restore = mockDate('2024-01-01T20:00:00'); // Lunes 8:00 PM
        expect(isOpenNow(hours)).toBe(false);
        restore();
      });
    });

    describe('Pattern 3: Full format with both AM/PM', () => {
      const hours: HourEntry[] = [
        { day: 'lunes', times: ['8:30 a. m. a 7:15 p. m.'] },
        { day: 'martes', times: ['2:00 p. m. - 6:30 p. m.'] },
        { day: 'miercoles', times: ['9:00 a. m. - 11:00 a. m.'] },
      ];

      it('should work with "a" separator', () => {
        const restore = mockDate('2024-01-01T15:00:00'); // Lunes 3:00 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should work with PM to PM times', () => {
        const restore = mockDate('2024-01-02T16:00:00'); // Martes 4:00 PM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should work with AM to AM times', () => {
        const restore = mockDate('2024-01-03T10:00:00'); // Miércoles 10:00 AM
        expect(isOpenNow(hours)).toBe(true);
        restore();
      });

      it('should return false outside PM to PM range', () => {
        const restore = mockDate('2024-01-02T19:00:00'); // Martes 7:00 PM
        expect(isOpenNow(hours)).toBe(false);
        restore();
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    const hours: HourEntry[] = [
      { day: 'lunes', times: ['12:00 a. m.-11:59 p. m.'] }, // Todo el día
      { day: 'martes', times: ['12 a. m.-12 p. m.'] }, // Mediodía
      { day: 'miercoles', times: ['12 p. m.-12 a. m.'] }, // Desde mediodía
    ];

    it('should handle 12 AM (midnight) correctly', () => {
      const restore = mockDate('2024-01-01T00:30:00'); // Lunes 12:30 AM
      expect(isOpenNow(hours)).toBe(true);
      restore();
    });

    it('should handle 12 PM (noon) correctly', () => {
      const restore = mockDate('2024-01-02T12:00:00'); // Martes 12:00 PM
      expect(isOpenNow(hours)).toBe(true);
      restore();
    });

    it('should handle exact opening time', () => {
      const exactHours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m.-5:00 p. m.'] },
      ];
      const restore = mockDate('2024-01-01T09:00:00'); // Lunes 9:00 AM exacto
      expect(isOpenNow(exactHours)).toBe(true);
      restore();
    });

    it('should handle exact closing time', () => {
      const exactHours: HourEntry[] = [
        { day: 'lunes', times: ['9:00 a. m.-5:00 p. m.'] },
      ];
      const restore = mockDate('2024-01-01T17:00:00'); // Lunes 5:00 PM exacto
      expect(isOpenNow(exactHours)).toBe(true);
      restore();
    });
  });

  describe('Multiple time ranges', () => {
    const hours: HourEntry[] = [
      {
        day: 'lunes',
        times: ['9:00 a. m.-12:00 p. m.', '1:00 p. m.-6:00 p. m.'],
      },
    ];

    it('should return true when in first time range', () => {
      const restore = mockDate('2024-01-01T10:00:00'); // Lunes 10:00 AM
      expect(isOpenNow(hours)).toBe(true);
      restore();
    });

    it('should return true when in second time range', () => {
      const restore = mockDate('2024-01-01T15:00:00'); // Lunes 3:00 PM
      expect(isOpenNow(hours)).toBe(true);
      restore();
    });

    it('should return false during lunch break', () => {
      const restore = mockDate('2024-01-01T12:30:00'); // Lunes 12:30 PM
      expect(isOpenNow(hours)).toBe(false);
      restore();
    });
  });

  describe('Invalid time formats', () => {
    const invalidHours: HourEntry[] = [
      { day: 'lunes', times: ['invalid time format'] },
      { day: 'martes', times: ['9-5'] }, // Sin AM/PM
      { day: 'miercoles', times: ['24:00-25:00'] }, // Horas inválidas
      { day: 'jueves', times: [''] }, // String vacío
    ];

    it('should return false for invalid time format', () => {
      const restore = mockDate('2024-01-01T15:00:00'); // Lunes 3:00 PM
      expect(isOpenNow(invalidHours)).toBe(false);
      restore();
    });

    it('should return false for format without AM/PM', () => {
      const restore = mockDate('2024-01-02T15:00:00'); // Martes 3:00 PM
      expect(isOpenNow(invalidHours)).toBe(false);
      restore();
    });

    it('should return false for empty time string', () => {
      const restore = mockDate('2024-01-04T15:00:00'); // Jueves 3:00 PM
      expect(isOpenNow(invalidHours)).toBe(false);
      restore();
    });
  });

  describe('All days of the week', () => {
    const fullWeekHours: HourEntry[] = [
      { day: 'lunes', times: ['9 a. m.-6 p. m.'] },
      { day: 'martes', times: ['9 a. m.-6 p. m.'] },
      { day: 'miércoles', times: ['9 a. m.-6 p. m.'] },
      { day: 'jueves', times: ['9 a. m.-6 p. m.'] },
      { day: 'viernes', times: ['9 a. m.-6 p. m.'] },
      { day: 'sábado', times: ['10 a. m.-4 p. m.'] },
      { day: 'domingo', times: ['Cerrado'] },
    ];

    it('should work for Monday', () => {
      const restore = mockDate('2024-01-01T12:00:00'); // Lunes
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should work for Tuesday', () => {
      const restore = mockDate('2024-01-02T12:00:00'); // Martes
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should work for Wednesday', () => {
      const restore = mockDate('2024-01-03T12:00:00'); // Miércoles
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should work for Thursday', () => {
      const restore = mockDate('2024-01-04T12:00:00'); // Jueves
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should work for Friday', () => {
      const restore = mockDate('2024-01-05T12:00:00'); // Viernes
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should work for Saturday with different hours', () => {
      const restore = mockDate('2024-01-06T13:00:00'); // Sábado 1:00 PM
      expect(isOpenNow(fullWeekHours)).toBe(true);
      restore();
    });

    it('should return false for Saturday outside hours', () => {
      const restore = mockDate('2024-01-06T17:00:00'); // Sábado 5:00 PM
      expect(isOpenNow(fullWeekHours)).toBe(false);
      restore();
    });

    it('should return false for Sunday (closed)', () => {
      const restore = mockDate('2024-01-07T12:00:00'); // Domingo
      expect(isOpenNow(fullWeekHours)).toBe(false);
      restore();
    });
  });

  describe('User Specific Real-World Case', () => {
    const userProvidedHours: HourEntry[] = [
      { day: 'lunes', times: ['2-7 p. m.'] },
      { day: 'martes', times: ['2-7:30 p. m.'] },
      { day: 'miercoles', times: ['2-7:30 p. m.'] },
      { day: 'jueves', times: ['2-7:30 p. m.'] },
      { day: 'viernes', times: ['2-7:30 p. m.'] },
      { day: 'sabado', times: ['10 a. m.-8 p. m.'] },
      { day: 'domingo', times: ['Cerrado'] },
    ];

    it('should return true for Saturday 1:35 PM with user provided data', () => {
      const restore = mockDate('2024-01-06T13:35:00'); // Sábado 1:35 PM
      expect(isOpenNow(userProvidedHours)).toBe(true);
      restore();
    });

    it('should return false for Saturday before opening (9:00 AM)', () => {
      const restore = mockDate('2024-01-06T09:00:00'); // Sábado 9:00 AM
      expect(isOpenNow(userProvidedHours)).toBe(false);
      restore();
    });

    it('should return false for Saturday after closing (9:00 PM)', () => {
      const restore = mockDate('2024-01-06T21:00:00'); // Sábado 9:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(false);
      restore();
    });

    it('should work correctly for Monday afternoon', () => {
      const restore = mockDate('2024-01-01T16:00:00'); // Lunes 4:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(true);
      restore();
    });

    it('should work correctly for Tuesday evening', () => {
      const restore = mockDate('2024-01-02T19:00:00'); // Martes 7:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(true);
      restore();
    });

    it('should return false for Sunday (explicitly closed)', () => {
      const restore = mockDate('2024-01-07T15:00:00'); // Domingo 3:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(false);
      restore();
    });

    it('should return false for Monday before opening hours', () => {
      const restore = mockDate('2024-01-01T13:00:00'); // Lunes 1:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(false);
      restore();
    });

    it('should return false for Tuesday after closing hours', () => {
      const restore = mockDate('2024-01-02T20:00:00'); // Martes 8:00 PM
      expect(isOpenNow(userProvidedHours)).toBe(false);
      restore();
    });
  });
});
