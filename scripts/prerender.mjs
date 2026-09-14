/**
 * SRAI Systems — post-build prerender.
 *
 * Runs after `vite build` and turns the single-page shell into one real HTML
 * document per route, so the FIRST HTTP response carries the page's own markup,
 * its own <title>, its own description and its own canonical.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  DO NOT ADD AN SPA CATCH-ALL REWRITE ON ANY HOST.
 *
 *  A `rewrites: [{ source: "/(.*)", destination: "/index.html" }]` in
 *  vercel.json, a `/*  /index.html  200` line in a Netlify `_redirects`, or an
 *  equivalent Cloudflare rule silently undoes everything this script does: the
 *  host serves the HOMEPAGE document for /services and /products/fundos, the
 *  browser then client-renders the right page, and the site looks perfect to a
 *  human while every crawler sees one page repeated sixteen times.
 *
 *  The host must serve dist/<path>/index.html from the filesystem, and answer
 *  unknown paths with dist/404.html and a real 404 status.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr", "entry-server.js");

/** A page rendering less body text than this is a broken prerender, not a short page. */
const MIN_BODY_TEXT = 400;

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function fail(message, details = []) {
  console.error(`\n${red("✗ prerender failed")} — ${message}`);
  for (const d of details) console.error(`  ${d}`);
  console.error("");
  process.exit(1);
}

if (!existsSync(SSR_ENTRY)) {
  fail("no SSR bundle found", [
    `expected ${SSR_ENTRY}`,
    "run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first (the `build` script does this).",
  ]);
}
if (!existsSync(join(DIST, "index.html"))) {
  fail("no client build found", [`expected ${join(DIST, "index.html")}`, "run `vite build` first."]);
}

const server = await import(pathToFileURL(SSR_ENTRY).href);
const {
  render,
  prerenderRoutes,
  notFoundRoute,
  headTagsFor,
  titleTag,
  descriptionTag,
  buildSitemap,
  buildRobots,
} = server;

const template = readFileSync(join(DIST, "index.html"), "utf8");

for (const marker of ["<!--%SEO%-->", "<!--%APP%-->"]) {
  if (!template.includes(marker)) {
    fail(`index.html is missing the ${marker} slot`, [
      "scripts/prerender.mjs needs both slots to inject per-route head tags and markup.",
    ]);
  }
}

/* ── framer-motion entry states ───────────────────────────────────────────
 *
 * Even under <MotionConfig isStatic>, motion components serialise their
 * `initial` prop into the inline style. Shipping that means shipping markup
 * that is present in the DOM and invisible on screen — which is worse than
 * shipping nothing, because it looks fine to a crawler and blank to a person
 * with JavaScript disabled or still loading.
 *
 * So: strip a hard `opacity:0`, any blur filter, and any translate transform.
 * A non-zero opacity (the footer watermark's 0.018, a demo row's 0.75) is a
 * deliberate design value and is left alone.
 */
function neutraliseEntryStates(html) {
  let stripped = 0;
  const out = html.replace(/ style="([^"]*)"/g, (_match, css) => {
    const kept = css
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .filter((decl) => {
        const idx = decl.indexOf(":");
        if (idx === -1) return true;
        const prop = decl.slice(0, idx).trim().toLowerCase();
        const value = decl.slice(idx + 1).trim().toLowerCase();
        if (prop === "opacity" && Number.parseFloat(value) === 0) return (stripped++, false);
        if (prop === "filter" && value.includes("blur(")) return (stripped++, false);
        if ((prop === "transform" || prop === "-webkit-transform") && value.includes("translate"))
          return (stripped++, false);
        return true;
      })
      .join(";");
    return kept ? ` style="${kept}"` : "";
  });
  return { html: out, stripped };
}

/** Visible text only: no tags, no <script>/<style> contents, whitespace collapsed. */
function bodyText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function documentFor(route, appHtml) {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, titleTag(route))
    .replace(/<meta name="description" content="[\s\S]*?">/, descriptionTag(route))
    .replace("<!--%SEO%-->", headTagsFor(route))
    .replace("<!--%APP%-->", appHtml);
}

function outputPath(path) {
  return path === "/" ? join(DIST, "index.html") : join(DIST, path.replace(/^\//, ""), "index.html");
}

function emit(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents, "utf8");
}

const thin = [];
const broken = [];
let totalStripped = 0;

function renderRoute(route, file) {
  let raw;
  try {
    raw = render(route.path);
  } catch (error) {
    broken.push(`${route.path} — ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const { html, stripped } = neutraliseEntryStates(raw);
  totalStripped += stripped;

  const text = bodyText(html);
  if (text.length < MIN_BODY_TEXT) {
    thin.push(`${route.path} — ${text.length} chars of body text (minimum ${MIN_BODY_TEXT})`);
    return;
  }

  const doc = documentFor(route, html);

  // The canonical is the reason this script exists. Never ship a page without one.
  if (!doc.includes(`rel="canonical"`)) {
    broken.push(`${route.path} — no canonical was injected`);
    return;
  }

  emit(file, doc);
  console.log(`  ${green("✓")} ${route.path.padEnd(28)} ${dim(`${text.length} chars`)}`);
}

console.log("\nPrerendering routes…");
for (const route of prerenderRoutes) renderRoute(route, outputPath(route.path));
renderRoute(notFoundRoute, join(DIST, "404.html"));

if (broken.length) fail("a route failed to render", broken);
if (thin.length) {
  fail("pages rendered almost no text — a partial prerender must never reach production", [
    ...thin,
    "",
    "Most likely causes: a page component threw during renderToString, or a route",
    "resolved to a Suspense fallback because a page was imported with React.lazy",
    "in src/entry-server.tsx.",
  ]);
}

/* ── sitemap.xml + robots.txt ─────────────────────────────────────────────
 * Generated here, from the same route array the prerenderer just walked, so a
 * new route cannot exist in one and be missing from the other.
 */
const lastmod = new Date().toISOString().slice(0, 10);
emit(join(DIST, "sitemap.xml"), buildSitemap(lastmod));
emit(join(DIST, "robots.txt"), buildRobots());

console.log(
  `\n${green("✓")} ${prerenderRoutes.length + 1} documents, sitemap.xml and robots.txt written to dist/`,
);
console.log(dim(`  ${totalStripped} framer-motion entry-state declarations neutralised`));
console.log(
  dim("  reminder: the host must NOT rewrite unknown paths to /index.html — see the note at the top of this file.\n"),
);
