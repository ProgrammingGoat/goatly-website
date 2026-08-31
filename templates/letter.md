---
# Anschreiben. Copy this into your applications repo — NOT into this one:
#
#   cp templates/letter.md ../applications/2026-09-acme-backend.md
#   npm run letter -- ../applications/2026-09-acme-backend.md
#
# The PDF lands beside the source, so one folder is one application.
# Paths are resolved from the repo root, not from your shell.

lang: de # de | en. The DIN 5008 layout is used either way.
date: 2026-09-15 # ISO YYYY-MM-DD. Printed as "15. September 2026".
place: Heidelberg # Optional, prefixes the date.

recipient:
  company: Beispiel GmbH
  name: Frau Musterfrau # Optional. Drop it and the salutation falls back.
  street: Musterstraße 1
  postcode: '69117'
  city: Heidelberg
  # country: Deutschland   # Only for post going abroad.

subject: Bewerbung als Full-Stack-Entwickler
# reference: Stellen-ID 2026-0042   # An ad's reference number, if it has one.

# Optional. Derived from recipient.name when absent, so set it when the guess
# would be wrong — a name the Herr/Frau pattern does not fit, or a title.
# salutation: Sehr geehrte Frau Dr. Musterfrau,

# Optional. Defaults to "Freundliche Grüße" / "Yours sincerely".
# closing: Mit freundlichen Grüßen

enclosures:
  - Lebenslauf
  - Zeugnisse
---

Der Body ist Markdown, aber nur ein kleiner Teil davon: Absätze, Aufzählungen,
**fett** und *kursiv*. Mehr braucht ein Anschreiben nicht — alles darüber
hinaus ist ein Zeichen dafür, dass es kein Brief mehr ist.

Ein Absatz wird durch eine Leerzeile getrennt. Zeilenumbrüche innerhalb eines
Absatzes werden zusammengefügt, sodass die Quelldatei umbrochen werden kann,
ohne den Satz zu beeinflussen.

- Aufzählungen funktionieren, sparsam eingesetzt
- Jede Zeile beginnt mit einem Bindestrich

Der Brief passt auf eine Seite. Das Skript zählt die Seiten und warnt, wenn es
zwei werden — ein zweiseitiges Anschreiben liest sich als jemand, der die
Konvention nicht kennt.
