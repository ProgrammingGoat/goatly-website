---
title: Ultimate Tic Tac Toe
date: 2024-07-08

description: Tic-Tac-Toe within Tic-Tac-Toe
cover: /img/projects/ultimate-tic-tac-toe.png

# Where a cropped cover keeps its subject. The card fills a fixed 16/9 slot, so
# a cover that is not that shape gets cropped from the centre by default.
# Takes CSS keywords in either order ("top", "left bottom") or percentages
# ("50% 25%") when a keyword is not precise enough. Delete it to stay centred.
# focus: top

featured: true              # promote to the landing page
draft: false                # true keeps it out of the site, the feed and the sitemap

kind: Game               # "Web app", "CLI", "Library", "Tooling" — free text
role: Solo                  # "Solo", "Team of 4", "Work project"

# What it took. Rendered as chips on the card and the detail page.
tools:
  - Python
  - Beeware

# Filters on the projects index. Lower case; matching folds case and space.
tags:
  - game
  - python
  - desktop
  - cross-platform

# Buttons on the detail page, in order. Repo, live demo, write-up, whatever.
links:
  - label: Source
    url: https://github.com/ProgrammingGoat/Ultimate-Tic-Tac-Toe
---

A [variant of Tic-Tac-Toe](https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe) where you play on 9 Tic-Tac-Toe grids at the same time.
Whoever wins three small Tic-Tac-Toe grids in a row wins the large Tic-Tac-Toe grid.
Each move on the small grid determines where the next move on the large grid can be made.

Built using [Beeware](https://beeware.org/), a toolkit for building cross-platform apps in Python.
This natively compiles for Windows, Linux, Mac or Android.