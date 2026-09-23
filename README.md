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
| `npm run build` | Client build, SSR build, prerender every route to `dist/`, then verify it |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest (includes `src/test/seo.test.ts`) |
| `npm run verify` | Serve `dist/` the way Vercel will and check every route over HTTP and in headless Chromium |
| `npm run verify:fast` | The same checks without the browser pass |

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
  data/answers.ts     The answer block for each page, and the site-level FAQ
  lib/seo.ts          Head tags, sitemap.xml, robots.txt and llms.txt generation
  lib/jsonld.ts       The JSON-LD @graph: one entity, referenced by every page
  pages/              One file per route
  components/         Shared UI
  lib/                analytics.ts, contact-form.ts, seo.ts
scripts/prerender.mjs Runs after `vite build`: one static HTML file per route
scripts/verify.mjs    Post-build checks (HTTP + headless Chromium)
public/screens/       Real product screenshots used across the site
docs/                 Setup notes for the contact form and analytics
```

## SEO architecture

The site is prerendered. `npm run build` does four things in order:

1. `vite build` — the client bundle and the `index.html` shell.
2. `vite build --ssr src/entry-server.tsx` — a Node-renderable copy of the app.
3. `node scripts/prerender.mjs` — renders every route in `src/routes.tsx` to
   `dist/<path>/index.html`, with that page's own `<title>`, description,
   `<link rel="canonical">`, `og:*`, `twitter:*` and a JSON-LD `@graph`. It also
   writes `dist/404.html`, `dist/sitemap.xml`, `dist/robots.txt` and
   `dist/llms.txt`.
4. `node scripts/verify.mjs` — serves `dist/` the way Vercel will, with **no
   catch-all**, and asserts every rule below against the bytes a crawler gets.

Steps 3 and 4 both **fail the build**. A page under 400 characters of body
text, a missing or duplicated canonical, a duplicate title, a JSON-LD block that
does not parse, a dangling `@id`, an empty `sameAs`, a `Review` / `AggregateRating`
/ `offers` / `JobPosting`, or an answer heading buried past the first 1500
characters — any of these stops the build rather than reaching the index. The
headless-browser half of step 4 is skipped with a notice where no browser is
available (a hosting build image), so a missing binary can never fail a deploy
and can never silently pass as though it ran.

Adding a route is one edit to `src/routes.tsx` plus a component in the
`PAGES` map in `App.tsx` and `entry-server.tsx` (TypeScript will not compile
without both) and an entry in `src/data/answers.ts`. The sitemap, robots.txt,
llms.txt and prerenderer follow automatically.

### The entity layer

Every page emits one `@graph` containing an `Organization` at
`https://sraisystems.in/#organization` and a `WebSite` at `.../#website`. Every
other node references those `@id`s rather than repeating the company. That is
what makes eighteen pages one resolvable entity instead of eighteen unrelated
blobs — and it is the mechanism that distinguishes SRAI Systems from the
similarly-named companies it currently gets confused with.

`src/data/org.ts` is the only place company facts live. Its `prune()` serializer
drops every `undefined` value and empty array before the graph is written, so
`"sameAs": []` and a half-empty `founder` can never be emitted. `ORG.sameAs` and
`ORG.founder` are deliberately empty — see the comments there before filling
either.

### Answer blocks

Every page opens its main content with an `<h2>` phrased as a question and one
40–70 word paragraph answering it. Those paragraphs live in
`src/data/answers.ts` (and on the product, in `src/data/srai.ts`) and are
written to survive being copy-pasted away from this site: each opens with the
proper noun, never "we" or "our platform", and no sentence depends on the
heading above it. Generative engines lift self-contained passages and drop
context-dependent ones — this is the highest-leverage content on the site, and
the tests enforce the length, the phrasing and the opening word.

The FAQ blocks and the JSON-LD `FAQPage` are built from the same array, so the
markup and the visible words cannot drift.

### llms.txt

Generated, unadvertised, untuned. No major AI provider has committed to reading
it, Google has advised against relying on it, and there is no evidence of
crawlers fetching it. It exists because the sitemap generator already walks the
route table, so it costs nothing. Do not link it from navigation and do not
treat it as a feature.

## Content rules

Two rules govern what may appear on this site:

1. **Product screenshots must be real captures.** No mockups, no illustrated
   dashboards, no invented UI.
2. **Every claim must be defensible.** No certifications we do not hold, no
   metrics we cannot produce, no customers we cannot name. Product status uses
   the fixed set in `ProductStatus` — `LIVE`, `DEPLOYING`, `READY`,
   `PRIVATE PILOT`, `IN DEVELOPMENT`, `COMING SOON` — and nothing vaguer.
3. **A claim with no evidence renders nothing.** `<Evidence>` returns `null`
   when its `source` is missing, so deleting the evidence deletes the claim
   rather than leaving an unsourced assertion behind. Same rule in the data:
   `replaces` and `runsOn` are absent on the products where `src/data/srai.ts`
   does not establish them, and the facts row is omitted rather than filled
   with "TBD".
4. **Structured data must match visible content.** Never emit `Review`,
   `AggregateRating` or `offers` — there are no reviews and no published price.
   Never emit a `JobPosting` while `openRoles` is empty. `npm run build` fails
   on all four.

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
> and `scripts/verify.mjs` — which now runs as part of `npm run build` — serves
> `dist/` with no catch-all, so a regression breaks the build instead of the
> search index.

After a deploy, the single highest-value check is one line:

```bash
curl -s https://sraisystems.in/products/fundos | grep -E "<title>|canonical"
```

It must return the **FundOS** title and a canonical of `/products/fundos`. If it
returns the homepage title, a rewrite is winning and nothing else matters.
