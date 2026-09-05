# SRAI Systems — corporate website

Marketing site for [SRAI Systems](https://sraisystems.in), an AI product studio based in Pune, India.

## Stack

Vite 5 · React 18 · TypeScript · Tailwind CSS · React Router 6 · Framer Motion

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in what you need — every value is optional
npm run dev                  # http://localhost:8080
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Configuration

All runtime configuration is via environment variables — see `.env.example`.
With none set, the site runs with analytics disabled and the contact form in its
"direct email" fallback mode. Nothing fakes success and nothing tracks silently.

- **Contact form** — set `VITE_CONTACT_ENDPOINT`. See `docs/contact-form.md`.
- **Analytics** — set `VITE_ANALYTICS_PROVIDER` plus the provider key. See `docs/analytics.md`.

## Project structure

```
src/
  data/srai.ts        Single source of truth: products, services, roadmap
  pages/              One file per route
  components/         Shared UI
  lib/                analytics.ts, contact-form.ts
public/screens/       Real product screenshots used across the site
docs/                 Setup notes for the contact form and analytics
```

## Content rules

Two rules govern what may appear on this site:

1. **Product screenshots must be real captures.** No mockups, no illustrated
   dashboards, no invented UI.
2. **Every claim must be defensible.** No certifications we do not hold, no
   metrics we cannot produce, no customers we cannot name. Product status uses
   the fixed set in `ProductStatus` — `LIVE`, `DEPLOYING`, `READY`,
   `PRIVATE PILOT`, `IN DEVELOPMENT`, `COMING SOON` — and nothing vaguer.

## Deployment

The build output in `dist/` is a static SPA. **The host must rewrite all unknown
paths to `/index.html`**, or deep links such as `/privacy` will 404 on refresh.
