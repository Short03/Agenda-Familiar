import type { SpecialDay } from './types'

const MONDAY = 1
const SUNDAY = 0

/**
 * Special days in Mexico.
 * - "oficial": mandatory rest days (Ley Federal del Trabajo, art. 74).
 * - "civica": civic commemorations without a day off.
 * - "tradicion": cultural and religious traditions.
 * Ids are stable on purpose: preferences reference them.
 */
export const MEXICAN_SPECIAL_DAYS: readonly SpecialDay[] = [
  // Descanso oficial (LFT art. 74)
  {
    id: 'mx-new-year',
    name: 'Año Nuevo',
    category: 'oficial',
    rule: { kind: 'fixed', month: 1, day: 1 },
  },
  {
    id: 'mx-constitution-day',
    name: 'Día de la Constitución',
    category: 'oficial',
    rule: { kind: 'nthWeekday', month: 2, weekday: MONDAY, n: 1 },
  },
  {
    id: 'mx-benito-juarez',
    name: 'Natalicio de Benito Juárez',
    category: 'oficial',
    rule: { kind: 'nthWeekday', month: 3, weekday: MONDAY, n: 3 },
  },
  {
    id: 'mx-labor-day',
    name: 'Día del Trabajo',
    category: 'oficial',
    rule: { kind: 'fixed', month: 5, day: 1 },
  },
  {
    id: 'mx-independence-day',
    name: 'Día de la Independencia',
    category: 'oficial',
    rule: { kind: 'fixed', month: 9, day: 16 },
  },
  {
    id: 'mx-transfer-of-power',
    name: 'Transmisión del Poder Ejecutivo',
    category: 'oficial',
    rule: { kind: 'everyNYears', month: 10, day: 1, interval: 6, anchorYear: 2024 },
  },
  {
    id: 'mx-revolution-day',
    name: 'Día de la Revolución',
    category: 'oficial',
    rule: { kind: 'nthWeekday', month: 11, weekday: MONDAY, n: 3 },
  },
  {
    id: 'mx-christmas',
    name: 'Navidad',
    category: 'oficial',
    rule: { kind: 'fixed', month: 12, day: 25 },
  },

  // Cívicas
  {
    id: 'mx-flag-day',
    name: 'Día de la Bandera',
    category: 'civica',
    rule: { kind: 'fixed', month: 2, day: 24 },
  },
  {
    id: 'mx-oil-expropriation',
    name: 'Expropiación Petrolera',
    category: 'civica',
    rule: { kind: 'fixed', month: 3, day: 18 },
  },
  {
    id: 'mx-battle-of-puebla',
    name: 'Batalla de Puebla',
    category: 'civica',
    rule: { kind: 'fixed', month: 5, day: 5 },
  },
  {
    id: 'mx-ninos-heroes',
    name: 'Niños Héroes',
    category: 'civica',
    rule: { kind: 'fixed', month: 9, day: 13 },
  },
  {
    id: 'mx-grito',
    name: 'Grito de Independencia',
    category: 'civica',
    rule: { kind: 'fixed', month: 9, day: 15 },
  },
  {
    id: 'mx-cultural-diversity',
    name: 'Día de la Diversidad Cultural',
    category: 'civica',
    rule: { kind: 'fixed', month: 10, day: 12 },
  },

  // Tradiciones
  {
    id: 'mx-reyes',
    name: 'Día de Reyes',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 1, day: 6 },
  },
  {
    id: 'mx-candelaria',
    name: 'Día de la Candelaria',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 2, day: 2 },
  },
  {
    id: 'mx-valentines',
    name: 'Día del Amor y la Amistad',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 2, day: 14 },
  },
  {
    id: 'mx-holy-thursday',
    name: 'Jueves Santo',
    category: 'tradicion',
    rule: { kind: 'easterOffset', days: -3 },
  },
  {
    id: 'mx-good-friday',
    name: 'Viernes Santo',
    category: 'tradicion',
    rule: { kind: 'easterOffset', days: -2 },
  },
  {
    id: 'mx-childrens-day',
    name: 'Día del Niño',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 4, day: 30 },
  },
  {
    id: 'mx-mothers-day',
    name: 'Día de las Madres',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 5, day: 10 },
  },
  {
    id: 'mx-teachers-day',
    name: 'Día del Maestro',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 5, day: 15 },
  },
  {
    id: 'mx-fathers-day',
    name: 'Día del Padre',
    category: 'tradicion',
    rule: { kind: 'nthWeekday', month: 6, weekday: SUNDAY, n: 3 },
  },
  {
    id: 'mx-grandparents-day',
    name: 'Día del Abuelo',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 8, day: 28 },
  },
  {
    id: 'mx-all-saints',
    name: 'Día de Todos los Santos',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 11, day: 1 },
  },
  {
    id: 'mx-day-of-the-dead',
    name: 'Día de Muertos',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 11, day: 2 },
  },
  {
    id: 'mx-guadalupe',
    name: 'Día de la Virgen de Guadalupe',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 12, day: 12 },
  },
  {
    id: 'mx-posadas',
    name: 'Inician las Posadas',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 12, day: 16 },
  },
  {
    id: 'mx-christmas-eve',
    name: 'Nochebuena',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 12, day: 24 },
  },
  {
    id: 'mx-holy-innocents',
    name: 'Día de los Santos Inocentes',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 12, day: 28 },
  },
  {
    id: 'mx-new-years-eve',
    name: 'Fin de Año',
    category: 'tradicion',
    rule: { kind: 'fixed', month: 12, day: 31 },
  },
]
