<script setup lang="ts">
import { site } from '~/site'

const links = [
  { to: '/projects', label: 'projects' },
  { to: '/cv', label: 'cv' },
  { to: '/about', label: 'about' },
]

const open = ref(false)
const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const route = useRoute()
watch(() => route.path, () => (open.value = false))
</script>

<template>
  <header
    class="theme-transition fixed inset-x-0 top-0 z-50 border-b bg-bg/85 backdrop-blur"
    :class="scrolled || open ? 'border-border' : 'border-transparent'"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <NuxtLink to="/" class="font-display text-lg font-bold tracking-tight">
        <span class="text-muted">{{ site.handle }}@</span><span class="prompt-text">{{ site.domain }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 sm:flex">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-lg px-3 py-2 font-mono text-sm text-muted transition hover:bg-surface-2 hover:text-text"
          active-class="!text-text prompt-underline"
        >
          {{ l.label }}
        </NuxtLink>
        <ThemeToggle class="ml-1" />
      </nav>

      <div class="flex items-center gap-1 sm:hidden">
        <ThemeToggle />
        <button
          type="button"
          class="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-text"
          :aria-expanded="open"
          aria-label="Toggle menu"
          @click="open = !open"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-6 w-6">
            <path v-if="!open" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <nav v-if="open" class="border-t border-border bg-bg sm:hidden">
      <div class="mx-auto max-w-6xl px-3 py-2">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="block rounded-lg px-3 py-3 font-mono text-muted transition hover:bg-surface-2 hover:text-text"
          active-class="!text-text"
        >
          {{ l.label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
