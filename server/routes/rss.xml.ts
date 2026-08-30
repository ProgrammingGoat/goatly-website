import { queryCollection } from '@nuxt/content/server'
import { site } from '~/site'
import { buildFeed, type FeedEntry } from '../utils/feed'

/**
 * RSS 2.0 feed of the projects.
 * Prerendered by `npm run generate` (see nuxt.config), so it ends up a static
 * file on Cloudflare; nothing runs at request time.
 *
 * This handler is only I/O — ordering, draft filtering and XML live in
 * ../utils/feed.ts, where they're unit-tested.
 */

// Collections in the feed, and the <category> each one's entries get.
const SOURCES = [
  ['projects', 'Projects'],
] as const

export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig(event).public

  const groups = await Promise.all(
    SOURCES.map(async ([collection, category]) => {
      const entries = await queryCollection(event, collection).all()
      return entries.map(entry => ({ ...entry, category }) as FeedEntry)
    }),
  )

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  return buildFeed(groups.flat(), {
    siteUrl,
    title: site.name,
    description: site.description,
    feedPath: '/rss.xml',
  })
})
