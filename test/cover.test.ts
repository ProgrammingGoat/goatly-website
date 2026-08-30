import { describe, expect, it } from 'vitest'
import { coverCrop, coverPosition } from '../app/utils/cover'

// The failure worth guarding here is the quiet one: a *valid* `focus:` wrongly
// rejected reverts silently to centre, and the author blames their own typing.
// A wrong crop from a correctly-parsed value shows up on first page load.
describe('coverPosition', () => {
  it('puts a single keyword on its own axis and centres the other', () => {
    expect(coverPosition('top')).toBe('50% 0%')
    expect(coverPosition('bottom')).toBe('50% 100%')
    expect(coverPosition('left')).toBe('0% 50%')
    expect(coverPosition('right')).toBe('100% 50%')
    expect(coverPosition('center')).toBe('50% 50%')
  })

  it('reads a keyword pair in either order', () => {
    expect(coverPosition('top left')).toBe('0% 0%')
    expect(coverPosition('left top')).toBe('0% 0%')
    expect(coverPosition('bottom right')).toBe('100% 100%')
  })

  it('takes percentages, x before y as in CSS', () => {
    expect(coverPosition('50% 25%')).toBe('50% 25%')
    expect(coverPosition('25%')).toBe('25% 50%')
    expect(coverPosition('12.5% 33.5%')).toBe('12.5% 33.5%')
  })

  it('mixes a keyword with a percentage, keyword keeping its axis', () => {
    expect(coverPosition('left 25%')).toBe('0% 25%')
    expect(coverPosition('25% top')).toBe('25% 0%')
    expect(coverPosition('center 20%')).toBe('50% 20%')
  })

  it('folds case and surrounding space, so CMS and hand-written agree', () => {
    expect(coverPosition('  Top Left ')).toBe('0% 0%')
    expect(coverPosition('TOP')).toBe('50% 0%')
  })

  it('clamps percentages into the frame', () => {
    expect(coverPosition('150% -20%')).toBe('100% 0%')
  })

  it('returns undefined when there is nothing to say', () => {
    // Undefined leaves the browser default in place — which is centre anyway.
    expect(coverPosition(undefined)).toBeUndefined()
    expect(coverPosition('')).toBeUndefined()
    expect(coverPosition('   ')).toBeUndefined()
  })

  it('rejects what CSS would reject, rather than emitting it', () => {
    expect(coverPosition('banana')).toBeUndefined()
    expect(coverPosition('top bottom')).toBeUndefined() // one axis, twice
    expect(coverPosition('left right')).toBeUndefined()
    expect(coverPosition('top left bottom')).toBeUndefined() // 3-value syntax
    expect(coverPosition('50')).toBeUndefined() // no unit
    expect(coverPosition('50px')).toBeUndefined() // not a percentage
    expect(coverPosition('url(x)')).toBeUndefined()
  })
})

// Invisible twice over: the card is only ever seen in someone else's chat
// window, and a box that leaves the source makes IPX refuse the crop, so the
// card 404s rather than merely looking wrong. The pairing with coverPosition
// is the point — the two have to agree about where a `focus:` points, or the
// card crops somewhere the site never does.
describe('coverCrop', () => {
  const CARD = { width: 1200, height: 630 }

  it('takes the largest window of the target shape that fits', () => {
    // Portrait source: the width fills, the height is what slides.
    expect(coverCrop('50% 50%', { width: 1000, height: 2000 }, CARD))
      .toEqual({ left: 0, top: 738, width: 1000, height: 525 })
    // Landscape source, wider than the card: the height fills instead.
    expect(coverCrop('50% 50%', { width: 4000, height: 1000 }, CARD))
      .toEqual({ left: 1048, top: 0, width: 1905, height: 1000 })
  })

  it('places the window where object-position would: p × (image − box)', () => {
    // A tall portrait cover — the crop that pushed the subject past the
    // bottom edge. 2593 − 1984/(1200/630) = 1551px of slide; 32% of it is 496.
    expect(coverCrop('50% 32%', { width: 1984, height: 2593 }, CARD))
      .toMatchObject({ left: 0, top: 496 })
    // A landscape cover, which the nine keywords rounded to the very top.
    expect(coverCrop('47% 18%', { width: 2468, height: 1868 }, CARD))
      .toMatchObject({ left: 0, top: 103 })
  })

  it('pins to an edge at 0% and 100%, without leaving the source', () => {
    const source = { width: 1000, height: 2000 }
    expect(coverCrop('50% 0%', source, CARD)).toMatchObject({ top: 0 })

    const bottom = coverCrop('50% 100%', source, CARD)!
    expect(bottom.top + bottom.height).toBe(source.height)
  })

  it('never lets the box run past the source, whatever the focus', () => {
    const sources = [
      { width: 1984, height: 2593 }, { width: 2468, height: 1868 },
      { width: 3508, height: 2480 }, { width: 1280, height: 877 },
      { width: 999, height: 1000 }, { width: 1201, height: 629 },
    ]
    const focuses = ['0% 0%', '100% 100%', '50% 50%', '17% 83%', 'top left', undefined]
    for (const source of sources) {
      for (const focus of focuses) {
        const box = coverCrop(focus, source, CARD)!
        const where = `${source.width}x${source.height} @ ${focus}`
        expect(box.left, where).toBeGreaterThanOrEqual(0)
        expect(box.top, where).toBeGreaterThanOrEqual(0)
        expect(box.left + box.width, where).toBeLessThanOrEqual(source.width)
        expect(box.top + box.height, where).toBeLessThanOrEqual(source.height)
      }
    }
  })

  it('centres an unparseable focus rather than refusing to crop', () => {
    // Same fallback coverPosition leaves to the browser: a typo loses the
    // focus, not the card.
    expect(coverCrop('banana', { width: 1000, height: 2000 }, CARD))
      .toMatchObject({ top: 738 })
  })

  it('returns undefined when the source was never measured', () => {
    // No dimensions, no pixels to compute with — the caller crops centred.
    expect(coverCrop('50% 20%', { width: 0, height: 0 }, CARD)).toBeUndefined()
  })
})
