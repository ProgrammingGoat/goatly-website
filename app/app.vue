<script setup lang="ts">
import { site } from '~/site'

const { siteUrl } = useRuntimeConfig().public
const route = useRoute()

// One absolute address per page, in the same form the feed's <guid> and the
// sitemap's <loc> use — all three have to agree, or they nominate competing
// canonicals for the same page.
const canonical = computed(() => new URL(routePath(route.path), siteUrl).href)

// Says the accounts on other platforms are this same person. The site is new
// and those profiles are not, so this is the thread search engines can follow
// from an established entity to a domain they've never seen. Relative entries
// (the RSS link) aren't profiles and are filtered out.
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': site.name,
  'url': siteUrl,
  'description': site.description,
  'sameAs': site.socials.filter(s => s.url.startsWith('http')).map(s => s.url),
}

// Titles read "Projects · goatly.dev", but a page that sets no title of its own gets
// the bare wordmark rather than a dangling separator. That fallback needs the
// function form, which can't live in nuxt.config's `app.head` — that object is
// serialized into the build, so a function there is silently dropped and every
// title renders unsuffixed.
useHead({
  titleTemplate: title => pageTitle(title || undefined),
  link: [{ rel: 'canonical', href: canonical }],
  meta: [
    { property: 'og:url', content: canonical },
    { property: 'og:site_name', content: site.name },
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(person) }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
