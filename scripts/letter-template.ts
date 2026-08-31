/**
 * An Anschreiben on A4, laid out to DIN 5008 Form B.
 *
 * WHY THE STANDARD WINS. The site's theme is welcome in the Briefkopf and in
 * the type, and nowhere else. DIN 5008 fixes where the address block sits, how
 * wide it is, where the date goes and where the Betreff starts, and a German
 * recruiter reads a deviation from that as carelessness rather than as design.
 * So the theme gets the letterhead and the palette; the standard gets the
 * geometry. Where they disagree the standard wins, every time.
 *
 * Form B (Briefkopf 45mm) rather than Form A (27mm), because there is a
 * letterhead here to put in it.
 *
 * The measurements, all from the top-left of the sheet:
 *
 *   left margin        25mm      right margin 20mm
 *   Briefkopf          0–45mm    the title bar and the letterhead live here
 *   Anschriftfeld      45mm      85mm wide, 40mm high
 *     Rücksendeangabe  45mm      one small line, what a window envelope shows
 *     recipient        50mm
 *   date               ~85mm     right-aligned, below the address field
 *   Betreff            98.46mm   bold, no "Betreff:" prefix — that is obsolete
 *   body               after the Betreff, two lines down
 *   Falzmarken         105mm and 210mm; Lochmarke at 148.5mm
 *
 * The fold and hole marks are the reason the geometry has to be exact: they
 * are what lets the sheet be folded into a window envelope with the address
 * showing. Nobody posts an application on paper often any more, but a PDF that
 * *could* be posted is the one that looks like it was written by someone who
 * knows the convention.
 */

import {
  BASE_CSS, esc, FONT_LINKS, letterDate, titlebar, TITLEBAR_CSS, type Lang,
} from './letterhead.ts'

/** Who the letter is from. Assembled from cv.yml, app/legal.ts and cv.private.yml. */
export type Sender = {
  name: string
  /** Postal address lines, from app/legal.ts. */
  address: string[]
  email: string
  phone?: string
  links: { label: string, url: string }[]
}

/** Who it is to. Everything but `company` is optional — some ads name nobody. */
export type Recipient = {
  company: string
  name?: string
  street?: string
  postcode?: string
  city?: string
  country?: string
}

export type LetterData = {
  lang: Lang
  /** ISO YYYY-MM-DD. */
  date: string
  /** Prefixes the date: "Heidelberg, 31. August 2026". */
  place?: string
  recipient: Recipient
  subject: string
  /** An ad's reference number, printed under the Betreff. */
  reference?: string
  salutation: string
  closing: string
  /** Markdown body, already rendered to HTML. */
  body: string
  enclosures?: string[]
}

const UI = {
  de: { enclosures: 'Anlagen', via: 'Ihre Anzeige' },
  en: { enclosures: 'Enclosures', via: 'Your advertisement' },
} as const

/**
 * The Rücksendeangabe: the sender on one small line above the recipient.
 *
 * This is the line that shows through a window envelope above the address, so
 * it has to fit on one line and stay small. It is not the place for the full
 * contact block — that is in the Briefkopf.
 */
function returnLine(s: Sender): string {
  return esc([s.name, ...s.address].join(' · '))
}

function addressBlock(r: Recipient): string {
  // DIN 5008 order: company, then person, then street, then postcode + city.
  // A country, when present, goes last and is conventionally uppercased.
  const lines = [
    r.company,
    r.name,
    r.street,
    [r.postcode, r.city].filter(Boolean).join(' '),
    r.country?.toUpperCase(),
  ].filter((l): l is string => Boolean(l && l.trim()))

  return lines.map(l => `<div>${esc(l)}</div>`).join('')
}

