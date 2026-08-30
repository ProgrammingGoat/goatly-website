import { queryCollection } from '@nuxt/content/server'
import { buildSitemap, type SitemapUrl } from '../utils/sitemap'

/**
 * sitemap.xml for the whole site. Prerendered by `npm run generate` (see
 * nuxt.config), so it ends up a static file on Cloudflare; nothing runs at
 * request time.
 *
 * This handler is only I/O — draft filtering and XML live in
 * ../utils/sitemap.ts, where they're unit-tested.
 */

// Pages that aren't content entries. Hand-maintained: nothing enumerates the
// routes here, so a new top-level page needs adding to this list.
// Legal pages are deliberately absent: robots.txt disallows them and they carry
// a noindex tag, so listing them in the sitemap would ask a crawler to index
// exactly what the other two say not to.
const STATIC = ['/', '/about', '/projects', '/cv']

const COLLECTIONS = ['projects'] as const

export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig(event).public

  const groups = await Promise.all(
    COLLECTIONS.map(collection =>
      queryCollection(event, collection).order('date', 'DESC').all(),
    ),
  )

  const entries = groups.flat().map(entry => ({
    path: entry.path,
    date: entry.date,
    // The cover as authored, not an /_ipx/ variant: those are generated per
    // breakpoint and the original is what should rank in image search.
    image: entry.cover,
    draft: entry.draft,
  }) as SitemapUrl)

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  // Static pages first, then each collection newest-first — a stable order, so
  // rebuilding unchanged content produces a byte-identical file.
  return buildSitemap([...STATIC.map(path => ({ path })), ...entries], siteUrl)
})
