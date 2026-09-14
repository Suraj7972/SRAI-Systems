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
| `npm run build` | Client build, SSR build, then prerender every route to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest (includes `src/test/seo.test.ts`) |
| `npm run verify` | Serve `dist/` the way Vercel will and check every route over HTTP and in headless Chromium |

## Configuration

All runtime configuration is via environment variables — see `.env.example`.
With none set, the site runs with analytics disabled and the contact form in its
"direct email" fallback mode. Nothing fakes success and nothing tracks silently.

- **Contact form** — set `VITE_CONTACT_ENDPOINT`. See `docs/contact-form.md`.
- **Analytics** — set `VITE_ANALYTICS_PROVIDER` plus the provider key. See `docs/analytics.md`.

## Project structure

```
src/
  routes.tsx          THE route table. App.tsx, the prerenderer, the sitemap
                      and robots.txt all derive from this one array.
  entry-server.tsx    Server render used by the prerenderer (StaticRouter)
  data/srai.ts        Single source of truth: products, services, roadmap
  data/org.ts         Canonical company identity, used by the JSON-LD
  data/careers.ts     Roles, hiring process, the honest downsides
  lib/seo.ts          Head tags, JSON-LD, sitemap.xml and robots.txt generation
  pages/              One file per route
  components/         Shared UI
  lib/                analytics.ts, contact-form.ts, seo.ts
scripts/prerender.mjs Runs after `vite build`: one static HTML file per route
scripts/verify.mjs    Post-build checks (HTTP + headless Chromium)
public/screens/       Real product screenshots used across the site
docs/                 Setup notes for the contact form and analytics
```

## SEO architecture

The site is prerendered. `npm run build` does three things in order:

1. `vite build` — the client bundle and the `index.html` shell.
2. `vite build --ssr src/entry-server.tsx` — a Node-renderable copy of the app.
3. `node scripts/prerender.mjs` — renders every route in `src/routes.tsx` to
   `dist/<path>/index.html`, with that page's own `<title>`, description,
   `<link rel="canonical">`, `og:*`, `twitter:*` and a JSON-LD `@graph`. It also
   writes `dist/404.html`, `dist/sitemap.xml` and `dist/robots.txt`.

The prerender **fails the build** if any page renders under 400 characters of
body text, so a partial prerender can never reach production.

Adding a route is one edit to `src/routes.tsx` plus a component in the
`PAGES` map in `App.tsx` and `entry-server.tsx` (TypeScript will not compile
without both). The sitemap, robots.txt and prerenderer follow automatically.

## Content rules

Two rules govern what may appear on this site:

1. **Product screenshots must be real captures.** No mockups, no illustrated
   dashboards, no invented UI.
2. **Every claim must be defensible.** No certifications we do not hold, no
   metrics we cannot produce, no customers we cannot name. Product status uses
   the fixed set in `ProductStatus` — `LIVE`, `DEPLOYING`, `READY`,
   `PRIVATE PILOT`, `IN DEVELOPMENT`, `COMING SOON` — and nothing vaguer.

## Deployment

The build output in `dist/` is a directory of real, per-route HTML documents —
not a single-page shell. Vercel serves `dist/services/index.html` at `/services`
straight from the filesystem, and unknown paths get `dist/404.html` with a real
404 status. `vercel.json` sets `cleanUrls`, `trailingSlash: false`, cache headers
and the security headers.

> ### ⚠️ NEVER re-add an SPA catch-all rewrite. On any host.
>
> Not `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]` in
> `vercel.json`, not `/*  /index.html  200` in a Netlify `_redirects`, not the
> equivalent Cloudflare rule.
>
> A catch-all makes the host answer **every** URL with the homepage document.
> The browser then client-renders the right page, so the site looks perfect to a
> human — while every crawler sees one page repeated sixteen times. That rule,
> combined with a hardcoded canonical of `/`, is what de-indexed this site in the
> first place: each URL was explicitly telling Google it was a duplicate of the
> homepage.
>
> `src/test/seo.test.ts` fails if a `rewrites` key reappears in `vercel.json`,
> and `npm run verify` serves `dist/` with no catch-all so a regression breaks
> the build instead of the search index.

After a deploy, the single highest-value check is one line:

```bash
curl -s https://sraisystems.in/products/fundos | grep -E "<title>|canonical"
```

It must return the **FundOS** title and a canonical of `/products/fundos`. If it
returns the homepage title, a rewrite is winning and nothing else matters.
