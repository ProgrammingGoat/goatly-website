/**
 * RSS 2.0 construction, kept free of Nitro and content queries so it can be
 * unit-tested directly — see test/feed.test.ts. server/routes/rss.xml.ts does
 * the I/O and hands the entries here.
 */

import { escapeXml as escape } from './xml'

/** One entry as the feed cares about it, whichever collection it came from. */
export type FeedEntry = {
  title: string
  path: string
  date: string
  /** Collection label, rendered as <category>. */
  category: string
  description?: string
  cover?: string
  draft?: boolean
}

export type FeedChannel = {
  /** Canonical origin, no trailing slash. */
  siteUrl: string
  title: string
  description: string
  /** Where the feed is served, for the rel="self" link. */
  feedPath: string
}

// Cap on entries, so the feed can't grow without bound.
export const FEED_MAX = 50

// RSS 2.0 dates are RFC 822, not the ISO 8601 the site displays.
const rfc822 = (input: string) => {
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString()
}

/**
 * Drafts dropped, newest first, capped at FEED_MAX. Entries arrive already
 * merged across collections; ordering is this function's job, not the query's.
 */
export function buildFeed(entries: FeedEntry[], channel: FeedChannel): string {
  const absolute = (path: string) => new URL(path, channel.siteUrl).href

  const items = entries
    .filter(entry => !entry.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, FEED_MAX)

  const rendered = items.map((item) => {
    const url = absolute(item.path)

    // Escaped here as HTML, then again below as XML — a reader unescapes the
    // XML layer and is left with the markup.
    const summary = [
      item.cover ? `<img src="${escape(absolute(item.cover))}" alt="">` : '',
      item.description ? `<p>${escape(item.description)}</p>` : '',
    ].join('')

    return [
      '    <item>',
      `      <title>${escape(item.title)}</title>`,
      `      <link>${escape(url)}</link>`,
      `      <guid isPermaLink="true">${escape(url)}</guid>`,
      `      <category>${escape(item.category)}</category>`,
      `      <pubDate>${rfc822(item.date)}</pubDate>`,
      summary ? `      <description>${escape(summary)}</description>` : '',
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n')
  })

  // The newest entry rather than "now", so rebuilding unchanged content
  // produces a byte-identical feed.
  const first = items[0]
  const updated = first ? rfc822(first.date) : ''

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escape(channel.title)}</title>`,
    `    <link>${escape(absolute('/'))}</link>`,
    `    <description>${escape(channel.description)}</description>`,
    '    <language>en</language>',
    updated ? `    <lastBuildDate>${updated}</lastBuildDate>` : '',
    `    <atom:link href="${escape(absolute(channel.feedPath))}" rel="self" type="application/rss+xml"/>`,
    ...rendered,
    '  </channel>',
    '</rss>',
  ]
    .filter(Boolean)
    .join('\n')
}
