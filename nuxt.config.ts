import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/image', '@nuxt/fonts', '@nuxt/eslint'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // titleTemplate lives in app/app.vue — see the note there.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#171c24' },
        // Mirror of site.description; used before a page sets its own.
        { name: 'description', content: 'Full-stack developer in Heidelberg — Java, Spring, Vue and TypeScript.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Feed autodiscovery — lets readers find the feed from any page URL.
        { rel: 'alternate', type: 'application/rss+xml', title: 'goatly.dev', href: '/rss.xml' },
      ],
      // Dark by default; light only if the visitor explicitly toggled it.
      // (Set before first paint to avoid a flash.)
      script: [
        {
          tagPosition: 'head',
          innerHTML:
            "(function(){try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark');}catch(e){}})();",
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // Smooth for in-page anchors only. As CSS on `html` it also caught the scroll
  // Nuxt runs on route change, so leaving a scrolled page glided to the top.
  router: {
    options: { scrollBehaviorType: 'smooth' },
  },

  content: {
    // Use Node's built-in SQLite (node:sqlite) instead of the native
    // better-sqlite3 addon — no compile step, works in CI (Cloudflare) too.
    experimental: { nativeSqlite: true },
    build: {
      markdown: {
        toc: { depth: 3 },
      },
    },
  },

  // Canonical origin, no trailing slash — deployment config, not copy, so it
  // lives here rather than in app/site.ts. The RSS feed builds absolute URLs
  // from it, item <guid>s included, so changing it makes readers treat every
  // existing entry as new. Override per build with NUXT_PUBLIC_SITE_URL (the
  // site is prerendered, so it's baked in at generate time, not read live).
  runtimeConfig: {
    public: {
      siteUrl: 'https://goatly.dev',
    },
  },

  compatibilityDate: '2025-07-15',

  // Full static generation: `npm run generate` prerenders every page by
  // crawling links, producing a static site for Cloudflare Pages.
  nitro: {
    prerender: {
      crawlLinks: true,
      // /rss.xml and /sitemap.xml are listed explicitly: the crawler only
      // follows links out of HTML pages. Nothing on the site links to the
      // sitemap at all (robots.txt points at it, and that isn't crawled), and
      // the feed would be missed if the footer link ever moved.
      routes: ['/', '/rss.xml', '/sitemap.xml'],
      // Fail the build rather than deploy the damage. Left off, a `cover:`
      // pointing at a missing file only logs IPX_FILE_NOT_FOUND and ships a
      // broken image, and an entry that misses the schema still publishes —
      // Nuxt Content backfills its title from the filename and lists it. Both
      // exit 0. Note this makes an image part of the commit that references
      // it: an entry whose cover isn't committed alongside now fails.
      failOnError: true,
      // Write `art/piece.html`, not `art/piece/index.html`: a directory index
      // makes Cloudflare 308 to the slashed path, which the canonical, sitemap
      // and feed <guid>s don't use — and which blanked entry pages on load.
      autoSubfolderIndex: false,
    },
  },

  // Tailwind CSS v4 is wired in through its official Vite plugin.
  vite: {
    plugins: [tailwindcss()],
  },

  // Lint + formatting in one. `stylistic` turns on the whitespace/quote/comma
  // rules, so there's no separate formatter. Run it with `npm run lint`.
  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
        indent: 2,
      },
    },
  },

  // Self-hosted webfonts (downloaded at build time — no external requests).
  fonts: {
    // IBM Plex, not the JetBrains Mono + Inter pairing every developer
    // portfolio reaches for. Plex is the typographic world of enterprise Java
    // and Spring, which is the work this site is advertising, and the mono and
    // sans are one superfamily so they sit together without negotiation.
    families: [
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'IBM Plex Sans', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },

  // Cover images are resized at build and served as AVIF, then WebP, with a
  // JPEG fallback. `quality` (0–100) trades file size for fidelity.
  //
  // AVIF earns its encode time on colour, not bytes. sharp writes AVIF at
  // 4:4:4, while lossy WebP is *always* 4:2:0 — half the colour resolution,
  // and no quality setting buys it back. Measured against the source, WebP's
  // chroma error only falls from 2.90 at q85 to 2.62 at q100 (384KB), where
  // AVIF q72 reaches 1.52 at 161KB. On flat, saturated art that is visible,
  // which is why AVIF is worth ~11x the encode time here.
  //
  // `maxOutputDimension` clamps encodes to 2560px, but expect little from it:
  // IPX already refuses to upscale past source width, so on a 1984px cover the
  // 3072 and 3840 rungs were always source-width copies anyway. It only bites
  // on sources wider than 2560 — insurance against a big scan, not a saving.
  //
  // Quality is no lever either. 85 cost 57% more AVIF bytes and ~12% more
  // build time than 72 with no visible gain: the win is 4:4:4, not the number.
  //
  // `format` here is only read when a component sets no `format` prop, so don't
  // reintroduce one. Its neighbour `legacy-format="jpeg"` is the opposite —
  // prop-only and load-bearing, since every cover is a .png and the default
  // fallback for those is the PNG chain described below.
  //
  // Every variant is a real file in the output, so the *set* of widths matters
  // as much as their size: each one costs three encodes and three files, per
  // image, forever. Widths come from these screens unioned with each `sizes`
  // slot in the components, doubled for retina — so a slot written as `340px`
  // when `384px` is already being generated mints two more widths (340, 680)
  // for a 13% difference no one can see. Keep component slots *on* this
  // ladder, and prefer a slightly-too-large image to a new rung.
  image: {
    format: ['avif', 'webp'],
    quality: 72,
    ipx: { maxOutputDimension: 2560 },
    // Add a larger breakpoint so full-bleed hero / lightbox images stay crisp
    // on big and retina displays.
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536, xxxl: 1920 },
  },
})
