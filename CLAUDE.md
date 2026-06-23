# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is the **afrIAgenesis®** monorepo root ("structure mère"), intended to host multiple independent sub-projects under a `Dynamics/` directory. Each sub-project is a self-contained static site — there is no shared build system, package manager, or test runner at the repo root.

The repo is deployed as-is to **GitHub Pages** via `.github/workflows/static.yml`: every push to `main` uploads the *entire repository* (`path: '.'`) as the Pages artifact. This means any HTML file anywhere in the repo is directly servable at its path — there is no bundling, transpilation, or build step.

## Commands

There is no `package.json`, build tool, linter, or test suite anywhere in this repo. There is nothing to install or compile.

To preview a sub-project locally, serve the repo root over HTTP (relative asset paths assume the server root is the repo root) and open the relevant `index.html`, e.g.:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/Dynamics/pispi-readiness/frontend/index.html
```

There is no CI beyond the Pages deploy workflow — no lint/test step runs on push.

## Architecture

### Layout convention

- `assets/` at the repo root holds brand assets (e.g. `assets/images/logo.jpg`) shared across all sub-projects. Sub-project pages reference these via relative paths (e.g. `Dynamics/pispi-readiness/frontend/index.html` links to `../../../assets/images/logo.jpg`). When adding a new sub-project page, count directory depth carefully to keep this relative path correct — there is no asset pipeline to catch broken paths.
- `Dynamics/<project-name>/frontend/` is the convention for a sub-project's static site, with `scripts/` and `styles/` subfolders. Follow this layout for any new sub-project rather than inventing a different structure.

### pispi-readiness (current sub-project)

A plain HTML/CSS/JS (no framework) diagnostic landing page for the **PI-SPI Readiness Platform**, a BCEAO/UEMOA instant-payment interoperability compliance tool. All UI copy is in French (`lang="fr"`).

- `frontend/index.html` — single landing page with: a live countdown to the BCEAO deadline (`2026-06-30T00:00:00Z`), adoption stats, and two CTA cards linking to `assessment.html?type=participant` (Parcours A — banks/EME/EP) and `assessment.html?type=business` (Parcours B — Business API). **`assessment.html` does not exist yet** — these links are currently dead; creating that page is the natural next step for this sub-project.
- `frontend/scripts/date-time.js` — pure helper functions (`getDate`, `getDay`, `getHour`, `getMin`, `getSec`, `getTimeLeft`) using French month/day name tables (`MONTHS_FR`, `DAYS_FR`). `getTimeLeft(target)` computes a `{ d, h, m, s, expired }` breakdown and is the basis for the countdown.
- `frontend/scripts/index.js` — wires `getTimeLeft` into the DOM via `tick(deadline, containers)`, polling every second with `setInterval` and writing zero-padded values into `#days/#hours/#minutes/#seconds`. The deadline string here must stay in sync with the date shown in `index.html`'s `.deadline-note`.
- `frontend/styles/root.css` — global reset and CSS custom properties (design tokens: `--bg`, `--gold`, `--text`, etc.) used across all pages in this sub-project.
- `frontend/styles/index.css` — page-specific styles for `index.html` (countdown, stat cards, CTA cards, progress bar).
- External dependencies are CDN-only: Google Fonts (Poppins) and Font Awesome 6.5.0 — no local copies, no bundler.

When adding new pages to this sub-project (e.g. the missing `assessment.html`), follow the existing pattern: link `styles/root.css` then a page-specific stylesheet, keep copy in French, and reuse the date-time helpers rather than duplicating date logic.
