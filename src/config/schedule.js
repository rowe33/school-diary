// Розклад уроків, розбитий по чвертях.
// Кожна чверть має власний розклад (dayIndex: 0 = Понеділок ... 4 = П'ятниця).
// Якщо для чверті розклад ще не готовий — просто залиште значення `schedule: null`,
// і застосунок покаже користувачу плашку "Розклад ще не завантажено".

import { toISODate } from './academicYear.js'

export const WEEKDAYS = [
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  "П'ятниця"
]

// ─────────────────────────────────────────────────────────────
// I чверть — заповнена як приклад. Відредагуйте під свій розклад.
// ─────────────────────────────────────────────────────────────
const SCHEDULE_Q1 = {
  0: [
    { number: 1, subject: 'Українська мова', time: '08:30 – 09:15' },
    { number: 2, subject: 'Алгебра', time: '09:25 – 10:10' },
    { number: 3, subject: 'Англійська мова', time: '10:25 – 11:10' },
    { number: 4, subject: 'Історія України', time: '11:25 – 12:10' },
    { number: 5, subject: 'Фізика', time: '12:20 – 13:05' },
    { number: 6, subject: 'Фізична культура', time: '13:15 – 14:00' }
  ],
  1: [
    { number: 1, subject: 'Геометрія', time: '08:30 – 09:15' },
    { number: 2, subject: 'Українська література', time: '09:25 – 10:10' },
    { number: 3, subject: 'Біологія', time: '10:25 – 11:10' },
    { number: 4, subject: 'Хімія', time: '11:25 – 12:10' },
    { number: 5, subject: 'Англійська мова', time: '12:20 – 13:05' },
    { number: 6, subject: 'Інформатика', time: '13:15 – 14:00' }
  ],
  2: [
    { number: 1, subject: 'Алгебра', time: '08:30 – 09:15' },
    { number: 2, subject: 'Зарубіжна література', time: '09:25 – 10:10' },
    { number: 3, subject: 'Географія', time: '10:25 – 11:10' },
    { number: 4, subject: 'Українська мова', time: '11:25 – 12:10' },
    { number: 5, subject: 'Фізична культура', time: '12:20 – 13:05' },
    { number: 6, subject: 'Мистецтво', time: '13:15 – 14:00' }
  ],
  3: [
    { number: 1, subject: 'Фізика', time: '08:30 – 09:15' },
    { number: 2, subject: 'Алгебра', time: '09:25 – 10:10' },
    { number: 3, subject: 'Історія України', time: '10:25 – 11:10' },
    { number: 4, subject: 'Англійська мова', time: '11:25 – 12:10' },
    { number: 5, subject: 'Хімія', time: '12:20 – 13:05' },
    { number: 6, subject: 'Захист України', time: '13:15 – 14:00' }
  ],
  4: [
    { number: 1, subject: 'Геометрія', time: '08:30 – 09:15' },
    { number: 2, subject: 'Українська мова', time: '09:25 – 10:10' },
    { number: 3, subject: 'Біологія', time: '10:25 – 11:10' },
    { number: 4, subject: 'Всесвітня історія', time: '11:25 – 12:10' },
    { number: 5, subject: 'Інформатика', time: '12:20 – 13:05' }
  ]
}

// ─────────────────────────────────────────────────────────────
// II, III, IV чверті — поки не задані.
// Заповніть за тим самим прикладом, що й SCHEDULE_Q1, коли буде готовий розклад.
// Поки що schedule: null — застосунок покаже "Розклад ще не завантажено".
// ─────────────────────────────────────────────────────────────
const SCHEDULE_Q2 = null
const SCHEDULE_Q3 = null
const SCHEDULE_Q4 = null

// Межі чвертей узгоджені з канікулами у src/config/academicYear.js:
// між чвертями завжди йдуть канікули, тому дати не перетинаються.
export const QUARTERS = [
  { id: 'q1', name: 'I чверть', start: '2026-08-31', end: '2026-10-23', schedule: SCHEDULE_Q1 },
  { id: 'q2', name: 'II чверть', start: '2026-11-02', end: '2026-12-23', schedule: SCHEDULE_Q2 },
  { id: 'q3', name: 'III чверть', start: '2027-01-11', end: '2027-03-19', schedule: SCHEDULE_Q3 },
  { id: 'q4', name: 'IV чверть', start: '2027-03-29', end: '2027-05-31', schedule: SCHEDULE_Q4 }
]

/**
 * Повертає обʼєкт чверті, до якої належить дата, або null,
 * якщо дата не потрапляє в жодну чверть (напр. канікули).
 */
export function getQuarterForDate(date) {
  const iso = toISODate(date)
  return QUARTERS.find((q) => iso >= q.start && iso <= q.end) || null
}
