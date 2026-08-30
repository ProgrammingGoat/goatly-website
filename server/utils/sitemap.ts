/**
 * sitemap.xml construction, kept free of Nitro and content queries so it can
 * be unit-tested directly — see test/sitemap.test.ts.
 * server/routes/sitemap.xml.ts does the I/O and hands the URLs here.
 */

import { escapeXml as escape } from './xml'

export type SitemapUrl = {
  /** Site-relative — "/projects/a-thing". Made absolute against siteUrl. */
  path: string
  /** ISO date. Omitted or malformed means the entry gets no <lastmod>. */
  date?: string
  /** Site-relative cover path, listed for Google Images. */
  image?: string
  draft?: boolean
}

// Only a full ISO date passes. <lastmod> takes W3C Datetime, which the stored
// format already is, so anything else is a frontmatter mistake — better to
// leave it out than to emit a date a validator rejects.
const lastmod = (input?: string) =>
  input && /^\d{4}-\d{2}-\d{2}$/.test(input) ? input : ''

/**
 * Drafts dropped; emitted in the order given, because a sitemap mixes
 * hand-listed pages with content and only the caller knows the useful order.
 *
 * No <changefreq> or <priority>: Google ignores both, so they would be noise
 * that still has to be kept true. Images carry <image:loc> and nothing else —
 * Google dropped support for image:title and image:caption, so emitting them
 * would just be bytes no one reads.
 */
export function buildSitemap(urls: SitemapUrl[], siteUrl: string): string {
  const absolute = (path: string) => new URL(path, siteUrl).href

  const rendered = urls
    .filter(url => !url.draft)
    .map((url) => {
      const stamp = lastmod(url.date)
      return [
        '  <url>',
        `    <loc>${escape(absolute(url.path))}</loc>`,
        stamp ? `    <lastmod>${stamp}</lastmod>` : '',
        url.image ? '    <image:image>' : '',
        url.image ? `      <image:loc>${escape(absolute(url.image))}</image:loc>` : '',
        url.image ? '    </image:image>' : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    + ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...rendered,
    '</urlset>',
  ].join('\n')
}
