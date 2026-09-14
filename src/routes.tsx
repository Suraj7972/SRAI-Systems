import { products } from "@/data/srai";
import { SITE_URL } from "@/data/org";

/**
 * SRAI Systems — the route table.
 *
 * ONE array. `App.tsx` builds its <Routes> from it, `scripts/prerender.mjs`
 * emits one static HTML file per entry, and `sitemap.xml` / `robots.txt` are
 * generated from it at build time. A route cannot be added to one of those and
 * forgotten in the others, and no page can ship with the homepage's title,
 * description or canonical.
 */

export { SITE_URL };

/**
 * Which page component renders a route. Both the client route table and the
 * server entry hold a Record<PageKey, ...>, so TypeScript refuses to compile if
 * a new page key is added here without a component on both sides.
 */
export type PageKey =
  | "home"
  | "products"
  | "productDetail"
  | "services"
  | "about"
  | "partnerships"
  | "careers"
  | "contact"
  | "privacy"
  | "terms"
  | "notFound";

/** Schema.org type for the page node in the JSON-LD @graph. */
export type PageType = "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";

export interface Crumb {
  name: string;
  path: string;
}

export interface RouteDef {
  /** Absolute site path, no trailing slash (except "/"). */
  path: string;
  page: PageKey;
  /** The page's own <title>. Never the homepage's. Max 70 chars (enforced by test). */
  title: string;
  /** The page's own meta description. Max 200 chars (enforced by test). */
  description: string;
  /** Drives the JSON-LD @graph shape. */
  type: PageType;
  /** Set on product routes; adds a SoftwareApplication node. */
  productId?: string;
  breadcrumbs: Crumb[];
  /** false for the 404 page, which must never be advertised. */
  inSitemap: boolean;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: number;
}

const HOME: Crumb = { name: "Home", path: "/" };
const PRODUCTS: Crumb = { name: "Products", path: "/products" };

/**
 * Per-product <title>. Each is a condensation of that product's existing
 * `seo.title` in src/data/srai.ts, shortened to fit inside 70 characters with
 * the brand suffix attached. Nothing new is claimed here. A product with no
 * entry falls back to "<name> | SRAI Systems", which is always valid.
 */
const PRODUCT_TITLES: Record<string, string> = {
  fundos: "FundOS — scheme eligibility & RBI compliance | SRAI Systems",
  smartbhoomi: "SmartBhoomi — AI farm management for India | SRAI Systems",
  hotelai: "Hotel Management AI — hotel & restaurant ops | SRAI Systems",
  modguardian: "ModGuardian — AI content moderation | SRAI Systems",
  thecrows: "TheCrows — trust scores and escrow | SRAI Systems",
  sraiauctions: "SRAI Auctions — live bidding with escrow | SRAI Systems",
  foodieflow: "FoodieFlow — hyperlocal food discovery | SRAI Systems",
  sraiquant: "SRAI Quant — systematic trading for India | SRAI Systems",
};

