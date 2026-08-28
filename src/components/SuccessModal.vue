<script setup>
import { CheckCircle2 } from 'lucide-vue-next'

defineProps({
  message: { type: String, default: 'Успішно збережено!' }
})

const emit = defineEmits(['confirm'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <Transition name="modal-scale" appear>
          <div class="glass-panel w-full max-w-xs rounded-3xl px-6 py-7 flex flex-col items-center text-center gap-3">
            <div class="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 :size="30" />
            </div>
            <p class="text-sm font-medium">{{ message }}</p>
            <button
              class="w-full mt-1 rounded-xl bg-accent text-white text-sm font-medium py-2.5 tap-scale"
              @click="emit('confirm')"
            >
              Гаразд
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
