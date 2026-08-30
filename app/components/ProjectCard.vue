<script setup lang="ts">
import type { ProjectsCollectionItem } from '@nuxt/content'

defineProps<{ item: ProjectsCollectionItem }>()
</script>

<template>
  <NuxtLink
    :to="item.path"
    class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/50"
  >
    <!-- Widest this slot ever gets is ~596px, two columns on the projects
         index. It's narrower once the index goes three-up, but asking for the
         widest case throughout costs a few KB and keeps one number to reason
         about — and a 2x display wants the larger image regardless. -->
    <CoverImage
      :src="item.cover"
      :alt="item.title"
      :seed="item.path"
      :focus="item.focus"
      sizes="xs:100vw sm:50vw md:50vw lg:640px xl:640px xxl:640px"
      aspect-class="aspect-[16/9]"
    />
    <div class="flex flex-1 flex-col p-5">
      <p v-if="item.kind" class="eyebrow mb-1.5 text-accent-2">{{ item.kind }}</p>
      <h3 class="font-semibold leading-snug transition group-hover:text-accent">
        {{ item.title }}
      </h3>
      <p v-if="item.description" class="mt-1.5 line-clamp-2 text-sm text-muted">
        {{ item.description }}
      </p>
      <div v-if="item.tools?.length" class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="t in item.tools"
          :key="t"
          class="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-muted"
        >
          {{ t }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
