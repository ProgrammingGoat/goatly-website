import { describe, expect, it } from 'vitest'
import { collectTags, foldTag, hasTag } from '../app/utils/tags'

describe('foldTag', () => {
  it('folds case and surrounding space, so one tag stays one tag', () => {
    expect(foldTag('Testing')).toBe('testing')
    expect(foldTag('  testing ')).toBe('testing')
  })
})

describe('collectTags', () => {
  it('merges spellings of the same tag and counts them together', () => {
    // The failure this guards is quiet: the pill renders, and only clicking it
    // reveals a filter that matches nothing.
    const tags = collectTags([
      { tags: ['TypeScript'] },
      { tags: ['typescript'] },
      { tags: [' TYPESCRIPT '] },
    ])
    expect(tags).toEqual([{ key: 'typescript', label: 'TypeScript', count: 3 }])
  })

  it('keeps the first spelling seen for display', () => {
    expect(collectTags([{ tags: ['Vue'] }, { tags: ['vue'] }])[0]?.label).toBe('Vue')
  })

  it('orders by count, then alphabetically', () => {
    const tags = collectTags([
      { tags: ['vue', 'testing'] },
      { tags: ['testing'] },
      { tags: ['api'] },
    ])
    expect(tags.map(t => t.key)).toEqual(['testing', 'api', 'vue'])
  })

  it('skips blank tags and entries with none', () => {
    expect(collectTags([{ tags: ['', '  '] }, {}, { tags: undefined }])).toEqual([])
  })
})

describe('hasTag', () => {
  it('matches on the folded form', () => {
    expect(hasTag({ tags: ['Vue', 'Testing'] }, 'testing')).toBe(true)
    expect(hasTag({ tags: ['Vue'] }, 'testing')).toBe(false)
    expect(hasTag({}, 'testing')).toBe(false)
  })
})
