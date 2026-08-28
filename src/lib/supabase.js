import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Змінні середовища VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY не задані. Перевірте файл .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const TABLE = 'homework_logs'

/**
 * Отримати всі записи ДЗ для діапазону дат (YYYY-MM-DD, включно).
 */
export async function fetchHomeworkForRange(startDate, endDate) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .gte('lesson_date', startDate)
    .lte('lesson_date', endDate)
    .order('lesson_date', { ascending: true })

  if (error) {
    console.error('[Supabase] Помилка завантаження ДЗ:', error)
    throw error
  }
  return data || []
}

/**
 * Створити або оновити запис ДЗ (upsert за унікальною парою дата+предмет).
 */
export async function saveHomework(record) {
  const payload = {
    lesson_date: record.lesson_date,
    subject_name: record.subject_name,
    description: record.description ?? '',
    is_control: !!record.is_control,
    is_independent: !!record.is_independent,
    is_practical: !!record.is_practical,
    is_lab: !!record.is_lab,
    attachments: record.attachments ?? [],
    added_by: record.added_by ?? null
  }

  if (record.id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', record.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Видалити запис ДЗ за id.
 */
export async function deleteHomework(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

const NOTES_TABLE = 'day_notes'

/**
 * Отримати всі коментарі до днів для діапазону дат (YYYY-MM-DD, включно).
 */
export async function fetchDayNotesForRange(startDate, endDate) {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .gte('note_date', startDate)
    .lte('note_date', endDate)

  if (error) {
    console.error('[Supabase] Помилка завантаження коментарів до днів:', error)
    throw error
  }
  return data || []
}

/**
 * Створити або оновити коментар до дня (унікальний за датою note_date).
 */
export async function saveDayNote(record) {
  const payload = {
    note_date: record.note_date,
    comment: record.comment,
    added_by: record.added_by ?? null
  }

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .upsert(payload, { onConflict: 'note_date' })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Видалити коментар до дня за id.
 */
export async function deleteDayNote(id) {
  const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', id)
  if (error) throw error
}
