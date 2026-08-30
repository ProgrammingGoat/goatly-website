<script setup lang="ts">
const route = useRoute()
// Normalised: a trailing slash would miss the prerendered payload key.
const path = routePath(route.path)

const { data: doc } = await useAsyncData(`projects-${path}`, () =>
  queryCollection('projects').path(path).first(),
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

useSeo({
  title: () => doc.value?.title,
  description: () => doc.value?.description,
  card: () => doc.value ?? undefined,
  type: 'article',
})
useEntrySchema('CreativeWork', () => doc.value)
</script>

<template>
  <EntryPage v-if="doc" back-to="/projects" back-label="Back to projects">
    <template #rail>
      <div v-if="doc.kind">
        <h2 class="eyebrow text-muted">Kind</h2>
        <p class="mt-2 text-sm text-accent-2">{{ doc.kind }}</p>
      </div>

      <div>
        <h2 class="eyebrow text-muted">Date</h2>
        <p class="mt-2 font-mono text-sm text-muted">{{ formatDate(doc.date) }}</p>
      </div>

      <div v-if="doc.tools?.length">
        <h2 class="eyebrow text-muted">Tools</h2>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="t in doc.tools"
            :key="t"
            class="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-muted"
          >
            {{ t }}
          </span>
        </div>
      </div>

      <!-- First link gets the solid treatment; the rest are outlined. -->
      <div v-if="doc.links?.length">
        <h2 class="eyebrow text-muted">Links</h2>
        <div class="mt-2 flex flex-col items-start gap-2">
          <a
            v-for="(link, i) in doc.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
            :class="
              i === 0
                ? 'bg-accent text-accent-contrast hover:bg-accent-hover'
                : 'border border-border hover:bg-surface-2'
            "
          >
            {{ link.label }} ↗
          </a>
        </div>
      </div>

      <div v-if="doc.tags?.length">
        <h2 class="eyebrow mb-2 text-muted">Tags</h2>
        <TagList :tags="doc.tags" to="/projects" />
      </div>
    </template>

    <header>
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
        {{ doc.title }}
      </h1>
      <p v-if="doc.description" class="mt-3 max-w-[52ch] text-lg text-muted">
        {{ doc.description }}
      </p>
    </header>

    <EntryCover
      v-if="doc.cover"
      :src="doc.cover"
      :alt="doc.title"
      class="mt-10 block"
    />

    <div class="prose mt-10 max-w-[74ch]">
      <ContentRenderer :value="doc" />
    </div>
  </EntryPage>
</template>
