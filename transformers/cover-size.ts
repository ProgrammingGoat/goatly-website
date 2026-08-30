import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineTransformer } from '@nuxt/content'
import { imageMeta } from 'image-meta'

/**
 * Measure each entry's cover at build time, into `coverWidth`/`coverHeight`.
 *
 * The site never needs this: its crops are CSS, and `object-position`'s
 * percentages are resolved by the browser, which decoded the image and so
 * knows its size. The social card has no browser — IPX crops it into a file
 * ahead of time and places the window in *pixels*. Turning a `focus:` of
 * `50% 32%` into pixels means knowing what it is 32% of, so the file gets
 * measured once here rather than guessed at, or rounded to one of sharp's
 * nine gravity keywords (which put the subject through the bottom edge).
 *
 * Both fields are derived, not authored. They're declared in
 * content.config.ts so they survive into the collection, but unlike every
 * other field there they belong in neither /templates nor the CMS config —
 * nobody types them.
 */

// Covers are served straight out of /public, so an entry's `cover:` path is
// also its path on disk, under the project root the build runs from.
const PUBLIC = join(process.cwd(), 'public')

export default defineTransformer({
  name: 'cover-size',
  extensions: ['.md'],
  transform(content) {
    const cover = content.cover
    if (typeof cover !== 'string' || !cover.startsWith('/')) return content

    try {
      const { width, height } = imageMeta(readFileSync(join(PUBLIC, cover)))
      if (width && height) return { ...content, coverWidth: width, coverHeight: height }
    }
    catch {
      // Fall through to the warning below.
    }

    // Not fatal: the card falls back to a centred crop, and a cover that is
    // genuinely missing already fails louder when prerendering its image.
    console.warn(`[cover-size] could not measure ${cover} — card will crop from the centre`)
    return content
  },
})
