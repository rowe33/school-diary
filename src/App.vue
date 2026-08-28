<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Header from './components/Header.vue'
import ScheduleTable from './components/ScheduleTable.vue'
import LessonModal from './components/LessonModal.vue'
import ImageLightbox from './components/ImageLightbox.vue'
import AiAssistant from './components/AiAssistant.vue'
import UserNameModal from './components/UserNameModal.vue'
import { fetchHomeworkForRange } from './lib/supabase.js'
import { SCHOOL_YEAR_START, SCHOOL_YEAR_END } from './config/academicYear.js'
import { QUARTERS, getQuarterForDate } from './config/schedule.js'
import {
  getMondayOfWeek,
  getWeekDates,
  addWeeks,
  formatWeekRangeLabel,
  toISODate
} from './utils/dateHelpers.js'

const USER_NAME_KEY = 'school_diary_user_name'

// ── Межі навчального року (гортати розклад за їх межі не можна) ──
const earliestMonday = getMondayOfWeek(new Date(SCHOOL_YEAR_START))
const latestMonday = getMondayOfWeek(new Date(SCHOOL_YEAR_END))

function clampMonday(monday) {
  if (monday.getTime() < earliestMonday.getTime()) return new Date(earliestMonday)
  if (monday.getTime() > latestMonday.getTime()) return new Date(latestMonday)
  return monday
}

const isDark = ref(false)
const currentMonday = ref(clampMonday(getMondayOfWeek(new Date())))
const homeworkByKey = reactive({})
const isLoading = ref(false)
const loadError = ref('')

const activeLesson = ref(null) // { date, lesson, homework }
const lightbox = ref(null) // { images, index }

// ── Профіль користувача (імʼя, без справжньої авторизації) ──
const userName = ref('')
const nameModalMode = ref('first-visit') // 'first-visit' | 'edit'
const showNameModal = ref(false)

const weekLabel = computed(() => formatWeekRangeLabel(currentMonday.value))
const isCurrentWeek = computed(
  () => toISODate(currentMonday.value) === toISODate(getMondayOfWeek(new Date()))
)
const canGoPrev = computed(() => currentMonday.value.getTime() > earliestMonday.getTime())
const canGoNext = computed(() => currentMonday.value.getTime() < latestMonday.getTime())

const quarterOptions = computed(() => QUARTERS.map((q) => ({ id: q.id, name: q.name })))
const selectedQuarterId = computed(() => getQuarterForDate(currentMonday.value)?.id || '')

const homeworkListForWeek = computed(() => Object.values(homeworkByKey))

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function goPrevWeek() {
  currentMonday.value = clampMonday(addWeeks(currentMonday.value, -1))
}
function goNextWeek() {
  currentMonday.value = clampMonday(addWeeks(currentMonday.value, 1))
}
function goToday() {
  currentMonday.value = clampMonday(getMondayOfWeek(new Date()))
}
function jumpToDate(dateStr) {
  currentMonday.value = clampMonday(getMondayOfWeek(new Date(dateStr)))
}
function selectQuarter(quarterId) {
  const q = QUARTERS.find((item) => item.id === quarterId)
  if (!q) return
  currentMonday.value = clampMonday(getMondayOfWeek(new Date(q.start)))
}

async function loadHomeworkForCurrentWeek() {
  isLoading.value = true
  loadError.value = ''
  const dates = getWeekDates(currentMonday.value)
  const start = toISODate(dates[0])
  const end = toISODate(dates[dates.length - 1])

  try {
    const records = await fetchHomeworkForRange(start, end)
    // Очищуємо старі записи цього тижня та наповнюємо новими
    Object.keys(homeworkByKey).forEach((k) => delete homeworkByKey[k])
    records.forEach((rec) => {
      const key = `${rec.lesson_date}__${rec.subject_name}`
      homeworkByKey[key] = rec
    })
  } catch (err) {
    console.error(err)
    loadError.value =
      'Не вдалося завантажити домашні завдання. Перевірте налаштування Supabase (.env).'
  } finally {
    isLoading.value = false
  }
}

function openLesson({ date, lesson, homework }) {
  activeLesson.value = { date, lesson, homework }
}

function closeLesson() {
  activeLesson.value = null
}

function onSaved(record) {
  const key = `${record.lesson_date}__${record.subject_name}`
  homeworkByKey[key] = record
  closeLesson()
}

function onDeleted(id) {
  const key = Object.keys(homeworkByKey).find((k) => homeworkByKey[k].id === id)
  if (key) delete homeworkByKey[key]
}

function openLightbox({ images, index }) {
  lightbox.value = { images, index }
}
function closeLightbox() {
  lightbox.value = null
}
function updateLightboxIndex(idx) {
  if (lightbox.value) lightbox.value.index = idx
}

function openEditName() {
  nameModalMode.value = 'edit'
  showNameModal.value = true
}
function onNameSave(name) {
  userName.value = name
  localStorage.setItem(USER_NAME_KEY, name)
  showNameModal.value = false
}
function onNameModalClose() {
  // Закрити можна лише в режимі редагування (перший вхід вимагає імʼя)
  if (nameModalMode.value === 'edit') showNameModal.value = false
}

watch(currentMonday, loadHomeworkForCurrentWeek)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme()
  loadHomeworkForCurrentWeek()

  const savedName = localStorage.getItem(USER_NAME_KEY)
  if (savedName) {
    userName.value = savedName
  } else {
    nameModalMode.value = 'first-visit'
    showNameModal.value = true
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header
      :week-label="weekLabel"
      :is-dark="isDark"
      :is-current-week="isCurrentWeek"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :jump-value="toISODate(currentMonday)"
      :min-date="SCHOOL_YEAR_START"
      :max-date="SCHOOL_YEAR_END"
      :quarter-options="quarterOptions"
      :selected-quarter-id="selectedQuarterId"
      :user-name="userName"
      @prev-week="goPrevWeek"
      @next-week="goNextWeek"
      @toggle-theme="toggleTheme"
      @go-today="goToday"
      @jump-to-date="jumpToDate"
      @select-quarter="selectQuarter"
      @edit-name="openEditName"
    />

    <main class="flex-1">
      <p
        v-if="loadError"
        class="mx-4 sm:mx-6 mb-2 text-xs text-red-500 bg-red-500/10 rounded-xl px-3 py-2"
      >
        {{ loadError }}
      </p>
      <p
        v-else-if="isLoading"
        class="mx-4 sm:mx-6 mb-2 text-xs text-gray-400"
      >
        Завантаження…
      </p>

      <ScheduleTable
        :monday="currentMonday"
        :homework-by-key="homeworkByKey"
        @open-lesson="openLesson"
      />
    </main>

    <AiAssistant :week-label="weekLabel" :homework-items="homeworkListForWeek" />

    <LessonModal
      v-if="activeLesson"
      :date="activeLesson.date"
      :lesson="activeLesson.lesson"
      :homework="activeLesson.homework"
      :current-user-name="userName"
      @close="closeLesson"
      @saved="onSaved"
      @deleted="onDeleted"
      @open-lightbox="openLightbox"
    />

    <ImageLightbox
      v-if="lightbox"
      :images="lightbox.images"
      :index="lightbox.index"
      @close="closeLightbox"
      @update:index="updateLightboxIndex"
    />

    <UserNameModal
      v-if="showNameModal"
      :mode="nameModalMode"
      :initial-name="userName"
      @save="onNameSave"
      @close="onNameModalClose"
    />
  </div>
</template>
