<script setup lang="ts">
import { site } from '~/site'

const { variant = 'grid' } = defineProps<{
  /** `grid` = cards with handles (/about); `compact` = icons only (footer). */
  variant?: 'grid' | 'compact'
}>()

// Placeholder entries carry an empty url — don't render dead links.
const links = computed(() => site.socials.filter(s => s.url))
</script>

<template>
  <nav v-if="links.length" :class="variant === 'grid' ? 'grid gap-3 sm:grid-cols-2' : 'flex items-center gap-5'">
    <a
      v-for="s in links"
      :key="s.url"
      :href="s.url"
      target="_blank"
      rel="me noopener"
      :aria-label="variant === 'compact' ? s.label : undefined"
      :class="
        variant === 'grid'
          ? 'group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface px-4 py-3.5 transition duration-200 hover:-translate-y-0.5'
          : 'text-muted transition-colors hover:text-text'
      "
    >
      <SocialIcon
        :name="s.icon"
        :label="s.label"
        :size="variant === 'grid' ? 22 : 18"
        :class="variant === 'grid' ? 'shrink-0 text-muted transition-colors duration-200 group-hover:text-text' : ''"
      />

      <template v-if="variant === 'grid'">
        <span class="min-w-0">
          <span class="block font-display font-semibold leading-tight">{{ s.label }}</span>
          <span v-if="s.handle" class="block truncate font-mono text-xs text-muted">{{ s.handle }}</span>
        </span>
        <!-- Ember stays hover-only here — the signature belongs to the wordmark,
             active nav, and section bars. -->
        <span
          class="prompt-bar absolute inset-x-0 bottom-0 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
        />
      </template>
    </a>
  </nav>
</template>
