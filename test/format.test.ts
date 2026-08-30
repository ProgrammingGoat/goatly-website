import { describe, expect, it } from 'vitest'
import { formatDate, formatYear } from '../app/utils/format'

describe('formatDate', () => {
  it('runs east of UTC, where the off-by-one-day bug reproduces', () => {
    // Guard for the test below, not for formatDate. If vitest.config.ts stops
    // pinning TZ, the regression test would quietly pass against the bug —
    // this fails loudly instead.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/Berlin')
    expect(new Date('2026-08-01T00:00:00Z').getHours()).not.toBe(0)
  })

  it('keeps a non-ISO date on its own day (regression: 2e80334)', () => {
    // Parsed as local midnight, so routing through toISOString() used to shift
    // this back to 31 Jul anywhere east of UTC.
    expect(formatDate('August 1, 2026')).toBe('1 Aug 2026')
    expect(formatDate('1 August 2026')).toBe('1 Aug 2026')
  })

  it('renders an ISO date as a named month', () => {
    expect(formatDate('2026-08-01')).toBe('1 Aug 2026')
    expect(formatDate('2019-06-14')).toBe('14 Jun 2019')
  })

  it('takes the date part of an ISO timestamp without shifting it', () => {
    expect(formatDate('2026-08-01T23:30:00Z')).toBe('1 Aug 2026')
    expect(formatDate('2026-08-01T00:30:00+09:00')).toBe('1 Aug 2026')
  })

  it('leaves the day unpadded', () => {
    expect(formatDate('March 5, 2026')).toBe('5 Mar 2026')
    expect(formatDate('2026-03-05')).toBe('5 Mar 2026')
  })

  it('returns an empty string for nothing', () => {
    expect(formatDate()).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('hands back input it cannot parse, rather than "NaN-NaN-NaN"', () => {
    expect(formatDate('sometime last spring')).toBe('sometime last spring')
  })

  it('hands back a date whose month does not exist', () => {
    // Shape matches, value does not — better the raw string than "1 undefined 2026".
    expect(formatDate('2026-13-01')).toBe('2026-13-01')
  })
})

describe('formatYear', () => {
  it('reads the year off an ISO date without going near a timezone', () => {
    // new Date('2026-01-01') is UTC midnight, an hour into 2025 west of UTC.
    expect(formatYear('2026-01-01')).toBe('2026')
    expect(formatYear('2019-12-31')).toBe('2019')
    expect(formatYear('2026-01-01T00:30:00+09:00')).toBe('2026')
  })

  it('falls back to parsing anything else', () => {
    expect(formatYear('August 1, 2026')).toBe('2026')
  })

  it('does not read a year out of a longer digit run', () => {
    expect(formatYear('20260801')).toBe('20260801')
  })

  it('returns an empty string for nothing', () => {
    expect(formatYear()).toBe('')
    expect(formatYear('')).toBe('')
  })

  it('hands back input it cannot parse', () => {
    expect(formatYear('sometime last spring')).toBe('sometime last spring')
  })
})
