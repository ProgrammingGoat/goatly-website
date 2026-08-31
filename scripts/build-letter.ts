/**
 * Prints one Anschreiben to an A4 PDF.
 *
 *   npm run letter -- ../applications/2026-09-acme-backend.md
 *   npm run letter -- ../applications/2026-09-acme-backend.md --out ~/Desktop
 *
 * WHERE THE LETTERS LIVE. Not in this repo. The path is an argument and there
 * is no default, so this repo carries no assumption about where applications
 * are kept and no letter ever sits in its working tree — which is a stronger
 * guarantee than gitignore, since there is no `git add -A` that could reach
 * one. Keep them in a private repo: they name companies, they say why you want
 * to leave somewhere, and unlike a gitignored file they are then backed up and
 * have a history you can reread before an interview.
 *
 * The PDF lands beside its source by default, so one directory is one
 * application — letter, CV and whatever else you attach.
 *
 * PATHS ARE RESOLVED FROM THE REPO ROOT, not from your shell: `npm run` sets
 * the working directory to the package root before the script starts. A
 * relative path is therefore relative to this repo, which is why the error
 * below prints what it actually looked for.
 *
 * The sender is assembled from the same three sources the private CV uses, so
 * the two documents cannot disagree about a phone number: content/cv/cv.yml
 * for the name, email and links; app/legal.ts for the postal
 * address; cv.private.yml for the phone.
 */

import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve, sep } from 'node:path'
import { parse } from 'yaml'
import { legal } from '../app/legal.ts'
import { parseLetter } from './letter-data.ts'
import { renderLetter, type Sender } from './letter-template.ts'
import { launch, printPdf } from './pdf.ts'

/** One line of body text: 10.5pt at line-height 1.55, in mm. */
const LINE_MM = (10.5 * 1.55 * 25.4) / 72

const PUBLIC_CV = 'content/cv/cv.yml'
const PRIVATE_CV = 'cv.private.yml'

function loadSender(): Sender {
  if (!existsSync(PUBLIC_CV)) throw new Error(`missing ${PUBLIC_CV}`)
  const cv = parse(readFileSync(PUBLIC_CV, 'utf8'))

  if (!existsSync(PRIVATE_CV)) {
    throw new Error(
      `${PRIVATE_CV} is missing — a letter carries your phone number.\n`
      + '  Copy docs/cv-private-template.yml to it and fill it in.',
    )
  }
  const priv = parse(readFileSync(PRIVATE_CV, 'utf8')) ?? {}

  if (!legal.address?.length) {
    throw new Error('app/legal.ts has no address; a DIN 5008 letter needs one.')
  }

  return {
    name: cv.name,
    address: legal.address,
    email: priv.contact?.email ?? cv.email,
    phone: priv.contact?.phone,
    links: cv.links ?? [],
  }
}

async function main() {
  const args = process.argv.slice(2)

  const outIndex = args.findIndex(a => a === '--out')
  const outDir = outIndex === -1 ? undefined : args[outIndex + 1]
  if (outIndex !== -1 && !outDir) {
    console.error('--out needs a directory')
    process.exit(1)
  }
  // Guarded on outIndex !== -1: otherwise `outIndex + 1` is 0 and the filter
  // silently eats the filename.
  const positional = args.filter((a, i) =>
    !a.startsWith('--') && (outIndex === -1 || (i !== outIndex && i !== outIndex + 1)))

  if (positional.length !== 1) {
    console.error('usage: npm run letter -- <letter.md> [--out <dir>]')
    console.error('  paths are resolved from the repo root, not your shell')
    process.exit(1)
  }

  const src = resolve(positional[0]!)
  if (!existsSync(src)) {
    // The resolved path, not the argument: the difference between the two is
    // the whole confusion when a relative path does not land where expected.
    console.error(`no such file: ${src}`)
    process.exit(1)
  }

  const letter = parseLetter(readFileSync(src, 'utf8'))
  const sender = loadSender()
  const html = renderLetter(letter, sender)

  const out = join(outDir ? resolve(outDir) : dirname(src), `${basename(src, extname(src))}.pdf`)

  // Refuse to write inside this repo. A letter PDF carries the postal address,
  // the phone and the personal email, and privacy:check CANNOT see inside a
  // PDF — the text is Flate-compressed, so a substring search over the bytes
  // finds nothing. A letter written in here would therefore be invisible to
  // the one guard meant to catch exactly this.
  const repo = resolve(process.cwd())
  if (out === repo || out.startsWith(repo + sep)) {
    console.error(`refusing to write inside the repo: ${out}`)
    console.error('  A letter PDF carries private data and privacy:check cannot read PDFs.')
    console.error('  Keep letters and their output in a private repo outside this one.')
    process.exit(1)
  }

  const browser = await launch()
  try {
    const { pages, overflowMm } = await printPdf(browser, html, out, '.body')
    console.log(`${letter.lang}  ${out}  (${pages} page${pages === 1 ? '' : 's'})`)

    // One page is the convention for an Anschreiben, and a recruiter who sees
    // two reads it as not knowing that, so this warns louder than the CV's.
    if (pages > 1) {
      console.warn(`  warning: ${pages} pages — an Anschreiben is one. Cut a paragraph.`)
    }
    // The page count does not catch the case *before* that one. `.body` is
    // absolutely positioned, so it overflows visibly instead of paginating: a
    // letter can run past its box, eat the whole foot margin and still print as
    // one page. DIN 5008 wants 20mm clear at the bottom, and a cramped letter
    // is exactly the kind of wrong nobody spots in their own draft.
    else if (overflowMm > 1) {
      // Only estimate lines once there is a whole line to estimate: calling a
      // 1mm overrun "1 line too long" overstates it and gets the fix wrong.
      const lines = Math.round(overflowMm / LINE_MM)
      const est = lines >= 1 ? `, roughly ${lines} line${lines === 1 ? '' : 's'}` : ''
      console.warn(`  warning: the body runs ${overflowMm.toFixed(0)}mm into the foot margin${est}.`)
      console.warn('  It still prints on one page. DIN 5008 wants 20mm clear; cut a sentence.')
    }
  }
  finally {
    await browser.close()
  }
}

await main()
