<script setup lang="ts">
import { site } from '~/site'

const { data: items } = await useAsyncData('projects-list', async () => {
  const all = await queryCollection('projects').order('date', 'DESC').all()
  return all.filter(i => !i.draft)
})

const { active, tags, filtered } = useTagFilter(computed(() => items.value || []))

useSeo({
  title: 'Projects',
  description: site.projects.description,
})
</script>

<template>
  <div>
    <header class="mb-8">
      <div class="prompt-bar mb-4 w-10" />
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
      <p class="mt-3 max-w-xl text-muted">{{ site.projects.lead }}</p>
    </header>

    <TagFilter :tags="tags" :active="active" />

    <div v-if="filtered.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <ProjectCard v-for="item in filtered" :key="item.path" :item="item" />
    </div>
    <p v-else class="text-muted">
      {{ active ? 'No entries with that tag.' : 'No entries yet.' }}
    </p>
  </div>
</template>
