// Auto-imported by Nuxt (from app/utils).
// Pure tag helpers, kept out of the composable so they can be unit-tested —
// see test/tags.test.ts.

/** Anything with tags: an art, projects or blog entry. */
export type Taggable = { tags?: string[] }

export type TagCount = {
  /** Folded form, used in ?tag= and for matching. */
  key: string
  /** First spelling seen, used for display. */
  label: string
  count: number
}

/**
 * Tags are free text in frontmatter, so "Sketch" and "sketch" are one tag
 * typed two ways. Folded for matching; the original spelling is what's shown.
 */
export function foldTag(tag: string): string {
  return tag.trim().toLowerCase()
}

/** Every tag across the entries, most-used first, ties broken alphabetically. */
export function collectTags(items: Taggable[]): TagCount[] {
  const seen = new Map<string, TagCount>()

  for (const item of items) {
    for (const tag of item.tags ?? []) {
      const key = foldTag(tag)
      if (!key) continue
      const found = seen.get(key)
      if (found) found.count++
      else seen.set(key, { key, label: tag.trim(), count: 1 })
    }
  }

  return [...seen.values()].sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key),
  )
}

/** Whether an entry carries the given folded tag. */
export function hasTag(item: Taggable, key: string): boolean {
  return !!item.tags?.some(tag => foldTag(tag) === key)
}
