<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
  seed?: string
  aspectClass?: string
  // @nuxt/image breakpoint syntax, e.g. "sm:100vw md:50vw lg:400px".
  // Must use breakpoint prefixes or the srcset degenerates to 1w/2w.
  // Always carry the largest breakpoint the slot can reach: the widest value
  // given also serves every viewport above it, so a string ending at `lg`
  // hands a 1920px screen the 1024px answer.
  sizes?: string
  // Entry's `focus:` — the slot is a fixed ratio, so a cover fills it by
  // cropping. Moves the part that survives; centred when unset.
  focus?: string
}>()

// On-brand placeholder gradient, keyed off the seed so each entry is stable
// and distinct (see app/utils/cover.ts).
const grad = computed(() => coverGradient(props.seed || props.alt))

// Inline style rather than a class: the value is arbitrary, per entry.
const focusStyle = computed(() => {
  const position = coverPosition(props.focus)
  return position ? { objectPosition: position } : undefined
})
</script>

<template>
  <div
    class="relative overflow-hidden bg-surface-2"
    :class="aspectClass || 'aspect-[4/3] rounded-2xl border border-border'"
  >
    <!-- Real cover once provided in frontmatter (path under /public).
         NuxtPicture emits <picture> with AVIF + WebP sources and an
         original-format <img> fallback; resized per `sizes` at build. -->
    <NuxtPicture
      v-if="src"
      :src="src"
      :alt="alt || ''"
      legacy-format="jpeg"
      :sizes="sizes || 'xs:100vw sm:50vw md:50vw lg:384px xl:384px xxl:384px'"
      loading="lazy"
      class="absolute inset-0 h-full w-full"
      :img-attrs="{
        class:
          'absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]',
        style: focusStyle,
      }"
    />
    <!-- Placeholder gradient when no cover is set yet. -->
    <div
      v-else
      class="h-full w-full transition duration-300 group-hover:scale-[1.04]"
      :style="{ background: grad }"
      aria-hidden="true"
    />
  </div>
</template>
