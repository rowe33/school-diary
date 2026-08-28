<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { X, Pencil, Trash2, Loader2, Check, User, MessageSquare } from 'lucide-vue-next'
import { formatDayMonth } from '../utils/dateHelpers.js'
import { saveDayNote, deleteDayNote } from '../lib/supabase.js'

const props = defineProps({
  date: { type: Date, required: true },
  note: { type: Object, default: null },
  currentUserName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved', 'deleted'])

const isEditing = ref(!props.note)
const isSaving = ref(false)
const errorMessage = ref('')

const form = reactive({
  comment: props.note?.comment || ''
})

watch(
  () => props.note,
  (n) => {
    form.comment = n?.comment || ''
  }
)

const hasNote = computed(() => !!props.note)

function dateISO(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function handleSave() {
  errorMessage.value = ''
  const trimmed = form.comment.trim()
  if (!trimmed) {
    errorMessage.value = 'Введіть текст коментаря.'
    return
  }

  isSaving.value = true
  try {
    const saved = await saveDayNote({
      note_date: dateISO(props.date),
      comment: trimmed,
      added_by: props.currentUserName || props.note?.added_by || null
    })
    emit('saved', saved)
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Не вдалося зберегти коментар. Спробуйте ще раз.'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (!props.note?.id) return
  if (!confirm('Видалити цей коментар до дня?')) return
  isSaving.value = true
  try {
    await deleteDayNote(props.note.id)
    emit('deleted', props.note.id)
    emit('close')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Не вдалося видалити коментар.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
        @click.self="emit('close')"
      >
        <Transition name="modal-scale" appear>
          <div
            class="glass-panel w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden"
          >
            <!-- Заголовок -->
            <div
              class="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10"
            >
              <div class="min-w-0 flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0"
                >
                  <MessageSquare :size="15" />
                </div>
                <div>
                  <h2 class="text-base font-semibold">Коментар до дня</h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDayMonth(date) }}</p>
                </div>
              </div>
              <button
                class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-scale shrink-0"
                @click="emit('close')"
                aria-label="Закрити"
              >
                <X :size="16" />
              </button>
            </div>

            <!-- Вміст -->
            <div class="px-5 py-4 overflow-y-auto flex-1">
              <!-- Режим перегляду -->
              <template v-if="!isEditing && hasNote">
                <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ note.comment }}</p>
                <p
                  v-if="note.added_by"
                  class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-3"
                >
                  <User :size="12" /> Додав(ла): {{ note.added_by }}
                </p>
              </template>

              <!-- Режим редагування -->
              <template v-else>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Текст коментаря
                </label>
                <textarea
                  v-model="form.comment"
                  rows="4"
                  placeholder="Наприклад: Приходити тільки у вишиванках"
                  class="w-full rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none placeholder:text-gray-400"
                ></textarea>
                <p v-if="errorMessage" class="text-xs text-red-500 mt-3">{{ errorMessage }}</p>
              </template>
            </div>

            <!-- Дії -->
            <div class="px-5 py-4 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
              <template v-if="!isEditing && hasNote">
                <button
                  class="flex items-center justify-center w-11 h-11 rounded-xl bg-red-500/10 text-red-500 tap-scale shrink-0"
                  @click="handleDelete"
                  :disabled="isSaving"
                  aria-label="Видалити"
                >
                  <Trash2 :size="17" />
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent text-white text-sm font-medium py-2.5 tap-scale"
                  @click="isEditing = true"
                >
                  <Pencil :size="15" /> Редагувати
                </button>
              </template>
              <template v-else>
                <button
                  v-if="hasNote"
                  class="flex items-center justify-center w-11 h-11 rounded-xl bg-red-500/10 text-red-500 tap-scale shrink-0"
                  @click="handleDelete"
                  :disabled="isSaving"
                  aria-label="Видалити"
                >
                  <Trash2 :size="17" />
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent text-white text-sm font-medium py-2.5 tap-scale disabled:opacity-60"
                  @click="handleSave"
                  :disabled="isSaving"
                >
                  <Loader2 v-if="isSaving" :size="15" class="animate-spin" />
                  <Check v-else :size="15" />
                  Зберегти
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
