# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Committed to git, so
it travels across machines — unlike per-machine assistant memory.

## What this is

**goatly.dev** — Lukas Brackmann's professional developer site: a landing page,
code projects, and an about/CV section. Terminal aesthetic with a light goat
motif (the domain and the `@ProgrammingGoat` handle are the source of it).

- **Nuxt 4** (static-generated via `npm run generate`)
- **Nuxt Content v3** — markdown projects and YAML CV data under `/content`
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- Deploys to **Cloudflare Pages**, Git-connected, so every push to `main`
  deploys. Build command `npm run generate`; output dir **`dist`** in the
  dashboard but `.output/public` locally — Cloudflare sets `CF_PAGES=1`, Nitro
  switches to its cloudflare-pages preset, and that writes `dist`. Node is
  pinned there with a `NODE_VERSION` project variable, not a file in the repo.

The site is in **English**. The legal pages (`/impressum`, `/datenschutz`) are in
**German** — they address German law and that is the convention there. CV *data*
is bilingual so one source can also print a German Lebenslauf.

Scaffolded from an existing personal Nuxt project, which is where the image
pipeline, SEO and prerender settings in `nuxt.config.ts` come from. Their
reasoning is inline in that file; the operative rules are under *Notes* below.

## Conventions (please follow)

### 1. Privacy — the rule that outranks the others

This site is statically generated and the repo is public. **Anything tracked in
git or emitted into the build is published permanently and archived by
crawlers.** Hiding a field in a component hides nothing. So privacy is enforced
at the *data* layer, never the UI layer.

#### 1a. Identity separation

This is a **professional** site under Lukas's real name. It must not link to, name,
or hint at his personal or pseudonymous online identities — separate handles,
communities, art accounts, or the domains attached to them. That linkage is not
recoverable once published, and it is the disclosure with the highest cost here.

Practically:

- Never add a social link, a comment, a commit message, a test fixture or a
  placeholder string that names another identity.
- This repo was scaffolded from a personal project. If you copy anything else
  across, **read it first** — the original was full of that name, in code
  comments and test fixtures as well as in copy.
- **Check filenames and image contents, not just text.** A content grep
  (`grep -rniI`) skips binaries and never looks at paths at all; an image called
  `<persona>-screencap.png` survived several sweeps that way, and a screenshot
  of another site carries its branding regardless of what it is called. Sweep
  with `git ls-files | grep -i` as well.
- Those handles belong in `cv.private.yml` under `aliases:`. Nothing reads that
  key, but `privacy:check` searches every value in the file, so the guard catches
  a slip without the term ever existing in a tracked file.

#### 1b. The CV split

```
content/cv/cv.yml   PUBLIC   committed · rendered on the site · in every PDF
                             name, headline, "Heidelberg, Germany", the
                             contact@goatly.dev alias, links, experience,
                             education, skills, certificates
cv.private.yml      PRIVATE  gitignored · read ONLY by scripts/build-cv.ts
                             street address, phone, date of birth, photo,
                             personal email, aliases
```

- `cv.private.yml` lives at the **repo root, never under `/content`**. Nuxt
  Content compiles collections into a SQLite database that ships with the static
  output, so a file under `/content` is published whether or not a page renders
  it.
- **Nuxt never reads the private file.** Only the PDF script does, and only when
  passed `--private`.
- The public surface carries **city and country only**. No street, no phone, no
  date of birth, no photo. (A German CV conventionally has a photo; the web
  version does not need one, and leaving it out is better anti-discrimination
  practice besides. It stays in the application PDF.)
- The site knows only `contact@goatly.dev`.
- A phone number is **not** legally required in an Impressum — EuGH C-298/07 —
  so it stays off the site entirely.

#### 1c. The guard

`scripts/privacy-check.ts` reads `cv.private.yml` at runtime and fails if any
value from it appears in a tracked file or in the build output. Two things about
it are deliberate and must survive any refactor:

- **The list of things to look for is never written down.** A hardcoded
  `grep "<street name>"` would put the secret into the public repo inside the
  very thing meant to protect it — and a street that exists in one place in the
  world identifies a person as precisely as the full address does.
