const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
// Модель Gemini. gemini-1.5-flash знято з підтримки — використовуємо актуальну
// швидку модель. Якщо Google випустить новішу, змініть значення тут.
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const RATE_LIMIT_KEY = 'ai_assistant_rate_limit'
const MAX_REQUESTS_PER_HOUR = 12
const HOUR_MS = 60 * 60 * 1000

const OFF_TOPIC_REPLY =
  'Я ваш шкільний асистент і можу допомагати лише з розкладом та домашніми завданнями.'

const SYSTEM_PROMPT = `Ти — шкільний асистент учня. Відповідай ВИКЛЮЧНО українською мовою, коротко та по суті.

СУВОРІ ПРАВИЛА:
1. Тобі заборонено розв'язувати домашні завдання: не пиши твори, есе, перекази, не розв'язуй рівняння, приклади, задачі, не давай готових відповідей на вправи. Ти лише допомагаєш організувати навчання.
2. Ти можеш: підказати, з чого почати виконання завдання, порадити, як розподілити час між предметами, нагадати про контрольні/самостійні/практичні роботи, структурувати список завдань за пріоритетом (спочатку те, що складніше або де контрольна).
3. Якщо учень просить розв'язати задачу, написати твір або дати готову відповідь — ввічливо відмов і запропонуй допомогу лише в плануванні (наприклад: "Я не можу розв'язати це за тебе, але можу підказати, з чого почати").
4. Якщо запитання не стосується розкладу або домашніх завдань (стороння тема) — відповідай рівно так: "${OFF_TOPIC_REPLY}"
5. Будь доброзичливим, стислим (2-5 речень), без зайвої води.`

/**
 * Перевіряє та оновлює локальний rate-limit (не більше MAX_REQUESTS_PER_HOUR запитів на годину).
 * Повертає { allowed: boolean, remaining: number, resetInMs: number }
 */
export function checkRateLimit() {
  const now = Date.now()
  let state = { count: 0, windowStart: now }

  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    if (raw) state = JSON.parse(raw)
  } catch {
    // ігноруємо пошкоджені дані
  }

  if (now - state.windowStart > HOUR_MS) {
    state = { count: 0, windowStart: now }
  }

  const allowed = state.count < MAX_REQUESTS_PER_HOUR
  const remaining = Math.max(0, MAX_REQUESTS_PER_HOUR - state.count)
  const resetInMs = HOUR_MS - (now - state.windowStart)

  return { allowed, remaining, resetInMs, state }
}

function registerRequest(state) {
  const now = Date.now()
  const updated =
    now - state.windowStart > HOUR_MS
      ? { count: 1, windowStart: now }
      : { count: state.count + 1, windowStart: state.windowStart }
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(updated))
}

/**
 * Формує контекстний блок з поточним розкладом та ДЗ для передачі в промпт.
 */
function buildContextBlock(context) {
  if (!context) return ''
  const { weekLabel, homeworkItems } = context

  const lines = []
  lines.push(`Поточний тиждень: ${weekLabel || 'невідомо'}.`)

  if (homeworkItems && homeworkItems.length > 0) {
    lines.push('Домашні завдання на цей тиждень:')
    homeworkItems.forEach((item) => {
      const badges = []
      if (item.is_control) badges.push('КОНТРОЛЬНА')
      if (item.is_independent) badges.push('самостійна')
      if (item.is_practical) badges.push('практична')
      const badgeText = badges.length ? ` [${badges.join(', ')}]` : ''
      lines.push(
        `- ${item.lesson_date} · ${item.subject_name}${badgeText}: ${item.description || 'без опису'}`
      )
    })
  } else {
    lines.push('Домашніх завдань на цей тиждень поки не додано.')
  }

  return lines.join('\n')
}

/**
 * Надсилає запит до Gemini API з урахуванням системного промпту, контексту та rate-limit.
 * @param {string} userMessage
 * @param {{weekLabel: string, homeworkItems: Array}} context
 * @returns {Promise<string>} відповідь асистента
 */
export async function askAssistant(userMessage, context) {
  const { allowed, state, resetInMs } = checkRateLimit()

  if (!allowed) {
    const minutes = Math.ceil(resetInMs / 60000)
    return `Ви досягли ліміту запитів до асистента (${MAX_REQUESTS_PER_HOUR} на годину). Спробуйте ще раз приблизно через ${minutes} хв.`
  }

  if (!GEMINI_API_KEY) {
    return 'Відсутній ключ Gemini API (VITE_GEMINI_API_KEY). Додайте його у файл .env, щоб увімкнути асистента.'
  }

  const contextBlock = buildContextBlock(context)
  const fullPrompt = `${SYSTEM_PROMPT}\n\nКонтекст:\n${contextBlock}\n\nПитання учня: ${userMessage}`

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300
        }
      })
    })

    registerRequest(state)

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Gemini] Помилка API:', errText)
      return 'Виникла помилка під час звернення до асистента. Спробуйте пізніше.'
    }

    const json = await response.json()
    const text =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      'Не вдалося отримати відповідь від асистента.'

    return text.trim()
  } catch (err) {
    console.error('[Gemini] Мережева помилка:', err)
    return 'Не вдалося звʼязатися з асистентом. Перевірте зʼєднання з інтернетом.'
  }
}

export { MAX_REQUESTS_PER_HOUR }
