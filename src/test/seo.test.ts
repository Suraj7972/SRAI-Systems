import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  routes,
  prerenderRoutes,
  sitemapRoutes,
  notFoundRoute,
  routePatterns,
  absoluteUrl,
  SITE_URL,
  type RouteDef,
} from "@/routes";
import { buildSitemap, buildRobots, buildLlmsTxt, jsonLdFor } from "@/lib/seo";
import { answerFor, faqsFor } from "@/lib/jsonld";
import { ORG, prune } from "@/data/org";
import { products } from "@/data/srai";
import { pageAnswers, siteFaqs } from "@/data/answers";

/**
 * These tests exist because of one specific failure: index.html hardcoded a
 * canonical of "/" and vercel.json rewrote every path to index.html, so all 16
 * sitemap URLs told Google they were duplicates of the homepage. Each assertion
 * below is a way that failure could come back.
 */

const MAX_TITLE = 70;
const MAX_DESCRIPTION = 200;

describe("route table", () => {
  it("has a 404 route that is never advertised", () => {
    const notFound = routes.find((r) => r.page === "notFound");
    expect(notFound, "no 404 route in src/routes.tsx").toBeDefined();
    expect(notFound).toBe(notFoundRoute);
    expect(notFound!.inSitemap).toBe(false);
    expect(sitemapRoutes).not.toContain(notFoundRoute);
  });

  it("gives every route a React Router pattern that can render it", () => {
    const pages = new Set(routePatterns.map((p) => p.page));
    for (const route of routes) {
      expect(pages.has(route.page), `no routePatterns entry renders ${route.path}`).toBe(true);
    }
  });

  it("expands one route per product", () => {
    for (const product of products) {
      const route = routes.find((r) => r.path === `/products/${product.id}`);
      expect(route, `no route for product ${product.id}`).toBeDefined();
      expect(route!.productId).toBe(product.id);
    }
  });

  it("uses paths with no trailing slash", () => {
    for (const route of routes) {
      expect(route.path.startsWith("/"), route.path).toBe(true);
      if (route.path !== "/") expect(route.path.endsWith("/"), route.path).toBe(false);
    }
  });
});

describe("titles and descriptions", () => {
  it("never repeats a title across routes", () => {
    const seen = new Map<string, string>();
    for (const route of routes) {
      const clash = seen.get(route.title);
      expect(clash, `${route.path} reuses the title of ${clash}`).toBeUndefined();
      seen.set(route.title, route.path);
    }
  });

  it("never repeats a description across routes", () => {
    const seen = new Map<string, string>();
    for (const route of routes) {
      const clash = seen.get(route.description);
      expect(clash, `${route.path} reuses the description of ${clash}`).toBeUndefined();
      seen.set(route.description, route.path);
    }
  });

  it("keeps every title inside 70 characters", () => {
    for (const route of routes) {
      expect(route.title.length, `${route.path}: "${route.title}"`).toBeLessThanOrEqual(MAX_TITLE);
    }
  });

  it("keeps every description inside 200 characters", () => {
    for (const route of routes) {
      expect(route.description.length, route.path).toBeLessThanOrEqual(MAX_DESCRIPTION);
      expect(route.description.length, `${route.path} has a stub description`).toBeGreaterThan(50);
    }
  });

  it("names the brand in every title", () => {
    for (const route of routes) {
      expect(route.title, `${route.path}: "${route.title}"`).toContain("SRAI");
    }
  });
});

describe("sitemap.xml", () => {
  const xml = buildSitemap("2026-01-01");

  it("lists every prerendered route", () => {
    for (const route of prerenderRoutes) {
      expect(xml, `${route.path} is missing from the sitemap`).toContain(
        `<loc>${absoluteUrl(route.path)}</loc>`,
      );
    }
  });

  it("lists nothing that is not a route", () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toHaveLength(sitemapRoutes.length);
    for (const loc of locs) {
      expect(routes.some((r) => absoluteUrl(r.path) === loc), `${loc} is not a route`).toBe(true);
    }
  });

  it("never advertises the 404 page", () => {
    expect(xml).not.toContain(absoluteUrl(notFoundRoute.path));
  });

  it("uses absolute URLs only", () => {
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      expect(loc.startsWith("https://"), loc).toBe(true);
    }
  });
});

