# goatly.dev

Source for **goatly.dev** — a developer portfolio: a landing page, a set of
code projects, and a CV that renders both to the web and to an A4 PDF in
English or German from one data file.

Nuxt 4 (static), Nuxt Content v3, Tailwind CSS v4, deployed to Cloudflare
Pages. Needs **Node 22+** — Nuxt Content is set to use the built-in
`node:sqlite` rather than the native `better-sqlite3` addon.

## Getting started

```bash
npm install
git config core.hooksPath .githooks   # once per clone — see below
npm run dev                           # http://localhost:3000
```

**Enable the hook.** There is no CI, so `.githooks/pre-commit` is the only
automated gate — and git ignores it until `core.hooksPath` is set, so a fresh
clone silently runs no checks at all. It runs `privacy:check`, the tests, then
lint. Bypass once with `git commit --no-verify`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `http://localhost:3000` |
| `npm run generate` | Static build → `.output/public` |
| `npm run preview` | Serve the built site |
| `npm test` | Vitest, once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint — formatting *and* lint |
| `npm run lint:fix` | …and fix what it can |
| `npm run typecheck` | `vue-tsc` over `app/`, `server/` and `nuxt.config.ts` |
| `npm run privacy:check` | Fail if private data reached a public file |
| `npm run cv` | Build both public CV PDFs — see below |
| `npm run letter -- <file.md>` | Build one Anschreiben PDF — see below |

`npm run typecheck` is deliberately not in the pre-commit hook: it needs
`.nuxt/` prepared and takes ~9s against the suite's ~0.5s. Run it by hand
before pushing anything type-shaped.

`grep -rn "TODO(" .` finds every placeholder string and stand-in asset.

## The CV

One YAML source, two renderers: the web page at `/cv`, and an A4 print
template. Every human-readable field is an `{ en, de }` pair.

```bash
npm run cv                 # public English + German → public/cv/
npm run cv -- --private    # full English + German   → cv-out/ (gitignored)
npm run cv -- --all        # all four
```

The public pair is committed, because `/cv` links to it. The `--private` pair
adds the postal address and phone and stays out of git. It needs
`cv.private.yml`:

```bash
cp docs/cv-private-template.yml cv.private.yml   # then fill it in
```

Rendering needs a **system Chromium** — `playwright-core` is used without a
downloaded browser. Set `CHROME_PATH` if it isn't found on the usual paths.

## The Anschreiben

A German cover letter on A4, laid out to DIN 5008 Form B, from Markdown with
frontmatter. It shares the CV's letterhead, palette and type, so the two read
as one application.

```bash
cp templates/letter.md ../applications/2026-09-acme.md
npm run letter -- ../applications/2026-09-acme.md
```

The PDF lands beside its source, so one folder is one application. Paths
resolve from the repo root, not your shell.

**Letters belong in a private repo, not this one** — they name companies, and
the PDF carries the postal address and phone. The script refuses to write its
output inside this repo, because `privacy:check` cannot read inside a PDF and
would not catch one.

## Privacy

This site is statically generated and this repo is public, so anything tracked
in git or emitted into the build is published permanently. Privacy is enforced
at the data layer, never the UI layer: the public CV is `content/cv/cv.yml`,
and private fields live only in gitignored `cv.private.yml` at the repo root —
**never under `/content`**, which Nuxt Content compiles into a database that
ships with the build. `npm run privacy:check` fails if a value from the private
file reaches a tracked file or the build output.

Full reasoning in [CLAUDE.md](CLAUDE.md).

## Deployment

Cloudflare Pages, Git-connected — every push to `main` deploys. Build command
`npm run generate`; output directory **`dist`** in the dashboard, though the
same command writes `.output/public` locally. Cloudflare sets `CF_PAGES=1`,
Nitro switches to its `cloudflare-pages` preset, and that writes `dist`.

## Licences

Vendored third-party assets, with their licences under `licenses/`:

- **[Tabler Icons](https://tabler.io/icons)** (MIT) — the favicon glyph and the
  CV's contact icons
- **[Noto Emoji](https://fonts.google.com/noto/specimen/Noto+Emoji)**
  (Apache 2.0) — the goat mark in the hero
