<script setup lang="ts">
import { site } from '~/site'

const year = new Date().getFullYear()

// German law wants the Impressum reachable in about two clicks from anywhere,
// so it lives here rather than only on the home page (§5 DDG).
const legal = [
  { to: '/impressum', label: 'Impressum' },
  { to: '/datenschutz', label: 'Datenschutz' },
]
</script>

<template>
  <footer class="mt-auto border-t border-border bg-surface">
    <!-- A tmux/vim status line: dense, monospace, left-aligned segments. It
         wraps to normal rows on a phone rather than scrolling sideways. -->
    <div class="mx-auto max-w-6xl px-5 py-4 sm:px-8">
      <div class="flex flex-col gap-3 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span class="rounded bg-accent px-1.5 py-0.5 font-medium text-accent-contrast">
            {{ site.domain }}
          </span>
          <span>© {{ year }} {{ site.name }}</span>
          <span aria-hidden="true" class="text-border">·</span>
          <span>{{ site.location }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <NuxtLink
            v-for="l in legal"
            :key="l.to"
            :to="l.to"
            class="text-muted transition hover:text-accent"
          >
            {{ l.label }}
          </NuxtLink>
          <span aria-hidden="true" class="text-border">·</span>
          <SocialLinks variant="compact" />
        </div>
      </div>
    </div>
  </footer>
</template>
