import { describe, expect, it } from 'vitest'
import { buildFeed, FEED_MAX, type FeedChannel, type FeedEntry } from '../server/utils/feed'

const channel: FeedChannel = {
  siteUrl: 'https://goatly.dev',
  title: 'Lukas Brackmann',
  description: 'Projects and writing by Lukas Brackmann.',
  feedPath: '/rss.xml',
}

const entry = (over: Partial<FeedEntry> = {}): FeedEntry => ({
  title: 'A piece',
  path: '/projects/a-piece',
  date: '2026-01-01',
  category: 'Art',
  ...over,
})

/** Titles in document order, the cheap way to assert ordering. */
const titles = (xml: string) =>
  [...xml.matchAll(/<title>(.*)<\/title>/g)].slice(1).map(m => m[1])

/**
 * The classic feed bug: a bare `&` makes the whole document unparseable, so
 * readers drop the feed entirely. Catches any field that skipped escaping.
 */
const bareAmpersands = (xml: string) =>
  xml.match(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g) ?? []

describe('buildFeed', () => {
  it('escapes XML metacharacters in titles', () => {
    const xml = buildFeed([entry({ title: 'A & B <c> "d"' })], channel)
    expect(xml).toContain('<title>A &amp; B &lt;c&gt; &quot;d&quot;</title>')
    expect(bareAmpersands(xml)).toEqual([])
  })

  it('escapes the category and channel copy too', () => {
    const xml = buildFeed([entry({ category: 'Art & Craft' })], {
      ...channel,
      title: 'Brackmann & co',
      description: 'Art, code & things',
    })
    expect(xml).toContain('<category>Art &amp; Craft</category>')
    expect(bareAmpersands(xml)).toEqual([])
  })

  it('double-escapes the summary so readers unwrap valid HTML', () => {
    const xml = buildFeed([entry({ description: 'A & B < C' })], channel)
    // XML layer unescaped by the reader leaves: <p>A &amp; B &lt; C</p>
    expect(xml).toContain(
      '<description>&lt;p&gt;A &amp;amp; B &amp;lt; C&lt;/p&gt;</description>',
    )
    expect(bareAmpersands(xml)).toEqual([])
  })

  it('makes cover images absolute and URL-encoded', () => {
    const xml = buildFeed([entry({ cover: '/img/projects/two words.jpg' })], channel)
    expect(xml).toContain('src=&quot;https://goatly.dev/img/projects/two%20words.jpg&quot;')
  })

  it('omits the description entirely when there is no cover or summary', () => {
    const xml = buildFeed([entry()], channel)
    expect(xml).not.toContain('<description></description>')
    // Only the channel's own description survives.
    expect(xml.match(/<description>/g)).toHaveLength(1)
  })

  it('drops drafts', () => {
    const xml = buildFeed(
      [entry({ title: 'Published' }), entry({ title: 'Hidden', draft: true })],
      channel,
    )
    expect(titles(xml)).toEqual(['Published'])
  })

  it('orders newest first across collections', () => {
    const xml = buildFeed(
      [
        entry({ title: 'Older art', date: '2026-01-01', category: 'Art' }),
        entry({ title: 'Newest post', date: '2026-08-07', category: 'Blog' }),
        entry({ title: 'Middle project', date: '2026-04-03', category: 'Projects' }),
      ],
      channel,
    )
    expect(titles(xml)).toEqual(['Newest post', 'Middle project', 'Older art'])
  })

  it(`caps the feed at ${FEED_MAX} entries, keeping the newest`, () => {
    const many = Array.from({ length: FEED_MAX + 10 }, (_, i) =>
      entry({
        title: `Entry ${i}`,
        path: `/projects/entry-${i}`,
        // Later index = newer.
        date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
      }),
    )
    const xml = buildFeed(many, channel)
    expect(titles(xml)).toHaveLength(FEED_MAX)
  })

  it('does not mutate the caller\'s array', () => {
    const entries = [
      entry({ title: 'Older', date: '2026-01-01' }),
      entry({ title: 'Newer', date: '2026-08-07' }),
    ]
    buildFeed(entries, channel)
    expect(entries.map(e => e.title)).toEqual(['Older', 'Newer'])
  })

  it('stamps lastBuildDate from the newest entry, not the clock', () => {
    const entries = [
      entry({ date: '2026-01-01' }),
      entry({ path: '/projects/b', date: '2026-08-07' }),
    ]
    const xml = buildFeed(entries, channel)
    expect(xml).toContain('<lastBuildDate>Fri, 07 Aug 2026 00:00:00 GMT</lastBuildDate>')
    // Byte-identical across rebuilds is the point.
    expect(buildFeed(entries, channel)).toBe(xml)
  })

  it('emits RFC 822 pubDates, not the ISO 8601 the site displays', () => {
    const xml = buildFeed([entry({ date: '2026-08-07' })], channel)
    expect(xml).toContain('<pubDate>Fri, 07 Aug 2026 00:00:00 GMT</pubDate>')
  })

  it('survives an unparseable date rather than emitting "Invalid Date"', () => {
    const xml = buildFeed([entry({ date: 'not a date' })], channel)
    expect(xml).toContain('<pubDate></pubDate>')
    expect(xml).not.toContain('Invalid Date')
  })

  it('builds absolute, matching link and guid', () => {
    const xml = buildFeed([entry({ path: '/projects/hello-world' })], channel)
    expect(xml).toContain('<link>https://goatly.dev/projects/hello-world</link>')
    expect(xml).toContain(
      '<guid isPermaLink="true">https://goatly.dev/projects/hello-world</guid>',
    )
  })

  it('points rel="self" at the feed and <link> at the site root', () => {
    const xml = buildFeed([entry()], channel)
    expect(xml).toContain('href="https://goatly.dev/rss.xml" rel="self"')
    expect(xml).toContain('<link>https://goatly.dev/</link>')
  })

  it('honours a different siteUrl, e.g. a preview deployment', () => {
    const xml = buildFeed([entry({ path: '/projects/x' })], {
      ...channel,
      siteUrl: 'https://preview.pages.dev',
    })
    expect(xml).toContain('<link>https://preview.pages.dev/projects/x</link>')
    expect(xml).not.toContain('goatly.dev')
  })

  it('still emits a valid empty channel when there is nothing to publish', () => {
    const xml = buildFeed([], channel)
    expect(xml).toContain('<rss version="2.0"')
    expect(xml.trimEnd()).toMatch(/<\/rss>$/)
    expect(xml).not.toContain('<item>')
    // No entries means no date to claim.
    expect(xml).not.toContain('<lastBuildDate>')
  })

  it('opens with the XML declaration, with nothing before it', () => {
    const xml = buildFeed([entry()], channel)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
  })
})