- **A hit is reported by key path (`contact.street`), never by value**, because
  that output lands in the pre-commit hook and in terminal scrollback.

It runs first in `.githooks/pre-commit`, because it is the only check whose
failure cannot be undone by a later fix: once a value is in a commit it is in the
history and in every clone.

Deliberately *not* in it: entity/percent decoding, transliteration,
phone-format normalisation, history scanning. Those defend against a value being
obfuscated on its way into output, which does not happen when one person
hand-authors the data. The realistic failure is pasting something into a public
file and forgetting, and a plain substring search catches that. **Do not grow
this script** without a concrete failure it would have caught.

### 2. Copy / prose — no AI voice

- All human-facing prose lives in **`app/site.ts`**. Components read from it.
- Every placeholder string is tagged `TODO(copy)`, and every stand-in asset
  `TODO(asset)`. Find them all: `grep -rn "TODO(" .`
- Do **not** write prose (hero copy, project descriptions, about text) in Lukas's
  voice and leave it as if it were his. Short UI labels (nav, buttons) are fine
  inline.

### 3. Dates

- Frontmatter `date:` is **ISO 8601** — `YYYY-MM-DD`. Stored and sorted as a
  string, so ISO is what keeps ordering right.
- CV entries use `YYYY-MM` (`start`, `end`) — a job has a month, not a day.
- Display goes through `app/utils/format.ts`. Month names are **hardcoded**,
  never `toLocaleDateString`, and ISO input is read off the string rather than
  through `new Date`. The output has to match between the build machine and the
  visitor's browser, and a timezone must never drag a January entry into the
  year before. `vitest.config.ts` pins `TZ=Europe/Berlin` because the regression
  this guards cannot reproduce under UTC.

### 4. Design direction

- **Palette**: near-black terminal ground with **amber** as the accent — VT220
  amber terminals, and it reads as the goat. A prompt **green** is reserved for
  the prompt glyph and success states; it is not a general-purpose accent.
  Tokens live in `app/assets/css/main.css`; use them via `bg-surface`,
  `text-accent`, etc. Both themes define every token — never add a colour that
  exists in only one.

  The dark ground is *near*-black and no longer nearly-black: it was `#0e1116`,
  which the hero survived because its content sits on `--surface`, a step up,
  and which every other page read as a hole because nothing else has that step.
  The whole ramp was lifted together so each step keeps its relationship —
  `--surface` stays ~1.10x the ground, and `--muted` moved furthest because it
  carries most of a content page. If it ever moves again, move it as a ramp;
  lifting `--bg` alone would flatten the terminal window against the page.

  Anything tuned *against* the ground moves with it. The hero's amber backlight
  was the case in point: a bloom is only ever the difference between the haze
  and the page behind it, so the lifted ground washed it out, and raising it to
  compensate is what exposed it as a shape rather than as light. It is gone —
  see *Design direction*.

  `.prose pre` keeps the old `#0e1116` on purpose — a code block is a terminal,
  and against the lifted ground it now reads as an inset rather than dissolving
  into the page.
- **Dark-first.** A warm paper-terminal light theme is available via the toggle;
  it is not stark white, so long reads don't glare.
- **Type**: JetBrains Mono for headings, nav, eyebrows and all terminal chrome;
  Inter for prose body. Full-mono body text is tiring on a long page.
- **Signature**: the **prompt**. An amber `$` before a section heading
  (`.prompt-heading`), a blinking block cursor (`.prompt-cursor`), a rule
  (`.prompt-bar`), a status-line footer. Used *sparingly* — everything else
  stays quiet.
- **Goat sub-theme**: a Noto Emoji goat sits in the hero terminal's top-right
  (`.goat-mark`), and the domain and handle carry the rest. Not on every
  heading, and *not* in the favicon — the same artwork turns to mush at 16px,
  which is where a favicon spends its life; at 150px it has room to read.

  Opacity is 0.5 dark / 0.6 light — **higher on paper, not lower**. The coat is
  pale, so on white it starts closer to the background and needs more to read
  as much as the same mark does against near-black. Getting that backwards is
  what made the first attempt nearly invisible in light mode.

  It is positioned on `.crt`, not inside `.crt-body`: the body scrolls the
  shell's scrollback, and a watermark that scrolls with the text is a texture,
  not a watermark. Hidden below `lg`, where the terminal is too narrow to have
  a spare corner.
