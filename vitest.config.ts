import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Plain unit tests over pure functions — no Nuxt environment, so the suite
// stays fast enough to sit in the pre-commit hook.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Pinned, and deliberately NOT UTC: the formatDate regression this suite
    // guards (see test/format.test.ts) only reproduces east of UTC, so on a
    // UTC machine those assertions would pass against the bug.
    env: { TZ: 'Europe/Berlin' },
  },
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
  },
})
