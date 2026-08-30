<script setup lang="ts">
import { site } from '~/site'

// TODO(copy): the stack line — the four things you most want to be hired for.
const stack = ['Java', 'Spring', 'Vue', 'TypeScript']

const nameEl = ref<HTMLElement | null>(null)

/**
 * Resolve scrambled characters into the real name, left to right.
 *
 * Progressive enhancement, deliberately: the real text is already in the DOM
 * and rendered by the prerender, so with JS off nothing here runs and the name
 * is simply there. The element this writes to is aria-hidden and sits beside a
 * screen-reader copy, so the accessible name is never a run of punctuation.
 */
function scrambleTo(el: HTMLElement, text: string, ms: number) {
  const pool = '#$%&/\\<>[]{}=+*_?01'
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / ms)
    const settled = Math.floor(progress * text.length)
    let out = text.slice(0, settled)
    for (let i = settled; i < text.length; i++) {
      // Spaces stay spaces, so the word shape holds while the letters resolve.
      out += text[i] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]
    }
    el.textContent = out
    if (progress < 1) requestAnimationFrame(tick)
    else el.textContent = text
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  const el = nameEl.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Starts as the power-on finishes and the content has faded in.
  const timer = setTimeout(() => scrambleTo(el, site.name, 620), 900)
  onBeforeUnmount(() => clearTimeout(timer))
})
</script>

<template>
  <section class="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
    <!-- Phosphor bloom behind the glass. Sits under the window, never over
         text, so it can be generous without costing any legibility. -->
    <div class="crt-glow" aria-hidden="true" />

    <!-- The window is chrome around real content: the title bar and the prompt
         lines are aria-hidden, the h1 and the stack are not. -->
    <div class="crt relative overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/30">
      <div
        class="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3"
        aria-hidden="true"
      >
        <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span class="h-3 w-3 rounded-full bg-[#28c840]" />
        <span class="ml-2 font-mono text-xs text-muted">
          {{ site.handle }}@{{ site.domain }}: ~
        </span>
      </div>

      <!-- Scrolls inside its own box: a long stack line must never make the
           page scroll sideways on a narrow phone. -->
      <div class="crt-body relative max-h-[60vh] overflow-auto px-5 py-7 font-mono text-sm leading-relaxed sm:px-8 sm:py-10 sm:text-base">
        <p class="t-cmd" style="--d: 0.68s" aria-hidden="true">
          <span class="text-accent-2">$</span> whoami
        </p>

        <div class="t-out mb-6 mt-3" style="--d: 1.16s">
          <h1 class="text-2xl font-bold tracking-tight text-text sm:text-4xl">
            <!-- The scramble runs on the aria-hidden copy; the accessible name
                 comes from the span beside it and never changes. -->
            <span class="sr-only">{{ site.name }}</span>
            <span ref="nameEl" aria-hidden="true">{{ site.name }}</span>
          </h1>
          <p class="mt-1 text-base text-accent sm:text-xl">
            {{ site.role }}
          </p>
          <p class="mt-2 max-w-prose font-sans text-sm text-muted sm:text-base">
            {{ site.home.lead }}
          </p>
        </div>

        <p class="t-cmd" style="--d: 1.62s" aria-hidden="true">
          <span class="text-accent-2">$</span> cat stack.txt
        </p>
        <p class="t-out mt-2 text-muted" style="--d: 2.06s">
          <span v-for="(item, i) in stack" :key="item">
            <span v-if="i" class="text-border"> · </span>{{ item }}
          </span>
        </p>

        <!-- The prompt is real once the boot sequence finishes: click or tab
             into it and the shell answers. Static until then. -->
        <div class="t-out mt-6" style="--d: 2.24s">
          <TerminalShell />
        </div>
      </div>
    </div>

    <nav class="mt-8 flex flex-wrap gap-3" aria-label="Sections">
      <NuxtLink to="/projects" class="btn btn-solid">projects</NuxtLink>
      <NuxtLink to="/cv" class="btn">cv</NuxtLink>
      <NuxtLink to="/about" class="btn">about</NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
