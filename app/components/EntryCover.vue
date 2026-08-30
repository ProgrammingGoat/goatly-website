<script setup lang="ts">
// Detail-page cover. Unlike CoverImage (fixed ratio, cropped to fill a card
// slot), this keeps the image's own shape — a detail page shouldn't crop the
// thing it exists to show. Height is capped so a tall piece can't push the
// text off screen; width follows from it.
defineProps<{
  src: string
  alt?: string
  sizes?: string
  /** Tailwind max-height class, e.g. "max-h-[70vh]". */
  cap?: string
}>()
</script>

<template>
  <NuxtPicture
    :src="src"
    :alt="alt || ''"
    legacy-format="jpeg"
    :sizes="sizes || 'xs:100vw sm:100vw md:100vw lg:768px xl:768px xxl:1024px'"
    :img-attrs="{
      class: `w-auto max-w-full rounded-2xl border border-border ${cap || 'max-h-[70vh]'}`,
    }"
  />
</template>
