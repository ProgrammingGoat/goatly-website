/**
 * SITE COPY — single source of truth for all human-facing prose.
 *
 * Short UI labels (nav items, button text, "Read →", etc.) live in the
 * components and pages, and are intentionally NOT here.
 *
 * Nothing private belongs in this file. It ships to every visitor: city and
 * country only, and only the goatly.dev email alias. See CLAUDE.md, "Privacy".
 */

export const site = {
  // — Identity —
  name: 'Lukas Brackmann',
  /** Used where the domain reads better than the person, e.g. the wordmark. */
  domain: 'goatly.dev',
  /** Shell prompt in the hero and the footer status line. */
  handle: 'lukas',

  role: 'Full-Stack Developer',
  /** City and country only — never a street. */
  location: 'Heidelberg, Germany',
  email: 'contact@goatly.dev',

  // Where to find me. An entry with an empty `url` is skipped everywhere, so
  // it's safe to leave a placeholder here until the account exists.
  //   icon   — key into app/utils/socialIcons.ts; no match → lettered monogram
  //   handle — optional, shown under the label on /about
  socials: [
    {
      label: 'GitHub',
      icon: 'github',
      handle: '@ProgrammingGoat',
      url: 'https://github.com/ProgrammingGoat',
    },
    {
      label: 'LinkedIn',
      icon: 'linkedin',
      handle: 'lukas-brackmann',
      url: 'https://www.linkedin.com/in/lukas-brackmann/',
    },
    {
      label: 'Email',
      icon: 'mail',
      handle: 'contact@goatly.dev',
      url: 'mailto:contact@goatly.dev',
    },
  ],

  description:
    'Full-stack developer in Heidelberg — Java, Spring, Vue and TypeScript, using modern tools for automation and AI-assisted development.',

  home: {
    lead: 'I build and test web applications, mostly in Java and TypeScript.',
  },

  projects: {
    lead: 'Things I have built through the years.',
    description: 'Code projects by Lukas Brackmann — web applications, games, experiments.',
  },

  about: {
    description: 'About Lukas Brackmann — full-stack developer in Heidelberg, Germany.',
    body: [
      'I am a full-stack developer based in Heidelberg, building web apps and learning about AI safety.',
      'I use modern tools and rigorous testing to ensure the highest quality.',
      'I like goats! 🐐',
    ],
  },

  cv: {
    lead: 'My work experience. A PDF is available in English and German.',
    description: 'Curriculum vitae of Lukas Brackmann — full-stack developer, Heidelberg.',
  },
}
