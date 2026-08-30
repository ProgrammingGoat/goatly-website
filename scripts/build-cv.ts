/**
 * Prints the CV to an A4 PDF.
 *
 *   npm run cv -- --lang=de --private   full German Lebenslauf → cv-out/
 *   npm run cv -- --lang=en --private   full English CV        → cv-out/
 *   npm run cv -- --lang=de             public German          → public/cv/
 *   npm run cv -- --lang=en             public English         → public/cv/
 *   npm run cv -- --all                 all four
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

import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright-core'
import { parse } from 'yaml'
import { renderCv, type CvData, type Lang } from './cv-template.ts'

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

/** A system Chromium. Playwright's own download is not required or expected. */
function findBrowser(): string {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean) as string[]

  for (const path of candidates) if (existsSync(path)) return path

  throw new Error(
    'No Chromium found. Install one, or set CHROME_PATH to a browser binary.\n'
    + `  Looked in: ${candidates.join(', ')}`,
  )
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
  return { ...cv, private: priv.contact ?? {} }
}

async function main() {
  const args = process.argv.slice(2)
  const all = args.includes('--all')
  const usePrivate = args.includes('--private')
  const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1]

  if (!all && !langArg) {
    console.error('usage: npm run cv -- --lang=en|de [--private]   (or --all)')
    process.exit(1)
  }
  if (langArg && langArg !== 'en' && langArg !== 'de') {
    console.error(`unknown --lang=${langArg}; expected en or de`)
    process.exit(1)
  }

  const jobs: { lang: Lang, isPrivate: boolean }[] = all
    ? [
        { lang: 'en', isPrivate: false },
        { lang: 'de', isPrivate: false },
        { lang: 'en', isPrivate: true },
        { lang: 'de', isPrivate: true },
      ]
    : [{ lang: langArg as Lang, isPrivate: usePrivate }]

  const browser = await chromium.launch({ executablePath: findBrowser() })
  try {
    for (const { lang, isPrivate } of jobs) {
      const data = loadData(isPrivate)
      const html = renderCv(data, lang)

      if (!isPrivate) assertNoPrivateData(html, lang)

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle' })
      // Webfonts arrive after networkidle on a slow link; without this the
      // page can be printed mid-swap, in the fallback face.
      await page.evaluate(() => document.fonts.ready)

      const dir = isPrivate ? OUT.private : OUT.public
      const out = resolve(dir, filename(data.name, lang, isPrivate))
      mkdirSync(dirname(out), { recursive: true })

      await page.pdf({
        path: out,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      await page.close()

      const pages = countPages(out)
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
}

/** Page count, read straight off the PDF — no dependency, just the /Type /Page objects. */
function countPages(path: string): number {
  const bytes = readFileSync(path).toString('latin1')
  return (bytes.match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1
}

await main()
