# Classic v2 Demo (May 2018)

This folder preserves the **original Ghost on GitHub Pages demo** published with [Classic v2.0.1](https://github.com/paladini/ghost-on-github-pages/releases/tag/v2.0.1).

## What is this?

A frozen snapshot of the blog as it looked in 2018, generated with:

- **Ghost 1.22.5** (full CMS source was committed to the repo)
- **buster** (Python 2 static site generator)

## Known issues (intentionally preserved)

These problems motivated the v3 rewrite. They are **left unfixed** so you can compare the old and new workflows side by side.

| Issue | Example |
|-------|---------|
| Links point to localhost | `http://localhost:2373/` in canonical, Open Graph, and tag URLs |
| Broken sitemap URL | `robots.txt` references `http://localhost:2373/sitemap.xml` |
| Hotlinked assets | Images served from `casper.ghost.org` |

See [issue #22](https://github.com/paladini/ghost-on-github-pages/issues/22) for the localhost link problem.

## View the archive

Open the live archive at:

**https://paladini.github.io/ghost-on-github-pages-demo/legacy/v2/static/**

## Current demo

The main demo now runs on [version 3](https://github.com/paladini/ghost-on-github-pages/releases/latest) with **gssg** instead of buster. Visit the root URL to see the updated site.
