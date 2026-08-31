import { describe, expect, it } from 'vitest'
import { coverPosition } from '../app/utils/cover'

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
