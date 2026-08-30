/**
 * A4 print template for the CV — the second of the two renderers that share
 * content/cv/cv.yml. The other is app/pages/cv.vue.
 *
 * They share data, not presentation: a sheet of paper and a web page want
 * genuinely different layouts, and the PDF additionally carries the private
 * contact block that the site must never show.
 *
 * The theme is the site's LIGHT palette, not the dark one. A dark A4 page is
 * unreadable printed and floods a printer with toner; the light tokens were
 * already designed as a warm paper terminal, which is exactly the brief.
 */

type L = { en: string, de: string }
export type Lang = 'en' | 'de'

/** Everything the template can render. Private fields are absent unless merged. */
export type CvData = {
  name: string
  headline: L
  tagline: L
  location: L
  email: string
  links: { label: string, url: string }[]
  experience: {
    start: string
    end?: string
    role: L
    org: string
    location?: string
    bullets?: L[]
    stack?: string[]
  }[]
  education: { start: string, end?: string, title: L, org?: string, grade?: string, note?: L }[]
  internships: { start: string, end?: string, title: L, org: string, note?: L }[]
  skills: { group: L, items: { name: string | L, level?: number }[] }[]
  softSkills?: L[]
  languages: { name: L, level: L, meter?: number }[]
  certificates: { name: L, issuer?: string, date?: string }[]
  interests?: L[]
  /** Only present on a --private build. */
  private?: {
    /** Postal address lines, from app/legal.ts — public, but PDF-only here. */
    address?: string[]
    phone?: string
    email?: string
  }
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Same rule as app/utils/format.ts: parsed off the string, never via `new Date`. */
function monthYear(input: string | undefined, lang: Lang): string {
  if (!input) return ''
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(input)
  if (!m) return input
  const [, year, month] = m
  if (!month) return year!
  if (lang === 'de') return `${month}/${year}`
  return `${MONTHS_EN[Number(month) - 1] ?? ''} ${year}`.trim()
}

/**
 * The date as it appears in the gutter: always numeric MM/YYYY.
 *
 * Spelled months ("Sep 2026") were tried first and are nicer to read in
 * isolation, but they vary in width, so the gutter could not be a fixed column
 * and every entry started at a slightly different place. Numeric dates are all
 * exactly the same width, which is what buys the single alignment line down
 * the page. A bare year stays a bare year.
 */
function gutter(start: string, end: string | undefined, lang: Lang): string {
  const one = (v?: string) => {
    if (!v) return ''
    const m = /^(\d{4})(?:-(\d{2}))?$/.exec(v)
    if (!m) return v
    return m[2] ? `${m[2]}/${m[1]}` : m[1]!
  }
  const to = end ? one(end) : (lang === 'de' ? 'heute' : 'present')
  return `${one(start)} – ${to}`
}

const t = (v: L | undefined, lang: Lang) => (v ? v[lang] : '')

/** A field that may be a plain string or a localised pair — skill names are both. */
const tx = (v: string | L | undefined, lang: Lang) =>
  (typeof v === 'string' ? v : t(v, lang))

/** Escape for HTML text nodes. The data is trusted, but a stray & breaks layout. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const UI = {
  en: {
    title: 'CURRICULUM VITAE',
    experience: 'experience',
    education: 'education',
    internships: 'internships & voluntary work',
    skills: 'skills',
    softSkills: 'soft skills',
    languages: 'languages',
    certificates: 'certificates',
    interests: 'interests',
    stack: 'Stack',
  },
  de: {
    title: 'LEBENSLAUF',
    experience: 'berufserfahrung',
    education: 'ausbildung',
    internships: 'praktika & soziales engagement',
    skills: 'kenntnisse',
    softSkills: 'soft skills',
    languages: 'sprachen',
    certificates: 'zertifikate',
    interests: 'hobbys',
    stack: 'Tech Stack',
  },
} as const

/**
 * A skill level as a ten-cell meter.
 *
 * Drawn with elements rather than the block characters `█`/`░` this started
 * as: JetBrains Mono ships no U+2588, so the fallback face supplied them at a
 * different advance width and the cells came out gapped and ragged. Ten
 * discrete cells keep the segmented, terminal look without depending on a
 * glyph that may not exist in whichever font actually loads.
 */
function meter(level: number | undefined): string {
  if (level === undefined) return ''
  const filled = Math.round(Math.max(0, Math.min(100, level)) / 10)
  const cells = Array.from({ length: 10 }, (_, i) =>
    `<i class="${i < filled ? 'on' : 'off'}"></i>`).join('')
  return `<span class="meter">${cells}</span>`
}

/**
 * One entry: a date in the gutter, everything else in the content column.
 *
 * Every section uses this — experience, education, internships, certificates —
 * so the whole document has one vertical line the eye can follow, and an entry
 * is visibly a block rather than a run of differently-sized lines.
 */
function row(when: string, inner: string): string {
  return `<div class="row"><div class="when">${esc(when)}</div><div class="what">${inner}</div></div>`
}

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
function icon(name: string): string {
  const body = ICONS[name]
  if (!body) return ''
  return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
}

/** Which icon a link gets. Inferred from the URL so the data stays plain. */
function linkIcon(url: string): string {
  return /github\.com/i.test(url) ? 'github' : 'web'
}

function section(heading: string, body: string): string {
  if (!body.trim()) return ''
  return `<section class="sec"><h2 class="sec-h">${esc(heading)}</h2>${body}</section>`
}

export function renderCv(cv: CvData, lang: Lang): string {
  const ui = UI[lang]
  const p = cv.private

  // A --private build prints the full postal address; the public one prints
  // city and country only. The address is public — it is in the Impressum —
  // but a CV gets forwarded around in a way a legal page does not, so the
  // public PDF still leaves it off.
  const addressLines = p?.address?.length
    ? [...p.address.map(esc), esc(t(cv.location, lang))]
    : [esc(t(cv.location, lang))]

  // The address is one row however many lines it runs to, so the pin sits
  // beside the whole block rather than repeating on each line.
  const contact = [
    `<div class="c-row">${icon('pin')}<span>${addressLines.join('<br>')}</span></div>`,
    p?.phone ? `<div class="c-row">${icon('phone')}<span>${esc(p.phone)}</span></div>` : '',
    `<div class="c-row">${icon('mail')}<a href="mailto:${esc(p?.email ?? cv.email)}">${esc(p?.email ?? cv.email)}</a></div>`,
    ...cv.links.map(l => `<div class="c-row">${icon(linkIcon(l.url))}`
      + `<a href="${esc(l.url)}">${esc(l.url.replace(/^https?:\/\//, ''))}</a></div>`),
  ].join('')

  const skills = cv.skills.map(g => `
    <div class="sb-sub">${esc(t(g.group, lang))}</div>
    ${g.items.map(i => `<div class="skill"><span class="skill-name">${esc(tx(i.name, lang))}</span>${meter(i.level)}</div>`).join('')}
  `).join('')

  const languages = cv.languages.map(l => `
    <div class="skill">
      <span class="skill-name">${esc(t(l.name, lang))} <span class="dim">(${esc(t(l.level, lang))})</span></span>
      ${meter(l.meter)}
    </div>`).join('')

  const experience = cv.experience.map(j => row(gutter(j.start, j.end, lang), `
      <h3 class="role">${esc(t(j.role, lang))}</h3>
      <div class="org">${esc(j.org)}${j.location ? `, ${esc(j.location)}` : ''}</div>
      ${j.bullets?.length
        ? `<ul class="bullets">${j.bullets.map(b => `<li>${esc(t(b, lang))}</li>`).join('')}</ul>`
        : ''}
      ${j.stack?.length
        ? `<div class="tech"><b>${ui.stack}:</b> ${esc(j.stack.join(' · '))}</div>`
        : ''}`)).join('')

  const education = cv.education.map(e => row(gutter(e.start, e.end, lang), `
      <h3 class="role">${esc(t(e.title, lang))}${e.grade ? ` <span class="grade">${esc(e.grade)}</span>` : ''}</h3>
      ${e.org ? `<div class="org">${esc(e.org)}</div>` : ''}
      ${e.note ? `<p class="note">${esc(t(e.note, lang))}</p>` : ''}`)).join('')

  const internships = cv.internships.map(i => row(gutter(i.start, i.end, lang), `
      <h3 class="role role-sm">${esc(t(i.title, lang))}</h3>
      <div class="org">${esc(i.org)}${i.note ? ` — ${esc(t(i.note, lang))}` : ''}</div>`)).join('')

  const certificates = cv.certificates.map(c => `
    <div class="sb-item">${esc(t(c.name, lang))}${c.date
      ? ` <span class="dim">${esc(monthYear(c.date, lang))}</span>`
      : ''}</div>`).join('')

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(cv.name)} — ${ui.title}</title>
<!-- Loaded over the network so the PDF matches the site's type. If it fails
     (offline), the stack falls back to a system mono and the layout holds. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  /* Light palette from app/assets/css/main.css. The page itself stays white:
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
    --mono: "JetBrains Mono", ui-monospace, "DejaVu Sans Mono", monospace;
    --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
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
  }

  /* Terminal window chrome, framing the whole sheet. Deliberately slim — it
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
  .dot { width: 2mm; height: 2mm; border-radius: 50%; }

  /* Exact height, not min-height: at exactly 297mm the sub-pixel rounding of
     the title bar tipped the body 2px past the sheet and Chromium emitted a
     blank second page. The real overflow guard is the page count printed by
     build-cv.ts, not this. */
  .page { display: flex; height: calc(297mm - 7mm); }

  /* Sidebar */
  .sidebar {
    width: 64mm;
    flex: 0 0 64mm;
    background: var(--paper);
    border-right: 0.4mm solid var(--border);
    padding: 6mm 5mm;
  }
  .name {
    font-family: var(--mono);
    font-size: 14pt;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.3pt;
  }
  .sb-role { font-family: var(--mono); font-size: 9pt; color: var(--accent); margin-top: 1mm; }

  .sb-h {
    font-family: var(--mono);
    font-size: 8.5pt;
    font-weight: 700;
    margin: 3.8mm 0 1.8mm;
    color: var(--text);
  }
  .sb-h::before { content: "$ "; color: var(--accent-2); }
  .sb-sub {
    font-family: var(--mono);
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    color: var(--muted);
    margin: 2.5mm 0 1mm;
  }
  .divider { border: 0; border-top: 0.3mm solid var(--border); margin: 3mm 0 0; }

  /* Icon and text on one baseline. align-items:start plus a small nudge centres
     the icon against the FIRST LINE of a wrapping value; align-items:center
     would drag the pin to the middle of a two-line address.
     (No backticks in here — this CSS sits inside a template literal.) */
  .c-row {
    display: flex;
    align-items: start;
    gap: 1.8mm;
    font-size: 8.2pt;
    line-height: 1.42;
    word-break: break-word;
  }
  .c-row + .c-row { margin-top: 1mm; }
  .c-row a { color: var(--text); text-decoration: none; }
  .ico {
    width: 3.2mm;
    height: 3.2mm;
    flex: 0 0 3.2mm;
    margin-top: 0.35mm;
    color: var(--accent);
  }

  .skill { display: flex; align-items: baseline; justify-content: space-between; gap: 2mm; margin-bottom: 0.8mm; }
  .skill-name { font-size: 8pt; line-height: 1.25; }
  .dim { color: var(--muted); }
  .meter { display: flex; gap: 0.35mm; flex: 0 0 auto; }
  .meter i { width: 1.5mm; height: 1.5mm; border-radius: 0.2mm; }
  .meter .on { background: var(--accent); }
  .meter .off { background: var(--border); }

  .sb-item { font-size: 8.2pt; line-height: 1.42; }
  .sb-item::before { content: "▸ "; color: var(--accent); }

  /* ---------------------------------------------------------------------
     Main column.

     TYPE SCALE — four sizes, and they are far enough apart to read as
     deliberate. The previous version had six (17 / 10 / 9 / 8.9 / 8.8 / 7.6),
     three of which differed by a tenth of a point: that reads as noise rather
     than hierarchy, because the eye cannot tell 8.8 from 9.

     FONT DISCIPLINE — mono means "machine-generated fact": dates, tech stacks,
     the section headings. Sans means prose. Nothing alternates within a line.

     WEIGHT — 400 for prose, 600 for the one thing that names an entry, 700 for
     headings. Three weights, each with a job.
  --------------------------------------------------------------------- */
  :root {
    --fs-title: 16pt;   /* document title */
    --fs-head: 9.5pt;   /* section headings and entry titles */
    --fs-body: 8.6pt;   /* prose: bullets, organisations, notes */
    --fs-meta: 7.4pt;   /* mono facts: dates, tech stacks */

    /* Spacing rhythm. Inter-entry is 4x intra-entry and inter-section is ~2x
       inter-entry, so the gaps themselves say where a block starts and ends —
       previously entries sat 2.6mm apart and sections 4mm, which is nearly the
       same number and left everything looking like one undifferentiated run. */
    --sp-in: 0.9mm;     /* between lines inside one entry */
    --sp-entry: 3.2mm;  /* between two entries */
    --sp-sec: 5mm;      /* between two sections */
  }

  .main { flex: 1; padding: 6.5mm 6.5mm 5mm 6mm; min-width: 0; }

  .doc-title {
    font-family: var(--mono);
    font-size: var(--fs-title);
    font-weight: 700;
    letter-spacing: 0.4pt;
    line-height: 1.1;
  }
  .tagline {
    font-size: var(--fs-body);
    color: var(--muted);
    margin-top: 1.2mm;
    padding-bottom: 2.4mm;
    border-bottom: 0.5mm solid var(--accent);
  }

  .sec { margin-top: var(--sp-sec); }
  .sec-h {
    font-family: var(--mono);
    font-size: var(--fs-head);
    font-weight: 700;
    margin-bottom: 2.2mm;
  }
  .sec-h::before { content: "$ "; color: var(--accent-2); }

  /* The grid that does the real work: a fixed date gutter, so every entry in
     every section starts at the same x and the dates form a column of their
     own. The gutter is exactly wide enough for MM/YYYY – MM/YYYY at --fs-meta,
     which is why gutter() emits numeric dates and never a spelled month. */
  .row {
    display: grid;
    grid-template-columns: 27mm 1fr;
    column-gap: 4mm;
    margin-top: var(--sp-entry);
  }
  .sec-h + .row { margin-top: 0; }

  .when {
    font-family: var(--mono);
    font-size: var(--fs-meta);
    line-height: 1.5;
    color: var(--muted);
    white-space: nowrap;
    padding-top: 0.5mm;   /* optical: sits on the role's baseline, not its box */
  }
  .what { min-width: 0; }

  .role {
    font-family: var(--sans);
    font-size: var(--fs-head);
    font-weight: 600;
    line-height: 1.3;
    color: var(--text);
  }
  .role-sm { font-size: var(--fs-body); }
  .grade { color: var(--accent); font-weight: 600; }
  .grade::before { content: "· "; color: var(--muted); font-weight: 400; }

  .org {
    font-size: var(--fs-body);
    line-height: 1.4;
    color: var(--muted);
    margin-top: var(--sp-in);
  }
  .org-strong { color: var(--text); }

  ul.bullets { list-style: none; margin-top: 1.3mm; }
  ul.bullets li {
    font-size: var(--fs-body);
    line-height: 1.45;
    padding-left: 3.6mm;
    position: relative;
  }
  ul.bullets li + li { margin-top: var(--sp-in); }
  ul.bullets li::before {
    content: "▸";
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .note {
    font-size: var(--fs-body);
    line-height: 1.45;
    color: var(--muted);
    margin-top: var(--sp-in);
  }

  .tech {
    font-family: var(--mono);
    font-size: var(--fs-meta);
    line-height: 1.5;
    color: var(--muted);
    margin-top: 1.2mm;
  }
  .tech b { color: var(--accent); font-weight: 500; }

</style>
</head>
<body>
  <div class="titlebar">
    <span class="dot" style="background:#e05c53"></span>
    <span class="dot" style="background:#d9a441"></span>
    <span class="dot" style="background:#3fa34d"></span>
    <span style="margin-left:2mm">${esc(cv.name.toLowerCase().split(' ')[0] ?? '')}@goatly.dev: ~/${lang === 'de' ? 'lebenslauf' : 'cv'}</span>
  </div>

  <div class="page">
    <aside class="sidebar">
      <div class="name">${esc(cv.name)}</div>
      <div class="sb-role">${esc(t(cv.headline, lang))}</div>

      <hr class="divider">
      <div class="sb-h">contact</div>
      ${contact}

      <hr class="divider">
      <div class="sb-h">${esc(ui.skills)}</div>
      ${skills}

      <hr class="divider">
      <div class="sb-h">${esc(ui.languages)}</div>
      ${languages}

      ${certificates
        ? `<hr class="divider"><div class="sb-h">${esc(ui.certificates)}</div>${certificates}`
        : ''}

      ${cv.softSkills?.length
        ? `<hr class="divider"><div class="sb-h">${esc(ui.softSkills)}</div>`
        + cv.softSkills.map(s => `<div class="sb-item">${esc(t(s, lang))}</div>`).join('')
        : ''}

      ${cv.interests?.length
        ? `<hr class="divider"><div class="sb-h">${esc(ui.interests)}</div>`
        + cv.interests.map(s => `<div class="sb-item">${esc(t(s, lang))}</div>`).join('')
        : ''}
    </aside>

    <main class="main">
      <div class="doc-title">${esc(ui.title)}</div>
      <div class="tagline">${esc(t(cv.tagline, lang))}</div>
      ${section(ui.experience, experience)}
      ${section(ui.education, education)}
      ${section(ui.internships, internships)}
    </main>
  </div>
</body>
</html>`
}
