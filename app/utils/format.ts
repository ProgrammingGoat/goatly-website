// Auto-imported by Nuxt (from app/utils).
// Formats a date for display: "14 Jun 2019".
//
// Month names are hardcoded rather than read from toLocaleDateString: the
// string has to come out identical on the build machine and in every
// visitor's browser, whatever locale they're in.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(input?: string): string {
  if (!input) return ''

  // ISO-ish (e.g. "2026-08-01" or "2026-08-01T..."): read the parts off the
  // string. new Date() would take them as UTC midnight, which the local-parts
  // read at the bottom then drags into the previous day west of UTC.
  const full = /^(\d{4})-(\d{2})-(\d{2})/.exec(input)
  if (full) {
    const month = MONTHS[Number(full[2]) - 1]
    return month ? `${Number(full[3])} ${month} ${full[1]}` : input
  }

  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return input
  // Read the local calendar parts rather than going via toISOString(): a
  // non-ISO date like "August 1, 2026" parses as local midnight, which
  // toISOString() shifts back into the previous day everywhere east of UTC.
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * A CV date: "May 2026" from `2026-05`, or just "2013" from a bare year.
 *
 * A job has a month, not a day. Bare years exist because some entries only
 * honestly have one, and inventing a month to satisfy a format would be worse
 * than showing less. Same string-parsing rule as formatDate — never `new Date`,
 * so no timezone can move an entry into the wrong year.
 */
export function formatMonthYear(input?: string, lang: 'en' | 'de' = 'en'): string {
  if (!input) return ''

  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(input)
  if (!match) return input

  const [, year, month] = match
  if (!month) return year!

  // German CVs write the numeric form, "05/2026"; English spells the month.
  if (lang === 'de') return `${month}/${year}`
  const name = MONTHS[Number(month) - 1]
  return name ? `${name} ${year}` : year!
}

/**
 * A date range for a CV entry. An omitted `end` means the role is current.
 */
export function formatRange(
  start?: string,
  end?: string,
  lang: 'en' | 'de' = 'en',
): string {
  const from = formatMonthYear(start, lang)
  if (!from) return ''
  const to = end ? formatMonthYear(end, lang) : (lang === 'de' ? 'heute' : 'present')
  return `${from} – ${to}`
}

// Read off the string where it's ISO, so no timezone can drag a January entry
// back into the year before.
export function formatYear(input?: string): string {
  if (!input) return ''

  const iso = /^(\d{4})(?:-|$)/.exec(input)
  if (iso) return iso[1]!

  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? input : String(d.getFullYear())
}
