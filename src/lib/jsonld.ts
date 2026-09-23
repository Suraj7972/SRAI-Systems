import {
  ORG,
  ORG_ID,
  WEBSITE_ID,
  SITE_URL,
  founderNode,
  organizationNode,
  prune,
} from "@/data/org";
import { pageAnswers, siteFaqs, type Answer } from "@/data/answers";
import { products, services } from "@/data/srai";
import { absoluteUrl, type RouteDef } from "@/routes";

/**
 * SRAI Systems — JSON-LD builders.
 *
 * Pure functions of the route table and src/data. No DOM, no build-tool import,
 * so scripts/prerender.mjs, scripts/verify.mjs and src/test/seo.test.ts all
 * assert on exactly the object that ships. The graph is injected into the
 * prerendered <head> — it is in the static HTML, never added by React on mount,
 * because a crawler that does not execute JavaScript must still see it.
 *
 * TWO INVARIANTS, both enforced by tests:
 *
 * 1. ONE ENTITY, REFERENCED. Every page emits an Organization at
 *    `https://sraisystems.in/#organization` and a WebSite at `.../#website`.
 *    Every other node points at those `@id`s instead of repeating the company.
 *    Eighteen pages each carrying their own copy of an organisation is eighteen
 *    weakly-related blobs; eighteen pages referencing one `@id` is one entity.
 *
 * 2. NOTHING EMPTY, NOTHING FALSE. `prune()` drops every undefined value and
 *    empty array before serialization, so `"sameAs": []`, a founder stub and a
 *    null `operatingSystem` cannot reach the page. And there is deliberately no
 *    `AggregateRating`, no `Review`, no `offers` and no `JobPosting` anywhere in
 *    this file: SRAI Systems has no reviews, no published price and no open
 *    role, and markup for any of them is a structured-data spam violation that
 *    earns a manual action.
 */

export interface LdRef {
  "@id": string;
}

export type LdNode = Record<string, unknown> & { "@type": string | string[] };

const ref = (id: string): LdRef => ({ "@id": id });

const productFor = (route: RouteDef) =>
  route.productId ? products.find((p) => p.id === route.productId) : undefined;

/* ── content lookups ──────────────────────────────────────────────────────
 * The visible page and the JSON-LD both read these, so "structured data must
 * match visible content" holds by construction rather than by review.
 */

/** The answer block for a route: its <h2> question and its standalone paragraph. */
export function answerFor(route: RouteDef): Answer | undefined {
  return productFor(route)?.answer ?? pageAnswers[route.path];
}

/** The Q&A pairs rendered on a route, and emitted as FAQPage for that route. */
export function faqsFor(route: RouteDef): { q: string; a: string }[] {
  const product = productFor(route);
  if (product) return product.faqs;
  if (route.path === "/about") return siteFaqs;
  return [];
}

/* ── nodes ────────────────────────────────────────────────────────────── */

export const websiteNode = (): LdNode => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: ORG.name,
  description: ORG.description,
  publisher: ref(ORG_ID),
  inLanguage: "en-IN",
});

export const breadcrumbNode = (route: RouteDef): LdNode => ({
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl(route.path)}#breadcrumb`,
  itemListElement: route.breadcrumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

/**
 * The page node. Carries `FAQPage` as a second type when the page renders a
 * visible Q&A block, with those same questions as `mainEntity` — one node per
 * URL rather than a second page entity competing with the first.
 */
export const pageNode = (route: RouteDef): LdNode => {
  const faqs = faqsFor(route);
  const answer = answerFor(route);
  return {
    "@type": faqs.length > 0 ? [route.type, "FAQPage"] : route.type,
    "@id": `${absoluteUrl(route.path)}#webpage`,
    url: absoluteUrl(route.path),
    name: route.title,
    description: route.description,
    isPartOf: ref(WEBSITE_ID),
    about: ref(ORG_ID),
    breadcrumb: ref(`${absoluteUrl(route.path)}#breadcrumb`),
    inLanguage: "en-IN",
    dateModified: route.lastUpdated,
    // The answer block, verbatim. Same string the page renders.
    ...(answer ? { mainContentOfPage: { "@type": "WebPageElement", text: answer.body } } : {}),
    ...(faqs.length > 0
      ? {
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : {}),
  };
};

/**
 * SoftwareApplication for a product page.
 *
 * No `offers`: there is no published price anywhere in src/data/srai.ts, and
 * `offers` with a made-up price is a lie with a rich result attached. No
 * `aggregateRating`, no `review` — there are no reviews.
 *
 * `operatingSystem` is emitted only where the product's `runsOn` establishes it,
 * so the structured data never claims a platform the visible page does not.
 */
export const softwareNode = (route: RouteDef): LdNode | undefined => {
  const p = productFor(route);
  if (!p) return undefined;
  return {
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(route.path)}#software`,
    name: p.name,
    description: p.oneLiner,
    url: absoluteUrl(route.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: p.runsOn ? "Web" : undefined,
    publisher: ref(ORG_ID),
    author: ref(ORG_ID),
    dateModified: p.lastUpdated,
    sameAs: p.url ? [p.url] : [],
  };
};

/** /products — the eight products as an ordered list of URLs. */
export const itemListNode = (route: RouteDef): LdNode => ({
  "@type": "ItemList",
  "@id": `${absoluteUrl(route.path)}#itemlist`,
  name: "Products built by SRAI Systems",
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    description: p.oneLiner,
    url: absoluteUrl(`/products/${p.id}`),
  })),
});

/** /services — one Service per offer, all provided by the one organisation. */
export const serviceNodes = (): LdNode[] =>
  services.map((s) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/services#${s.id}`,
    name: s.title,
    description: s.description,
    serviceType: s.title,
    provider: ref(ORG_ID),
    // No `offers` and no price: pricing is a shape ("fixed-fee pilot"), never a
    // published number, and schema.org offers wants a number.
  }));

/* ── the graph ────────────────────────────────────────────────────────── */

/**
 * The full @graph for one route: the shared entity pair, this page, its
 * breadcrumbs, and whatever else this particular page actually is.
 *
 * /careers deliberately gets NO JobPosting. `openRoles` is empty, and a
 * JobPosting for a role that does not exist is the same violation as a
 * fabricated review.
 */
export function jsonLdFor(route: RouteDef): Record<string, unknown> {
  const graph: (LdNode | undefined)[] = [
    organizationNode() as LdNode,
    founderNode() as LdNode | undefined,
    websiteNode(),
    pageNode(route),
    breadcrumbNode(route),
    softwareNode(route),
    route.path === "/products" ? itemListNode(route) : undefined,
    ...(route.path === "/services" ? serviceNodes() : []),
  ];

  const pruned = prune({
    "@context": "https://schema.org",
    "@graph": graph.filter(Boolean),
  });
  return (pruned ?? {}) as Record<string, unknown>;
}

/** `</script>` inside JSON would close the tag early. Nothing else needs escaping. */
export function jsonLdScript(route: RouteDef): string {
  const json = JSON.stringify(jsonLdFor(route)).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
