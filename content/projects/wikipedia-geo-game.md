---
title: Wikipedia Geo Game
date: 2022-06-25

description: Location based Wikipedia guessing game

cover: /img/projects/wikipedia-geo-game.png

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
  - C#

# Filters on the projects index. Lower case; matching folds case and space.
tags:
  - game
  - desktop

# Buttons on the detail page, in order. Repo, live demo, write-up, whatever.
links:
  - label: Source
    url: https://github.com/ProgrammingGoat/Wikipedia-Geo-Game
---

Guess which geotagged Wikipedia article is closest to the one shown!

A project I created during project week at my school in summer of 2022. It pulls four random Wikipedia articles with geotags from the API, then shows you one of them at the top and three at the bottom. You have to estimate which location from the options presented at the bottom is closest to the one at the top.

## Features

- Engaging gameplay testing player's geographic knowledge and deductive skills
- Streak counter with emoji emphasis for high streaks
- Streak high score (only maintained per session)
- Language settings
  - English
  - German
  - Japanese
  - French
  - Simple English
  - Alemannisch
  - Plattdüütsch
- Responsive UI
- Clickable links in postgame screen

---

Wikipedia Geo Game is not affiliated with Wikipedia.
