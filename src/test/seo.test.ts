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
import { buildSitemap, buildRobots, jsonLdFor } from "@/lib/seo";
import { ORG } from "@/data/org";
import { products } from "@/data/srai";

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
      const types = graphFor(route).map((n) => n["@type"]);
      expect(types, route.path).toContain("Organization");
      expect(types, route.path).toContain("WebSite");
      expect(types, route.path).toContain("BreadcrumbList");
      expect(types, route.path).toContain(route.type);
    }
  });

  it("adds SoftwareApplication on product pages only", () => {
    for (const route of routes) {
      const types = graphFor(route).map((n) => n["@type"]);
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
