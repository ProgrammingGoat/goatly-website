<script setup lang="ts">
defineProps<{
  tags?: string[]
  /** Index page these filter, e.g. "/projects". */
  to: string
}>()
</script>

<template>
  <div v-if="tags?.length" class="flex flex-wrap gap-1.5">
    <NuxtLink
      v-for="tag in tags"
      :key="tag"
      :to="{ path: to, query: { tag: foldTag(tag) } }"
      class="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
    >
      {{ tag }}
    </NuxtLink>
  </div>
</template>
