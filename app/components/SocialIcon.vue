<script setup lang="ts">
// Marks and their provenance live in app/utils/socialIcons.ts (auto-imported).
const { name, label, size = 22 } = defineProps<{
  name: string
  /** Used for the monogram when no mark exists for `name`. */
  label: string
  size?: number
}>()

const icon = computed(() => socialIcons[name])
</script>

<template>
  <!-- v-html is safe here: icon.body is only ever read from the hardcoded
       table in app/utils/socialIcons.ts. No user input, page content, or
       frontmatter can reach it. Revisit if icons ever become data-driven. -->
  <!-- eslint-disable vue/no-v-html -->
  <svg
    v-if="icon"
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    fill="currentColor"
    aria-hidden="true"
    v-html="icon.body"
  />
  <!-- eslint-enable vue/no-v-html -->

  <!-- No mark yet — stand in with the platform's initial. -->
  <span
    v-else
    class="flex items-center justify-center rounded-md border border-current font-display font-bold leading-none"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.5)}px`,
    }"
    aria-hidden="true"
  >
    {{ label.charAt(0) }}
  </span>
</template>
