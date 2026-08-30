<script setup lang="ts">
import { site } from '~/site'

// TODO(copy): the stack line — the four things you most want to be hired for.
const stack = ['Java', 'Spring', 'Vue', 'TypeScript']
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
    <!-- The window is chrome around real content: the title bar and the prompt
         lines are aria-hidden, the h1 and the stack are not. -->
    <div class="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/20">
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
      <div class="relative overflow-x-auto px-5 py-7 font-mono text-sm leading-relaxed sm:px-8 sm:py-10 sm:text-base">
        <p class="t-cmd" aria-hidden="true">
          <span class="text-accent-2">$</span> whoami
        </p>

        <div class="t-out mb-6 mt-3">
          <h1 class="text-2xl font-bold tracking-tight text-text sm:text-4xl">
            {{ site.name }}
          </h1>
          <p class="mt-1 text-base text-accent sm:text-xl">
            {{ site.role }}
          </p>
          <p class="mt-2 max-w-prose font-sans text-sm text-muted sm:text-base">
            {{ site.home.lead }}
          </p>
        </div>

        <p class="t-cmd" aria-hidden="true">
          <span class="text-accent-2">$</span> cat stack.txt
        </p>
        <p class="t-out mt-2 text-muted">
          <span v-for="(item, i) in stack" :key="item">
            <span v-if="i" class="text-border"> · </span>{{ item }}
          </span>
        </p>

        <p class="t-cmd mt-6" aria-hidden="true">
          <span class="text-accent-2">$</span> <span class="prompt-cursor align-middle" />
        </p>
      </div>
    </div>

    <nav class="mt-8 flex flex-wrap gap-3" aria-label="Sections">
      <NuxtLink
        to="/projects"
        class="rounded-lg border border-accent bg-accent px-4 py-2.5 font-mono text-sm font-medium text-accent-contrast transition hover:border-accent-hover hover:bg-accent-hover"
      >
        projects
      </NuxtLink>
      <NuxtLink
        to="/cv"
        class="rounded-lg border border-border px-4 py-2.5 font-mono text-sm font-medium text-text transition hover:border-accent hover:text-accent"
      >
        cv
      </NuxtLink>
      <NuxtLink
        to="/about"
        class="rounded-lg border border-border px-4 py-2.5 font-mono text-sm font-medium text-text transition hover:border-accent hover:text-accent"
      >
        about
      </NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
/* Pure CSS, no JS: the text is always in the DOM, so it survives JS being off
   and never has to be hidden from the accessibility tree to be animated.
   `both` holds the from-state through the delay; without it every line would
   flash fully visible for a frame before starting. */
.t-cmd {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  animation: type 0.5s steps(24, end) both;
}

.t-out {
  animation: print 0.25s ease-out both;
}

/* Command, output, command, output, cursor — each waiting on the last. */
.t-cmd:nth-of-type(1) { animation-delay: 0.15s; }
.t-out:nth-of-type(1) { animation-delay: 0.65s; }
.t-cmd:nth-of-type(2) { animation-delay: 0.95s; }
.t-out:nth-of-type(2) { animation-delay: 1.45s; }
.t-cmd:nth-of-type(3) { animation-delay: 1.7s; }

@keyframes type {
  from { width: 0; }
  to { width: max-content; }
}

@keyframes print {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: none; }
}

/* Reduced motion: no animation at all, which leaves every line in its natural
   (fully visible) state — the reason the animation runs hidden→visible rather
   than the other way round. */
@media (prefers-reduced-motion: reduce) {
  .t-cmd,
  .t-out {
    animation: none;
  }
}
</style>
