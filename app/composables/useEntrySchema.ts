import { site } from '~/site'

/**
 * Schema.org JSON-LD for a single entry, alongside the site-wide Person in
 * app.vue. Two ld+json blocks on a page is fine — search engines read them as
 * one graph.
 */

/** Whatever the three collections have in common, plus art's `medium`. */
type Entry = {
  title?: string
  description?: string
  date?: string
  cover?: string
  path?: string
  tags?: string[]
  medium?: string
}

/**
 * The same three facts are called different things per type, and using the
 * wrong name silently drops the field: an Article wants `headline` and
 * `datePublished`, an artwork `name` and `dateCreated`.
 */
const SHAPES = {
  VisualArtwork: { title: 'name', date: 'dateCreated', person: 'creator' },
  BlogPosting: { title: 'headline', date: 'datePublished', person: 'author' },
  CreativeWork: { title: 'name', date: 'dateCreated', person: 'creator' },
} as const

export function useEntrySchema(
  type: keyof typeof SHAPES,
  entry: () => Entry | null | undefined,
) {
  const { siteUrl } = useRuntimeConfig().public
  const shape = SHAPES[type]

  const json = computed(() => {
    const doc = entry()
    if (!doc) return ''

    const absolute = (path: string) => new URL(path, siteUrl).href

    // Undefined values drop out of the JSON, so an entry missing a cover or a
    // description just omits those keys rather than asserting an empty one.
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      [shape.title]: doc.title,
      [shape.date]: doc.date,
      [shape.person]: { '@type': 'Person', 'name': site.name, 'url': siteUrl },
      'url': doc.path ? absolute(doc.path) : undefined,
      'description': doc.description,
      'image': doc.cover ? absolute(doc.cover) : undefined,
      'keywords': doc.tags?.length ? doc.tags : undefined,
      // Only artwork has a medium, and only VisualArtwork defines the property.
      'artMedium': type === 'VisualArtwork' ? doc.medium : undefined,
    })
  })

  useHead({ script: [{ type: 'application/ld+json', innerHTML: json }] })
}
