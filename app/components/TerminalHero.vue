<script setup lang="ts">
import { site } from '~/site'

const stack = ['Vue', 'Angular', 'TypeScript', 'Python', 'Java']

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

      <!-- Goat watermark. Sits on the window rather than inside .crt-body so it
           stays put while the shell's scrollback moves under it, and so the
           body's overflow never clips it.

           Noto Emoji U+1F410, Copyright 2013 Google, Inc., Apache-2.0 —
           licenses/noto-emoji/LICENSE. Modified: the per-path colours are
           stripped so the whole shape takes one fill, making it a silhouette
           rather than the original illustration.

           The opacity is on the <svg>, not the paths, so the overlapping
           shapes composite once and read as a single flat form instead of
           darkening where they overlap.

           Hidden below lg: the terminal is narrow on a phone and the goat
           would sit on top of the name. -->
      <svg
        class="goat-mark"
        viewBox="0 0 128 128"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      ><path d="M66.67,49.49c0,0,5.07-2.25,9.57-3.1c4.5-0.84,8.17-0.7,8.17-0.7s3.94-5.77,4.5-8.87 s0.63-5.98,0.7-6.48c0.17-1.2,8.17-1.27,9.85,3.52c1.69,4.79-0.42,10.56-1.83,12.67s-2.96,3.66-2.96,3.66s6.9,6.48,8.45,13.66 s1.13,17.74,1.13,17.74s-0.42,8.02-4.36,8.59c-3.94,0.56-8.73-3.03-9.43-3.87c-0.7-0.84-2.06-3.21-4.36-2.46 c-2.6,0.84-3.27,3.84-3.8,6.48c-0.66,3.24-1.64,11.5-1.64,11.5s-4.69,1.88-7.51,1.45c-2.82-0.42-6.34-3.8-6.34-3.8 s0.28-4.22-1.13-5.07s-2.82,1.55-2.82,1.55l-5.63,6.19l-7.74-6.34c0,0-0.56-2.82-1.41-4.22c-0.84-1.41-2.53-4.5-3.1-6.62 C43.58,79.76,44,69.77,44,69.77l-8.59-41.95l2.11-1.97c0,0,1.97-10.14,5.07-14.5s5.63-5.49,7.32-6.34s6.9-1.41,6.9,0 s-2.39,3.24-3.8,5.49s-2.96,5.49-3.8,8.31S47.43,25,47.43,25l3.05,0.7c0,0,1.69-4.08,3.24-6.19c1.55-2.11,3.73-5,6.41-7.04 c2.27-1.73,5.42-3.52,8.94-3.52c3.52,0,8.17,0.99,7.74,3.59c-0.23,1.42-2.89,0.77-5.56,2.53c-3.25,2.14-6.76,5.7-9.36,11.68 s-3.52,8.59-3.52,8.59s6.83,6.41,7.53,8.59S66.67,49.49,66.67,49.49z" /><path d="M35.7,70.14c0,0,5.73,3.62,8.26,3.75c3.89,0.21,9.62-2.09,13.21-6.03s6.55-9.68,6.03-16.68 c-0.45-6.03-2.51-8.24-2.51-8.24s3.59,3.52,8.8,3.1c5.21-0.42,9.43-3.59,11.05-6.76c1.28-2.5,2.46-5.56,1.69-6.12 c-0.77-0.56-3.36,0-3.36,0l-9.81,4.43l-16.82,1.13l-17.6,25.13L35.7,70.14z" /><path d="M22.18,30.16c-0.7,0.48,0.35,3.66,2.82,5.56s5.98,2.46,5.98,2.46l5.21-7.11 C36.19,31.07,23.52,29.24,22.18,30.16z" /><path d="M66.76,97.97c0,0,2.86,2.63,6.87,2.28c4.01-0.35,7.63-2.93,7.63-2.93s-0.8,8.21-0.87,9.76 c-0.07,1.55-0.21,6.1-0.21,6.1s-5.07,5.44-7.81,4.95c-2.75-0.49-6.57-5.3-6.5-6.22c0.07-0.92,0.66-5.04,0.8-7.16 C66.81,102.64,66.76,97.97,66.76,97.97z" /><path d="M56.32,96.72c4.29-0.3,7.53-1.95,7.53-1.95s0.23,6.01,0.14,7.6c-0.16,2.78-0.38,6.1-0.66,6.95 c-0.28,0.84-9.41,2.04-9.41,2.04s-4.43-3.94-4.43-4.15c0-0.21,0.23-3.21,0.33-5.44c0.07-1.62-0.42-6.66-0.42-6.66 S52.24,97.01,56.32,96.72z" /><path d="M90.04,85.77c0,0,3.03,0.33,5.07,0.12c2.04-0.21,6.26-1.76,7.32-2.46c1.06-0.7,1.83-1.83,1.83-1.83 s-0.42,8.73-0.35,10.42c0.07,1.69,0.07,5.7,0.07,5.7s-3.31,5.35-6.83,5.7c-3.52,0.35-7.11-6.15-7.11-6.15s0.52-3.43,0.52-5.54 C90.55,89.62,90.04,85.77,90.04,85.77z" /><path d="M72.25,114.39c3.72,0.33,8-1.69,8-1.69s0.35,6.41-0.63,8.26c-0.84,1.6-3.43,3.33-9.78,2.3 c-4.12-0.67-4.62-3.11-4.86-4.65c-0.23-1.55,0.84-6.9,0.84-6.9S67.54,113.97,72.25,114.39z" /><path d="M97.08,99.38c2.96-0.1,6.9-1.67,6.9-1.67s0.21,6.26-2.18,8.45c-2.75,2.51-9.27,1.74-11.1-0.31 c-1.83-2.04-0.66-8.78-0.66-8.78S93.06,99.52,97.08,99.38z" /><path d="M55.97,108.69c3.46,0.14,7.65-1.1,7.65-1.1s0.52,7.56-3,8.87c-3.74,1.4-8.63,1.08-10.56-1.36 c-1.39-1.76-0.63-8.17-0.63-8.17S52.38,108.55,55.97,108.69z" /><path d="M39.71,32.88c0.69,0.41,2.11-3.87,11.19-3.8c10,0.07,15.27,4.93,16.05,5c0.77,0.07,6.12,0,7.81-0.14 c1.69-0.14,4.65-1.48,4.58-0.49s-1.2,6.41-6.19,7.81c-5,1.41-13.44-1.62-15.06-1.76c-1.62-0.14-3.03,0-2.89,2.46 c0.14,2.46-18.37,13.59-18.37,13.59s-13.54-6.31-13.75-7.09c-0.21-0.77,1.31-2.82,2.56-4.74c1.58-2.44,2.39-5.14,3.24-6.55 c0.84-1.41,2.18-3.24,2.18-3.24s-2.63,0.21-4.36-0.54c-1.19-0.51-4.15-2.49-4.29-3.19s3.31,0.07,6.12-0.21 c2.82-0.28,8.09-3.24,8.09-3.24s1.76,1.41,2.25,2.75C39.36,30.84,39.36,32.67,39.71,32.88z" /><path d="M27.53,66.18c0,0-0.81,3.1-0.33,6.48c0.38,2.65,2.37,5.21,2.72,6.12s0.99,3.03,0.92,3.73 c-0.07,0.7,0.89,0.87,1.1,0.35c0.26-0.63-0.02-1.51,0.7-1.34c0.8,0.19,0,1.74,1.03,1.78c1.08,0.05,0.35-1.41,1.13-1.41 c0.82,0,0.09,1.67,1.27,1.64c1.08-0.02,0.07-1.48,1.1-1.45c0.84,0.02,0.14,1.55,1.31,1.38c0.66-0.09-0.11-1.66,0.75-1.85 c0.75-0.16,0.35,1.41,1.22,1.08c0.56-0.21,0.75-1.67,0.54-3.36c-0.21-1.69-0.84-4.08-1.2-6.01c-0.35-1.92-0.75-3.97-0.77-5.8 s-0.05-3.97-0.05-3.97L27.53,66.18z" /><path d="M40.44,50.01c0.55,0.05,2.63-2.25,3.57-3.89s3.43-5.26,7.09-5.68c3.76-0.43,5.96,1.55,6.85,4.65 c0.82,2.86,0.05,6.15-3.71,7.93c-3.62,1.72-5.02,1.03-8.07,1.92c-1.62,0.47-4.13,1.88-4.27,2.06c-0.14,0.19,0.83,6.93-4.5,9.85 c-4.46,2.44-11.31,1.5-14.83-2.91c-3.86-4.84-3.14-12.11-0.28-15.63c2.83-3.48,6.24-4.75,11.26-3.28 C39.17,46.68,39.92,49.96,40.44,50.01z" /><path d="M55.22,47.57c0,2.06-1.31,3.94-3.89,3.99c-2.21,0.04-3.07-1.79-3.14-3.85 c-0.09-2.63,1.79-3.95,3.66-3.99C54.28,43.67,55.22,45.51,55.22,47.57z" /><path d="M25.42,52.77c0,0,3.66-2.01,4.12-2.25s1.65-0.67,2.29,0.32c0.63,0.99-0.39,1.87-1.2,2.22 c-0.81,0.35-4.22,2.43-4.22,2.43s-0.39,2.57-0.04,2.85c0.94,0.75,2.36,1.16,3.52,1.06c1.16-0.11,2.08-0.6,2.43-0.67 c0.35-0.07,1.34-0.11,1.55,0.6c0.21,0.7-0.29,1.52-1.16,1.94c-1.04,0.49-2.08,1.01-3.84,0.7c-1.37-0.24-2.46-0.56-3.1-0.99 c-0.63-0.42-1.3-1.2-1.3-1.2s-0.95,1.16-1.83,1.13c-0.88-0.04-2.01-0.6-2.04-0.7c-0.04-0.11-1.2-1.02-0.67-2.01 c0.53-0.99,1.72,0.35,2.46,0.46c0.74,0.11,1.2-0.39,1.27-0.63c0.07-0.25,0.04-2.99,0.04-2.99s-1.58-2.04-1.94-2.39 c-0.35-0.35-1.27-1.51-0.32-2.22s1.58,0,1.83,0.21S25.42,52.77,25.42,52.77z" /></svg>

      <!-- Scrolls inside its own box: a long stack line must never make the
           page scroll sideways on a narrow phone. -->
      <div class="crt-body relative z-10 max-h-[60vh] overflow-auto px-5 py-7 font-mono text-sm leading-relaxed sm:px-8 sm:py-10 sm:text-base">
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
   unrolls vertically, then the brightness decays. Pure CSS on purpose: the page is
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

