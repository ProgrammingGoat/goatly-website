/**
 * Whether the committed CV PDFs still match the CV data.
 *
 * THE FAILURE THIS GUARDS is silent and slow: `npm run cv` is a manual step, so
 * editing content/cv/cv.yml and committing without rerunning it leaves the site
 * serving a web CV and a PDF that disagree about the same job. Nothing errors,
 * nothing looks broken, and the first person to notice is a recruiter reading
 * both — which is the worst possible reviewer for that bug.
 *
 * WHY A HASH OF THE RENDERED HTML, and not any of the obvious alternatives:
 *
 *   - File mtimes are useless: git does not preserve them, so a fresh clone has
 *     every file stamped at checkout time and the comparison is meaningless.
 *   - Reading the PDF back does not work. Chromium embeds subset fonts with
 *     custom glyph encoding, so inflating the content streams yields no
 *     readable text — the same wall privacy:check hits, and the reason
 *     build-cv.ts checks the HTML *before* printing rather than the bytes after.
 *   - Hashing cv.yml itself would fire on comments and reindentation, which
 *     change nothing in the output. Nobody keeps regenerating a PDF for a
 *     whitespace edit; they start passing --no-verify, and then the check is
 *     worse than nothing.
 *
 * The rendered HTML is the actual input to the printer, and renderCv is pure —
 * so this runs in milliseconds with no browser, and it is silent about
 * refactors that genuinely do not change the output. The letterhead extraction
 * that moved half of cv-template.ts into letterhead.ts produced byte-identical
 * HTML; a check keyed on source files would have cried wolf over it.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { renderCv, type CvData, type Lang } from './cv-template.ts'

export const PUBLIC_CV = 'content/cv/cv.yml'
export const PUBLIC_DIR = 'public/cv'
export const MANIFEST = join(PUBLIC_DIR, 'manifest.json')

/** The languages that get a committed, public PDF. */
export const PUBLIC_LANGS: Lang[] = ['en', 'de']

export function pdfName(name: string, lang: Lang): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slug}-${lang === 'de' ? 'lebenslauf' : 'cv'}.pdf`
}

export function hashHtml(html: string): string {
  return createHash('sha256').update(html).digest('hex').slice(0, 16)
}

/** What the PDFs *should* contain, keyed by filename. */
export function expectedHashes(): Record<string, string> {
  const cv = parse(readFileSync(PUBLIC_CV, 'utf8')) as CvData
  const out: Record<string, string> = {}
  for (const lang of PUBLIC_LANGS) {
    out[pdfName(cv.name, lang)] = hashHtml(renderCv(cv, lang))
  }
  return out
}

export type Staleness = { file: string, reason: string }

/** Empty means the committed PDFs match the data. */
export function checkFreshness(): Staleness[] {
  const expected = expectedHashes()

  if (!existsSync(MANIFEST)) {
    return [{ file: MANIFEST, reason: 'missing — the PDFs have never been fingerprinted' }]
  }
  let recorded: Record<string, string>
  try {
    recorded = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Record<string, string>
  }
  catch {
    return [{ file: MANIFEST, reason: 'unreadable — rebuild to regenerate it' }]
  }

  const stale: Staleness[] = []
  for (const [file, want] of Object.entries(expected)) {
    if (!existsSync(join(PUBLIC_DIR, file))) {
      stale.push({ file, reason: 'the PDF itself is missing' })
    }
    else if (recorded[file] !== want) {
      stale.push({
        file,
        reason: recorded[file]
          ? `built from different data (${recorded[file]}, data now hashes to ${want})`
          : 'not listed in the manifest',
      })
    }
  }
  return stale
}
