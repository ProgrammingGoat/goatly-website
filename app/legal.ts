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
 * Set `address` to a real value before pointing the domain at the site. Until
 * then the pages render an explicit notice rather than a plausible-looking
 * blank, so an unfinished Impressum cannot go live quietly.
 */
export const legal = {
  name: 'Lukas Brackmann',
  email: 'contact@goatly.dev',

  /** TODO(legal): ladungsfähige Anschrift, or null while undecided. */
  address: null as string[] | null,

  /** Last review of the Datenschutzerklärung. */
  updated: '2026-08-30',
}
