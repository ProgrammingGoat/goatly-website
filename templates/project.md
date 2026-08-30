---
# Copy this file to add a project:
#   cp templates/project.md content/projects/my-thing.md
#
# The filename becomes the URL: content/projects/my-thing.md → /projects/my-thing
# Templates live here rather than under /content so they are never published
# and survive /content being emptied.

title: My Thing
date: 2026-08-30            # ISO 8601, always a full date — it sorts the list

description: One sentence. Shown on the card and used as the meta description.

# ---------------------------------------------------------------------------
# Cover image (optional)
#
#   1. Put the file in public/img/projects/ — e.g. public/img/projects/my-thing.png
#   2. Point at it from /public's root, with the leading slash, as below.
#
# COMMIT THE IMAGE WITH THE ENTRY. nitro.prerender.failOnError is on, so a
# cover pointing at a missing file fails the build rather than shipping a
# broken image — which is deliberate, but it does mean the two go together.
#
# Landscape suits the card slot (16/9). Make it at least 1200px wide: the
# social card crops 1200x630 out of it, and cards ask for up to 640px at 2x.
# Somewhere around 1600-2000px wide is plenty; bigger only costs build time,
# since every variant is encoded to AVIF and WebP at build.
#
# Without a cover the card shows a gradient with the project's path on it.
cover: /img/projects/my-thing.png

# Where a cropped cover keeps its subject. The card fills a fixed 16/9 slot, so
# a cover that is not that shape gets cropped from the centre by default.
# Takes CSS keywords in either order ("top", "left bottom") or percentages
# ("50% 25%") when a keyword is not precise enough. Delete it to stay centred.
# focus: top

featured: true              # promote to the landing page
draft: false                # true keeps it out of the site, the feed and the sitemap

kind: Web app               # "Web app", "CLI", "Library", "Tooling" — free text
role: Solo                  # "Solo", "Team of 4", "Work project"

# What it took. Rendered as chips on the card and the detail page.
tools:
  - TypeScript

# Filters on the projects index. Lower case; matching folds case and space.
tags:
  - web

# Buttons on the detail page, in order. Repo, live demo, write-up, whatever.
links:
  - label: Source
    url: https://github.com/ProgrammingGoat/my-thing
---

The body is markdown and becomes the detail page. Lead with what the thing does
and why it was worth building; a recruiter reads the first sentence and a
developer reads the rest.
