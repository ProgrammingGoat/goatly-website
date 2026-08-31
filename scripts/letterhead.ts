/**
 * Chrome shared by every printed document: the CV and the Anschreiben.
 *
 * The two are handed to the same recruiter in the same folder, so they have to
 * read as one person's paperwork. What makes that happen is small and specific
 * — the palette, the type stack, the terminal title bar, the contact icons —
 * and it lives here so it cannot drift between them. The CV's own furniture
 * (the gutter, the meters, the timeline rail) stays in cv-template.ts, because
 * a letter has no dated entries to align and importing that would be theming
 * for its own sake.
 *
 * Deliberately NOT a package. These two documents must look identical, and a
 * version boundary between them is exactly how that stops being true.
 */

export type Lang = 'en' | 'de'

/** Escape for HTML text nodes. The data is trusted, but a stray & breaks layout. */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ---------------------------------------------------------------------------
// Dates
//
// Month names are hardcoded and ISO input is read off the string, never through
// `new Date` — the same rule as app/utils/format.ts, and for the same reason: a
// timezone must never drag a January date into the year before. A PDF is
// printed once and posted; a date that is wrong in it is wrong permanently.
// ---------------------------------------------------------------------------

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const MONTHS_DE_FULL = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const MONTHS_EN_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** `YYYY-MM` → `09/2026` (de) or `Sep 2026` (en). A bare year stays a bare year. */
export function monthYear(input: string | undefined, lang: Lang): string {
  if (!input) return ''
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(input)
  if (!m) return input
  const [, year, month] = m
  if (!month) return year!
  if (lang === 'de') return `${month}/${year}`
  return `${MONTHS_EN[Number(month) - 1] ?? ''} ${year}`.trim()
}

/**
 * A letter's date line, DIN 5008 §8.2.
 *
 * German gets `31. August 2026`: the standard permits `31.08.2026` too, but a
 * spelled month cannot be misread as a US-order date by a reader who is used
 * to seeing both, and an application is exactly where that ambiguity is worst.
 * English uses day-month-year for the same reason — never `August 31`.
 *
 * The place prefix (`Heidelberg, 31. August 2026`) is conventional on a German
 * letter and is what the `place` argument is for.
 */
export function letterDate(iso: string, lang: Lang, place?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) throw new Error(`date must be ISO YYYY-MM-DD, got "${iso}"`)
  const [, year, month, day] = m
  const names = lang === 'de' ? MONTHS_DE_FULL : MONTHS_EN_FULL
  const name = names[Number(month) - 1]
  if (!name) throw new Error(`month out of range in "${iso}"`)

  // No leading zero on the day: "01. August" is a form field, not a letter.
  const d = Number(day)
  const stamp = lang === 'de' ? `${d}. ${name} ${year}` : `${d} ${name} ${year}`
  return place ? `${place}, ${stamp}` : stamp
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * Contact icons — Tabler Icons (outline), MIT, Copyright (c) 2020-2026 Paweł
 * Kuna. Full text in licenses/tabler-icons/LICENSE, the same set the favicon
 * comes from. Brand marks remain the property of their owners.
 *
 * Stored as inner markup only; icon() supplies the <svg> wrapper so stroke
 * width and size are set in one place rather than in five copied headers.
 */
const ICONS: Record<string, string> = {
  pin: '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0" />',
  phone: '<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />',
  mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" /><path d="M3 7l9 6l9 -6" />',
  github: '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />',
  web: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" />',
}

/** A contact icon at text size, vertically centred on the first line. */
export function icon(name: string): string {
  const body = ICONS[name]
  if (!body) return ''
  return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
}

/** Which icon a link gets. Inferred from the URL so the data stays plain. */
export function linkIcon(url: string): string {
  return /github\.com/i.test(url) ? 'github' : 'web'
}

// ---------------------------------------------------------------------------
// Document chrome
// ---------------------------------------------------------------------------

/**
 * Webfonts, loaded over the network so print matches the site. If it fails
 * (offline), the stacks below fall back to a system face and the layout holds.
 */
export const FONT_LINKS = `<!-- Loaded over the network so the PDF matches the site's type. If it fails
     (offline), the stack falls back to a system mono and the layout holds. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`

/**
 * Palette, page box and reset.
 *
 * Light palette from app/assets/css/main.css. The page itself stays white: the
 * warm paper tone is used only for the sidebar and the title bar, so a real
 * printer is not asked to flood 210x297mm with ink.
 */
export const BASE_CSS = `  /* Light palette from app/assets/css/main.css. The page itself stays white:
     the warm paper tone is used only for the sidebar and the title bar, so a
     real printer is not asked to flood 210x297mm with ink. */
  :root {
    --paper: #f6f1e6;
    --surface: #ffffff;
    --text: #1c2128;
    --muted: #5f6672;
    --border: #ddd5c4;
    --accent: #8a5f0a;
    --accent-2: #1a7f37;
    --mono: "IBM Plex Mono", ui-monospace, "DejaVu Sans Mono", monospace;
    --sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  }

  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 210mm;
    height: 297mm;
    font-family: var(--sans);
    color: var(--text);
    background: var(--surface);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }`

/**
 * Terminal window chrome, framing the whole sheet. Deliberately slim — it
 * should read as a considered detail, not a costume.
 */
export const TITLEBAR_CSS = `  /* Terminal window chrome, framing the whole sheet. Deliberately slim — it
     should read as a considered detail, not a costume. */
  .titlebar {
    display: flex;
    align-items: center;
    gap: 2mm;
    height: 7mm;
    padding: 0 5mm;
    background: var(--paper);
    border-bottom: 0.4mm solid var(--border);
    font-family: var(--mono);
    font-size: 7pt;
    color: var(--muted);
  }
  .dot { width: 2mm; height: 2mm; border-radius: 50%; }`

/** The title bar itself. `path` is what follows the prompt, e.g. `~/lebenslauf`. */
export function titlebar(name: string, path: string): string {
  const handle = esc(name.toLowerCase().split(' ')[0] ?? '')
  return `<div class="titlebar">
    <span class="dot" style="background:#e05c53"></span>
    <span class="dot" style="background:#d9a441"></span>
    <span class="dot" style="background:#3fa34d"></span>
    <span style="margin-left:2mm">${handle}@goatly.dev: ~/${esc(path)}</span>
  </div>`
}
