<script setup lang="ts">
import { legal } from '~/legal'

// Required regardless of whether an Impressum is: any website processes IP
// addresses, and that is personal data under the GDPR.
useSeo({ title: 'Datenschutzerklärung', description: 'Informationen zur Verarbeitung personenbezogener Daten.' })
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="mx-auto max-w-[70ch]">
    <div class="prompt-bar mb-4 w-10" />
    <h1 class="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>

    <div class="prose mt-8">
      <h2>Verantwortlicher</h2>
      <p>
        {{ legal.name }}<br>
        <template v-if="legal.address">
          <span v-for="line in legal.address" :key="line">{{ line }}<br></span>
        </template>
        E-Mail: <a :href="`mailto:${legal.email}`">{{ legal.email }}</a>
      </p>

      <h2>Hosting</h2>
      <p>
        Diese Website wird als statische Seite bei Cloudflare Pages gehostet
        (Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA). Beim
        Aufruf der Seite verarbeitet Cloudflare technisch notwendige Daten,
        insbesondere die IP-Adresse, Datum und Uhrzeit des Zugriffs, die
        aufgerufene Seite sowie Browser- und Betriebssysteminformationen.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO — das berechtigte
        Interesse an einer sicheren und zuverlässigen Bereitstellung.
      </p>

      <h2>Keine Cookies, kein Tracking</h2>
      <p>
        Diese Website setzt keine Cookies, bindet keine Analyse- oder
        Tracking-Dienste ein und lädt keine Ressourcen von Drittanbietern.
        Schriftarten werden lokal ausgeliefert, es findet also keine Verbindung
        zu externen Servern statt. Die Einstellung für das Farbschema wird
        ausschließlich lokal im Browser (<code>localStorage</code>) gespeichert
        und nicht übertragen.
      </p>

      <h2>Kontaktaufnahme per E-Mail</h2>
      <p>
        Wenn Sie mich per E-Mail kontaktieren, verarbeite ich Ihre Angaben
        ausschließlich zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO. Die Daten werden gelöscht,
        sobald sie für den Zweck nicht mehr erforderlich sind.
      </p>

      <h2>Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
        (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) sowie ein Widerspruchsrecht (Art. 21).
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde
        beschweren (Art. 77 DSGVO).
      </p>

      <p class="text-sm text-muted">Stand: {{ formatDate(legal.updated) }}</p>
    </div>
  </div>
</template>
