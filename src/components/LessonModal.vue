<script setup>
import { ref, reactive, watch, computed } from 'vue'
import {
  X,
  Pencil,
  Trash2,
  ImagePlus,
  Loader2,
  Check,
  AlarmClockCheck,
  PenLine,
  FlaskConical,
  User
} from 'lucide-vue-next'
import { formatDayMonth } from '../utils/dateHelpers.js'
import { uploadImagesToImgBB } from '../lib/imgbb.js'
import { saveHomework, deleteHomework } from '../lib/supabase.js'
import SuccessModal from './SuccessModal.vue'

const props = defineProps({
  date: { type: Date, required: true },
  lesson: { type: Object, required: true },
  homework: { type: Object, default: null },
  currentUserName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved', 'deleted', 'open-lightbox'])

const isEditing = ref(!props.homework)
const isSaving = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')
const pendingFiles = ref([])
const showSuccess = ref(false)

const form = reactive({
  description: props.homework?.description || '',
  is_control: props.homework?.is_control || false,
  is_independent: props.homework?.is_independent || false,
  is_practical: props.homework?.is_practical || false,
  is_lab: props.homework?.is_lab || false,
  attachments: [...(props.homework?.attachments || [])]
})

watch(
  () => props.homework,
  (hw) => {
    form.description = hw?.description || ''
    form.is_control = hw?.is_control || false
    form.is_independent = hw?.is_independent || false
    form.is_practical = hw?.is_practical || false
    form.is_lab = hw?.is_lab || false
    form.attachments = [...(hw?.attachments || [])]
  }
)

const hasHomework = computed(() => !!props.homework)

function onFilesSelected(e) {
  const files = Array.from(e.target.files || [])
  pendingFiles.value.push(...files)
  e.target.value = ''
}

function removePendingFile(idx) {
  pendingFiles.value.splice(idx, 1)
}

function removeExistingAttachment(idx) {
  form.attachments.splice(idx, 1)
}

async function handleSave() {
  errorMessage.value = ''
  isSaving.value = true
  try {
    let newUrls = []
    const hadNewFiles = pendingFiles.value.length > 0
    if (hadNewFiles) {
      isUploading.value = true
      newUrls = await uploadImagesToImgBB(pendingFiles.value)
      isUploading.value = false
    }

    const record = {
      id: props.homework?.id,
      lesson_date: dateISO(props.date),
      subject_name: props.lesson.subject,
      description: form.description,
      is_control: form.is_control,
      is_independent: form.is_independent,
      is_practical: form.is_practical,
      is_lab: form.is_lab,
      attachments: [...form.attachments, ...newUrls],
      added_by: props.currentUserName || props.homework?.added_by || null
    }

    const saved = await saveHomework(record)
    pendingFiles.value = []
    isEditing.value = false
    emit('saved', saved)

    // Якщо додавали нові фото-вкладення — показуємо підтвердження,
    // після якого сторінка оновлюється, щоб усе точно підвантажилось коректно.
    if (hadNewFiles && newUrls.length > 0) {
      showSuccess.value = true
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message || 'Не вдалося зберегти дані. Спробуйте ще раз.'
  } finally {
    isSaving.value = false
    isUploading.value = false
  }
}

function handleSuccessConfirm() {
  window.location.reload()
}

async function handleDelete() {
  if (!props.homework?.id) return
  if (!confirm('Видалити це домашнє завдання?')) return
  isSaving.value = true
  try {
    await deleteHomework(props.homework.id)
    emit('deleted', props.homework.id)
    emit('close')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Не вдалося видалити запис.'
  } finally {
    isSaving.value = false
  }
}

function dateISO(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function openLightboxAt(idx) {
  emit('open-lightbox', { images: form.attachments, index: idx })
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
            class="glass-panel w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <!-- Заголовок -->
            <div
              class="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10"
            >
              <div class="min-w-0">
                <h2 class="text-base font-semibold truncate">{{ lesson.subject }}</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDayMonth(date) }} · {{ lesson.time }}
                </p>
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
              <template v-if="!isEditing">
                <div v-if="hasHomework">
                  <div class="flex flex-wrap gap-1.5 mb-3">
                    <span
                      v-if="homework.is_control"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-500"
                    >
                      <AlarmClockCheck :size="12" /> Контрольна робота
                    </span>
                    <span
                      v-if="homework.is_independent"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    >
                      <PenLine :size="12" /> Самостійна робота
                    </span>
                    <span
                      v-if="homework.is_practical"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    >
                      <FlaskConical :size="12" /> Практична робота
                    </span>
                    <span
                      v-if="homework.is_lab"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    >
                      <FlaskConical :size="12" /> Лабораторна робота
                    </span>
                  </div>

                  <p class="text-sm whitespace-pre-wrap leading-relaxed">
                    {{ homework.description || 'Опис не додано.' }}
                  </p>

                  <p
                    v-if="homework.added_by"
                    class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-3"
                  >
                    <User :size="12" /> Додав(ла): {{ homework.added_by }}
                  </p>

                  <div
                    v-if="homework.attachments?.length"
                    class="grid grid-cols-3 gap-2 mt-4"
                  >
                    <button
                      v-for="(url, idx) in homework.attachments"
                      :key="url"
                      class="aspect-square rounded-lg overflow-hidden tap-scale bg-black/5"
                      @click="openLightboxAt(idx)"
                    >
                      <img :src="url" class="w-full h-full object-cover" alt="Вкладення" />
                    </button>
                  </div>
                </div>

                <p v-else class="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                  Домашнє завдання ще не додано.
                </p>
              </template>

              <!-- Режим редагування -->
              <template v-else>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Текст завдання
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Наприклад: § 12, вправи 3-5"
                  class="w-full rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50 resize-none placeholder:text-gray-400"
                ></textarea>

                <div class="flex flex-col gap-2 mt-4">
                  <label class="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="form.is_independent"
                      class="w-4 h-4 rounded accent-accent"
                    />
                    Самостійна робота
                  </label>
                  <label class="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="form.is_practical"
                      class="w-4 h-4 rounded accent-accent"
                    />
                    Практична робота
                  </label>
                  <label class="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="form.is_lab"
                      class="w-4 h-4 rounded accent-accent"
                    />
                    Лабораторна робота
                  </label>
                  <label class="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      v-model="form.is_control"
                      class="w-4 h-4 rounded accent-accent"
                    />
                    Контрольна робота
                  </label>
                </div>

                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mt-4 mb-1.5">
                  Фото
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="(url, idx) in form.attachments"
                    :key="'existing-' + url"
                    class="relative aspect-square rounded-lg overflow-hidden bg-black/5 group"
                  >
                    <img :src="url" class="w-full h-full object-cover" alt="Вкладення" />
                    <button
                      class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                      @click="removeExistingAttachment(idx)"
                    >
                      <X :size="11" />
                    </button>
                  </div>

                  <div
                    v-for="(file, idx) in pendingFiles"
                    :key="'pending-' + idx"
                    class="relative aspect-square rounded-lg overflow-hidden bg-black/5"
                  >
                    <img :src="URL.createObjectURL(file)" class="w-full h-full object-cover opacity-80" alt="Нове фото" />
                    <button
                      class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                      @click="removePendingFile(idx)"
                    >
                      <X :size="11" />
                    </button>
                  </div>

                  <label
                    class="aspect-square rounded-lg border-2 border-dashed border-black/10 dark:border-white/15 flex items-center justify-center cursor-pointer text-gray-400 hover:text-accent hover:border-accent/40 transition-colors"
                  >
                    <ImagePlus :size="20" />
                    <input type="file" accept="image/*" multiple class="hidden" @change="onFilesSelected" />
                  </label>
                </div>

                <p v-if="errorMessage" class="text-xs text-red-500 mt-3">{{ errorMessage }}</p>
              </template>
            </div>

            <!-- Дії -->
            <div class="px-5 py-4 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
              <template v-if="!isEditing">
                <button
                  class="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent text-white text-sm font-medium py-2.5 tap-scale"
                  @click="isEditing = true"
                >
                  <Pencil :size="15" /> Редагувати
                </button>
              </template>
              <template v-else>
                <button
                  v-if="hasHomework"
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
                  {{ isUploading ? 'Завантаження фото…' : 'Зберегти' }}
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <SuccessModal
      v-if="showSuccess"
      message="Вкладення успішно додано!"
      @confirm="handleSuccessConfirm"
    />
  </Teleport>
</template>
