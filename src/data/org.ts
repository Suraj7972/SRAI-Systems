/**
 * SRAI Systems — canonical company identity.
 *
 * This is the single source of truth for who the company is, used by the
 * JSON-LD emitted on every prerendered page. Nothing in here may be invented:
 * if a fact is not confirmed, the field is absent or empty and that absence is
 * documented, because structured data that points at something untrue (or at a
 * 404) is worse for the brand than structured data that is merely incomplete.
 */

export const SITE_URL = "https://sraisystems.in";

export const ORG = {
  /** Trading name used everywhere on the site. */
  name: "SRAI Systems",
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
    locality: "Pune",
    region: "Maharashtra",
    country: "IN",
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
   * fails on any entry that is not an absolute http(s) URL.
   */
  sameAs: [] as string[],
} as const;

/** Organization node, shared by every page's @graph via @id reference. */
export const organizationNode = () => ({
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: ORG.name,
  url: ORG.url,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    url: ORG.logo,
  },
  description: ORG.description,
  email: ORG.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: ORG.address.locality,
    addressRegion: ORG.address.region,
    addressCountry: ORG.address.country,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: ORG.email,
    },
  ],
  ...(ORG.sameAs.length > 0 ? { sameAs: [...ORG.sameAs] } : {}),
});
