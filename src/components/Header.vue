<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, Moon, Sun, CalendarDays, User } from 'lucide-vue-next'

const props = defineProps({
  weekLabel: { type: String, required: true },
  isDark: { type: Boolean, required: true },
  isCurrentWeek: { type: Boolean, default: false },
  canGoPrev: { type: Boolean, default: true },
  canGoNext: { type: Boolean, default: true },
  jumpValue: { type: String, required: true }, // YYYY-MM-DD (поточний понеділок)
  minDate: { type: String, required: true },
  maxDate: { type: String, required: true },
  quarterOptions: { type: Array, default: () => [] }, // [{id, name}]
  selectedQuarterId: { type: String, default: '' },
  userName: { type: String, default: '' }
})

const emit = defineEmits([
  'prev-week',
  'next-week',
  'toggle-theme',
  'go-today',
  'jump-to-date',
  'select-quarter',
  'edit-name'
])

const initials = computed(() => {
  if (!props.userName) return '?'
  const parts = props.userName.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
})

function onJumpChange(e) {
  if (e.target.value) emit('jump-to-date', e.target.value)
}

function onQuarterChange(e) {
  if (e.target.value) emit('select-quarter', e.target.value)
}
</script>

<template>
  <header class="sticky top-0 z-30 px-4 pt-4 pb-3 sm:px-6">
    <div class="glass-panel rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
      <!-- Верхній рядок: назва + профіль + тема -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0"
          >
            <CalendarDays :size="20" :stroke-width="2.2" />
          </div>
          <div class="min-w-0">
            <h1 class="text-[15px] sm:text-base font-semibold tracking-tight truncate">
              Шкільний Щоденник
            </h1>
            <p class="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 truncate">
              {{ weekLabel }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            class="tap-scale flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 transition-colors max-w-[140px]"
            @click="emit('edit-name')"
            title="Змінити імʼя"
          >
            <span
              class="w-6 h-6 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
            >
              {{ initials }}
            </span>
            <span class="text-xs font-medium truncate hidden sm:inline">{{ userName || 'Гість' }}</span>
          </button>

          <button
            class="tap-scale flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors"
            @click="emit('toggle-theme')"
            :aria-label="isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'"
          >
            <Sun v-if="isDark" :size="17" />
            <Moon v-else :size="17" />
          </button>
        </div>
      </div>

      <!-- Нижній рядок: навігація по тижнях -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="segmented">
          <button
            class="segmented-item flex items-center gap-1 tap-scale disabled:opacity-30 disabled:pointer-events-none"
            @click="emit('prev-week')"
            :disabled="!canGoPrev"
            aria-label="Попередній тиждень"
          >
            <ChevronLeft :size="16" />
            <span class="hidden md:inline">Попередній</span>
          </button>
          <button
            v-if="!isCurrentWeek"
            class="segmented-item tap-scale"
            @click="emit('go-today')"
          >
            Сьогодні
          </button>
          <button
            class="segmented-item flex items-center gap-1 tap-scale disabled:opacity-30 disabled:pointer-events-none"
            @click="emit('next-week')"
            :disabled="!canGoNext"
            aria-label="Наступний тиждень"
          >
            <span class="hidden md:inline">Наступний</span>
            <ChevronRight :size="16" />
          </button>
        </div>

        <select
          class="rounded-full bg-black/5 dark:bg-white/10 text-xs sm:text-[13px] font-medium px-3 py-2 outline-none cursor-pointer"
          :value="selectedQuarterId"
          @change="onQuarterChange"
        >
          <option value="" disabled>Чверть…</option>
          <option v-for="q in quarterOptions" :key="q.id" :value="q.id">{{ q.name }}</option>
        </select>

        <input
          type="date"
          class="rounded-full bg-black/5 dark:bg-white/10 text-xs sm:text-[13px] font-medium px-3 py-2 outline-none cursor-pointer"
          :value="jumpValue"
          :min="minDate"
          :max="maxDate"
          @change="onJumpChange"
          aria-label="Перейти до дати"
        />
      </div>
    </div>
  </header>
</template>
