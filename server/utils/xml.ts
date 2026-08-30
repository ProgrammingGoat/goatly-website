/**
 * Shared by the RSS feed and the sitemap. One implementation, because both are
 * outputs nobody eyeballs: a single unescaped `&` makes either document
 * unparseable, and a fix applied to one copy would silently leave the other.
 */
export const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
