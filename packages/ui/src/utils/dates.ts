import { DAYS_OF_WEEK } from '../constants/date';
import { clearAccents } from './strings';
import { HourEntry, parseBusinessHours, parseOpeningHours } from './hours';

export const getOpenDaysDeprecated = (
  closedOn: string | null,
  locale: 'es' | 'en' | undefined = 'es'
) => {
  const DAYS = DAYS_OF_WEEK[locale];

  // Special cases
  if (!closedOn) return 'Todos los días';
  if (clearAccents(closedOn.toLowerCase()) === 'open all days')
    return 'Todos los días';

  // Get open days
  const closedDays = closedOn
    .split(',')
    .map((day) => clearAccents(day.trim().toLowerCase()));

  const openDays = DAYS.filter((day) => !closedDays.includes(day));

  // More special cases
  if (!openDays || openDays.length === 0) return null;
  if (openDays.length === 7) return 'Todos los días';

  if (openDays.length === 1) {
    // @ts-expect-error - openDays is not undefined
    return openDays[0]?.charAt(0).toUpperCase() + openDays[0]?.slice(1);
  }

  // Helper to check if two days are consecutive (including wrap-around)
  const areConsecutive = (day1: string, day2: string) => {
    const idx1 = DAYS.indexOf(day1);
    const idx2 = DAYS.indexOf(day2);
    return idx2 === (idx1 + 1) % 7;
  };

  // Double the array to handle wrap-around cases easily
  const doubledOpenDays = [...openDays, ...openDays];
  let maxSeqStart = 0;
  let maxSeqLength = 0;

  // Find the longest sequence
  for (let i = 0; i < openDays.length; i++) {
    let seqLength = 1;
    let j = i;
    while (
      j < doubledOpenDays.length - 1 &&
      // @ts-expect-error - doubledOpenDays is not undefined
      areConsecutive(doubledOpenDays[j], doubledOpenDays[j + 1])
    ) {
      seqLength++;
      j++;
    }
    if (seqLength > maxSeqLength) {
      maxSeqLength = seqLength;
      maxSeqStart = i;
    }
  }

  // Extract the main sequence
  const mainSeq = openDays.slice(maxSeqStart, maxSeqStart + maxSeqLength);
  const remainingDays = openDays.filter((day) => !mainSeq.includes(day));

  // Format the result
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  let result = '';
  if (mainSeq.length > 1) {
    // @ts-expect-error - mainSeq is not undefined
    result = `${capitalize(mainSeq[0])} a ${capitalize(mainSeq[mainSeq.length - 1])}`;
  } else if (mainSeq.length === 1) {
    // @ts-expect-error - mainSeq is not undefined
    result = capitalize(mainSeq[0]);
  }

  if (remainingDays.length > 0) {
    const remainingFormatted = remainingDays.map(capitalize).join(' y ');
    result = result ? `${result} y ${remainingFormatted}` : remainingFormatted;
  }

  return result;
};

export const getOpenDays = (
  closedOn: string | null,
  openingHours: string | null,
  hours: HourEntry[] | null | undefined
) => {
  if (!closedOn || closedOn.toLowerCase() === 'open all days') {
    const openingHoursFormatted = parseOpeningHours(openingHours);
    return [
      `Todos los dias ${openingHoursFormatted ? `de ${openingHoursFormatted}` : ''}`,
    ];
  }
  if (hours) {
    return parseBusinessHours(hours);
  }
  return [];
};
