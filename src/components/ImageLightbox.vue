<script setup>
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  images: { type: Array, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['close', 'update:index'])

const current = computed(() => props.images[props.index])

function prev() {
  emit('update:index', (props.index - 1 + props.images.length) % props.images.length)
}
function next() {
  emit('update:index', (props.index + 1) % props.images.length)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <button
          class="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center tap-scale"
          @click="emit('close')"
          aria-label="Закрити"
        >
          <X :size="20" />
        </button>

        <button
          v-if="images.length > 1"
          class="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center tap-scale"
          @click="prev"
          aria-label="Попереднє зображення"
        >
          <ChevronLeft :size="22" />
        </button>

        <img
          :src="current"
          alt="Вкладення до домашнього завдання"
          class="max-w-[92vw] max-h-[86vh] rounded-xl shadow-soft-dark object-contain select-none"
        />

        <button
          v-if="images.length > 1"
          class="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center tap-scale"
          @click="next"
          aria-label="Наступне зображення"
        >
          <ChevronRight :size="22" />
        </button>

        <div
          v-if="images.length > 1"
          class="absolute bottom-6 text-white/80 text-sm font-medium"
        >
          {{ index + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
