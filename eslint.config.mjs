// @nuxt/eslint generates the base config in .nuxt/ from the project's own
// setup (Vue, TS, the module list). Project-specific overrides go below.
// Stylistic options (quotes, semicolons, indent) live in nuxt.config.ts.
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.output/**', '.nuxt/**', 'dist/**'],
  },
  {
    rules: {
      // Templates here keep multi-attribute tags on one line and short content
      // inline. That's deliberate and readable; enforcing the reflow would
      // rewrite nearly every template for no benefit.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',

      // Prose in site.ts is full of apostrophes ("I'm a developer"), where
      // double quotes are the readable choice over escaping.
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    },
  },
)
