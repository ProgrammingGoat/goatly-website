/**
 * A route path without a trailing slash (`/` stays `/`).
 *
 * Content paths, payload keys and canonical URLs are all slash-less. A host
 * that serves the slashed form instead hydrates at a path one character off,
 * which misses the payload and renders the page with no content.
 */
export function routePath(path: string) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}
