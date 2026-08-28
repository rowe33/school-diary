// Конфігурація навчального року: канікули та державні/важливі свята.
// Дати у форматі 'YYYY-MM-DD'. Рік можна змінювати вручну під поточний навчальний рік.

// Межі навчального року. Гортати розклад за ці межі не можна —
// застосунок обмежує навігацію по тижнях цим діапазоном.
export const SCHOOL_YEAR_START = '2026-08-31'
export const SCHOOL_YEAR_END = '2027-08-31'

export const VACATIONS = [
  {
    id: 'autumn',
    name: 'Осінні канікули',
    emoji: '🍂',
    start: '2026-10-24',
    end: '2026-11-01'
  },
  {
    id: 'winter',
    name: 'Зимові канікули',
    emoji: '❄️',
    start: '2026-12-24',
    end: '2027-01-10'
  },
  {
    id: 'spring',
    name: 'Весняні канікули',
    emoji: '🌷',
    start: '2027-03-20',
    end: '2027-03-28'
  },
  {
    id: 'summer',
    name: 'Літні канікули',
    emoji: '☀️',
    start: '2027-06-01',
    end: '2027-08-31'
  }
]

// Державні та важливі памʼятні дати. Кожна дата підсвічується в таблиці розкладу.
export const HOLIDAYS = [
  { date: '2026-10-01', name: 'День Козацтва / Покрова', emoji: '⚔️' },
  { date: '2026-12-19', name: 'День Святого Миколая', emoji: '🎅' },
  { date: '2026-12-25', name: 'Різдво Христове', emoji: '🎄' },
  { date: '2027-01-01', name: 'Новий Рік', emoji: '🎆' },
  { date: '2027-01-07', name: 'Різдво (за юліанським календарем)', emoji: '⭐' },
  { date: '2027-03-08', name: 'Міжнародний жіночий день', emoji: '🌷' },
  { date: '2027-05-18', name: 'День Вишиванки', emoji: '🧵' },
  { date: '2027-05-09', name: 'День Перемоги над нацизмом у Другій світовій війні', emoji: '🕊️' },
  { date: '2027-06-28', name: 'День Конституції України', emoji: '📜' }
]

/**
 * Перевіряє, чи дата (Date) потрапляє у діапазон канікул.
 * Повертає обʼєкт канікул або null.
 */
export function getVacationForDate(date) {
  const iso = toISODate(date)
  return (
    VACATIONS.find((vac) => iso >= vac.start && iso <= vac.end) || null
  )
}

/**
 * Перевіряє, чи дата збігається зі святом.
 * Повертає обʼєкт свята або null.
 */
export function getHolidayForDate(date) {
  const iso = toISODate(date)
  return HOLIDAYS.find((h) => h.date === iso) || null
}

export function toISODate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
