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

  // TODO(copy): confirm how you want to describe yourself professionally.
  role: 'Full-Stack Developer',
  /** City and country only — never a street. */
  location: 'Heidelberg, Germany',
  email: 'hello@goatly.dev',

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
      handle: '',
      url: '', // TODO(copy): add the profile URL, or delete this entry.
    },
    {
      label: 'Email',
      icon: 'mail',
      handle: 'hello@goatly.dev',
      url: 'mailto:hello@goatly.dev',
    },
  ],

  // TODO(copy): this is the meta description — one sentence, ~155 characters,
  // written the way you'd introduce yourself to a recruiter.
  description:
    'Full-stack developer in Heidelberg — Java, Spring, Vue and TypeScript, with a focus on test automation and AI-assisted development.',

  home: {
    // TODO(copy): the line under your name in the hero.
    lead: 'I build and test web applications, mostly in Java and TypeScript.',
  },

  projects: {
    // TODO(copy)
    lead: 'Things I have built, at work and on my own time.',
    description: 'Code projects by Lukas Brackmann — web applications, tooling, and experiments.',
  },

  about: {
    description: 'About Lukas Brackmann — full-stack developer in Heidelberg, Germany.',
    // TODO(copy): one string per paragraph. Written in your voice, so please
    // rewrite these rather than shipping them as-is.
    body: [
      'I am a full-stack developer based in Heidelberg, currently building features and fixing bugs at tts Knowledge Products.',
      'I came to development the long way round, through an Ausbildung after several false starts, which is probably why I care more about shipping working software than about the route someone took to get there.',
      'Outside work I 3D-print things, draw, and over-configure my Arch Linux setup. 🐐',
    ],
  },

  cv: {
    // TODO(copy)
    lead: 'The short version. A PDF is available in English and German.',
    description: 'Curriculum vitae of Lukas Brackmann — full-stack developer, Heidelberg.',
  },
}