const marketingRoutes: RouteDef[] = [
  {
    path: "/",
    page: "home",
    title: "SRAI Systems — AI product studio building for India",
    description:
      "SRAI Systems is an AI product studio in Pune, India. Eight products built in-house — FundOS, SmartBhoomi and more — plus AI engineering for other companies.",
    type: "WebPage",
    breadcrumbs: [HOME],
    inSitemap: true,
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    path: "/products",
    page: "products",
    title: "Products — eight AI platforms built by SRAI Systems",
    description:
      "Every product SRAI Systems has built, with its honest deployment status: FundOS, SmartBhoomi, Hotel Management AI, ModGuardian, TheCrows, SRAI Auctions, FoodieFlow and SRAI Quant.",
    type: "CollectionPage",
    breadcrumbs: [HOME, PRODUCTS],
    inSitemap: true,
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/services",
    page: "services",
    title: "Services — AI engineering, scoped before it starts | SRAI Systems",
    description:
      "AI product engineering, computer vision and NLP, cloud architecture, data pipelines and automation from SRAI Systems. Scoped and priced before any work begins.",
    type: "CollectionPage",
    breadcrumbs: [HOME, { name: "Services", path: "/services" }],
    inSitemap: true,
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/about",
    page: "about",
    title: "About SRAI Systems — an AI product studio in Pune",
    description:
      "Who SRAI Systems is, how we work, and what we will and will not claim. An engineering-first AI product studio in Pune, India, building for Indian conditions.",
    type: "AboutPage",
    breadcrumbs: [HOME, { name: "About", path: "/about" }],
    inSitemap: true,
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/partnerships",
    page: "partnerships",
    title: "Partnerships and investors | SRAI Systems",
    description:
      "Pilot partnerships, distribution partners and investor conversations at SRAI Systems — what we are looking for, and what a first conversation looks like.",
    type: "WebPage",
    breadcrumbs: [HOME, { name: "Partnerships", path: "/partnerships" }],
    inSitemap: true,
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/careers",
    page: "careers",
    title: "Careers at SRAI Systems — build things people use",
    description:
      "Working at SRAI Systems in Pune: what the work is like, the downsides stated plainly, and how hiring actually runs here. Open applications always welcome.",
    type: "WebPage",
    breadcrumbs: [HOME, { name: "Careers", path: "/careers" }],
    inSitemap: true,
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/contact",
    page: "contact",
    title: "Contact SRAI Systems — start a project or ask a question",
    description:
      "Tell SRAI Systems what you are trying to build and get a straight answer about whether we are the right fit. Pune, India — contact@sraisystems.in.",
    type: "ContactPage",
    breadcrumbs: [HOME, { name: "Contact", path: "/contact" }],
    inSitemap: true,
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/privacy",
    page: "privacy",
    title: "Privacy policy | SRAI Systems",
    description:
      "How SRAI Systems handles personal data collected through this website, including analytics and contact-form submissions. Currently a draft pending legal review.",
    type: "WebPage",
    breadcrumbs: [HOME, { name: "Privacy", path: "/privacy" }],
    inSitemap: true,
    changefreq: "yearly",
    priority: 0.2,
  },
  {
    path: "/terms",
    page: "terms",
    title: "Terms of service | SRAI Systems",
    description:
      "The terms that govern use of the SRAI Systems website and the products linked from it. Currently a draft pending legal review.",
    type: "WebPage",
    breadcrumbs: [HOME, { name: "Terms", path: "/terms" }],
    inSitemap: true,
    changefreq: "yearly",
    priority: 0.2,
  },
];

/** One route per product, expanded from src/data/srai.ts. */
const productDetailRoutes: RouteDef[] = products.map((p) => ({
  path: `/products/${p.id}`,
  page: "productDetail" as const,
  title: PRODUCT_TITLES[p.id] ?? `${p.name} | SRAI Systems`,
  description: p.seo.description,
  type: "WebPage" as const,
  productId: p.id,
  breadcrumbs: [HOME, PRODUCTS, { name: p.name, path: `/products/${p.id}` }],
  inSitemap: true,
  changefreq: "monthly" as const,
  priority: 0.8,
}));

/**
 * The 404 page. Prerendered to dist/404.html and served by the host with a real
 * 404 status. Never listed in the sitemap.
 */
export const notFoundRoute: RouteDef = {
  path: "/404",
  page: "notFound",
  title: "Page not found (404) | SRAI Systems",
  description:
    "That page does not exist on sraisystems.in. Jump to the products, services or contact page instead, or tell us what you were looking for.",
  type: "WebPage",
  breadcrumbs: [HOME],
  inSitemap: false,
  changefreq: "yearly",
  priority: 0.0,
};

/** Every page this site renders, 404 included. */
export const routes: RouteDef[] = [...marketingRoutes, ...productDetailRoutes, notFoundRoute];

/** Everything the prerenderer must emit as dist/<path>/index.html. */
export const prerenderRoutes: RouteDef[] = routes.filter((r) => r !== notFoundRoute);

/** Everything the sitemap advertises. */
export const sitemapRoutes: RouteDef[] = routes.filter((r) => r.inSitemap);

export const routeFor = (path: string): RouteDef | undefined =>
  routes.find((r) => r.path === path);

/**
 * React Router path patterns, in match order. `productDetail` collapses the
 * eight product routes into one `:slug` pattern so the client keeps a single
 * lazy chunk for all of them.
 *
 * Every entry in `routes` must be matched by one of these — src/test/seo.test.ts
 * asserts it, so a new route cannot be added without a pattern to render it.
 */
export const routePatterns: { pattern: string; page: PageKey }[] = [
  { pattern: "/", page: "home" },
  { pattern: "/products", page: "products" },
  { pattern: "/products/:slug", page: "productDetail" },
  { pattern: "/services", page: "services" },
  { pattern: "/about", page: "about" },
  { pattern: "/partnerships", page: "partnerships" },
  { pattern: "/careers", page: "careers" },
  { pattern: "/contact", page: "contact" },
  { pattern: "/privacy", page: "privacy" },
  { pattern: "/terms", page: "terms" },
  { pattern: "*", page: "notFound" },
];

/** Absolute URL for a site path. */
export const absoluteUrl = (path: string): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
