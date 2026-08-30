import { describe, expect, it } from 'vitest'
import { buildSitemap, type SitemapUrl } from '../server/utils/sitemap'

const siteUrl = 'https://goatly.dev'

const url = (over: Partial<SitemapUrl> = {}): SitemapUrl => ({
  path: '/projects/a-thing',
  date: '2026-01-01',
  ...over,
})

/** <loc> values in document order. */
const locs = (xml: string) =>
  [...xml.matchAll(/<loc>(.*)<\/loc>/g)].map(m => m[1])

/** Same trap the feed guards: a bare `&` makes the document unparseable. */
const bareAmpersands = (xml: string) =>
  xml.match(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g) ?? []

describe('buildSitemap', () => {
  it('makes paths absolute against siteUrl', () => {
    const xml = buildSitemap([url({ path: '/projects/a-thing' })], siteUrl)
    expect(locs(xml)).toEqual(['https://goatly.dev/projects/a-thing'])
  })

  it('keeps the root as a bare origin with a trailing slash', () => {
    const xml = buildSitemap([url({ path: '/', date: undefined })], siteUrl)
    expect(locs(xml)).toEqual(['https://goatly.dev/'])
  })

  // The one that can't be undone: a draft listed here is a draft submitted to
  // Google, and it will be crawled whether or not it is linked from anywhere.
  it('drops drafts', () => {
    const xml = buildSitemap(
      [url({ path: '/projects/public' }), url({ path: '/projects/secret', draft: true })],
      siteUrl,
    )
    expect(locs(xml)).toEqual(['https://goatly.dev/projects/public'])
    expect(xml).not.toContain('secret')
  })

  it('escapes XML metacharacters in the URL', () => {
    const xml = buildSitemap([url({ path: '/projects/a&b' })], siteUrl)
    expect(bareAmpersands(xml)).toEqual([])
    expect(xml).toContain('&amp;')
  })

  it('emits lastmod for a full ISO date', () => {
    const xml = buildSitemap([url({ date: '2026-08-09' })], siteUrl)
    expect(xml).toContain('<lastmod>2026-08-09</lastmod>')
  })

  // A partial or malformed date would fail sitemap validation, so it is left
  // out rather than passed through.
  it.each(['2019-06', '', 'yesterday', '09/08/2026', undefined])(
    'omits lastmod for %o',
    (date) => {
      const xml = buildSitemap([url({ date })], siteUrl)
      expect(xml).not.toContain('<lastmod>')
    },
  )

  it('preserves the order it is given', () => {
    const xml = buildSitemap(
      [url({ path: '/' }), url({ path: '/projects' }), url({ path: '/projects/a-thing' })],
      siteUrl,
    )
    expect(locs(xml)).toEqual([
      'https://goatly.dev/',
      'https://goatly.dev/projects',
      'https://goatly.dev/projects/a-thing',
    ])
  })

  it('lists a cover as an absolute <image:loc>', () => {
    const xml = buildSitemap([url({ image: '/img/projects/piece.png' })], siteUrl)
    expect(xml).toContain('<image:loc>https://goatly.dev/img/projects/piece.png</image:loc>')
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')
  })

  it('omits the image block entirely when there is no cover', () => {
    const xml = buildSitemap([url({ image: undefined })], siteUrl)
    expect(xml).not.toContain('image:image')
  })

  // A draft's cover is as unpublishable as its page.
  it('drops the image along with the draft that owns it', () => {
    const xml = buildSitemap(
      [url({ path: '/projects/secret', image: '/img/projects/secret.png', draft: true })],
      siteUrl,
    )
    expect(xml).not.toContain('secret')
  })

  it('is well-formed with no URLs at all', () => {
    const xml = buildSitemap([], siteUrl)
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
    expect(locs(xml)).toEqual([])
  })
})
