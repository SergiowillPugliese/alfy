export const MEASUREMENT_UNITS = {
  PIECES: 'pz',
  GRAMS: 'g',
  HECTOGRAMS: 'hg',
  KILOGRAMS: 'kg',
  MILLILITERS: 'ml',
  CENTILITERS: 'cl',
  LITERS: 'l',
} as const;

export const MEASUREMENT_UNITS_ARRAY = Object.values(MEASUREMENT_UNITS);

export type MeasurementUnit = typeof MEASUREMENT_UNITS[keyof typeof MEASUREMENT_UNITS];

export const MEASUREMENT_UNITS_LABELS = {
  [MEASUREMENT_UNITS.PIECES]: 'Pezzi',
  [MEASUREMENT_UNITS.GRAMS]: 'Grammi',
  [MEASUREMENT_UNITS.HECTOGRAMS]: 'Ettogrammi',
  [MEASUREMENT_UNITS.KILOGRAMS]: 'Chilogrammi',
  [MEASUREMENT_UNITS.MILLILITERS]: 'Millilitri',
  [MEASUREMENT_UNITS.CENTILITERS]: 'Centilitri',
  [MEASUREMENT_UNITS.LITERS]: 'Litri',
} as const;
