import type { Taggable } from '~/utils/tags'

/**
 * Tag filtering for the collection index pages, driven by ?tag= in the URL.
 *
 * A query param rather than local state, so a filtered view is linkable —
 * that's what the tag pills on entry pages point at. Filtering happens in the
 * browser over the already-loaded list; the site is prerendered, so there's no
 * per-tag route to fetch and nothing further to query.
 */
export function useTagFilter<T extends Taggable>(items: Ref<T[]>) {
  const route = useRoute()

  const active = computed(() => {
    const tag = route.query.tag
    return typeof tag === 'string' && tag.trim() ? foldTag(tag) : null
  })

  const tags = computed(() => collectTags(items.value))

  const filtered = computed(() => {
    const key = active.value
    return key === null ? items.value : items.value.filter(item => hasTag(item, key))
  })

  return { active, tags, filtered }
}
