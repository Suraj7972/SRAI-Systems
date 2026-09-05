# SRAI Systems website — deploy guide

Everything in this folder is the complete site: source only, no `node_modules`,
no build output. Two steps to get it live.

---

## 1. Put it on GitHub

```bash
cd srai-systems-website
git init
git add .
git commit -m "SRAI Systems website"
git branch -M main
git remote add origin https://github.com/Suraj7972/ai-genesis-studio.git
git push -u origin main --force
```

`--force` replaces what's currently on `main`. If you'd rather keep the old code,
create a new empty repo on GitHub and use that URL instead — nothing here depends
on the previous history.

## 2. Deploy

**Vercel (recommended — `vercel.json` is already set up):**

```bash
npm install -g vercel
vercel            # answer the prompts, get a preview URL
vercel --prod     # when you're happy with it
```

Or connect the GitHub repo at vercel.com/new and it redeploys on every push.

**Netlify / Cloudflare Pages:** build command `npm run build`, publish directory
`dist`. Both need an SPA fallback rewrite. `vercel.json` covers Vercel; for
Netlify create `public/_redirects` containing:

```
/*  /index.html  200
```

> ⚠️ Without that rewrite, `/privacy` and every product page will 404 when
> someone refreshes or opens a direct link.

---

## 3. Make the contact form live — 2 minutes

Today the form validates properly but has nowhere to send mail, so it shows an
honest "not connected yet" panel rather than pretending to succeed.

1. Go to **https://web3forms.com** and enter `contact@sraisystems.in`
2. They email you an access key
3. Add it in your host's dashboard (Vercel → Project → Settings → Environment
   Variables):
   ```
   VITE_CONTACT_ACCESS_KEY = <the key they sent you>
   ```
4. Redeploy. Submissions now arrive at contact@sraisystems.in.

That's the only variable needed — the endpoint is inferred from it.

## 4. Analytics — optional, 5 minutes

Nothing is tracked until you do this. Create a PostHog project, then set
`VITE_ANALYTICS_PROVIDER=posthog` and `VITE_POSTHOG_KEY=phc_...` in the same
place. Full notes in `docs/analytics.md`.

## 5. Point the domain

Vercel → Project → Settings → Domains → add `sraisystems.in`.
**Unpublish the GoDaddy parking page first**, or it will keep winning.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # production build into dist/
npm run lint
npm test
```

## Where things live

```
src/data/srai.ts          Single source of truth: 8 products, services, roadmap
src/pages/                One file per route
src/components/demos/     The 8 interactive demos
src/components/           SiteGuide, ProductGlyph, FeatureWalkthrough, StatusBadge…
public/screens/fundos/    Real FundOS screenshots
docs/                     Contact-form and analytics setup notes
```

## Two rules for anyone editing this site

1. **Product screenshots must be real captures.** No mockups, no illustrated
   dashboards, no invented UI. The interactive demos are labelled as working
   models of a mechanic, never as the product's own interface.
2. **Every claim must be defensible.** Product status uses the fixed set in
   `ProductStatus` — LIVE, DEPLOYING, READY, PRIVATE PILOT, IN DEVELOPMENT,
   COMING SOON — and nothing vaguer. No statistics you cannot produce, no
   certifications you do not hold, no customers you cannot name.

---

## Still outstanding

- **No team page.** There is no name, photo or bio anywhere on the site. For a
  B2B buyer this is the single biggest remaining gap, and it costs one paragraph
  and one photograph.
- **Six products have no real screenshots.** Their demos cover the mechanic;
  screenshots would show the actual product. Send 6–10 per product.
- **Legal pages are unreviewed drafts.** `/privacy` and `/terms` carry a visible
  "pending legal review" banner and inline markers where a lawyer must decide —
  registered entity name, postal address, retention periods, jurisdiction.
- **SRAI Quant needs regulatory groundwork before launch.** Under SEBI's retail
  algo framework an algo provider must be empanelled with the exchanges before
  distributing through brokers, and a black-box strategy provider must register
  as a SEBI Research Analyst. Broker API access requires per-client keys, static
  IP whitelisting and 2FA, and every order needs an exchange-issued identifier.
  Worth a conversation with a securities lawyer well before launch — the product
  page describes the design honestly, but shipping it is a regulated activity.
