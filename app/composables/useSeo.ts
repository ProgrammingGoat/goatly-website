import { site } from '~/site'

/**
 * Page titles, used both by the <title> template in app.vue and by the
 * og:title on the social card, so the two can't drift into disagreeing about
 * what a page is called.
 */
export function pageTitle(title?: string) {
  return title ? `${title} · ${site.name}` : site.name
}

type MaybeGetter<T> = T | (() => T)

/**
 * Per-page SEO and social-card tags.
 *
 * Wraps useSeoMeta rather than replacing it, because the Open Graph set needs
 * more than a title and a description: scrapers want an *absolute* og:image
 * (a site-relative path renders no card at all — which is what /projects/[slug]
 * and friends were emitting), and they don't fall back to the page's own
 * title or description, so those have to be stated twice.
 *
 * Site-wide tags — canonical, og:url, the Person schema — live in app.vue,
 * since they follow the route rather than the page.
 */
// The card every scraper lays a large preview out to: 1200×630, i.e. 1.91:1.
// Covers are whatever shape the work is, so the card is cropped rather than
// used as-is. Size is the other half of it — the raw covers run to several MB,
// and X drops an og:image over 5MB outright.
const CARD = { width: 1200, height: 630 } as const
const CARD_TYPE = 'image/jpeg'

/**
 * What a card is built from — an entry, or anything shaped like one. The whole
 * entry rather than a cover path, because the alt text is its own title.
 */
type CardSource = {
  title?: string
  cover?: string
}

export function useSeo(input: {
  title?: MaybeGetter<string | undefined>
  description?: MaybeGetter<string | undefined>
  /** The entry whose cover becomes the card. Omit for a page without one. */
  card?: MaybeGetter<CardSource | undefined>
  /** 'article' for a single entry, 'website' for an index. */
  type?: 'website' | 'article'
}) {
  const { siteUrl } = useRuntimeConfig().public
  const img = useImage()

  const source = () => {
    const entry = toValue(input.card)
    return entry?.cover ? entry : undefined
  }

  const image = () => {
    const entry = source()
    if (!entry) return undefined

    // Asking $img for the URL is also what gets the crop *built*: during
    // prerender it registers the path with Nitro, so the file lands in the
    // static output instead of 404ing at a URL only a scraper ever visits.
    const url = img(entry.cover!, {
      // Centred. Covers here are landscape screenshots and the card's shape is
      // close enough to theirs that aiming the crop bought nothing for the
      // build-time measuring pass it cost.
      fit: 'cover',
      ...CARD,
      // JPEG because scrapers won't take WebP, and its own quality above the
      // site's 72: this is the one JPEG anybody actually looks at.
      format: 'jpeg',
      quality: 85,
    })
    return new URL(url, siteUrl).href
  }
  const description = () => toValue(input.description) ?? site.description

  useSeoMeta({
    title: () => toValue(input.title),
    description,
    ogTitle: () => pageTitle(toValue(input.title)),
    ogDescription: description,
    ogType: input.type ?? 'website',
    ogImage: image,
    // What the cover depicts — the piece's own title, not the page's.
    ogImageAlt: () => source()?.title,
    ogImageType: () => (source() ? CARD_TYPE : undefined),
    // Safe to state now that the crop fixes the output size — a declared pair
    // that disagreed with the file would have the card laid out distorted.
    ogImageWidth: () => (source() ? CARD.width : undefined),
    ogImageHeight: () => (source() ? CARD.height : undefined),
    // X shows a postage stamp without this; the rest of the card it takes
    // from the og: tags above.
    twitterCard: () => (source() ? 'summary_large_image' : 'summary'),
  })
}
