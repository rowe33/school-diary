<script setup>
import { ref, nextTick, computed } from 'vue'
import { Sparkles, X, Send, Loader2 } from 'lucide-vue-next'
import { askAssistant, checkRateLimit, MAX_REQUESTS_PER_HOUR } from '../lib/ai.js'

const props = defineProps({
  weekLabel: { type: String, required: true },
  homeworkItems: { type: Array, required: true }
})

const isOpen = ref(false)
const input = ref('')
const isSending = ref(false)
const scrollAreaRef = ref(null)

const messages = ref([
  {
    role: 'assistant',
    text: 'Привіт! Я твій шкільний асистент. Можу підказати, з чого почати домашні завдання, і нагадати про контрольні. Чим допомогти?'
  }
])

const remaining = computed(() => checkRateLimit().remaining)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isSending.value) return

  messages.value.push({ role: 'user', text })
  input.value = ''
  isSending.value = true
  await scrollToBottom()

  const reply = await askAssistant(text, {
    weekLabel: props.weekLabel,
    homeworkItems: props.homeworkItems
  })

  messages.value.push({ role: 'assistant', text: reply })
  isSending.value = false
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTop = scrollAreaRef.value.scrollHeight
  }
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
    <Transition name="modal-scale">
      <div
        v-if="isOpen"
        class="glass-panel w-[92vw] max-w-sm h-[70vh] max-h-[520px] rounded-3xl flex flex-col overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Sparkles :size="16" />
            </div>
            <div>
              <p class="text-sm font-semibold leading-tight">Шкільний асистент</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                Залишилось запитів: {{ remaining }}/{{ MAX_REQUESTS_PER_HOUR }}
              </p>
            </div>
          </div>
          <button
            class="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-scale"
            @click="toggleOpen"
          >
            <X :size="14" />
          </button>
        </div>

        <div ref="scrollAreaRef" class="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap"
            :class="
              msg.role === 'user'
                ? 'self-end bg-accent text-white rounded-br-md'
                : 'self-start bg-black/5 dark:bg-white/10 rounded-bl-md'
            "
          >
            {{ msg.text }}
          </div>
          <div v-if="isSending" class="self-start flex items-center gap-1.5 text-gray-400 text-sm px-1">
            <Loader2 :size="14" class="animate-spin" /> Друкує…
          </div>
        </div>

        <div class="px-3 py-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="Запитай про розклад чи ДЗ…"
            class="flex-1 rounded-full bg-black/5 dark:bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-gray-400"
            @keyup.enter="sendMessage"
          />
          <button
            class="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center tap-scale disabled:opacity-50 shrink-0"
            :disabled="!input.trim() || isSending"
            @click="sendMessage"
            aria-label="Надіслати"
          >
            <Send :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <button
      class="w-14 h-14 rounded-full bg-accent text-white shadow-soft flex items-center justify-center tap-scale"
      @click="toggleOpen"
      aria-label="Відкрити шкільного асистента"
    >
      <X v-if="isOpen" :size="22" />
      <Sparkles v-else :size="22" />
    </button>
  </div>
</template>
