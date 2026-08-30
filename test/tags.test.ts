import { describe, expect, it } from 'vitest'
import { collectTags, foldTag, hasTag } from '../app/utils/tags'

describe('foldTag', () => {
  it('folds case and surrounding space, so one tag stays one tag', () => {
    expect(foldTag('Sketch')).toBe('sketch')
    expect(foldTag('  sketch ')).toBe('sketch')
  })
})

describe('collectTags', () => {
  it('merges spellings of the same tag and counts them together', () => {
    // The failure this guards is quiet: the pill renders, and only clicking it
    // reveals a filter that matches nothing.
    const tags = collectTags([
      { tags: ['Sketch'] },
      { tags: ['sketch'] },
      { tags: [' SKETCH '] },
    ])
    expect(tags).toEqual([{ key: 'sketch', label: 'Sketch', count: 3 }])
  })

  it('keeps the first spelling seen for display', () => {
    expect(collectTags([{ tags: ['Ink'] }, { tags: ['ink'] }])[0]?.label).toBe('Ink')
  })

  it('orders by count, then alphabetically', () => {
    const tags = collectTags([
      { tags: ['zebra', 'ink'] },
      { tags: ['ink'] },
      { tags: ['apple'] },
    ])
    expect(tags.map(t => t.key)).toEqual(['ink', 'apple', 'zebra'])
  })

  it('skips blank tags and entries with none', () => {
    expect(collectTags([{ tags: ['', '  '] }, {}, { tags: undefined }])).toEqual([])
  })
})

describe('hasTag', () => {
  it('matches on the folded form', () => {
    expect(hasTag({ tags: ['Ink', 'Sketch'] }, 'sketch')).toBe(true)
    expect(hasTag({ tags: ['Ink'] }, 'sketch')).toBe(false)
    expect(hasTag({}, 'sketch')).toBe(false)
  })
})
