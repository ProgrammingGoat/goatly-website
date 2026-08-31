/**
 * Fails when the committed CV PDFs no longer match content/cv/cv.yml.
 *
 * Runs in the pre-commit hook. The reasoning for the approach — and for the
 * three obvious alternatives that do not work — is in cv-freshness.ts.
 */

import { checkFreshness, MANIFEST } from './cv-freshness.ts'

const stale = checkFreshness()

if (!stale.length) {
  console.log('cv: PDFs match the data.')
  process.exit(0)
}

console.error('\ncv: THE COMMITTED PDFs NO LONGER MATCH content/cv/cv.yml\n')
for (const { file, reason } of stale) console.error(`  ${file}  —  ${reason}`)
console.error(
  '\n  The web CV and the downloadable PDF would disagree about the same job,'
  + '\n  and nothing else would notice. Rebuild and stage them:'
  + '\n'
  + '\n      npm run cv'
  + `\n      git add public/cv/*.pdf ${MANIFEST}`
  + '\n'
  + '\n  Commit anyway with --no-verify if the PDFs are deliberately behind.\n',
)
process.exit(1)
