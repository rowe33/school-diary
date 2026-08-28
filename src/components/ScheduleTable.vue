<script setup>
import { computed } from 'vue'
import {
  Paperclip,
  FlaskConical,
  PenLine,
  AlarmClockCheck,
  CalendarClock,
  MessageSquare,
  MessageSquarePlus,
  User
} from 'lucide-vue-next'
import { WEEKDAYS, getQuarterForDate } from '../config/schedule.js'
import { getVacationForDate, getHolidayForDate } from '../config/academicYear.js'
import { getWeekDates, formatDayMonth, isToday, toISODate } from '../utils/dateHelpers.js'

const props = defineProps({
  monday: { type: Date, required: true },
  homeworkByKey: { type: Object, required: true }, // key: `${iso}__${subject}` -> record
  dayNotesByDate: { type: Object, required: true } // key: iso date -> record
})

const emit = defineEmits(['open-lesson', 'open-day-note'])

const weekDates = computed(() => getWeekDates(props.monday))

const vacation = computed(() => {
  // Якщо будь-який день тижня потрапляє в канікули, покажемо плашку канікул
  for (const date of weekDates.value) {
    const v = getVacationForDate(date)
    if (v) return v
  }
  return null
})

const quarter = computed(() => getQuarterForDate(weekDates.value[0]))

const scheduleMissing = computed(() => {
  if (vacation.value) return false
  return !quarter.value || !quarter.value.schedule
})

function homeworkFor(date, subject) {
  const key = `${toISODate(date)}__${subject}`
  return props.homeworkByKey[key] || null
}

function noteFor(date) {
  return props.dayNotesByDate[toISODate(date)] || null
}

function holidayFor(date) {
  return getHolidayForDate(date)
}

function dayLessons(dayIndex) {
  return quarter.value?.schedule?.[dayIndex] || []
}

function homeworkPreview(hw) {
  if (!hw) return ''
  const text = (hw.description || '').trim()
  if (!text) return 'Завдання додано'
  const MAX = 30
  return text.length > MAX ? text.slice(0, MAX).trimEnd() + '…' : text
}
</script>

