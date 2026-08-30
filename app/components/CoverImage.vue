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
    <!-- No cover yet. A bare gradient reads as a broken image, so the slot
         says what it is instead: the entry's own path, set like a shell would
         print it. Decorative — the card's heading already carries the title,
         and repeating it here would make a screen reader say it twice. -->
    <div
      v-else
      class="flex h-full w-full items-center justify-center transition duration-300 group-hover:scale-[1.04]"
      :style="{ background: grad }"
      aria-hidden="true"
    >
      <span class="max-w-full truncate px-4 font-mono text-sm text-white/45">
        <span class="text-white/30">~</span>{{ seed || '' }}
      </span>
    </div>
  </div>
</template>
