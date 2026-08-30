<script setup lang="ts">
defineProps<{
  backTo: string
  backLabel: string
  /** Roomier main column, for image-led pages (art). */
  wide?: boolean
}>()
</script>

<template>
  <article class="mx-auto" :class="wide ? 'max-w-6xl' : 'max-w-5xl'">
    <div class="grid gap-x-12 gap-y-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-y-0">
      <!-- Meta rail. `contents` on narrow screens dissolves this wrapper so its
           two halves can sit apart — back link above the entry, metadata below
           it, rather than a stack of metadata before the body. From `lg` it
           re-forms as one sticky column, so the back link travels with the
           metadata it looks like it belongs to. -->
      <aside class="contents lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-8 lg:self-start">
        <NuxtLink
          :to="backTo"
          class="order-first text-sm text-muted transition hover:text-accent"
        >
          ← {{ backLabel }}
        </NuxtLink>

        <div
          class="order-last flex flex-col gap-6 border-t border-border pt-8 lg:order-none lg:border-0 lg:pt-0"
        >
          <slot name="rail" />
        </div>
      </aside>

      <div class="min-w-0">
        <slot />
      </div>
    </div>
  </article>
</template>