<template>
  <div class="px-4 sm:px-6 pb-28">
    <!-- Плашка канікул -->
    <div
      v-if="vacation"
      class="glass-panel rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-2 mt-2"
    >
      <span class="text-4xl">{{ vacation.emoji }}</span>
      <h2 class="text-xl font-semibold">🎉 Канікули!</h2>
      <p class="text-gray-500 dark:text-gray-400">{{ vacation.name }}</p>
    </div>

    <!-- Розклад на цю чверть ще не додано -->
    <div
      v-else-if="scheduleMissing"
      class="glass-panel rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-2 mt-2"
    >
      <span class="text-4xl">
        <CalendarClock :size="40" class="text-gray-400" />
      </span>
      <h2 class="text-xl font-semibold">Розклад ще не завантажено</h2>
      <p class="text-gray-500 dark:text-gray-400">
        {{
          quarter
            ? `Розклад на ${quarter.name} поки не додано. Заповніть його у src/config/schedule.js`
            : 'Для цього тижня розклад не налаштовано.'
        }}
      </p>
    </div>

    <!-- Сітка тижня -->
    <div
      v-else
      class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      <div
        v-for="(dayName, dayIndex) in WEEKDAYS"
        :key="dayIndex"
        class="glass-panel rounded-2xl overflow-hidden flex flex-col transition-colors"
        :class="
          holidayFor(weekDates[dayIndex])
            ? 'bg-pink-500/10 dark:bg-pink-500/10 ring-1 ring-pink-400/50'
            : ''
        "
      >
        <!-- Заголовок дня -->
        <div
          class="px-4 py-3 flex items-center justify-between gap-2 border-b"
          :class="
            holidayFor(weekDates[dayIndex])
              ? 'border-pink-400/20'
              : 'border-black/5 dark:border-white/10'
          "
        >
          <div
            :class="
              !holidayFor(weekDates[dayIndex]) && isToday(weekDates[dayIndex])
                ? 'bg-accent/10 -mx-4 -my-3 px-4 py-3 rounded-none flex-1'
                : ''
            "
          >
            <p
              class="font-semibold text-sm"
              :class="{
                'text-accent': isToday(weekDates[dayIndex]) && !holidayFor(weekDates[dayIndex]),
                'text-pink-600 dark:text-pink-400': holidayFor(weekDates[dayIndex])
              }"
            >
              {{ dayName }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDayMonth(weekDates[dayIndex]) }}
            </p>
          </div>
          <div
            v-if="holidayFor(weekDates[dayIndex])"
            class="flex items-center gap-1 text-xs font-medium text-pink-600 dark:text-pink-400 max-w-[55%] text-right"
            :title="holidayFor(weekDates[dayIndex]).name"
          >
            <span>{{ holidayFor(weekDates[dayIndex]).emoji }}</span>
            <span class="truncate">{{ holidayFor(weekDates[dayIndex]).name }}</span>
          </div>
        </div>

        <!-- Уроки -->
        <div class="flex flex-col divide-y divide-black/5 dark:divide-white/10">
          <button
            v-for="lesson in dayLessons(dayIndex)"
            :key="lesson.number"
            class="tap-scale text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            @click="
              emit('open-lesson', {
                date: weekDates[dayIndex],
                lesson,
                homework: homeworkFor(weekDates[dayIndex], lesson.subject)
              })
            "
          >
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[11px] font-semibold text-gray-500 dark:text-gray-300 mt-0.5"
            >
              {{ lesson.number }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="text-sm font-medium truncate">{{ lesson.subject }}</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ lesson.time }}</p>

              <p
                v-if="homeworkFor(weekDates[dayIndex], lesson.subject)"
                class="text-xs italic text-accent/90 dark:text-accent-light truncate mt-0.5"
              >
                ДЗ: {{ homeworkPreview(homeworkFor(weekDates[dayIndex], lesson.subject)) }}
              </p>

              <div
                v-if="homeworkFor(weekDates[dayIndex], lesson.subject)"
                class="flex flex-wrap items-center gap-1.5 mt-1.5"
              >
                <span
                  v-if="homeworkFor(weekDates[dayIndex], lesson.subject).is_control"
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500"
                >
                  <AlarmClockCheck :size="11" /> Контрольна
                </span>
                <span
                  v-if="homeworkFor(weekDates[dayIndex], lesson.subject).is_independent"
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  <PenLine :size="11" /> Самостійна
                </span>
                <span
                  v-if="homeworkFor(weekDates[dayIndex], lesson.subject).is_practical"
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  <FlaskConical :size="11" /> Практична
                </span>
                <span
                  v-if="homeworkFor(weekDates[dayIndex], lesson.subject).is_lab"
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400"
                >
                  <FlaskConical :size="11" /> Лабораторна
                </span>
                <span
                  v-if="homeworkFor(weekDates[dayIndex], lesson.subject).attachments?.length"
                  class="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-accent/10 text-accent"
                >
                  <Paperclip :size="11" /> Дивитись вкладення ({{
                    homeworkFor(weekDates[dayIndex], lesson.subject).attachments.length
                  }})
                </span>
              </div>
            </div>
          </button>

          <p
            v-if="dayLessons(dayIndex).length === 0"
            class="px-4 py-6 text-center text-xs text-gray-400"
          >
            Уроків немає
          </p>
        </div>

        <!-- Коментар до дня -->
        <div class="mt-auto border-t border-black/5 dark:border-white/10 px-4 py-3">
          <template v-if="noteFor(weekDates[dayIndex])">
            <button
              class="w-full text-left tap-scale"
              @click="
                emit('open-day-note', {
                  date: weekDates[dayIndex],
                  note: noteFor(weekDates[dayIndex])
                })
              "
            >
              <p class="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                <MessageSquare :size="12" class="shrink-0 mt-0.5 text-gray-400" />
                <span class="whitespace-pre-wrap">{{ noteFor(weekDates[dayIndex]).comment }}</span>
              </p>
              <p
                v-if="noteFor(weekDates[dayIndex]).added_by"
                class="flex items-center gap-1 text-[11px] text-gray-400 mt-1 pl-[18px]"
              >
                <User :size="10" /> {{ noteFor(weekDates[dayIndex]).added_by }}
              </p>
            </button>
          </template>
          <button
            v-else
            class="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-accent transition-colors py-1 tap-scale"
            @click="emit('open-day-note', { date: weekDates[dayIndex], note: null })"
          >
            <MessageSquarePlus :size="13" /> Додати коментар до дня
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
