/**
 * Reading an Anschreiben's Markdown file into the shape the template wants.
 *
 * Split out of build-letter.ts so it can be tested without the CLI: that file
 * ends in `await main()`, so importing it would run it. Same reason
 * server/utils/feed.ts is split out of rss.xml.ts.
 *
 * Everything here is pure — no filesystem, no browser, no argv.
 */

import { parse } from 'yaml'
import { esc, type Lang } from './letterhead.ts'
import type { LetterData, Recipient } from './letter-template.ts'

/** Closings that are conventional rather than a choice, so they need no frontmatter. */
const CLOSING: Record<Lang, string> = {
  de: 'Freundliche Grüße',
  en: 'Yours sincerely',
}

/**
 * A deliberately small Markdown subset: paragraphs, bullet lists, bold, italic.
 *
 * No headings, no tables, no images. An Anschreiben is four paragraphs and
 * occasionally a short list; anything more structural than that is a sign the
 * letter has stopped being a letter. Keeping the subset this small is also why
 * there is no Markdown dependency here.
 */
export function renderBody(md: string): string {
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\W)\*(?!\s)(.+?)(?<!\s)\*/g, '$1<em>$2</em>')

  return md
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.every(l => /^[-*]\s+/.test(l))) {
        const items = lines.map(l => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('')
        return `<ul>${items}</ul>`
      }
      return `<p>${inline(lines.join(' '))}</p>`
    })
    .join('\n')
}

/** Split `---\nfrontmatter\n---\nbody`. */
export function splitFrontmatter(raw: string): { data: unknown, body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw.replace(/^\uFEFF/, ''))
  if (!m) {
    throw new Error('no frontmatter: the file must start with a --- block')
  }
  return { data: parse(m[1]!) ?? {}, body: m[2] ?? '' }
}

/**
 * A salutation, when the frontmatter does not give one.
 *
 * "Sehr geehrte Damen und Herren" is the fallback and never the goal — if the
 * ad names a person, naming them back is the single cheapest thing a letter
 * can do. The German honorific has to be guessed from the name field, so an
 * explicit `salutation:` always wins.
 */
export function defaultSalutation(r: Recipient, lang: Lang): string {
  if (!r.name) {
    return lang === 'de' ? 'Sehr geehrte Damen und Herren,' : 'Dear Sir or Madam,'
  }
  if (lang === 'en') return `Dear ${r.name},`

  const m = /^(Herrn?|Frau)\s+(.*)$/i.exec(r.name.trim())
  if (!m) return `Sehr geehrte:r ${r.name},`
  const anrede = /^herr/i.test(m[1]!) ? 'Sehr geehrter Herr' : 'Sehr geehrte Frau'
  return `${anrede} ${m[2]},`
}

/** What the frontmatter may carry. Validated below, since it is hand-written. */
type Frontmatter = {
  lang?: string
  date?: string
  place?: string
  recipient?: Recipient
  subject?: string
  reference?: string
  salutation?: string
  closing?: string
  enclosures?: string[]
}

export function parseLetter(raw: string): LetterData {
  const { data, body } = splitFrontmatter(raw)
  const fm = data as Frontmatter

  const lang: Lang = fm.lang ?? 'de'
  if (lang !== 'de' && lang !== 'en') throw new Error(`lang must be de or en, got "${fm.lang}"`)

  for (const key of ['date', 'subject'] as const) {
    if (!fm[key]) throw new Error(`frontmatter is missing \`${key}:\``)
  }
  if (!fm.recipient?.company) throw new Error('frontmatter is missing `recipient.company:`')
  if (!body.trim()) throw new Error('the letter has no body under the frontmatter')

  const recipient = fm.recipient as Recipient
  return {
    lang,
    date: String(fm.date),
    place: fm.place,
    recipient,
    subject: fm.subject!,
    reference: fm.reference,
    salutation: fm.salutation ?? defaultSalutation(recipient, lang),
    closing: fm.closing ?? CLOSING[lang],
    body: renderBody(body),
    enclosures: fm.enclosures,
  }
}
