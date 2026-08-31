import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * A string in both site languages. The site renders `en`; the PDF script
 * (scripts/build-cv.ts) renders whichever it was asked for, so one CV source
 * can print an English CV and a German Lebenslauf.
 *
 * This is contained to the CV on purpose — see CLAUDE.md. The rest of the site
 * is English only and must not grow an i18n layer.
 */
const t = z.object({
  en: z.string(),
  de: z.string(),
})

/**
 * `YYYY-MM`, or bare `YYYY` where the month genuinely isn't known — a stretch
 * of study from years ago has a year and nothing more honest than that. Sorted
 * as a string either way, which is why the format is ISO-ordered.
 */
const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, 'expected YYYY-MM or YYYY')

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(), // ISO date, e.g. 2026-08-01
        description: z.string().optional(),
        cover: z.string().optional(), // path under /public, e.g. /img/projects/thing.png
        // Where a cropped cover keeps its subject — "top", "left bottom",
        // "50% 25%". A free string, not an enum, so the percentage form stays
        // open; coverPosition in app/utils/cover.ts validates it and falls back
        // to centre rather than emitting CSS the browser drops.
        focus: z.string().optional(),
        featured: z.boolean().default(false), // promote to the landing page
        draft: z.boolean().default(false),
        tags: z.array(z.string()).default([]),

        kind: z.string().optional(), // "Web app", "CLI", "Library", "Tooling"
        role: z.string().optional(), // "Solo", "Team of 4", "Work project"
        tools: z.array(z.string()).default([]), // Java, Vue, Playwright, …
        // Rendered as buttons, in order. Repo, live demo, write-up, whatever.
        links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      }),
    }),

    // A `data` collection, not a page: there is exactly one CV and it has no
    // markdown body. Queried with queryCollection('cv').first().
    //
    // NOTHING PRIVATE GOES IN HERE. Anything under /content is compiled into a
    // SQLite database that ships with the static build, so it is published
    // whether or not a page renders it. Street address, phone, date of birth
    // and the personal email live in cv.private.yml at the repo root, which
    // Nuxt never reads. See CLAUDE.md, "Privacy".
    cv: defineCollection({
      type: 'data',
      source: 'cv/cv.yml',
      schema: z.object({
        name: z.string(),
        headline: t,
        tagline: t,
        /** City and country only — never a street. */
        location: t,
        /** The goatly.dev alias, never the personal address. */
        email: z.string(),
        links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),

        experience: z.array(z.object({
          start: yearMonth,
          end: yearMonth.optional(), // omitted = current
          role: t,
          org: z.string(),
          location: z.string().optional(),
          bullets: z.array(t).default([]),
          stack: z.array(z.string()).default([]),
        })).default([]),

        education: z.array(z.object({
          start: yearMonth,
          end: yearMonth.optional(),
          title: t,
          org: z.string().optional(),
          grade: z.string().optional(),
          note: t.optional(),
        })).default([]),

        internships: z.array(z.object({
          start: yearMonth,
          end: yearMonth.optional(),
          title: t,
          org: z.string(),
          note: t.optional(),
        })).default([]),

        // Grouped rather than a flat list, because the PDF's sidebar renders
        // them as headed blocks and the web page as labelled rows.
        //
        // `level` (0-100) is optional and drives the PDF's block meters. The
        // web page ignores it: a self-assessed percentage reads as padding on a
        // portfolio site, but it is expected on a German Lebenslauf.
        skills: z.array(z.object({
          group: t,
          items: z.array(z.object({
            // Most skill names are the same in both languages (Java, Vue), so a
            // plain string is the common case. The localised form is there for
            // the ones that genuinely differ — "AI-assisted development" is
            // "KI-gestützte Entwicklung" on a German Lebenslauf.
            name: z.union([z.string(), t]),
            level: z.number().min(0).max(100).optional(),
          })),
        })).default([]),

        // Sidebar only, and PDF only — the web CV says this with prose on
        // /about instead, where it can be specific rather than a word list.
        softSkills: z.array(t).default([]),

        languages: z.array(z.object({
          name: t,
          level: t,
          /** 0-100, for the PDF's meters. The web page shows `level` instead. */
          meter: z.number().min(0).max(100).optional(),
        })).default([]),

        certificates: z.array(z.object({
          name: t,
          issuer: z.string().optional(),
          date: z.string().optional(),
        })).default([]),

        interests: z.array(t).default([]),
      }),
    }),

    // Deferred, not deleted — a /notes section is a one-line change from here.
    // Adding it back means adding it to SOURCES in server/routes/rss.xml.ts too.
    //
    // blog: defineCollection({
    //   type: 'page',
    //   source: 'blog/**/*.md',
    //   schema: z.object({ ... }),
    // }),
  },
})
