import { describe, expect, it } from 'vitest'
import { routePath } from '../app/utils/route'

describe('routePath', () => {
  it('strips a trailing slash', () => {
    // The failure this guards is silent: an entry page hydrating at the
    // slashed path missed its payload key and rendered no content.
    expect(routePath('/projects/a-thing/')).toBe('/projects/a-thing')
    expect(routePath('/projects/hello-world/')).toBe('/projects/hello-world')
  })

  it('leaves an already-normalised path alone', () => {
    expect(routePath('/projects/a-thing')).toBe('/projects/a-thing')
    expect(routePath('/projects')).toBe('/projects')
  })

  it('keeps the root as /', () => {
    expect(routePath('/')).toBe('/')
  })
})
