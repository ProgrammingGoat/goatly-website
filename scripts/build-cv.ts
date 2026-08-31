/**
 * Prints the CV to an A4 PDF.
 *
 *   npm run cv                  public English + German → public/cv/
 *   npm run cv -- --private     full English + German   → cv-out/
 *   npm run cv -- --all         all four
 *
 * A language is never built on its own. The two are one document in two
 * renderings, and building them separately is what lets them drift: a change
 * made to the German on Tuesday and the English on Friday ships a pair that
 * disagrees, with nothing to catch it.
 *
 * The public pair carries no private data and is committed, because it is
 * linked from /cv. The --private pair carries the street address and phone,
 * lands in gitignored cv-out/, and is attached to applications by hand.
 *
 * WHY THE SPLIT IS STRUCTURAL: a public build never merges cv.private.yml at
 * all, so a private value cannot reach the PDF by being forgotten in a
 * template — it is not in the data. The assertion below is a second line of
 * defence, not the first, and it matters because privacy:check CANNOT see
 * inside a committed PDF: text in a PDF is Flate-compressed, so a substring
 * search over the bytes finds nothing. This script is the only place that can
 * check a PDF's content, and it does it before the bytes are written.
 *
 * Rendered with Chromium via playwright-core, pointed at a system browser
 * rather than a downloaded one — the PDF is built locally and occasionally,
 * and a 150MB download per machine is not worth it.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'
import { legal } from '../app/legal.ts'
import { renderCv, type CvData, type Lang } from './cv-template.ts'
import { hashHtml, MANIFEST, pdfName, PUBLIC_LANGS } from './cv-freshness.ts'
import { launch, printPdf } from './pdf.ts'

/** Both are always built together — see the note at the top of the file. */
const LANGS: Lang[] = ['en', 'de']

const PUBLIC_CV = 'content/cv/cv.yml'
const PRIVATE_CV = 'cv.private.yml'

/** Where a build lands. Private output is gitignored; public output is committed. */
const OUT = {
  private: 'cv-out',
  public: 'public/cv',
}

/** Filenames are what a recruiter sees in their downloads folder. */
function filename(name: string, lang: Lang, isPrivate: boolean): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const kind = lang === 'de' ? 'lebenslauf' : 'cv'
  return `${slug}-${kind}${isPrivate ? '-full' : ''}.pdf`
}

/** Every string in an object, with the key path that led to it. */
function leaves(node: unknown, path = ''): [string, string][] {
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  }
  if (typeof node === 'string' || typeof node === 'number') return [[path, String(node)]]
  return []
}

/**
 * Refuse to write a public PDF whose HTML contains a private value.
 *
 * Same rule as scripts/privacy-check.ts: the values are read at runtime and a
 * failure names the key path, never the value. Values under 6 characters are
 * skipped — they match anything.
 */
function assertNoPrivateData(html: string, lang: Lang) {
  if (!existsSync(PRIVATE_CV)) return // nothing to compare against
  const hay = html.toLowerCase()
  const hits = leaves(parse(readFileSync(PRIVATE_CV, 'utf8')))
    .filter(([, v]) => v.trim().length >= 6 && hay.includes(v.toLowerCase()))
    .map(([k]) => k)

  if (hits.length) {
    console.error(`\nprivacy: refusing to write the public ${lang.toUpperCase()} PDF.`)
    console.error(`  Private values reached the public render: ${hits.join(', ')}`)
    console.error(`  Values are not printed on purpose — look the key path up in ${PRIVATE_CV}.\n`)
    process.exit(1)
  }
}

function loadData(usePrivate: boolean): CvData {
  if (!existsSync(PUBLIC_CV)) throw new Error(`missing ${PUBLIC_CV}`)
  const cv = parse(readFileSync(PUBLIC_CV, 'utf8')) as CvData

  if (!usePrivate) return cv

  if (!existsSync(PRIVATE_CV)) {
    throw new Error(
      `--private needs ${PRIVATE_CV}, which is missing.\n`
      + `  Copy docs/cv-private-template.yml to ${PRIVATE_CV} and fill it in.`,
    )
  }
  const priv = parse(readFileSync(PRIVATE_CV, 'utf8')) ?? {}
  // The postal address comes from app/legal.ts, not the private file: it is
  // published in the Impressum, so app/legal.ts is its one source. Phone and
  // personal email are still private and still come from cv.private.yml.
  return {
    ...cv,
    private: { ...(priv.contact ?? {}), address: legal.address ?? undefined },
  }
}

async function main() {
  const args = process.argv.slice(2)

  // An unrecognised flag is rejected rather than ignored: --private is the
  // only thing separating the committed pair from the one with the address in
  // it, so a typo has to fail rather than quietly build the other one.
  const KNOWN = new Set(['--private', '--all'])
  for (const arg of args.filter(a => !KNOWN.has(a))) {
    console.error(
      arg.startsWith('--lang')
        ? '--lang is gone: both languages are always built, so the pair cannot drift.'
        : `unknown option ${arg}`,
    )
    console.error('usage: npm run cv [-- --private] [-- --all]')
    process.exit(1)
  }

  const jobs: { lang: Lang, isPrivate: boolean }[]
    = (args.includes('--all') ? [false, true] : [args.includes('--private')])
      .flatMap(isPrivate => LANGS.map(lang => ({ lang, isPrivate })))

  const built: Record<string, string> = {}

  const browser = await launch()
  try {
    for (const { lang, isPrivate } of jobs) {
      const data = loadData(isPrivate)
      const html = renderCv(data, lang)
      if (!isPrivate) built[pdfName(data.name, lang)] = hashHtml(html)

      if (!isPrivate) assertNoPrivateData(html, lang)

      const dir = isPrivate ? OUT.private : OUT.public
      const out = resolve(dir, filename(data.name, lang, isPrivate))
      const { pages } = await printPdf(browser, html, out)
      const size = (readFileSync(out).length / 1024).toFixed(0)
      console.log(
        `${isPrivate ? 'private' : 'public '}  ${lang}  ${out}  (${pages} page${pages === 1 ? '' : 's'}, ${size}KB)`,
      )
      // This CV is laid out to fit one sheet. A second page almost always
      // means content grew, not that a two-pager was intended.
      if (pages > 1) {
        console.warn(`  warning: ${pages} pages — the layout targets one. Trim content or spacing.`)
      }
    }
  }
  finally {
    await browser.close()
  }

  // Only after a full public pair, so a partial run cannot leave a manifest
  // claiming more than was printed.
  if (PUBLIC_LANGS.every(l => built[pdfName(loadData(false).name, l)])) {
    writeFileSync(MANIFEST, JSON.stringify(built, null, 2) + '\n')
    console.log(`manifest  ${MANIFEST}`)
  }
}

await main()
