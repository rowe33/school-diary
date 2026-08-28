<script setup>
import { ref } from 'vue'
import { X, User, Check } from 'lucide-vue-next'

const props = defineProps({
  mode: { type: String, default: 'first-visit' }, // 'first-visit' | 'edit'
  initialName: { type: String, default: '' }
})

const emit = defineEmits(['save', 'close'])

const name = ref(props.initialName)

function handleSave() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('save', trimmed)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
        @click.self="mode === 'edit' ? emit('close') : null"
      >
        <Transition name="modal-scale" appear>
          <div
            class="glass-panel w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden"
          >
            <div
              class="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <User :size="17" />
                </div>
                <h2 class="text-base font-semibold">
                  {{ mode === 'first-visit' ? 'Як до вас звертатись?' : 'Змінити імʼя' }}
                </h2>
              </div>
              <button
                v-if="mode === 'edit'"
                class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-scale shrink-0"
                @click="emit('close')"
                aria-label="Закрити"
              >
                <X :size="16" />
              </button>
            </div>

            <div class="px-5 py-4">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Імʼя
              </label>
              <input
                v-model="name"
                type="text"
                placeholder="Наприклад: Олег"
                maxlength="40"
                class="w-full rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-gray-400"
                @keyup.enter="handleSave"
              />

              <p
                v-if="mode === 'first-visit'"
                class="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed"
              >
                Ми зберігаємо ваше імʼя локально, у сховищі браузера (localStorage) — так само,
                як це роблять багато інших сайтів. Це потрібно, щоб позначати, хто додав те чи
                інше домашнє завдання. Дані не передаються на сервер і зберігаються лише на
                цьому пристрої.
              </p>
            </div>

            <div class="px-5 py-4 border-t border-black/5 dark:border-white/10">
              <button
                class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent text-white text-sm font-medium py-2.5 tap-scale disabled:opacity-50"
                :disabled="!name.trim()"
                @click="handleSave"
              >
                <Check :size="15" /> Зберегти
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
