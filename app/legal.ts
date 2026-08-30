/**
 * Legal-page details, kept apart from app/site.ts because these are not copy —
 * they are a compliance decision that is still open.
 *
 * THE ADDRESS IS NOT DECIDED YET. Under §5 DDG a site that counts as
 * "geschäftsmäßig" needs a ladungsfähige Anschrift: a real postal address, not
 * a P.O. box. A portfolio used to find employment is a grey area; one that
 * offers freelance services is not. Three options, all of which only change
 * the value below:
 *
 *   1. Treat the site as private — no Impressum at all. Requires keeping every
 *      commercial framing off the site: no "available for hire", no rates, no
 *      ads or affiliate links.
 *   2. Rent a ladungsfähige business address (~€10–30/month) and publish that.
 *      Only valid if the provider offers real office space and receives post —
 *      pure mail forwarding does not qualify.
 *   3. Publish the home address.
 *
 * Note also that §5 Abs. 1 Nr. 2 DDG wants a means of *direct and efficient*
 * communication. A phone number specifically is NOT required (EuGH C-298/07),
 * but email alone is thin — if an Impressum turns out to be required, consider
 * adding a contact form.
 *
 * DECIDED: option 3 — the home address is published. The `address` field below
 * is filled in, so the Impressum is complete and the incomplete-notice branch
 * in the page no longer fires. It stays in the markup for the next time this
 * file is scaffolded somewhere.
 */
export const legal = {
  name: 'Lukas Brackmann',
  email: 'contact@goatly.dev',

  /**
   * Ladungsfähige Anschrift, as § 5 DDG requires.
   *
   * THIS IS PUBLIC AND PERMANENT. It renders into impressum.html and
   * datenschutz.html, which are static files that crawlers archive; robots.txt
   * and a noindex tag reduce how widely it spreads but cannot unpublish it.
   * That was a deliberate decision — see the note above.
   *
   * It lives here rather than in cv.private.yml precisely because it is no
   * longer private: guarding a value that the site itself publishes would make
   * privacy:check fire on this file and teach everyone to ignore it. The CV
   * PDF reads the address from here too, so there is still one source.
   */
  address: ['Im Fasanenwäldchen 4', '69126 Heidelberg'] as string[] | null,

  /** Last review of the Datenschutzerklärung. */
  updated: '2026-08-30',
}
