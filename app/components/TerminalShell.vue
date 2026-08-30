<script setup lang="ts">
import { site } from '~/site'

/**
 * The hero's prompt, made real.
 *
 * This is the site's one easter egg, and it is native to the design rather
 * than pasted onto it: the hero already looks like a terminal, so the reward
 * for poking at it is that it behaves like one. It stays completely inert
 * until someone clicks or tabs into it, which is what makes it safe on a page
 * a recruiter also has to use — they see the same static prompt as before.
 *
 * Not a toy shell over the whole page: it can only navigate, print, and toggle
 * the theme. Nothing here can put the visitor somewhere they cannot get back
 * from with the ordinary nav.
 */

type Line = { kind: 'cmd' | 'out' | 'err', text: string }

const { toggle } = useTheme()
const router = useRouter()

const input = ref('')
const focused = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const log = ref<Line[]>([])
const history = ref<string[]>([])
const historyAt = ref(-1)

/** Pages the shell knows how to reach, and what `ls` prints. */
const ROUTES: Record<string, string> = {
  projects: '/projects',
  cv: '/cv',
  about: '/about',
  impressum: '/impressum',
  datenschutz: '/datenschutz',
}

const COMMANDS = [
  'help', 'whoami', 'ls', 'cd', 'open', 'cat', 'stack', 'contact',
  'theme', 'goat', 'clear',
]

const HELP: string[] = [
  'whoami          who this is',
  'ls              pages on this site',
  'cd <page>       go to a page',
  'cat cv          open the CV',
  'stack           what I build with',
  'contact         how to reach me',
  'theme           switch light / dark',
  'clear           clear this output',
]

/**
 * Keep the prompt in view after output lands.
 *
 * The scroll container is the hero's `.crt-body`, which owns the boot lines
 * above this component as well — a real session scrolls as one thing, so the
 * shell cannot just scroll itself. Reached with `closest` rather than a prop
 * because this component is only ever rendered inside that window, and a ref
 * threaded through for one call would be more machinery than the fact is
 * worth. `?.` keeps it harmless if that ever stops being true.
 */
function keepPromptInView() {
  nextTick(() => {
    const body = inputEl.value?.closest('.crt-body')
    if (!body) return
    body.scrollTop = body.scrollHeight
  })
}

function print(text: string, kind: Line['kind'] = 'out') {
  log.value.push({ kind, text })
  // A runaway log would push the page around under the reader; the shell is a
  // toy, not a scrollback buffer.
  if (log.value.length > 40) log.value.splice(0, log.value.length - 40)
}

function run(raw: string) {
  const line = raw.trim()
  print(line, 'cmd')
  if (!line) return

  history.value.push(line)
  historyAt.value = -1

  const [cmd, ...rest] = line.split(/\s+/)
  const arg = rest.join(' ').toLowerCase()

  switch (cmd?.toLowerCase()) {
    case 'help':
      HELP.forEach(l => print(l))
      break

    case 'whoami':
      print(`${site.name} — ${site.role}, ${site.location}`)
      break

    case 'ls':
      print(Object.keys(ROUTES).map(r => `${r}/`).join('   '))
      break

    case 'stack':
      print('Java · Spring · Docker · Vue · TypeScript · Playwright')
      break

    case 'contact':
      print(site.email)
      break

    case 'theme':
      toggle()
      print('theme toggled')
      break

    case 'goat':
      print('🐐  you found the goat!')
      break

    case 'clear':
      log.value = []
      break

    case 'cd':
    case 'open':
    case 'cat': {
      // `cat cv` and `cd cv` both mean "take me there" — insisting on the
      // difference would be pedantry in a shell with five destinations.
      const key = arg.replace(/^\/+|\/+$/g, '').replace(/\.md$/, '')
      const to = ROUTES[key]
      if (!key) print(`${cmd}: missing argument — try \`ls\``, 'err')
      else if (to) {
        print(`→ ${to}`)
        router.push(to)
      }
      else print(`${cmd}: no such page: ${arg}`, 'err')
      break
    }

    default:
      print(`zsh: command not found: ${cmd}`, 'err')
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    run(input.value)
    input.value = ''
    keepPromptInView()
    return
  }

  // Shell history, because a prompt that forgets what you just typed is a
  // costume rather than a terminal.
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    if (!history.value.length) return
    e.preventDefault()
    const last = history.value.length - 1
    if (historyAt.value === -1) historyAt.value = last
    else historyAt.value += e.key === 'ArrowUp' ? -1 : 1
    historyAt.value = Math.max(0, Math.min(last, historyAt.value))
    input.value = history.value[historyAt.value] ?? ''
    return
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    const parts = input.value.split(/\s+/)
    const pool = parts.length > 1 ? Object.keys(ROUTES) : COMMANDS
    const stem = (parts.pop() ?? '').toLowerCase()
    const hit = pool.find(c => c.startsWith(stem) && stem)
    if (hit) input.value = [...parts, hit].join(' ')
  }
}
</script>

<template>
  <div>
    <!-- Output. A live region so a screen-reader user hears results; without
         it the shell would type into a void for them. -->
    <div aria-live="polite" aria-atomic="false">
      <p
        v-for="(line, i) in log"
        :key="i"
        class="whitespace-pre-wrap break-words"
        :class="{
          'text-text': line.kind === 'cmd',
          'text-muted': line.kind === 'out',
          'text-[#e05c53]': line.kind === 'err',
        }"
      >
        <span v-if="line.kind === 'cmd'" class="text-accent-2">$ </span>{{ line.text }}
      </p>
    </div>

    <!-- The prompt. The whole row is a click target so the small caret is not
         the only way in. -->
    <p class="mt-1 flex items-center gap-1.5" @click="inputEl?.focus()">
      <span class="text-accent-2" aria-hidden="true">$</span>

      <!-- Before the input in DOM order, not after: the input is flex-1, so a
           cursor placed after it gets pushed to the far edge instead of
           sitting where the caret will actually appear. -->
      <span v-if="!focused && !input" class="prompt-cursor" aria-hidden="true" />

      <label class="sr-only" for="shell">Terminal — try typing help</label>
      <input
        id="shell"
        ref="inputEl"
        v-model="input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        class="shell-input min-w-0 flex-1 bg-transparent text-text outline-none"
        @keydown="onKey"
        @focus="focused = true"
        @blur="focused = false"
      >

      <span
        v-if="!focused && !log.length && !input"
        class="ml-auto shrink-0 text-xs text-muted/60"
        aria-hidden="true"
      >type <span class="text-accent/70">help</span></span>
    </p>
  </div>
</template>

<style scoped>
/* The real caret replaces the block one on focus, so typing behaves exactly
   the way the browser's own text editing does — selection, IME and a mobile
   keyboard all keep working, which a fake caret would quietly break. */
.shell-input {
  caret-color: var(--accent);
  font: inherit;
}
.shell-input:focus-visible {
  outline: none;
}
</style>
