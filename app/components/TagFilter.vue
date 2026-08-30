<script setup lang="ts">
import type { TagCount } from '~/utils/tags'

defineProps<{
  tags: TagCount[]
  active: string | null
}>()

const route = useRoute()

// Query-only changes don't scroll, so filtering leaves the page where it is.
// `piece` is dropped alongside the tag: whatever it points at may not
// survive the new filter.
function to(key: string | null) {
  const query = { ...route.query }
  delete query.piece
  if (key) query.tag = key
  else delete query.tag
  return { query }
}

const pill = (on: boolean) => [
  'rounded-full border px-2.5 py-0.5 text-xs transition',
  on
    ? 'border-accent bg-accent text-accent-contrast'
    : 'border-border bg-surface-2 text-muted hover:border-accent hover:text-accent',
]
</script>

<template>
  <!-- aria-current is set explicitly on every pill, overriding NuxtLink's own:
       it ignores the query string, so these same-path links would otherwise
       all claim to be the current one at once. -->
  <div v-if="tags.length" class="mb-8 flex flex-wrap items-center gap-1.5">
    <NuxtLink
      :to="to(null)"
      :class="pill(active === null)"
      :aria-current="active === null ? 'true' : undefined"
    >
      All
    </NuxtLink>
    <NuxtLink
      v-for="tag in tags"
      :key="tag.key"
      :to="to(tag.key)"
      :class="pill(active === tag.key)"
      :aria-current="active === tag.key ? 'true' : undefined"
    >
      {{ tag.label }}<span class="ml-1 opacity-60">{{ tag.count }}</span>
    </NuxtLink>
  </div>
</template>