export function renderLetter(d: LetterData, sender: Sender): string {
  const ui = UI[d.lang]

  // One line, no icons. On the CV an icon column is doing real work — it lets
  // the eye find the phone number among a dozen rows. Here there are four
  // items on one line and nothing to search, so the icons were only texture.
  const contact = [
    sender.email,
    sender.phone,
    ...sender.links.map(l => l.url.replace(/^https?:\/\//, '')),
  ].filter(Boolean).map(v => esc(v!)).join(' &middot; ')

  const enclosures = d.enclosures?.length
    ? `<div class="anlagen">
        <div class="anlagen-h">${esc(ui.enclosures)}</div>
        ${d.enclosures.map(e => `<div>${esc(e)}</div>`).join('')}
      </div>`
    : ''

  return `<!doctype html>
<html lang="${d.lang}">
<head>
<meta charset="utf-8">
<title>${esc(sender.name)} — ${esc(d.subject)}</title>
${FONT_LINKS}
<style>
${BASE_CSS}

${TITLEBAR_CSS}

  /* Everything DIN-critical is positioned from the sheet, not from the flow,
     so the title bar above cannot push the address field off its measurement. */
  .sheet { position: relative; width: 210mm; height: 297mm; }

  /* --- Briefkopf: 0-45mm, the only zone the theme is free in ---
     The title bar carries the theme; everything under it stays quiet, because
     a business letter is not the place for a second letterhead.

     The rule belongs to the name, not to the block. Sat under the contact line
     instead, as a terminator, it hangs off a long muted line with nothing to
     attach to and reads as a stray dash — and it competes with the
     Rücksendeangabe's own hairline 20mm below. Under the name it does the one
     job the block needs: it separates the name from the details. */
  .kopf { padding: 6mm 20mm 0 25mm; }
  .kopf .name { font-size: 12pt; font-weight: 600; }
  .rule { width: 9mm; height: 0.6mm; background: var(--accent); margin: 2.4mm 0 2.2mm; }
  .kopf .contacts { font-size: 7.8pt; color: var(--muted); }

  /* --- Anschriftfeld: 85x40mm at 45mm. Not negotiable. --- */
  .anschrift {
    position: absolute;
    top: 45mm; left: 25mm;
    width: 85mm; height: 40mm;
    font-size: 10pt;
    line-height: 1.35;
  }
  .ruecksende {
    font-size: 6.5pt;
    color: var(--muted);
    border-bottom: 0.2mm solid var(--border);
    padding-bottom: 0.8mm;
    margin-bottom: 3.5mm;
    white-space: nowrap;
    overflow: hidden;
  }

  /* --- Date: right-aligned, below the address field --- */
  .datum { position: absolute; top: 87mm; right: 20mm; font-size: 10pt; }

  /* --- Body: starts at the Betreff line and runs to the footer ---
     bottom is 20mm because that is DIN 5008's minimum foot margin, not a
     guess. Setting the box to exactly the standard's floor is what makes the
     overflow check in build-letter.ts mean something: content past this box is
     precisely content breaking the margin. It was 18mm, which quietly allowed
     letters 2mm over. */
  .body {
    position: absolute;
    top: 98.46mm; left: 25mm; right: 20mm; bottom: 20mm;
    font-size: 10.5pt;
    line-height: 1.55;
  }
  .betreff { font-weight: 600; font-size: 11pt; }
  .referenz { font-size: 9pt; color: var(--muted); margin-top: 1mm; }
  .anrede { margin-top: 8mm; }
  /* Ragged right, deliberately. Justified was tried and produced visible
     rivers: German compounds are long, and Chromium hyphenates only when the
     language's dictionary component happens to be installed — it is not here,
     so hyphens:auto was a no-op and justification had nothing to relieve it
     with. Worse, where the dictionary *is* installed the line breaks differ,
     so the same letter could run to one page on one machine and two on
     another. DIN 5008 does not ask for justification; determinism is worth
     more than the straight edge. */
  .prose p { margin-top: 4mm; }
  .prose ul { margin: 4mm 0 0 5mm; }
  .prose li { margin-top: 1.2mm; }
  .prose strong { font-weight: 600; }

  .gruss { margin-top: 7mm; }
  /* Three empty lines is the convention for a handwritten signature. A printed
     name directly under the closing reads as an email, not a letter. */
  .sig { margin-top: 18mm; font-size: 10.5pt; }
  .anlagen { margin-top: 8mm; font-size: 9pt; }
  .anlagen-h { font-size: 8.5pt; color: var(--muted); margin-bottom: 1mm; }

  /* --- Falzmarken and Lochmarke ---
     Placed 5mm in from the left edge rather than on it: a printer that cannot
     bleed would otherwise clip the marks off entirely, which defeats them. */
  .mark { position: absolute; left: 5mm; width: 4mm; height: 0; border-top: 0.2mm solid var(--border); }
  .falz1 { top: 105mm; }
  .lochung { top: 148.5mm; width: 6mm; }
  .falz2 { top: 210mm; }
</style>
</head>
<body>
  <div class="sheet">
    ${titlebar(sender.name, d.lang === 'de' ? 'anschreiben' : 'letter')}

    <div class="kopf">
      <div class="name">${esc(sender.name)}</div>
      <div class="rule"></div>
      <div class="contacts">${contact}</div>
    </div>

    <div class="mark falz1"></div>
    <div class="mark lochung"></div>
    <div class="mark falz2"></div>

    <div class="anschrift">
      <div class="ruecksende">${returnLine(sender)}</div>
      ${addressBlock(d.recipient)}
    </div>

    <div class="datum">${esc(letterDate(d.date, d.lang, d.place))}</div>

    <div class="body">
      <div class="betreff">${esc(d.subject)}</div>
      ${d.reference ? `<div class="referenz">${esc(d.reference)}</div>` : ''}

      <div class="anrede">${esc(d.salutation)}</div>
      <div class="prose">${d.body}</div>

      <div class="gruss">${esc(d.closing)}</div>
      <div class="sig">${esc(sender.name)}</div>
      ${enclosures}
    </div>
  </div>
</body>
</html>`
}