/* ---------------------------------------------------------------------------
   The signature: a CRT coming on.

   Not a fade — a real tube opens as a thin bright line that widens, then
   unrolls vertically, then the bloom decays. Pure CSS on purpose: the page is
   prerendered, so gating any of this on JS would leave the hero blank for a
   visitor without it. The content fades in only after the scale finishes, so
   it is never seen stretched.
--------------------------------------------------------------------------- */
.crt {
  transform-origin: center;
  animation: power-on 560ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes power-on {
  0% {
    transform: scaleX(0.55) scaleY(0.006);
    opacity: 0;
    filter: brightness(3.2);
  }
  35% {
    transform: scaleX(1) scaleY(0.006);
    opacity: 1;
    filter: brightness(3.2);
  }
  70% {
    transform: scaleX(1) scaleY(1);
    filter: brightness(1.7);
  }
  100% {
    transform: scaleX(1) scaleY(1);
    filter: brightness(1);
  }
}

/* The window is the viewport onto the session, not the session itself. Without
   a cap it grows with every command until the newest output — and the prompt
   you are typing at — is below the fold, which is exactly backwards: a real
   terminal keeps the prompt in view and scrolls its scrollback instead.
   TerminalShell scrolls this element to the bottom after each command. */
.crt-body {
  animation: fade-in 240ms ease-out 520ms both;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
  overscroll-behavior: contain; /* don't hand the page a scroll at the end */
}

.crt-body::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.crt-body::-webkit-scrollbar-track {
  background: transparent;
}
.crt-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 999px;
}
.crt-body::-webkit-scrollbar-thumb:hover {
  background: var(--muted);
  background-clip: content-box;
}

.crt-glow {
  position: absolute;
  /* Tracks the window rather than the section: the top offset matches the
     section's pt-28/pt-36, so the haze sits behind the glass instead of
     hanging above it in the header. */
  inset: 7rem 6% auto 6%;
  height: 60%;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  filter: blur(100px);
  animation: bloom 1.4s ease-out 320ms forwards;
}

@media (min-width: 640px) {
  .crt-glow { top: 9rem; }
}

/* The glow is a dark-theme effect. On the paper theme a coloured haze behind
   the window reads as a print artefact, not phosphor. */
:root:not(.dark) .crt-glow {
  display: none;
}

@keyframes bloom {
  from { opacity: 0; }
  to { opacity: 0.16; }
}

/* No text-shadow on the type. A phosphor bloom on every accent glyph muddied
   the letterforms without adding anything the backlight does not already say —
   the ambient glow behind the glass carries the effect on its own. */

/* ---------------------------------------------------------------------------
   The typed sequence. Each line takes its delay from --d, rather than from
   nth-of-type: the order is then stated where the markup is, and inserting a
   line cannot silently reshuffle every delay after it.
--------------------------------------------------------------------------- */
.t-cmd {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  animation: type 440ms steps(24, end) var(--d) both;
}

.t-out {
  animation: print 260ms ease-out var(--d) both;
}

@keyframes type {
  from { width: 0; }
  to { width: max-content; }
}

@keyframes print {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ---------------------------------------------------------------------------
   Buttons. The hover lifts and lights rather than just changing colour, which
   is the one place the page uses motion after the opening sequence.
--------------------------------------------------------------------------- */
.btn {
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  padding: 0.625rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  transition: transform 160ms ease, border-color 160ms ease, color 160ms ease,
    box-shadow 160ms ease, background-color 160ms ease;
}
.btn:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 6px 20px -8px color-mix(in srgb, var(--accent) 70%, transparent);
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.btn-solid {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-contrast);
}
.btn-solid:hover {
  border-color: var(--accent-hover);
  background: var(--accent-hover);
  color: var(--accent-contrast);
}

/* ---------------------------------------------------------------------------
   Reduced motion: no power-on, no typing, no bloom, no lift. Everything is in
   its natural, fully visible state — which is why every animation above runs
   hidden→visible rather than the other way round. The scramble is skipped in
   the script for the same reason.
--------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .crt,
  .crt-body,
  .t-cmd,
  .t-out,
  .crt-glow {
    animation: none;
  }
  .crt-glow {
    opacity: 0.12;
  }
  .btn:hover {
    transform: none;
  }
}
</style>
