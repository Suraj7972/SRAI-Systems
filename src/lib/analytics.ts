/**
 * SRAI Systems — analytics abstraction.
 *
 * Design goals:
 *  1. NOTHING is tracked unless an environment variable explicitly enables a provider.
 *     With no env vars set, every call is a no-op (dev builds log to console instead).
 *  2. The provider is swappable via one env var. No provider SDK is bundled — the
 *     vendor script is injected at runtime, so an unconfigured build ships zero
 *     tracking bytes and makes zero third-party network requests.
 *  3. Only product-intent events are tracked. No PII: we never send names, email
 *     addresses, message bodies, or free-text form content.
 *
 * Configuration (.env.local — see .env.example):
 *   VITE_ANALYTICS_PROVIDER = "posthog" | "ga4" | "none"   (default: "none")
 *   VITE_POSTHOG_KEY        = "phc_..."
 *   VITE_POSTHOG_HOST       = "https://eu.i.posthog.com"   (default)
 *   VITE_GA4_ID             = "G-XXXXXXXXXX"
 */

/** The complete, closed set of events this site emits. Add here, not inline. */
export type AnalyticsEvent =
  | "hero_cta_click"
  | "product_card_click"
  | "product_detail_view"
  | "product_page_view"
  | "product_demo_step"
  | "product_demo_open"
  | "service_view"
  | "service_cta_click"
  | "site_guide_open"
  | "site_guide_question"
  | "site_guide_route"
  | "services_cta_click"
  | "contact_form_started"
  | "contact_form_submitted"
  | "contact_form_failed"
  | "product_waitlist_cta_click"
  | "outbound_product_click"
  | "page_view";

/**
 * Non-identifying context only. Never pass name/email/message/company here.
 */
export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

type Provider = "posthog" | "ga4" | "none";

const env = import.meta.env;
const provider = ((env.VITE_ANALYTICS_PROVIDER as string) || "none").toLowerCase() as Provider;
const posthogKey = env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = (env.VITE_POSTHOG_HOST as string | undefined) || "https://eu.i.posthog.com";
const ga4Id = env.VITE_GA4_ID as string | undefined;

let initialised = false;

/** Keys we refuse to forward even if a caller passes them by mistake. */
const BLOCKED_KEYS = new Set(["name", "email", "message", "company", "phone", "address"]);

function sanitise(props?: AnalyticsProps): AnalyticsProps {
  if (!props) return {};
  const out: AnalyticsProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (BLOCKED_KEYS.has(k.toLowerCase())) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function injectScript(src: string, onLoad?: () => void) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  if (onLoad) s.onload = onLoad;
  document.head.appendChild(s);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    posthog?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function initPostHog() {
  if (!posthogKey) return false;
  // Minimal official snippet, loaded only when a key is present.
  const w = window as any;
  w.posthog = w.posthog || [];
  w.posthog._i = w.posthog._i || [];
  const queue: any[] = [];
  w.posthog.capture = (...args: any[]) => queue.push(args);
  injectScript(`${posthogHost}/static/array.js`, () => {
    if (!w.posthog || typeof w.posthog.init !== "function") return;
    w.posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false, // we emit page_view ourselves on route change
      persistence: "localStorage",
      autocapture: false,
      disable_session_recording: true,
    });
    queue.forEach((args) => w.posthog.capture(...args));
  });
  return true;
}

function initGa4() {
  if (!ga4Id) return false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as any;
  window.gtag("js", new Date());
  window.gtag("config", ga4Id, { send_page_view: false, anonymize_ip: true });
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`);
  return true;
}

/** Call once, from the app root. Safe to call more than once. */
export function initAnalytics() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  if (provider === "posthog") initPostHog();
  else if (provider === "ga4") initGa4();
}

/** Emit a product-intent event. No-op unless a provider is configured. */
export function track(event: AnalyticsEvent, props?: AnalyticsProps) {
  const payload = sanitise(props);
  if (typeof window === "undefined") return;

  if (provider === "posthog" && window.posthog) {
    window.posthog.capture(event, payload);
    return;
  }
  if (provider === "ga4" && window.gtag) {
    window.gtag("event", event, payload);
    return;
  }
  if (import.meta.env.DEV) {
    // Visible in dev so events can be verified before a provider is chosen.
    console.info("[analytics:noop]", event, payload);
  }
}

/** Route-change page view. Path only — never query strings (they can carry PII). */
export function trackPageView(path: string) {
  if (provider === "ga4" && window.gtag && ga4Id) {
    window.gtag("event", "page_view", { page_path: path });
    return;
  }
  track("page_view", { path });
}

export const analyticsProvider = provider;
