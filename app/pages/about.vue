<script setup lang="ts">
import { site } from '~/site'

useSeo({
  title: 'About',
  description: site.about.description,
})
</script>

<template>
  <div class="mx-auto max-w-[74ch]">
    <!-- Same reading measure the entry pages use. -->
    <div class="prompt-bar mb-4 w-10" />
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">About</h1>

    <div class="prose mt-8">
      <p v-for="(para, i) in site.about.body" :key="i">{{ para }}</p>
    </div>

    <div class="mt-12">
      <h2 class="eyebrow text-muted">My socials</h2>
      <SocialLinks class="mt-4" />
    </div>
  </div>
</template>
