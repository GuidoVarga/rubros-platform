export type HourEntry = {
  day: string;
  times: string[];
};

export type GroupedHours = {
  days: string[];
  times: string[];
};

// Mapeo de días para orden correcto (sin acentos para normalización)
const dayOrder = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

// Capitalizar primera letra
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Limpiar formato de horarios
const cleanTimeFormat = (time: string): string => {
  return time
    .replace(/\s+a\.\s*m\./g, ' a. m.')
    .replace(/\s+p\.\s*m\./g, ' p. m.')
    .replace(/\s*-\s*/g, ' a ')
    .trim();
};

// Verificar si dos horarios son iguales
const areTimesEqual = (times1: string[], times2: string[]): boolean => {
  if (times1.length !== times2.length) return false;
  return times1.every((time, index) => time === times2[index]);
};

// Normalizar nombres de días (remover acentos)
const normalizeDayName = (day: string): string => {
  return day
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// Agrupar días consecutivos
const groupConsecutiveDays = (days: string[]): string | undefined => {
  if (days.length === 0) return '';
  if (days.length === 1) return days[0];

  // Ordenar días según dayOrder (normalizando para comparación)
  const sortedDays = days.sort((a, b) => {
    const normalizedA = normalizeDayName(a);
    const normalizedB = normalizeDayName(b);
    return dayOrder.indexOf(normalizedA) - dayOrder.indexOf(normalizedB);
  });

  // Identificar grupos consecutivos
  const groups: string[][] = [];
  let currentGroup = [sortedDays[0]];

  for (let i = 1; i < sortedDays.length; i++) {
    const currentDayIndex = dayOrder.indexOf(normalizeDayName(sortedDays[i]!));
    const previousDayIndex = dayOrder.indexOf(
      normalizeDayName(sortedDays[i - 1]!)
    );

    // Si son días consecutivos, agregar al grupo actual
    if (currentDayIndex === previousDayIndex + 1) {
      currentGroup.push(sortedDays[i]);
    } else {
      // Si no son consecutivos, cerrar grupo actual y empezar uno nuevo
      // @ts-expect-error - currentGroup is not undefined
      groups.push([...currentGroup]);
      currentGroup = [sortedDays[i]];
    }
  }

  // Agregar el último grupo
  // @ts-expect-error - currentGroup is not undefined
  groups.push(currentGroup);

  // Crear elementos finales (rangos o días individuales)
  const elements: string[] = [];

  groups.forEach((group) => {
    if (group.length === 1) {
      // Día individual
      elements.push(group[0]!);
    } else {
      // 2+ días consecutivos: crear rango
      elements.push(`${group[0]} a ${group[group.length - 1]}`);
    }
  });

  // Aplicar reglas de separación basadas en número total de elementos
  if (elements.length === 1) {
    return elements[0];
  } else if (elements.length === 2) {
    return `${elements[0]} y ${elements[1]}`;
  } else {
    // 3+ elementos: usar comas y "y" al final
    const lastElement = elements.pop();
    return `${elements.join(', ')} y ${lastElement}`;
  }
};

// Función principal para parsear horarios
export const parseBusinessHours = (
  hours: HourEntry[] | null | undefined
): string[] => {
  if (!hours || !Array.isArray(hours) || hours.length === 0) {
    return [];
  }

  // Filtrar días cerrados
  const openDays = hours.filter(
    (hour) =>
      hour.times &&
      hour.times.length > 0 &&
      !hour.times.some((time) => time.toLowerCase().includes('cerrado'))
  );

  if (openDays.length === 0) {
    return ['Cerrado'];
  }

  // Agrupar por horarios iguales
  const groupedByTimes: GroupedHours[] = [];

  openDays.forEach((dayHour) => {
    const existingGroup = groupedByTimes.find((group) =>
      areTimesEqual(group.times, dayHour.times)
    );

    if (existingGroup) {
      existingGroup.days.push(dayHour.day);
    } else {
      groupedByTimes.push({
        days: [dayHour.day],
        times: dayHour.times,
      });
    }
  });

  // Formatear resultado
  const result = groupedByTimes.map((group) => {
    const daysText = groupConsecutiveDays(group.days);
    const timesText = group.times
      .map((time) => cleanTimeFormat(time))
      .join(', ');

    const fullText = `${daysText} de ${timesText}`;
    // Capitalizar solo la primera letra del string completo
    return capitalize(fullText);
  });

  return result;
};

// Función auxiliar para obtener horarios como string único
export const getBusinessHoursString = (
  hours: HourEntry[] | null | undefined
): string => {
  const parsed = parseBusinessHours(hours);

  if (parsed.length === 0) {
    return 'Horarios no disponibles';
  }

  if (parsed.includes('Cerrado')) {
    return 'Cerrado';
  }

  return parsed.join('. ');
};

// Función para verificar si está abierto ahora (mejorada para consistencia con SQL)
export const isOpenNow = (
  hours: HourEntry[] | null | undefined
): boolean | undefined => {
  if (!hours?.length || !Array.isArray(hours)) return undefined;

  const now = new Date();

  // Mapeo manual de días para evitar problemas de acentos
  const dayMap: Record<number, string> = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miércoles', // Probar ambas versiones
    4: 'jueves',
    5: 'viernes',
    6: 'sábado', // Probar ambas versiones
  };

  const currentDayNumber = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

  // Buscar horarios para hoy probando múltiples variantes del día
  const possibleDayNames = [
    dayMap[currentDayNumber]!,
    dayMap[currentDayNumber]!.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), // Sin acentos
  ];

  const todayHours = hours.find((h) =>
    possibleDayNames.some(
      (dayName) => h.day.toLowerCase() === dayName.toLowerCase()
    )
  );

  if (!todayHours || !todayHours.times || todayHours.times.length === 0) {
    return false;
  }

  // Verificar si dice "Cerrado"
  if (
    todayHours.times.some(
      (time) =>
        time.toLowerCase().includes('cerrado') ||
        time.toLowerCase().includes('closed')
    )
  ) {
    return false;
  }

  // Parsear horarios para verificar si está abierto
  return todayHours.times.some((timeRange) => {
    // Limpiar espacios extra
    const cleanTimeRange = timeRange.trim();

    // Patrones mejorados que manejan los formatos reales:
    // "2-7 p. m.", "2-7:30 p. m.", "10 a. m.-8 p. m.", "8:30 a. m.-7:15 p. m."

    // Patrón 1: Formato "X a. m.-Y p. m." (con AM explícito en inicio)
    let match = cleanTimeRange.match(
      /^(\d{1,2})(?::(\d{2}))?\s*a\.\s*m\.\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*p\.\s*m\.$/i
    );
    if (match) {
      const openHour = parseInt(match[1]!);
      const openMinute = parseInt(match[2] || '0');
      const closeHour = parseInt(match[3]!);
      const closeMinute = parseInt(match[4] || '0');

      let openTime24 = openHour * 100 + openMinute;
      let closeTime24 = closeHour * 100 + closeMinute;

      // Manejar 12 a.m. = 00:xx
      if (openHour === 12) {
        openTime24 = openMinute;
      }

      // Manejar PM para hora de cierre - 12 p.m. = 1200 (mediodía)
      if (closeHour !== 12) {
        closeTime24 += 1200; // Solo agregar 12 horas si no es 12 p.m.
      }

      return currentTime >= openTime24 && currentTime <= closeTime24;
    }

    // Patrón 2: Formato "X-Y p. m." (solo PM al final)
    match = cleanTimeRange.match(
      /^(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*p\.\s*m\.$/i
    );
    if (match) {
      const openHour = parseInt(match[1]!) + 12; // Asumir PM también para la apertura
      const openMinute = parseInt(match[2] || '0');
      const closeHour = parseInt(match[3]!) + 12; // PM
      const closeMinute = parseInt(match[4] || '0');

      const openTime24 = openHour * 100 + openMinute;
      const closeTime24 = closeHour * 100 + closeMinute;

      return currentTime >= openTime24 && currentTime <= closeTime24;
    }

    // Patrón 3: Formato completo "X:XX a. m. a Y:XX p. m." o "X:XX p. m. - Y:XX p. m."
    match = cleanTimeRange.match(
      /^(\d{1,2})(?::(\d{2}))?\s*(a\.\s*m\.|p\.\s*m\.)\s*(?:[-–]|a)\s*(\d{1,2})(?::(\d{2}))?\s*(a\.\s*m\.|p\.\s*m\.)$/i
    );
    if (match) {
      const openHour = parseInt(match[1]!);
      const openMinute = parseInt(match[2] || '0');
      const openPeriod = match[3]!.toLowerCase();
      const closeHour = parseInt(match[4]!);
      const closeMinute = parseInt(match[5] || '0');
      const closePeriod = match[6]!.toLowerCase();

      let openTime24 = openHour * 100 + openMinute;
      let closeTime24 = closeHour * 100 + closeMinute;

      // Convertir AM/PM a formato 24h
      if (openPeriod.includes('p') && openHour !== 12) {
        openTime24 += 1200;
      } else if (openPeriod.includes('a') && openHour === 12) {
        openTime24 = openMinute; // 12 a.m. es 00:xx
      }

      if (closePeriod.includes('p') && closeHour !== 12) {
        closeTime24 += 1200;
      } else if (closePeriod.includes('a') && closeHour === 12) {
        closeTime24 = closeMinute; // 12 a.m. es 00:xx
      }

      return currentTime >= openTime24 && currentTime <= closeTime24;
    }

    // Si no coincide con ningún patrón conocido, conservadoramente asumir cerrado
    return false;
  });
};

export const parseOpeningHours = (openingHours: string | null) => {
  if (!openingHours) return '';
  return openingHours.replace('-', ' a ');
};