describe("robots.txt", () => {
  const robots = buildRobots();

  it("names the search and answer-engine crawlers explicitly", () => {
    for (const agent of [
      "Googlebot",
      "Bingbot",
      "GPTBot",
      "OAI-SearchBot",
      "ClaudeBot",
      "PerplexityBot",
    ]) {
      expect(robots).toContain(`User-agent: ${agent}`);
    }
  });

  it("names every answer-engine crawler the site wants to be cited by", () => {
    for (const agent of [
      "ChatGPT-User",
      "Claude-User",
      "Claude-SearchBot",
      "Perplexity-User",
      "Google-Extended",
      "Applebot-Extended",
      "Amazonbot",
      "Meta-ExternalAgent",
      "CCBot",
    ]) {
      expect(robots).toContain(`User-agent: ${agent}`);
    }
  });

  it("allows everything it names", () => {
    expect(robots).not.toContain("Disallow:");
    expect(robots).toContain("User-agent: *\nAllow: /");
  });

  /**
   * Recorded in the file so a future "let us opt out of AI training" pass
   * cannot quietly cost the site its Gemini citations under the impression it
   * is turning off AI Overviews. It cannot.
   */
  it("records what Google-Extended and Applebot-Extended actually govern", () => {
    expect(robots).toContain("Google-Extended governs Gemini grounding");
    expect(robots).toContain("AI Overviews follow Googlebot");
    expect(robots).toContain("Applebot-Extended is likewise training-only");
  });

  it("points at the sitemap", () => {
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});

describe("organization identity", () => {
  it("only ever carries absolute sameAs URLs", () => {
    for (const url of ORG.sameAs as string[]) {
      expect(/^https?:\/\/[^\s]+$/.test(url), `sameAs entry is not absolute: ${url}`).toBe(true);
    }
  });

  it("omits sameAs entirely while it is empty rather than emitting []", () => {
    const graph = jsonLdFor(routes[0])["@graph"] as Record<string, unknown>[];
    const org = graph.find((n) => n["@type"] === "Organization")!;
    if ((ORG.sameAs as string[]).length === 0) {
      expect(org.sameAs).toBeUndefined();
    } else {
      expect(org.sameAs).toEqual([...ORG.sameAs]);
    }
  });
});

describe("JSON-LD", () => {
  const graphFor = (route: RouteDef) => jsonLdFor(route)["@graph"] as Record<string, unknown>[];

  it("gives every route an Organization, WebSite, page node and breadcrumbs", () => {
    for (const route of routes) {
      // A page node may carry two types: a product page is WebPage AND FAQPage.
      const types = graphFor(route).flatMap((n) =>
        Array.isArray(n["@type"]) ? (n["@type"] as string[]) : [n["@type"] as string],
      );
      expect(types, route.path).toContain("Organization");
      expect(types, route.path).toContain("WebSite");
      expect(types, route.path).toContain("BreadcrumbList");
      expect(types, route.path).toContain(route.type);
    }
  });

  it("adds SoftwareApplication on product pages only", () => {
    for (const route of routes) {
      const types = graphFor(route).flatMap((n) =>
        Array.isArray(n["@type"]) ? (n["@type"] as string[]) : [n["@type"] as string],
      );
      expect(types.includes("SoftwareApplication"), route.path).toBe(Boolean(route.productId));
    }
  });

  it("claims no ratings, reviews or offers anywhere", () => {
    for (const route of routes) {
      const json = JSON.stringify(jsonLdFor(route));
      expect(json, route.path).not.toMatch(/aggregateRating|"review"|"offers"/i);
    }
  });

  it("canonicalises every page node to its own absolute URL", () => {
    for (const route of routes) {
      const page = graphFor(route).find((n) => String(n["@id"]).endsWith("#webpage"))!;
      expect(page.url, route.path).toBe(absoluteUrl(route.path));
    }
  });
});

/* ── Part 2 of the GEO work: the serializer must never assert emptiness ──── */

describe("JSON-LD serializer", () => {
  it("drops undefined values", () => {
    expect(prune({ a: 1, b: undefined })).toEqual({ a: 1 });
  });

  it("drops empty arrays", () => {
    expect(prune({ sameAs: [], name: "x" })).toEqual({ name: "x" });
  });

  it("drops empty strings and empty objects", () => {
    expect(prune({ a: "", b: {}, c: "y" })).toEqual({ c: "y" });
  });

  it("drops a key whose object value pruned away entirely", () => {
    expect(prune({ founder: { name: undefined }, ok: 1 })).toEqual({ ok: 1 });
  });

  it("keeps zero and false, which carry information", () => {
    expect(prune({ n: 0, f: false })).toEqual({ n: 0, f: false });
  });

  it("returns undefined when the whole value pruned away", () => {
    expect(prune({ a: undefined, b: [] })).toBeUndefined();
  });

  it("never emits null or undefined anywhere in a real page graph", () => {
    for (const route of routes) {
      const json = JSON.stringify(jsonLdFor(route));
      expect(json, route.path).not.toMatch(/:\s*null/);
      expect(json, route.path).not.toContain("undefined");
      expect(json, route.path).not.toMatch(/"sameAs":\s*\[\]/);
    }
  });
});

describe("JSON-LD entity graph", () => {
  const idsIn = (value: unknown, into = new Set<string>()): Set<string> => {
    if (Array.isArray(value)) value.forEach((v) => idsIn(v, into));
    else if (value && typeof value === "object") {
      const node = value as Record<string, unknown>;
      if (typeof node["@id"] === "string" && Object.keys(node).length > 1) {
        into.add(node["@id"] as string);
      }
      Object.values(node).forEach((v) => idsIn(v, into));
    }
    return into;
  };
  const refsIn = (value: unknown, into: string[] = []): string[] => {
    if (Array.isArray(value)) value.forEach((v) => refsIn(v, into));
    else if (value && typeof value === "object") {
      const node = value as Record<string, unknown>;
      const keys = Object.keys(node);
      if (keys.length === 1 && typeof node["@id"] === "string") into.push(node["@id"] as string);
      else Object.values(node).forEach((v) => refsIn(v, into));
    }
    return into;
  };

  it("resolves every @id reference to an entity present in the same graph", () => {
    for (const route of routes) {
      const graph = jsonLdFor(route);
      const defined = idsIn(graph);
      const dangling = [...new Set(refsIn(graph))].filter((id) => !defined.has(id));
      expect(dangling, `${route.path} references entities that are not in its graph`).toEqual([]);
    }
  });

  it("anchors every page to the one Organization and WebSite", () => {
    for (const route of routes) {
      const nodes = jsonLdFor(route)["@graph"] as Record<string, unknown>[];
      const org = nodes.find((n) => n["@type"] === "Organization")!;
      const site = nodes.find((n) => n["@type"] === "WebSite")!;
      expect(org["@id"], route.path).toBe(`${SITE_URL}/#organization`);
      expect(site["@id"], route.path).toBe(`${SITE_URL}/#website`);
    }
  });

  it("never emits a JobPosting while no role is open", () => {
    for (const route of routes) {
      expect(JSON.stringify(jsonLdFor(route)), route.path).not.toContain("JobPosting");
    }
  });

  it("never emits a rating, a review or an offer", () => {
    for (const route of routes) {
      const json = JSON.stringify(jsonLdFor(route));
      expect(json, route.path).not.toMatch(/aggregateRating|ratingValue|"review"|"offers"/i);
    }
  });

  it("omits a founder Person entirely while ORG.founder is undefined", () => {
    const nodes = jsonLdFor(routes[0])["@graph"] as Record<string, unknown>[];
    const person = nodes.find((n) => n["@type"] === "Person");
    if (ORG.founder === undefined) expect(person).toBeUndefined();
    else expect(person).toBeDefined();
  });

  it("emits dateModified matching the route's own content date", () => {
    for (const route of routes) {
      const nodes = jsonLdFor(route)["@graph"] as Record<string, unknown>[];
      const page = nodes.find((n) => String(n["@id"]).endsWith("#webpage"))!;
      expect(page.dateModified, route.path).toBe(route.lastUpdated);
    }
  });
});

/* ── Part 3: the answer blocks ───────────────────────────────────────────── */

describe("answer blocks", () => {
  it("gives every route an answer block", () => {
    for (const route of routes) {
      expect(answerFor(route), `${route.path} has no answer block`).toBeDefined();
    }
  });

  it("phrases every question as a question", () => {
    for (const route of routes) {
      expect(answerFor(route)!.question, route.path).toMatch(/\?$/);
    }
  });

  it("keeps every answer between 40 and 70 words", () => {
    for (const route of routes) {
      const words = answerFor(route)!.body.trim().split(/\s+/).length;
      expect(words, `${route.path}: ${words} words`).toBeGreaterThanOrEqual(40);
      expect(words, `${route.path}: ${words} words`).toBeLessThanOrEqual(70);
    }
  });

  /**
   * The whole point of an answer block is that it survives being copy-pasted
   * away from this site. An answer opening with "We" or "Our platform" cannot:
   * the reader has no idea who "we" is.
   */
  it("opens every answer with a proper noun, never a pronoun", () => {
    const PRONOUNS = ["We", "Our", "Ours", "Us", "It", "Its", "They", "Their", "I",
      "This", "That", "These", "Those", "He", "She", "Here", "There"];
    for (const route of routes) {
      const [first, second] = answerFor(route)!.body.trim().split(/\s+/);
      expect(
        PRONOUNS.includes(first),
        `${route.path} opens with "${first}" — an answer that needs context to parse`,
      ).toBe(false);
      // "The" is only acceptable as the article on a proper noun: "The SRAI
      // Systems website ...", never "The platform ...".
      if (first === "The") {
        expect(
          /^[A-Z]/.test(second ?? ""),
          `${route.path} opens "The ${second}" — name the subject, do not gesture at it`,
        ).toBe(true);
      }
    }
  });

  it("names a route for every page answer, and vice versa", () => {
    for (const path of Object.keys(pageAnswers)) {
      expect(routes.some((r) => r.path === path), `${path} is not a route`).toBe(true);
    }
  });
});

/* ── Part 2: FAQ markup must match the visible page ──────────────────────── */

describe("FAQ content", () => {
  it("gives every product 4 to 6 questions", () => {
    for (const product of products) {
      expect(product.faqs.length, `${product.id} has ${product.faqs.length} FAQs`).toBeGreaterThanOrEqual(4);
      expect(product.faqs.length, `${product.id} has ${product.faqs.length} FAQs`).toBeLessThanOrEqual(6);
    }
  });

  it("gives the site-level set to /about and to nothing else", () => {
    const about = routes.find((r) => r.path === "/about")!;
    expect(faqsFor(about)).toBe(siteFaqs);
    expect(faqsFor(routes.find((r) => r.path === "/contact")!)).toEqual([]);
  });

  it("phrases every question as a question and answers each one", () => {
    for (const route of routes) {
      for (const faq of faqsFor(route)) {
        expect(faq.q, `${route.path}: "${faq.q}"`).toMatch(/\?$/);
        expect(faq.a.length, `${route.path}: "${faq.q}" has a stub answer`).toBeGreaterThan(40);
      }
    }
  });

  it("emits FAQPage only where questions are actually rendered", () => {
    for (const route of routes) {
      const nodes = jsonLdFor(route)["@graph"] as Record<string, unknown>[];
      const page = nodes.find((n) => String(n["@id"]).endsWith("#webpage"))!;
      const types = Array.isArray(page["@type"]) ? page["@type"] : [page["@type"]];
      expect(types.includes("FAQPage"), route.path).toBe(faqsFor(route).length > 0);
    }
  });

  it("puts the same words in mainEntity as the page will render", () => {
    for (const route of routes) {
      const faqs = faqsFor(route);
      if (faqs.length === 0) continue;
      const nodes = jsonLdFor(route)["@graph"] as Record<string, unknown>[];
      const page = nodes.find((n) => String(n["@id"]).endsWith("#webpage"))!;
      const entity = page.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      expect(entity.map((q) => q.name), route.path).toEqual(faqs.map((f) => f.q));
      expect(entity.map((q) => q.acceptedAnswer.text), route.path).toEqual(faqs.map((f) => f.a));
    }
  });
});

/* ── Part 6: freshness ───────────────────────────────────────────────────── */

describe("lastUpdated", () => {
  it("is an ISO date on every route", () => {
    for (const route of routes) {
      expect(route.lastUpdated, route.path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("drives the sitemap's lastmod", () => {
    const xml = buildSitemap();
    for (const route of sitemapRoutes) {
      expect(xml).toContain(`<lastmod>${route.lastUpdated}</lastmod>`);
    }
  });
});

/* ── Part 5: llms.txt. Generated, unadvertised, untuned. ─────────────────── */

describe("llms.txt", () => {
  const llms = buildLlmsTxt();

  it("names the site and lists every indexable route", () => {
    expect(llms.startsWith(`# ${ORG.name}`)).toBe(true);
    for (const route of sitemapRoutes) {
      expect(llms, `${route.path} missing from llms.txt`).toContain(absoluteUrl(route.path));
    }
  });

  it("never advertises the 404 page", () => {
    expect(llms).not.toContain(absoluteUrl(notFoundRoute.path));
  });
});

describe("host configuration", () => {
  const root = resolve(__dirname, "../..");
  const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

  /**
   * An SPA catch-all makes the host serve the homepage document for every URL.
   * It silently undoes the prerender while the site still looks correct in a
   * browser — which is exactly how this site got de-indexed. Never re-add one.
   */
  it("has no SPA catch-all rewrite", () => {
    expect(vercel.rewrites, "vercel.json must not rewrite paths to /index.html").toBeUndefined();
  });

  it("serves clean URLs with no trailing slash", () => {
    expect(vercel.trailingSlash).toBe(false);
    expect(vercel.cleanUrls).toBe(true);
  });

  it("sets the security headers", () => {
    const keys = (vercel.headers ?? []).flatMap((h: { headers: { key: string }[] }) =>
      h.headers.map((x) => x.key),
    );
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("Cache-Control");
  });

  it("keeps index.html free of a hardcoded canonical and og:url", () => {
    const html = readFileSync(resolve(root, "index.html"), "utf8");
    const uncommented = html.replace(/<!--[\s\S]*?-->/g, "");
    expect(uncommented).not.toContain('rel="canonical"');
    expect(uncommented).not.toContain('property="og:url"');
  });

  it("keeps the prerender slots index.html needs", () => {
    const html = readFileSync(resolve(root, "index.html"), "utf8");
    expect(html).toContain("<!--%SEO%-->");
    expect(html).toContain("<!--%APP%-->");
  });

  it("does not ship a hand-maintained sitemap or robots.txt in public/", () => {
    // Both are generated from the route table at build time; a stale copy in
    // public/ would be copied over the generated one and drift immediately.
    expect(() => readFileSync(resolve(root, "public/sitemap.xml"))).toThrow();
    expect(() => readFileSync(resolve(root, "public/robots.txt"))).toThrow();
  });
});
