# Analytics — decision, setup, and event dictionary

## Decision: PostHog is the default recommendation

Both adapters are implemented behind one interface (`src/lib/analytics.ts`), so
switching is a single environment variable. The recommendation is PostHog for
this specific site:

| | PostHog | GA4 |
|---|---|---|
| Useful data on an SPA out of the box | Autocapture + custom events | Almost nothing beyond pageviews; every question below needs a custom event anyway |
| Funnels (`product_card_click → contact_form_submitted`) | Built in, no setup | Requires GA4 explorations, and the free tier samples |
| Session replay for the contact form | Available (off by default here) | Not available |
| Consent/privacy posture in India + EU visitors | EU cloud or self-host | Google-hosted; consent question is live in the EU |
| Google Ads conversion import | Not supported | Supported |

The only column GA4 clearly wins is Ads conversion import — and paid search is
blocked in the current plan. Choose GA4 only if that changes.

**GA4 and PostHog are not mutually exclusive with Google Search Console.** GSC is
independent of both; see below.

## Setup — what you need to do

### 1. PostHog (recommended)
1. Create a project at posthog.com (pick the **EU** cloud if you want EU-hosted).
2. Copy the Project API key (`phc_...`).
3. In `.env.local`:
   ```
   VITE_ANALYTICS_PROVIDER=posthog
   VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
   VITE_POSTHOG_HOST=https://eu.i.posthog.com
   ```
4. Rebuild. Vite inlines env vars at build time — changing them requires a redeploy.

### 2. GA4 (alternative)
```
VITE_ANALYTICS_PROVIDER=ga4
VITE_GA4_ID=G-XXXXXXXXXX
```

### 3. Google Search Console
1. Search Console → Add property → `https://sraisystems.in`.
2. Verify by **DNS TXT record** (survives redeploys and host changes) or by the
   HTML tag: uncomment the `google-site-verification` meta in `index.html` and
   paste the token.
3. Submit `https://sraisystems.in/sitemap.xml` under Sitemaps. The file is at
   `public/sitemap.xml` and is already referenced from `public/robots.txt`.
4. Note: this site is a client-rendered SPA. Google will render it, but
   prerendering (Stage 3) will materially improve indexing.

## Default behaviour: nothing is tracked

With no environment variables set, `VITE_ANALYTICS_PROVIDER` is `none`. No
vendor script loads, no third-party request is made, no cookie or identifier is
set. In dev builds, events are logged to the console as `[analytics:noop]` so
they can be verified before a provider is chosen.

## Event dictionary

| Event | Fires when | Properties |
|---|---|---|
| `page_view` | Initial load and every client-side route change | `path` |
| `hero_cta_click` | Homepage hero button | `cta` = `explore_platforms` \| `get_early_access` |
| `product_card_click` | A product card in a grid is clicked | `product`, `position`, `variant?` |
| `product_detail_view` | Product modal opens (any entry point) | `product` |
| `product_waitlist_cta_click` | "Request Demo" in the product modal | `product`, `location` |
| `outbound_product_click` | Any link out to a product subdomain | `product`, `location` |
| `services_cta_click` | Services page CTA | `location` |
| `contact_form_started` | First interaction with any contact field | — |
| `contact_form_submitted` | **Only** after a confirmed 2xx submission | `product` |
| `contact_form_failed` | Submission rejected or endpoint not configured | `reason` |

## What is deliberately not tracked

No names, email addresses, message bodies, company names, phone numbers, or
addresses are ever sent. `src/lib/analytics.ts` strips those keys defensively
even if a future caller passes them. Autocapture and session recording are
disabled in the PostHog adapter; IP anonymisation is on in the GA4 adapter.
