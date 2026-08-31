/**
 * Turning a rendered HTML document into an A4 PDF.
 *
 * Shared by build-cv.ts and build-letter.ts so there is one browser-launching
 * path rather than two that drift. Everything here is about *printing* — the
 * look of the documents lives in letterhead.ts and the two templates.
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { chromium, type Browser } from 'playwright-core'

/** A system Chromium. Playwright's own download is not required or expected. */
export function findBrowser(): string {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean) as string[]

  for (const path of candidates) if (existsSync(path)) return path

  throw new Error(
    'No Chromium found. Install one, or set CHROME_PATH to a browser binary.\n'
    + `  Looked in: ${candidates.join(', ')}`,
  )
}

/** Page count, read straight off the PDF — no dependency, just the /Type /Page objects. */
export function countPages(path: string): number {
  const bytes = readFileSync(path).toString('latin1')
  return (bytes.match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1
}

export async function launch(): Promise<Browser> {
  return chromium.launch({ executablePath: findBrowser() })
}

export type PrintResult = {
  pages: number
  /**
   * How far the measured element's content runs past its own box, in mm.
   *
   * A page count alone does not catch a document that overruns: an absolutely
   * positioned box overflows *visibly* rather than paginating, so a letter can
   * eat its whole bottom margin and still report one page. Pass a selector to
   * measure and the caller can say so.
   */
  overflowMm: number
}

/** Print one document. `overflowSelector` is measured before the PDF is written. */
export async function printPdf(
  browser: Browser,
  html: string,
  out: string,
  overflowSelector?: string,
): Promise<PrintResult> {
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'networkidle' })
    // Webfonts arrive after networkidle on a slow link; without this the page
    // can be printed mid-swap, in the fallback face.
    await page.evaluate(() => document.fonts.ready)

    const overflowMm = overflowSelector
      ? await page.evaluate((sel) => {
          const el = document.querySelector(sel)
          if (!(el instanceof HTMLElement)) return 0
          return Math.max(0, el.scrollHeight - el.clientHeight) / (96 / 25.4)
        }, overflowSelector)
      : 0

    mkdirSync(dirname(out), { recursive: true })
    await page.pdf({
      path: out,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return { pages: countPages(out), overflowMm }
  }
  finally {
    await page.close()
  }
}
