<script setup lang="ts">
import { site } from '~/site'

definePageMeta({ layout: 'home' })

const FEATURED_MAX = 4

const { data } = await useAsyncData('home', async () => {
  const projects = await queryCollection('projects').order('date', 'DESC').all()
  const published = projects.filter(p => !p.draft)

  // `featured: true` promotes a project here, newest first. Nothing flagged
  // falls back to the newest few, so the section is never empty while there is
  // anything to show.
  const flagged = published.filter(p => p.featured)
  return {
    featured: (flagged.length ? flagged : published).slice(0, FEATURED_MAX),
  }
})

// No title: the home page is the site, so it takes the bare wordmark rather
// than "Home · goatly.dev" — the name is what anyone searching is typing.
useSeo({
  description: site.description,
  card: () => data.value?.featured?.[0],
})
</script>

<template>
  <div>
    <TerminalHero />

    <div class="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
      <section v-if="data?.featured?.length">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <div class="prompt-bar mb-3 w-10" />
            <h2 class="prompt-heading font-display text-xl font-bold sm:text-2xl">
              ls projects/
            </h2>
            <p class="mt-2 text-sm text-muted">{{ site.projects.lead }}</p>
          </div>
          <NuxtLink
            to="/projects"
            class="shrink-0 font-mono text-sm font-medium text-accent transition hover:text-accent-hover"
          >
            all →
          </NuxtLink>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <ProjectCard v-for="item in data.featured" :key="item.path" :item="item" />
        </div>
      </section>

      <!-- A recruiter's shortest path to the thing they came for. -->
      <section class="mt-16 rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div class="prompt-bar mb-3 w-10" />
        <h2 class="prompt-heading font-display text-xl font-bold sm:text-2xl">
          cat cv.md
        </h2>
        <p class="mt-2 max-w-prose text-sm text-muted sm:text-base">
          {{ site.cv.lead }}
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <NuxtLink
            to="/cv"
            class="rounded-lg border border-accent bg-accent px-4 py-2.5 font-mono text-sm font-medium text-accent-contrast transition hover:border-accent-hover hover:bg-accent-hover"
          >
            read the cv
          </NuxtLink>
          <a
            :href="`mailto:${site.email}`"
            class="rounded-lg border border-border px-4 py-2.5 font-mono text-sm font-medium text-text transition hover:border-accent hover:text-accent"
          >
            {{ site.email }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
