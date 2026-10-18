# Expense Tracker — Implementation Plan

## Product scope

Build a desktop-first Expense Tracker dashboard for recording expenses, organizing categories, setting monthly category budgets, analyzing spending, and reviewing monthly reports. The interface should make data analysis, validation, and reporting visible in the product rather than hiding them behind a generic CRUD form.

The requested production stack is Java, Spring Boot, and MySQL. The current deliverable is a fully interactive Preview-ready front end with a small Node static preview server; the UI is organized around the corresponding Spring Boot/MySQL domain model and API seams so the backend can be attached without changing the experience.

## Design exploration

- Ledger Noir — 0.07: a dark editorial finance dashboard with crisp tables and fine green data lines.
- Paper Budget — 0.04: a warm, tactile household-ledger interface with paper tones and strong numeric hierarchy.
- Signal Grid — 0.08: a high-contrast analytical console with geometric panels and vivid exception states.

### Chosen direction: Ledger Noir

- **Design Movement:** contemporary editorial fintech, closer to a printed market brief than a consumer banking app.
- **Core Principles:** high information density without visual noise; every number has context; restrained accent colors carry status; actions stay close to the data they affect.
- **Color Philosophy:** deep ink surfaces create focus, off-white text preserves long-session legibility, and a signature acid green marks healthy progress. Amber and red are reserved for budget attention and exception states.
- **Layout Paradigm:** a fixed left rail anchors navigation while the content area uses an asymmetric analysis canvas: summary numbers up top, a wide trend narrative on the left, and a narrow budget-health rail on the right.
- **Signature Elements:** the green “signal line” motif in charts; compact uppercase labels with generous tracking; rounded data capsules for status and filters.
- **Interaction Philosophy:** editing should feel immediate and safe. Forms validate in place, totals update optimistically, filters stay visible, and every mutation returns a clear confirmation message.
- **Animation:** use short ease-out transitions for tabs, modal entry, progress bars, and toast feedback. Avoid decorative motion; motion only explains state change.
- **Typography System:** IBM Plex Sans for all UI text, with 11px tracked uppercase labels, 14–16px body copy, and large tabular-looking figures for financial totals.
- **Brand Essence:** a calm monthly control room for people who want to understand their money, not merely log it. Personality: precise, composed, accountable.
- **Brand Voice:** headlines state the decision in plain language; CTAs are direct and specific. Example lines: “Here’s where October went.” “Log the expense while it’s fresh.”
- **Wordmark & Logo:** an “ET” monogram made from a ledger bracket and a rising signal tick, used as the compact mark beside the Expense Tracker wordmark.
- **Signature Brand Color:** Signal Green `#22C55E` — reserved for healthy budget progress, positive change, and primary action emphasis.

## Implementation approach

- `public/index.html` owns the semantic application shell, sidebar navigation, dashboard sections, modal, and toast region.
- `public/styles.css` defines the Ledger Noir visual system, responsive breakpoints, chart styling, modal states, validation feedback, and accessible focus states.
- `public/app.js` owns demo state, derived metrics, SVG chart rendering, filtering, category/budget views, modal validation, and local persistence through `localStorage` so the Preview is useful without a database.
- `server.mjs` serves the static Preview on port 3000 and exposes a minimal unauthenticated `/api/health` endpoint. A future Spring Boot service can replace the static preview server without changing the page contract.
- `backend/` documents the Spring Boot/MySQL domain seam: expense, category, and budget records; validation rules; and the monthly-report aggregation boundary.
- `public/manus-routes.json` declares the complete current page route set for Preview and publication tooling.

## Domain model and API seam

The UI models `Expense`, `Category`, and `Budget` records. Amounts are positive decimal values; dates are ISO dates; category is required; descriptions are required and capped at 120 characters. Monthly summaries aggregate expense totals by month and category, then compare them to category budgets. Suggested Spring endpoints are `GET/POST /api/expenses`, `GET/POST /api/categories`, `GET/PUT /api/budgets`, and `GET /api/reports/monthly`.

## Project structure

```text
expensetr/
├── app.config.ts
├── plan.md
├── TODO.md
├── package.json
├── server.mjs
├── backend/
│   ├── README.md
│   └── schema.sql
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── manus-routes.json
```

## Delivery assumptions

This milestone prioritizes a polished, working Preview with realistic seeded data and local interaction. No credentials, external API keys, or user login are required. The managed database capability is enabled for the project so the backend seam can be connected later; the Preview itself does not write to shared managed data.