- **The favicon** is the Tabler `terminal` prompt glyph in amber on a rounded
  plate (`public/favicon.svg`, MIT, `licenses/tabler-icons/LICENSE`). The plate
  *is* the window frame, which is why the boxed `terminal-2` variant was
  rejected — at 16px its border and inner glyph merge. Any replacement mark
  must be checked at 16px against both themes before it lands.
- The terminal is a **frame, not the interface**. Pages below the hero are
  normal and scannable — a recruiter must never have to type a command to find
  the CV.
- Don't animate placeholder elements (the gradient standing in for a missing
  cover image). A placeholder that draws the eye is doing the wrong job.

- **The hero prompt is a real shell** (`TerminalShell.vue`) — the site's one
  easter egg, and deliberately native to the design rather than pasted onto it.
  It looks like the static prompt it replaced, so a recruiter who ignores it
  loses nothing. It can only navigate, print and toggle the theme.

  **Typing anywhere on the page types into it**, because a blinking cursor and
  a `type help` hint promise exactly that, and requiring a click first made it
  read as broken. The guards on that capture are the load-bearing part: no
  modifier held, no other field focused, and the prompt on screen — a reader
  who has scrolled past the hero must never be yanked back to it by a
  keystroke. `Escape` clears the line and hands the keyboard back, which is
  what returns space and the arrow keys to page scrolling.

  A cursor-following goat was tried here first and removed: a full-colour emoji
  trailing the pointer reads as a sticker stuck onto a page that is otherwise
  disciplined mono on near-black. If whimsy gets added again, it has to be in
  the site's own material — type, prompt, terminal — not on top of it.

- **No text-shadow on the type**, and **no glow behind the glass.** A phosphor
  bloom on every accent glyph was tried and muddied the letterforms. An ambient
  amber backlight behind the terminal window was then tried twice — first as a
  free ellipse positioned against the section, then as the window's own
  silhouette blurred behind it — and **both were removed.** The ellipse read as
  an airbrush stroke, an amber shape with no relation to the thing it was
  supposed to be radiating from; taking the shape from the window fixed that
  specific fault and still read as something stuck onto the page rather than as
  light. The lifted ground gives the window enough contrast on its own, so the
  depth is now its border and its drop shadow, and nothing else.

  Anyone re-adding one is re-opening a settled question: the bar is that it has
  to read as light in the room, not as a coloured shape on the background, and
  two reasonable attempts did not clear it.

#### Accessibility is part of the theme, not a later pass

- The hero terminal is decorative chrome around **real** `<h1>`/`<p>` content.
  ASCII art and the window bar get `aria-hidden="true"`. A screen reader must
  hear the name and the role, never a stream of box-drawing characters. The `$`
  before headings is a CSS pseudo-element for the same reason.
- The typing animation runs over text already in the DOM, so it degrades to
  fully-rendered text with JS off, and renders instantly under
  `prefers-reduced-motion: reduce`.
- The terminal must not force horizontal page scroll at 360px — it scrolls
  inside its own box or reflows.
- The shell's output is an `aria-live="polite"` region and its input carries a
  real label. That is not decoration like the rest of the terminal chrome — it
  is interactive content, so it has to be usable by a screen reader rather than
  hidden from one.


### 5. Git commits

