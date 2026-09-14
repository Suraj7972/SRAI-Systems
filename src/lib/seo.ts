import { ORG, SITE_URL, organizationNode } from "@/data/org";
import { products } from "@/data/srai";
import {
  absoluteUrl,
  notFoundRoute,
  routes,
  sitemapRoutes,
  type RouteDef,
} from "@/routes";

/**
 * SRAI Systems — SEO output, generated from the route table.
 *
 * Everything here is a pure function of `src/routes.tsx` + `src/data/*`, with no
 * DOM and no build-tool dependency, so scripts/prerender.mjs and
 * src/test/seo.test.ts assert on exactly the same strings that ship.
 *
 * Emitted structured data is deliberately narrow: Organization, WebSite,
 * WebPage, BreadcrumbList and SoftwareApplication. No AggregateRating, no
 * Review, no offers — there is no traction to claim and inventing it would be
 * both a lie and a manual action waiting to happen.
 */

/** Social preview image. A real FundOS capture committed to this repo. */
export const OG_IMAGE = `${SITE_URL}/screens/fundos/schemes-eligibility.webp`;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* ── JSON-LD ──────────────────────────────────────────────────────────── */

const websiteNode = () => ({
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: ORG.name,
  description: ORG.description,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-IN",
});

const breadcrumbNode = (route: RouteDef) => ({
  "@type": "BreadcrumbList",
  "@id": `${absoluteUrl(route.path)}#breadcrumb`,
  itemListElement: route.breadcrumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

const pageNode = (route: RouteDef) => ({
  "@type": route.type,
  "@id": `${absoluteUrl(route.path)}#webpage`,
  url: absoluteUrl(route.path),
  name: route.title,
  description: route.description,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  breadcrumb: { "@id": `${absoluteUrl(route.path)}#breadcrumb` },
  inLanguage: "en-IN",
});

/**
 * SoftwareApplication for a product page.
 *
 * No `offers`, no `aggregateRating`, no `review`. `applicationCategory` is
 * BusinessApplication for every product here, which is accurate for all eight.
 */
const softwareNode = (route: RouteDef) => {
  const p = products.find((x) => x.id === route.productId);
  if (!p) return null;
  return {
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(route.path)}#software`,
    name: p.name,
    description: p.oneLiner,
    url: absoluteUrl(route.path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(p.url ? { sameAs: [p.url] } : {}),
  };
};

/** The full @graph for one route. */
export function jsonLdFor(route: RouteDef): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [
    organizationNode(),
    websiteNode(),
    pageNode(route),
    breadcrumbNode(route),
  ];
  const software = softwareNode(route);
  if (software) graph.push(software);
  return { "@context": "https://schema.org", "@graph": graph };
}

/** `</script>` inside JSON would close the tag early. Nothing else needs escaping. */
export function jsonLdScript(route: RouteDef): string {
  const json = JSON.stringify(jsonLdFor(route)).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

/* ── <head> ───────────────────────────────────────────────────────────── */

/**
 * Per-route head tags. The canonical here is the whole point of the exercise:
 * one correct absolute URL per page, never the homepage's.
 */
export function headTagsFor(route: RouteDef): string {
  const url = absoluteUrl(route.path);
  const tags = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(ORG.name)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:image" content="${esc(OG_IMAGE)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${esc(OG_IMAGE)}" />`,
  ];
  // The 404 page must never be indexed, and must never be advertised as canonical.
  if (!route.inSitemap) {
    tags.unshift(`<meta name="robots" content="noindex, follow" />`);
  }
  tags.push(jsonLdScript(route));
  return tags.join("\n    ");
}

/** Title and description, ready to substitute into the built index.html shell. */
export const titleTag = (route: RouteDef) => `<title>${esc(route.title)}</title>`;
export const descriptionTag = (route: RouteDef) =>
  `<meta name="description" content="${esc(route.description)}">`;

/* ── sitemap.xml ──────────────────────────────────────────────────────── */

/**
 * Generated at build time from the route table, so it cannot drift from what
 * the prerenderer actually emits. `lastmod` is the build date: every page is
 * rebuilt on every deploy, so that is the truthful answer.
 */
export function buildSitemap(lastmod: string): string {
  const urls = sitemapRoutes
    .map(
      (r) =>
        `  <url>\n` +
        `    <loc>${esc(absoluteUrl(r.path))}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority.toFixed(1)}</priority>\n` +
        `  </url>`,
    )
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

/* ── robots.txt ───────────────────────────────────────────────────────── */

/**
 * Search crawlers plus the answer-engine crawlers, named explicitly.
 *
 * Naming GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot is not decoration:
 * an unnamed agent falls through to `User-agent: *`, and an explicit Allow is
 * the only unambiguous signal that this site wants to be cited by them.
 */
export function buildRobots(): string {
  const agents = [
    "Googlebot",
    "Googlebot-Image",
    "Bingbot",
    "DuckDuckBot",
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    // Answer engines / AI crawlers.
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
  ];
  const blocks = agents.map((a) => `User-agent: ${a}\nAllow: /`).join("\n\n");
  return (
    `# Generated by scripts/prerender.mjs from src/routes.tsx — do not edit by hand.\n` +
    `${blocks}\n\n` +
    `User-agent: *\nAllow: /\n\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`
  );
}

/** Exported for the test suite. */
export const allRoutes = routes;
export const notFound = notFoundRoute;