.goat-mark {
  position: absolute;
  top: 3.75rem;
  right: 1.75rem;
  z-index: 0;
  display: none;
  width: 9.5rem;
  height: auto;
  pointer-events: none;
  color: var(--text);
  opacity: 0.18;
}

@media (min-width: 1024px) {
  .goat-mark {
    display: block;
  }
}

/* Higher on paper, and a muted grey rather than the near-black body colour:
   --text on white at this opacity reads as a hard shadow, where --muted stays
   a soft form. Still higher than the dark value, because a light shape on
   white starts closer to its background than on near-black. */
:root:not(.dark) .goat-mark {
  color: var(--muted);
  opacity: 0.25;
}

/* No text-shadow on the type: a phosphor bloom on every accent glyph muddied
   the letterforms. There is no ambient glow behind the glass either — see
   CLAUDE.md; both versions of one read as a shape stuck onto the page rather
   than as light. The window's depth is its border and its drop shadow, and on
   the lifted ground that is enough. */

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
   Reduced motion: no power-on, no typing, no lift. Everything is in
   its natural, fully visible state — which is why every animation above runs
   hidden→visible rather than the other way round. The scramble is skipped in
   the script for the same reason.
--------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .crt,
  .crt-body,
  .t-cmd,
  .t-out {
    animation: none;
  }
  .btn:hover {
    transform: none;
  }
}
</style>
