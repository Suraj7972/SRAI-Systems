# Contact form — how submission works and what you must choose

## Current state

`src/lib/contact-form.ts` posts the form as JSON to whatever URL is set in
`VITE_CONTACT_ENDPOINT` and reports success **only** on an HTTP 2xx response
(and, for providers that return `{ success: false }` inside a 200, only when
that flag is not false).

**No endpoint is configured in this repository.** Nothing was invented, and no
credentials were added. With the variable unset, submitting shows an explicit
"this form isn't connected yet" panel with a prefilled mailto button. It never
shows a success message.

## What you need to decide

The site is a static SPA with no server of its own, so it cannot receive a POST
by itself. Three options satisfy the same contract — pick one and set one
variable.

### Option A — hosted form endpoint (fastest, no infrastructure)
| Provider | Endpoint | Notes |
|---|---|---|
| Formspree | `https://formspree.io/f/<form-id>` | Free tier 50 submissions/month; spam filtering included |
| Web3Forms | `https://api.web3forms.com/submit` | Free; also set `VITE_CONTACT_ACCESS_KEY` |
| Formspark | `https://submit-form.com/<form-id>` | Paid, one-off pricing |

```
VITE_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

Trade-off: enquiry contents pass through a third party. This is disclosed in
`/privacy` — update the processor list there when you choose one.

### Option B — a serverless function on the eventual host
If this site is deployed to Vercel, Netlify, or Cloudflare Pages, add a function
that accepts the JSON body and forwards it (Resend, Postmark, SES, or SMTP), then
point `VITE_CONTACT_ENDPOINT` at its path (e.g. `/api/contact`). This keeps
enquiries out of a third-party form vendor and lets you add server-side rate
limiting. Requires the deployment target to be decided first.

### Option C — your own backend
Any endpoint that accepts `POST` with a JSON body and returns 2xx works
unchanged.

## Payload sent

```json
{
  "access_key": "<only if VITE_CONTACT_ACCESS_KEY is set>",
  "subject": "SRAI Systems enquiry — <product or General>",
  "name": "...", "email": "...", "company": "...", "product": "...",
  "message": "...", "source": "sraisystems.in/contact"
}
```

## Protections in place

- Zod validation before any network call; first invalid field receives focus.
- Submit button disabled while in flight, plus a ref guard, so rapid clicking
  produces exactly one request (verified).
- 15-second timeout with an explicit timeout message.
- Hidden honeypot field (`website`) — a non-empty value fails validation.
- Errors are shown as a `role="alert"` panel with a direct email fallback; the
  form is never cleared on failure, so the message is not lost.

## Still open (needs a server, deliberately not faked)

Rate limiting and CAPTCHA are not implemented client-side, because client-side
versions of both are trivially bypassed. Most hosted providers in Option A
include spam filtering; if you go with Option B, add rate limiting in the
function.
