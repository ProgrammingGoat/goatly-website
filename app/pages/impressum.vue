<script setup lang="ts">
import { legal } from '~/legal'

// German, on an otherwise English site: these pages address German law and
// that is the convention. Not indexed — they are duty, not content.
useSeo({ title: 'Impressum', description: 'Impressum und Anbieterkennzeichnung.' })
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="mx-auto max-w-[70ch]">
    <div class="prompt-bar mb-4 w-10" />
    <h1 class="text-3xl font-bold tracking-tight">Impressum</h1>

    <div class="prose mt-8">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {{ legal.name }}<br>
        <template v-if="legal.address">
          <span v-for="line in legal.address" :key="line">{{ line }}<br></span>
        </template>
      </p>

      <p v-if="!legal.address" class="rounded-lg border border-accent/40 bg-surface-2 p-4 text-sm">
        <strong>Hinweis:</strong> Die Anschrift ist noch nicht hinterlegt. Diese
        Seite ist unvollständig und die Domain darf bis dahin nicht öffentlich
        verlinkt werden. Siehe <code>app/legal.ts</code>.
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a :href="`mailto:${legal.email}`">{{ legal.email }}</a>
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>{{ legal.name }}</p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
        10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte
        oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
        zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Dieses Angebot enthält Links zu externen Websites Dritter, auf deren
        Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten
        ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht.
      </p>
    </div>
  </div>
</template>
