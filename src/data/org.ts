/**
 * SRAI Systems — canonical company identity.
 *
 * This is the single source of truth for who the company is, used by the
 * JSON-LD emitted on every prerendered page. Nothing in here may be invented:
 * if a fact is not confirmed, the field is `undefined` or empty and that
 * absence is documented, because structured data that points at something
 * untrue (or at a 404) is worse for the brand than structured data that is
 * merely incomplete.
 *
 * Serialization rule, enforced by `prune()` below and by src/test/seo.test.ts:
 * a key whose value is undefined, null, an empty array or an empty object is
 * omitted from the emitted JSON-LD entirely. `"sameAs": []` and a `founder`
 * stub are never emitted.
 */

export const SITE_URL = "https://sraisystems.in";

export interface Founder {
  name: string;
  jobTitle: string;
  url?: string;
}

export const ORG = {
  /** Trading name used everywhere on the site. */
  name: "SRAI Systems",
  /**
   * Same as the trading name. Do not change without a source — the registered
   * entity name is a companies-register fact, not a branding decision.
   */
  legalName: "SRAI Systems",
  url: SITE_URL,
  /**
   * The only brand mark committed to this repo today.
   * TODO (needs a real asset, not code): Google's Organization logo guidance
   * wants a square raster image of at least 112x112 px, ideally 512x512 PNG on
   * a solid background. Replace with /logo-512.png once that file exists.
   */
  logo: `${SITE_URL}/favicon.ico`,
  email: "contact@sraisystems.in",
  description:
    "SRAI Systems is an AI product studio in Pune, India. Eight products built in-house, plus AI engineering for other companies.",
  /** Pune is in Maharashtra, India — geography, not a claim. No street address is published. */
  address: {
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  /**
   * DELIBERATELY EMPTY — do not fill this with guesses.
   *
   * `sameAs` is the mechanism that tells Google "SRAI Systems" is a distinct
   * entity from SRA Systems, Saisystems and STRAI Systems. It only works with
   * real, live profile URLs (LinkedIn company page, GitHub organisation,
   * Crunchbase). Those do not exist yet. A sameAs entry that 404s is worse than
   * no sameAs at all: it tells Google the entity claim cannot be corroborated.
   *
   * When the profiles exist, paste the absolute URLs here. src/test/seo.test.ts
   * fails on any entry that is not an absolute http(s) URL, and `prune()` keeps
   * the key out of the graph entirely while the array is empty.
   */
  sameAs: [] as string[],
  /**
   * UNDEFINED until the owner supplies a real name and title.
   *
   * A named, titled founder is the strongest E-E-A-T signal a young studio can
   * add, and the /about team section plus the Person node in the @graph are
   * both already built and waiting for it — but a placeholder person is a
   * fabricated entity, so nothing renders while this is undefined.
   */
  founder: undefined as Founder | undefined,
  /**
   * UNDEFINED until the owner supplies the real incorporation or start date.
   * Format: ISO 8601, e.g. "2024-01-15" or "2024".
   */
  foundingDate: undefined as string | undefined,
} as const;

/* ── Serialization ────────────────────────────────────────────────────── */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/**
 * Recursively drop every key whose value carries no information: undefined,
 * null, an empty string, an empty array, or an object that pruned down to
 * nothing. Returns undefined when the whole value pruned away.
 *
 * This exists so a builder can write `sameAs: ORG.sameAs` or
 * `founder: founderNode()` unconditionally and still never emit `"sameAs": []`
 * or a half-empty Person. Emitting an empty value is not neutral — it tells a
 * consumer the site asserted something and had nothing to say.
 */
export function prune<T>(value: T): Json | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    const items = value.map((v) => prune(v)).filter((v): v is Json => v !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === "object") {
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const pruned = prune(v);
      if (pruned !== undefined) out[k] = pruned;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  if (typeof value === "string") return value.length > 0 ? value : undefined;
  return value as Json;
}

/* ── @id constants ────────────────────────────────────────────────────── */

/**
 * Every entity on the site references these two ids rather than repeating the
 * organisation block. That is what makes "SRAI Systems" one resolvable entity
 * across eighteen pages instead of eighteen disconnected copies of a company.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

/** The Person node, or undefined while no founder is on record. */
export const founderNode = () =>
  ORG.founder
    ? {
        "@type": "Person",
        "@id": FOUNDER_ID,
        name: ORG.founder.name,
        jobTitle: ORG.founder.jobTitle,
        url: ORG.founder.url,
        worksFor: { "@id": ORG_ID },
      }
    : undefined;

/** Organization node, shared by every page's @graph via @id reference. */
export const organizationNode = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: ORG.name,
  legalName: ORG.legalName,
  url: ORG.url,
  logo: {
    "@type": "ImageObject",
    "@id": LOGO_ID,
    url: ORG.logo,
  },
  image: { "@id": LOGO_ID },
  description: ORG.description,
  email: ORG.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: ORG.address.addressLocality,
    addressRegion: ORG.address.addressRegion,
    addressCountry: ORG.address.addressCountry,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: ORG.email,
      // No areaServed and no availableLanguage: neither is established anywhere
      // in this repo, and a contact channel is the wrong place to guess.
    },
  ],
  // Both pruned away while empty/undefined — never emitted as [] or a stub.
  sameAs: [...ORG.sameAs],
  foundingDate: ORG.foundingDate,
  ...(ORG.founder ? { founder: { "@id": FOUNDER_ID } } : {}),
});
