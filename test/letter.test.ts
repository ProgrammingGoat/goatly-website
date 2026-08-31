import { describe, expect, it } from 'vitest'
import { defaultSalutation, parseLetter, renderBody, splitFrontmatter } from '../scripts/letter-data'
import { letterDate } from '../scripts/letterhead'

// Three things here fail *invisibly*, which is the whole reason they are
// tested and the letter's layout is not. A wrong month, a swapped honorific or
// a sentence silently swallowed by an unescaped `<` all survive a proofread —
// and unlike a page on the site, a letter is printed once and posted, so the
// mistake cannot be fixed after it is noticed.

describe('letterDate', () => {
  it('runs east of UTC, where a date-shifting bug would reproduce', () => {
    // Guard for this file, not for letterDate: if vitest.config.ts stops
    // pinning TZ, a regression that reintroduced `new Date` would quietly pass.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/Berlin')
  })

  it('spells the German month and leaves the day unpadded', () => {
    expect(letterDate('2026-09-15', 'de')).toBe('15. September 2026')
    expect(letterDate('2026-01-01', 'de')).toBe('1. Januar 2026')
  })

  it('gives the same date in every timezone', () => {
    // The mechanism, not one lucky offset. Pinning TZ to Europe/Berlin cannot
    // catch a `new Date` regression on its own: an ISO date-only string parses
    // as UTC midnight, which is still the right day anywhere *east* of UTC.
    // Los Angeles is where it shifts back a day — and a January letter dated
    // to the previous year is not a typo anyone catches before posting.
    const tz = process.env.TZ
    try {
      for (const zone of ['Europe/Berlin', 'America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
        process.env.TZ = zone
        expect(letterDate('2026-01-01', 'de'), zone).toBe('1. Januar 2026')
        expect(letterDate('2025-12-31', 'de'), zone).toBe('31. Dezember 2025')
        expect(letterDate('2026-09-15', 'en'), zone).toBe('15 September 2026')
      }
    }
    finally {
      process.env.TZ = tz
    }
  })

  it('puts the day first in English too, never US order', () => {
    expect(letterDate('2026-09-15', 'en')).toBe('15 September 2026')
  })

  it('prefixes the place when given one', () => {
    expect(letterDate('2026-09-15', 'de', 'Heidelberg')).toBe('Heidelberg, 15. September 2026')
  })

  it('rejects anything that is not an ISO date', () => {
    // A silently-wrong date is the failure worth preventing, so a malformed
    // one has to stop the build rather than print something plausible.
    expect(() => letterDate('15.09.2026', 'de')).toThrow(/ISO/)
    expect(() => letterDate('2026-9-15', 'de')).toThrow(/ISO/)
    expect(() => letterDate('2026-13-01', 'de')).toThrow(/month/)
  })
})

describe('defaultSalutation', () => {
  it('turns the address block\'s dative "Herrn" back into the nominative', () => {
    // A German address block conventionally reads "Herrn Müller"; the
    // salutation must not. Getting this wrong is the kind of mistake a
    // recruiter notices and the writer never does.
    expect(defaultSalutation({ company: 'X', name: 'Herrn Müller' }, 'de'))
      .toBe('Sehr geehrter Herr Müller,')
    expect(defaultSalutation({ company: 'X', name: 'Herr Müller' }, 'de'))
      .toBe('Sehr geehrter Herr Müller,')
  })

  it('agrees the adjective ending with Frau', () => {
    expect(defaultSalutation({ company: 'X', name: 'Frau Schmidt' }, 'de'))
      .toBe('Sehr geehrte Frau Schmidt,')
  })

  it('keeps titles attached to the name', () => {
    expect(defaultSalutation({ company: 'X', name: 'Frau Dr. Schmidt' }, 'de'))
      .toBe('Sehr geehrte Frau Dr. Schmidt,')
  })

  it('falls back when the ad names nobody', () => {
    expect(defaultSalutation({ company: 'X' }, 'de')).toBe('Sehr geehrte Damen und Herren,')
    expect(defaultSalutation({ company: 'X' }, 'en')).toBe('Dear Sir or Madam,')
  })

  it('does not guess a gender it was not given', () => {
    expect(defaultSalutation({ company: 'X', name: 'Kim Vogel' }, 'de'))
      .toBe('Sehr geehrte:r Kim Vogel,')
  })
})

describe('renderBody', () => {
  it('escapes before applying markdown, so no text is swallowed', () => {
    // The failure this guards: an unescaped `<` opens a tag the browser then
    // eats the rest of the sentence into, and the PDF is short a clause that
    // was in the source. Nothing errors; you simply sent less than you wrote.
    const html = renderBody('Ich nutze A < B & C > D täglich.')
    expect(html).toBe('<p>Ich nutze A &lt; B &amp; C &gt; D täglich.</p>')
  })

  it('does not let markdown reach through an escape', () => {
    expect(renderBody('<strong>nope</strong>')).toBe('<p>&lt;strong&gt;nope&lt;/strong&gt;</p>')
  })

  it('joins wrapped lines so the source can be hard-wrapped', () => {
    expect(renderBody('eine Zeile\nund noch eine')).toBe('<p>eine Zeile und noch eine</p>')
  })

  it('separates paragraphs on a blank line', () => {
    expect(renderBody('erster\n\nzweiter')).toBe('<p>erster</p>\n<p>zweiter</p>')
  })

  it('renders a bullet list only when every line is a bullet', () => {
    expect(renderBody('- eins\n- zwei')).toBe('<ul><li>eins</li><li>zwei</li></ul>')
    // A stray dash mid-paragraph must stay prose, not become a one-item list.
    expect(renderBody('Text\n- nicht wirklich eine Liste'))
      .toBe('<p>Text - nicht wirklich eine Liste</p>')
  })

  it('handles bold and italic without eating the surrounding text', () => {
    expect(renderBody('sehr **wichtig** und *kursiv* dazu'))
      .toBe('<p>sehr <strong>wichtig</strong> und <em>kursiv</em> dazu</p>')
  })

  it('leaves a lone asterisk alone', () => {
    expect(renderBody('5 * 3 = 15')).toBe('<p>5 * 3 = 15</p>')
  })
})

describe('splitFrontmatter', () => {
  it('reads CRLF files, which a Windows editor writes', () => {
    const { data, body } = splitFrontmatter('---\r\nsubject: Hallo\r\n---\r\nText\r\n')
    expect(data).toEqual({ subject: 'Hallo' })
    expect(body.trim()).toBe('Text')
  })

  it('tolerates a BOM', () => {
    const { data } = splitFrontmatter('﻿---\nsubject: Hallo\n---\nText\n')
    expect(data).toEqual({ subject: 'Hallo' })
  })

  it('refuses a file with no frontmatter', () => {
    expect(() => splitFrontmatter('just a letter')).toThrow(/frontmatter/)
  })
})

describe('parseLetter', () => {
  const base = [
    '---',
    'date: 2026-09-15',
    'subject: Bewerbung',
    'recipient:',
    '  company: Beispiel GmbH',
    '---',
    'Guten Tag.',
  ].join('\n')

  it('defaults to German and its closing', () => {
    const l = parseLetter(base)
    expect(l.lang).toBe('de')
    expect(l.closing).toBe('Freundliche Grüße')
    expect(l.salutation).toBe('Sehr geehrte Damen und Herren,')
  })

  it('lets an explicit salutation beat the derived one', () => {
    const l = parseLetter(base.replace('subject: Bewerbung', 'subject: Bewerbung\nsalutation: Moin,'))
    expect(l.salutation).toBe('Moin,')
  })

  it('names the missing field rather than failing further down', () => {
    expect(() => parseLetter(base.replace('subject: Bewerbung\n', ''))).toThrow(/subject/)
    expect(() => parseLetter(base.replace('  company: Beispiel GmbH\n', ''))).toThrow(/company/)
    expect(() => parseLetter(base.replace('Guten Tag.', ''))).toThrow(/no body/)
    expect(() => parseLetter(base.replace('date: 2026-09-15', 'lang: fr\ndate: 2026-09-15')))
      .toThrow(/de or en/)
  })
})
