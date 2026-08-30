/**
 * Fails if a value from cv.private.yml has reached a public file.
 *
 * The list of things to look for is read from cv.private.yml at runtime — never
 * written down here. A hardcoded `grep "<street name>"` would put the secret
 * into the public repo inside the very thing meant to protect it. For the same
 * reason a hit is reported by key path ("contact.street"), never by value:
 * this output lands in terminal scrollback and in the pre-commit hook.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'

const PRIVATE = 'cv.private.yml'
const PUBLIC_CV = 'content/cv/cv.yml'

/** Every string in the private file, with the key path that led to it. */
function leaves(node: unknown, path = ''): [string, string][] {
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  }
  if (typeof node === 'string' || typeof node === 'number') return [[path, String(node)]]
  return []
}

// Short values ("4", a postal code) match everything and would train everyone
// to ignore this check. The identifying part of an address is the street name.
const searchable = ([, v]: [string, string]) => v.trim().length >= 6

if (!existsSync(PRIVATE)) {
  // A check that silently passes when it cannot run still reads green, which is
  // worse than no check — so this is only tolerable before the CV data exists.
  if (existsSync(PUBLIC_CV)) {
    console.error(`privacy: ${PUBLIC_CV} exists but ${PRIVATE} is missing — cannot verify.`)
    process.exit(1)
  }
  console.log(`privacy: no ${PRIVATE} yet, nothing to check.`)
  process.exit(0)
}

const secrets = leaves(parse(readFileSync(PRIVATE, 'utf8'))).filter(searchable)

// Tracked files are what a push would publish; build output is what a visitor
// gets. Ignored files (cv.private.yml itself, cv-out/) are *supposed* to hold it.
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)
const built = existsSync('.output/public')
  ? (await readdir('.output/public', { withFileTypes: true, recursive: true }))
      .filter(e => e.isFile() && /\.(html|json|txt|xml|js|css)$/.test(e.name))
      .map(e => join(e.parentPath, e.name))
  : []

const hits = new Map<string, Set<string>>()
for (const file of [...tracked, ...built]) {
  let text: string
  try {
    text = readFileSync(file, 'utf8').toLowerCase()
  }
  catch { continue } // binary or unreadable
  for (const [path, value] of secrets) {
    if (!text.includes(value.toLowerCase())) continue
    if (!hits.has(path)) hits.set(path, new Set())
    hits.get(path)!.add(file)
  }
}

if (hits.size) {
  console.error('\nprivacy: PRIVATE DATA IN PUBLIC FILES\n')
  for (const [path, files] of hits) console.error(`  ${path}  →  ${[...files].join(', ')}`)
  console.error(`\n  Values are not printed on purpose — look the key path up in ${PRIVATE}.\n`)
  process.exit(1)
}

console.log(`privacy: clean — ${secrets.length} value(s) absent from ${tracked.length} tracked and ${built.length} built file(s).`)
