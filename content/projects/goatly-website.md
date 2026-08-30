---
title: goatly.dev
date: 2026-08-30
description: This site — a static Nuxt 4 portfolio with a terminal theme and a CV that prints itself to PDF.
kind: Web app
role: Solo
featured: true
tools:
  - Nuxt 4
  - Vue
  - TypeScript
  - Tailwind CSS
tags:
  - web
  - typescript
links:
  - label: Source
    url: https://github.com/ProgrammingGoat
---

<!-- TODO(copy): rewrite this in your own voice before launch. -->

A static site built with Nuxt 4 and Nuxt Content, deployed to Cloudflare Pages.

The interesting part is the CV: one YAML source holds every field in both
English and German, the website renders the English version, and a Playwright
script prints an A4 PDF in either language. Private details live in a separate
gitignored file that Nuxt never reads, so the published site and the repository
carry only what is meant to be public.