- **Conventional Commits**: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `content`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`. Scope optional (e.g. `feat(cv): ...`).
- `content` is for entries under `/content`; `docs` for repo documentation.
  Building a page or component is `feat`.
- Imperative, lower-case subject, no trailing period.
- A commit message is as public as the diff — nothing private goes in one.

### 6. Comments

- Keep them short. Don't comment self-explanatory code.
- Comment the *why*, especially where a choice looks arbitrary but is
  load-bearing.

## Content model

Schema in `content.config.ts`.

- `content/projects/*.md` → `/projects/<file>` — a `page` collection. `kind`
  labels the sort of project, `tools` is what it took, `links` is a free list of
  label+url buttons, `featured` promotes it to the landing page.
- `content/cv/cv.yml` → a **`data`** collection, not a page. Queried with
  `queryCollection('cv').first()`.

Frontmatter lists are **block style** — `tags:` then indented `- item`.

Starting points live in **`/templates`**, outside `/content` so they are never
published and survive `/content` being emptied. Copy one in to add an entry:

```bash
cp templates/project.md content/projects/my-thing.md
```

Adding a field to `content.config.ts` means updating the template too — nothing
generates one from the other.

### Cover images

1. Put the file in `public/img/projects/`.
2. Reference it from `/public`'s root: `cover: /img/projects/my-thing.png`.

**Commit the image with the entry.** `failOnError` is on, so a `cover:` pointing
at a missing file fails the build rather than shipping a broken image.

Landscape suits the card's 16/9 slot. At least 1200px wide — the social card
crops 1200×630 out of it, and cards request up to 640px at 2x — with 1600–2000
a sensible target; beyond that only costs build time, since every variant is
encoded to AVIF and WebP. `focus:` moves the part of an off-ratio cover that
survives the crop on the site's own cards; the social card always crops from
the centre. Without a cover the card shows a gradient carrying the
entry's path.

### Bilingual CV fields

Every human-readable CV field is a `{ en, de }` pair; structural fields (dates,
URLs, tech names) are plain strings. The site renders `en`; the PDF script
renders whichever language it was asked for. This is contained to the CV data on
purpose — **do not pull i18n into the rest of the site.**

## CV PDFs — `scripts/build-cv.ts`

One data source, **two renderers**: the web CV page and an A4 print template.
They share data, not presentation — an A4 Lebenslauf and a web page want
honestly different layouts.

They do share three *rules*, which the A4 template worked out first and
`app/pages/cv.vue` now follows, because the page had the same three problems:

1. **One gutter.** Every section puts its label — a date range, a skill group,
   a language — in a fixed left column, so the document has a single vertical
   line the eye follows and every value starts at the same x. The page's header
   is in it too: location, email, links and the PDF buttons are gutter rows, not
   a free stack, which is what stopped the top of the page reading as four
   separate things that happened to land near each other.
2. **Four type steps, far apart.** Six steps, two of them a hair apart, read as
   noise rather than as hierarchy.
3. **Mono is a machine fact** (dates, section headings, tech stacks); **sans is
   prose**, entry titles included. A mono entry title one size off a mono
   heading makes the two look like the same kind of thing.

The page's tail — languages, certificates, interests — is the PDF's sidebar
folded into one band, not four more full-width sections: they are short
reference lists, so they neither earn the gutter nor a band each.

The **skill meter** is shared as well, same ten-cell construction and same
reason for not using `█`/`░`. Two things the page has that the sheet has no
room for: a **timeline rail** down the gutter's column boundary on the dated
sections only — skills uses the same gutter but is not a chronology — and an
amber tick on each section rule, which is `.prompt-bar` sitting on the rule
instead of floating above the heading.

**Nothing on the page is smaller than 13px.** The gutter and the `stack:` lines
were 12 and were legible in the sense that the letters resolved, not in the
sense that anyone read them. The gutter is 10rem because that is what the
widest range needs at 13px without wrapping.

```bash
npm run cv                 # public English + German → public/cv/
npm run cv -- --private    # full English + German   → cv-out/ (gitignored)
npm run cv -- --all        # all four
```

**A language is never built on its own.** `--lang` is gone: the two are one
document in two renderings, and building them separately is exactly what lets
them drift — German edited on Tuesday, English on Friday, and a pair that
disagrees ships with nothing to catch it. `--private` picks the pair, not the
language. An unrecognised flag is rejected rather than ignored, because
`--private` is the only thing between the committed pair and the one carrying
the address.

`scripts/cv-template.ts` renders the HTML; `scripts/build-cv.ts` drives the
browser. The template uses the site's **light** palette — a dark A4 page is
unreadable printed and floods a printer with toner — and only the sidebar and
title bar carry the warm paper tone, so the sheet is not full-bleed ink.

Rendered with `playwright-core` and a **system** Chromium (`CHROME_PATH`, or
the usual paths), not a downloaded browser: the PDF is built locally and
occasionally, and a 150MB download per machine is not worth it. Generated
locally and committed (the public pair only) rather than built on Cloudflare —
the image build is already the slow part of CI.

Two things that will bite anyone editing the template:

- **`privacy:check` cannot see inside a PDF.** Text in a PDF is
  Flate-compressed, so a substring search over the committed bytes finds
  nothing. `build-cv.ts` therefore checks the rendered HTML for private values
  *before* printing, and refuses to write a public PDF that fails. That check is
  the only thing standing between a template bug and a published address.
- **Skill meters are drawn with elements, not the block characters `█`/`░`.**
  JetBrains Mono ships no U+2588, so the fallback face supplied them at a
  different advance width and the cells came out gapped and ragged.

Fonts are loaded from Google Fonts at render time so the PDF matches the site.
Offline, the stack falls back to a system mono and the layout still holds.

## Commands

```bash
npm run dev            # dev server at http://localhost:3000
npm run generate       # static build → .output/public
npm run preview        # preview the built site
npm run lint           # eslint (formatting + lint, via @nuxt/eslint)
npm run lint:fix       # …and fix what it can
npm run typecheck      # vue-tsc over app, server and nuxt.config — run by hand
npm test               # vitest, once
npm run privacy:check  # private-data leak check (also runs pre-commit)
grep -rn "TODO(" .     # placeholder copy and stand-in assets, all of it
```

### Lint + the pre-commit hook

`@nuxt/eslint` with stylistic rules on covers both formatting and linting —
there's no separate formatter. Overrides live in `eslint.config.mjs`.

There's no CI, so `.githooks/pre-commit` is the only automated gate. **It needs
enabling once per clone** — git otherwise silently runs no hook at all:

```bash
git config core.hooksPath .githooks
```

It runs `privacy:check`, then `npm test`, then `npm run lint`, and blocks the
commit if any fails. Bypass once with `git commit --no-verify`.

`npm run typecheck` is deliberately **not** in the hook — it needs `.nuxt/`
prepared and takes ~9s against the suite's ~0.5s. Run it by hand before pushing
anything type-shaped. It covers `nuxt.config.ts` and `server/` too, which is not
incidental: anything in `app.head` must be JSON-serializable, and typecheck is
what catches a function there being silently dropped at build.

## The Anschreiben — `scripts/build-letter.ts`

A German cover letter on A4, laid out to **DIN 5008 Form B**, from a Markdown
file with YAML frontmatter.

```bash
cp templates/letter.md ../applications/2026-09-acme.md
npm run letter -- ../applications/2026-09-acme.md
npm run letter -- ../applications/2026-09-acme.md --out ~/Desktop
```

**Letters do not live in this repo, and the script refuses to write one into
it.** They name companies and say why you want to leave somewhere, so they
belong in a *private* repo — which also gives them the history and the backup a
gitignored file would not have. The path is an argument with no default, so
this repo holds no assumption about where they are kept and no letter is ever
in its working tree; there is no `git add -A` that could reach one.

The output guard is not belt-and-braces. A letter PDF carries the postal
address, the phone and the personal email, and `privacy:check` **cannot see
inside a PDF** — the text is Flate-compressed, so a substring search over the
bytes finds nothing. A letter written into this repo would be invisible to the
one guard meant to catch exactly that, which is why the script hard-fails
instead of trusting `.gitignore`.

Paths resolve **from the repo root, not your shell** — `npm run` sets the
working directory to the package root before the script starts. The
missing-file error prints the resolved absolute path, because the gap between
what you typed and where it looked is the whole confusion.

### Why the standard wins over the theme

DIN 5008 fixes the geometry: the address field is 85×40mm at 45mm from the top,
the Betreff sits at 98.46mm, the date is right-aligned, and the fold marks go
at 105mm and 210mm with the hole mark at 148.5mm. A German recruiter reads a
deviation from that as carelessness, not as design.

So the theme gets the Briefkopf — the letterhead, the palette, the title bar,
the type — and the standard gets everything below it. **Where they disagree the
standard wins.** Form B rather than Form A because there is a letterhead to put
in the 45mm.

Two conventions worth not rediscovering: there is no `Betreff:` prefix on the
subject line, that is obsolete; and three empty lines are left above the typed
name, because a printed name directly under the closing reads as an email
rather than a letter.

### Shared chrome — `scripts/letterhead.ts`

The CV and the letter arrive in the same folder, so they must read as one
person's paperwork. The palette, `@page` box, type stack, title bar, contact
icons and date formatting live in `letterhead.ts` and are used by both.

`cv-template.ts` keeps its own furniture — the gutter, the meters, the timeline
rail. A letter has no dated entries to align, and importing the gutter would be
theming for its own sake.

**This is deliberately not a package.** The two documents have to look
identical, and a version boundary between them is exactly how that stops being
true — the same argument that removed `--lang` from the CV build. The browser
plumbing is shared the same way, in `scripts/pdf.ts`, so there is one
launch-and-print path rather than two that drift.

Dates go through `letterhead.ts`, so the hardcoded-month rule under *Dates*
applies: `letterDate` reads the ISO string directly and never touches
`new Date`. German prints `15. September 2026` rather than `15.09.2026` — the
standard permits both, but a spelled month cannot be misread in US order, and
an application is where that ambiguity costs most.

## Tests

Vitest, in `/test`, over **pure functions only** — no Nuxt environment, so the
suite stays fast enough to sit in the pre-commit hook.

A test earns its place in proportion to how *invisible* the failure would be:

- **`server/utils/feed.ts`** — nobody eyeballs the RSS feed. One unescaped `&`
  makes it unparseable and every subscriber silently stops updating.
- **`app/utils/format.ts`** — see the timezone note under *Dates*.
- **`scripts/letter-data.ts` and `letterDate`** — an Anschreiben is printed
  once and posted. A wrong month, a *Frau* where the recipient is a *Herr*, or
  a clause silently swallowed by an unescaped `<` all survive a proofread, and
  none of them can be fixed after the PDF is sent.

  The timezone case there is tested by **flipping `TZ` inside the test**, not
  by relying on the pinned one. An ISO date-only string parsed through
  `new Date` is UTC midnight, which is still the right day anywhere east of
  UTC — so `Europe/Berlin` alone cannot catch that regression. Los Angeles
  can, and turns `1. Januar 2026` into `31. Januar 2026`: wrong, and plausible
  enough to post. This is the one place the suite deliberately steps outside
  the pinned timezone.

  The letter's *layout* is not tested. It is loud and visual — you see it in
  the PDF — and `build-letter.ts` warns when a letter runs to two pages.

Things whose breakage is loud and visual — layout, placeholder gradients,
component rendering — are deliberately **not** tested. You'd see those on first
page load, and the test would cost more than it returns.

Prefer extracting pure logic out of a handler (as `feed.ts` is out of
`rss.xml.ts`) over reaching for a Nuxt test environment.

## Notes

- Nuxt Content uses Node's built-in `node:sqlite`
  (`content.experimental.nativeSqlite`), so there's no native `better-sqlite3`
  compile — which keeps the Cloudflare build simple. Needs a recent Node.
- **Images** (`image:` in `nuxt.config.ts`, where the full reasoning lives):
  every variant is a real file in the output, so keep component `sizes` slots
  *on* the width ladder the `screens` entries already mint. **No component sets
  a `format` prop** — it silently shadows `image.format`. `NuxtPicture` needs
  `legacy-format="jpeg"` so a `.png` source doesn't emit a PNG fallback chain
  several times the size of the WebP.
- `nitro.prerender.failOnError: true` — a `cover:` pointing at a missing file
  otherwise only logs and ships a broken image. It means an image must be
  committed alongside the entry that references it.
- `autoSubfolderIndex: false` — writes `projects/thing.html`, not
  `projects/thing/index.html`, so Cloudflare doesn't 308 to a slashed path that
  the canonical, sitemap and feed `<guid>`s don't use.
