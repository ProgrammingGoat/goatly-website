<script setup lang="ts">
// `light` = rendered over the hero image (needs light-on-dark styling).
defineProps<{ light?: boolean }>()
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="rounded-lg p-2 transition"
    :class="light
      ? 'on-art-icon text-white/85 hover:bg-white/15 hover:text-white'
      : 'text-muted hover:bg-surface-2 hover:text-text'"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggle"
  >
    <ClientOnly>
      <svg
        v-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <template #fallback>
        <span class="block h-5 w-5" />
      </template>
    </ClientOnly>
  </button>
</template>
