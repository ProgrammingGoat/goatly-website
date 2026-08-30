// Auto-imported by Nuxt (from app/utils).
// Placeholder visuals for entries that don't have a cover image yet.

// Picked deterministically from a seed, so each entry is stable and distinct.
// Terminal greys with an amber lift — kept dark in both themes, because these
// sit behind white card text. Matches .hero-fallback in main.css.
const palettes = [
  ['#161b22', '#e3b341'], // ground → amber
  ['#0e1116', '#30363d'], // ground → slate
  ['#1c2128', '#8a5f0a'], // slate → deep amber
  ['#30363d', '#161b22'], // slate → ground
  ['#161b22', '#3fb950'], // ground → prompt green
]

// Screenshots are landscape far more often than not, so the placeholder shapes
// stay near 16/10 — a portrait placeholder next to real project covers reads as
// a broken image rather than a design choice.
const shapes = ['16 / 10', '3 / 2', '4 / 3', '16 / 9']

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

export function coverGradient(seed?: string): string {
  const [a, b] = palettes[hash(seed || 'goatly') % palettes.length]!
  return `linear-gradient(135deg, ${a}, ${b})`
}

export function coverAspect(seed?: string): string {
  // The shift is incidental: 5 palettes and 4 shapes are coprime, so colour and
  // shape are independent without it. Kept only so entries keep their shape.
  return shapes[(hash(seed || 'goatly') >>> 3) % shapes.length]!
}

// Crop focus — where a cropped cover keeps its subject.
// The hero and the cards fill their slot with `object-cover`, which always
// keeps the middle: a tall portrait loses its top and bottom, and a face is
// rarely dead centre. An entry's `focus:` moves the window that survives.

const X_KEYWORDS: Record<string, number | undefined> = { left: 0, right: 100 }
const Y_KEYWORDS: Record<string, number | undefined> = { top: 0, bottom: 100 }

// An axis-less token is positional — it fills whichever axis is still free.
type Token = { axis?: 'x' | 'y', value: number }

function parseToken(token: string): Token | undefined {
  const x = X_KEYWORDS[token]
  if (x !== undefined) return { axis: 'x', value: x }
  const y = Y_KEYWORDS[token]
  if (y !== undefined) return { axis: 'y', value: y }
  if (token === 'center') return { value: 50 }

  if (!/^-?\d+(?:\.\d+)?%$/.test(token)) return undefined
  return { value: Math.min(100, Math.max(0, Number.parseFloat(token))) }
}

/**
 * Resolve a frontmatter `focus` into a pair of percentages.
 *
 * Takes the CSS keywords in either order (`top`, `left bottom`, `bottom left`)
 * and percentage pairs (`50% 25%`) for when a keyword isn't precise enough.
 * Returns undefined for empty or unparseable input, so each caller can fall
 * back to centre in whatever way its own target expects.
 */
function parseFocus(focus?: string): { x: number, y: number } | undefined {
  const tokens = (focus || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length || tokens.length > 2) return undefined

  const parsed: Token[] = []
  for (const token of tokens) {
    const p = parseToken(token)
    if (!p) return undefined
    parsed.push(p)
  }

  const axes: { x?: number, y?: number } = {}

  // Keywords name their own axis first, so `top left` reads as `left top`.
  for (const { axis, value } of parsed) {
    if (!axis) continue
    if (axes[axis] !== undefined) return undefined // e.g. `top bottom`
    axes[axis] = value
  }

  // Then the positional ones fill what's left, x before y, as in CSS.
  for (const { axis, value } of parsed) {
    if (axis) continue
    if (axes.x === undefined) axes.x = value
    else if (axes.y === undefined) axes.y = value
    else return undefined
  }

  return { x: axes.x ?? 50, y: axes.y ?? 50 }
}

/**
 * Focus as an `object-position` value, for the covers cropped in CSS.
 *
 * Undefined for unparseable input, leaving the browser default — centred — in
 * place rather than emitting CSS the browser drops.
 */
export function coverPosition(focus?: string): string | undefined {
  const axes = parseFocus(focus)
  return axes && `${axes.x}% ${axes.y}%`
}

export type Box = { left: number, top: number, width: number, height: number }
export type Size = { width: number, height: number }

/**
 * The crop the social card takes out of a cover, in source pixels.
 *
 * This is `coverPosition`'s arithmetic done by hand. On the site the browser
 * does it: given `object-fit: cover` it scales the image to fill the box, and
 * `object-position: p%` then slides it so the p% point of each lines up —
 * which works out to an offset of `p × (image − box)`. IPX has no such
 * primitive (its `position` is a nine-way gravity keyword, no percentages), so
 * the same formula is applied here against the measured source instead.
 *
 * Undefined when the source hasn't been measured, leaving the caller to crop
 * from the centre. An unparseable `focus` is not a failure — it centres, the
 * same fallback `coverPosition` leaves to the browser.
 */
export function coverCrop(focus: string | undefined, source: Size, target: Size): Box | undefined {
  if (!(source.width > 0) || !(source.height > 0)) return undefined

  // The largest window of the target's shape that still fits the source: one
  // axis fills, the other is what's left to slide along.
  const ratio = target.width / target.height
  const fillsWidth = source.width / source.height < ratio
  const width = fillsWidth ? source.width : Math.round(source.height * ratio)
  const height = fillsWidth ? Math.round(source.width / ratio) : source.height

  const { x, y } = parseFocus(focus) ?? { x: 50, y: 50 }
  return {
    left: Math.round((x / 100) * (source.width - width)),
    top: Math.round((y / 100) * (source.height - height)),
    // Rounding can overshoot the source by a pixel; IPX rejects a box that
    // leaves it, and a rejected crop is a 404 where a card should be.
    width: Math.min(width, source.width),
    height: Math.min(height, source.height),
  }
}
