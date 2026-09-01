---
title: Coffee Helper
date: 2024-09-04

description: Step-by-step brewing guide for Aeropress and French Press

cover: /img/projects/coffee-helper.png

featured: true
draft: false

kind: Desktop app
role: Solo

tools:
  - Python
  - Beeware
  - pytest

tags:
  - python
  - desktop

links:
  - label: Documentation (PDF, German)
    url: /docs/coffee-helper-projektdokumentation.pdf
  - label: Source
    url: https://github.com/ProgrammingGoat/Coffee-Helper
---

## What it does

A desktop app that helps you make coffee using a French Press or Aeropress.
Each step has short instructions and an image, as well as a visual timer for relevant steps.
A calculator helps the user determine the right ratio between coffee grounds and water.
On first use, the user is asked if they own a grinder. This setting is persisted,
but can be changed in the app settings. This adjusts the instructions.

## How it works

The GUI is rendered using **Toga**, Beeware's GUI toolkit. It's based on the `toga.Box` class,
which behaves similarly to a CSS flexbox.
Recipes are stored as JSON files, so new recipes can be added without having to make changes to the code.
The timer uses unix timestamps and an asynchronous loop checking twice a second to determine how much time has passed.

## Testing and packaging

The ratio calculation is covered by unit tests using `pytest`, especially the zero-division case.
The software is packaged into an MSI installer using Briefcase, Beeware's packaging toolkit.
Packaging for other operating systems is possible, but was scoped out of this project.

## Context

This was my final project for my vocational training (Ausbildung) as an application developer (Fachinformatiker für Anwendungsentwicklung).
The scoring was based on the documentation, which received a score of 100/100.
