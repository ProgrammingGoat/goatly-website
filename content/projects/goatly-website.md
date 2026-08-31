---
title: goatly.dev
date: 2026-08-30
description: This site — a static Nuxt 4 portfolio with a terminal theme and a CV that prints itself to PDF.
cover: /img/projects/goatly-website.png
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
    url: https://github.com/ProgrammingGoat/goatly-website
---

A static site built with Nuxt 4 and Nuxt Content, deployed to Cloudflare Pages.

The landing page has a functional terminal that allows accessing all pages on
the website, can toggle the theme and has a secret easter egg.

The CV section has my information stored in a YAML file that holds every field
in English and German. The English information is rendered to the website,
while German and English can be rendered into a PDF in either language.
The PDF follows the terminal theme of the website, while using a lighter theme for
easier printing.
In addition, private fields like my address and phone number are stored in a
separate gitignored file, and can be rendered into a complete PDF using a local script.

Furthermore, the repo comes with a cover letter generator. Address, subject and body
for the letter are entered in a markdown file with frontmatter. These are laid out
to DIN 5008 formatting and generated into a PDF matching the branding using
the same pipeline as the CV generator.

This project was built using Claude Code. Every change was reviewed, tested and
adjusted by me.
