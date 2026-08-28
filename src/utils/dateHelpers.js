import { toISODate } from '../config/academicYear.js'

/**
 * Повертає дату понеділка тижня, до якого належить передана дата.
 */
export function getMondayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = неділя, 1 = понеділок ... 6 = субота
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Повертає масив із 5 дат (Пн–Пт) для тижня, що починається з monday.
 */
export function getWeekDates(monday) {
  const dates = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

/**
 * Додає (або віднімає) вказану кількість тижнів до дати.
 */
export function addWeeks(date, weeks) {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

const MONTHS_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня'
]

/**
 * Форматує дату у вигляді "24 жовтня".
 */
export function formatDayMonth(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`
}

/**
 * Форматує діапазон тижня у вигляді "24 жовтня – 28 жовтня 2026".
 */
export function formatWeekRangeLabel(monday) {
  const dates = getWeekDates(monday)
  const first = dates[0]
  const last = dates[dates.length - 1]
  return `${formatDayMonth(first)} – ${formatDayMonth(last)} ${last.getFullYear()}`
}

export function isSameDay(a, b) {
  return toISODate(a) === toISODate(b)
}

export function isToday(date) {
  return isSameDay(date, new Date())
}

export { toISODate }
