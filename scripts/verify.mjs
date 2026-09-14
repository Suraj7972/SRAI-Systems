/**
 * SRAI Systems — post-build verification.
 *
 * Serves dist/ EXACTLY the way Vercel will — clean URLs, no trailing slash, and
 * crucially NO SPA CATCH-ALL REWRITE — then checks every route over raw HTTP and
 * again in headless Chromium at 390px and 1440px.
 *
 * The catch-all is the point. With `rewrites: [{ source: "/(.*)", destination:
 * "/index.html" }]` every check below still passes in a browser while the served
 * HTML is the homepage on all sixteen URLs. This server refuses to do that, so
 * if the prerender regresses, this script fails instead of the search index.
 *
 * Run after `npm run build`:  npm run verify
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr", "entry-server.js");

const MIN_BODY_TEXT = 400;
const VIEWPORTS = [
  { name: "390px", width: 390, height: 844 },
  { name: "1440px", width: 1440, height: 900 },
];

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const failures = [];
let checks = 0;

function check(ok, label, detail) {
  checks++;
  if (!ok) failures.push(detail ? `${label} — ${detail}` : label);
  return ok;
}

if (!existsSync(DIST) || !existsSync(SSR_ENTRY)) {
  console.error(red("\n✗ no build found. Run `npm run build` first.\n"));
  process.exit(1);
}

const { prerenderRoutes, notFoundRoute, absoluteUrl } = await import(pathToFileURL(SSR_ENTRY).href);

/* ── A static server that behaves like Vercel ─────────────────────────── */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

async function fileOr(path) {
  try {
    if ((await stat(path)).isFile()) return path;
  } catch {
    /* not a file */
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let pathname = decodeURIComponent(url.pathname);

  // trailingSlash: false — Vercel 308s /services/ to /services.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    res.writeHead(308, { Location: pathname.replace(/\/+$/, "") + url.search });
    return res.end();
  }

  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const target =
    (await fileOr(join(DIST, safe))) ??
    (await fileOr(join(DIST, safe, "index.html"))) ??
    (await fileOr(join(DIST, `${safe}.html`))); // cleanUrls

  if (!target) {
    // NO catch-all. Unknown paths get 404.html with a real 404 status.
    const body = await readFile(join(DIST, "404.html"));
    res.writeHead(404, { "Content-Type": MIME[".html"], "X-Content-Type-Options": "nosniff" });
    return res.end(body);
  }

  const body = await readFile(target);
  res.writeHead(200, {
    "Content-Type": MIME[extname(target)] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
});

const port = await new Promise((done) => {
  server.listen(0, "127.0.0.1", () => done(server.address().port));
});
const origin = `http://127.0.0.1:${port}`;
console.log(dim(`\nserving dist/ at ${origin} (clean URLs, no catch-all)\n`));

/* ── Raw HTTP checks: what a crawler is actually handed ───────────────── */

const between = (html, re) => (html.match(re) ?? [])[1];

function visibleText(html) {
  const body = html.split('<div id="root">')[1] ?? html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const decode = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

const home = prerenderRoutes.find((r) => r.path === "/");
const seenTitles = new Map();
const seenDescriptions = new Map();

console.log("HTTP (no browser — this is what a crawler receives)");

for (const route of prerenderRoutes) {
  const res = await fetch(`${origin}${route.path}`, { redirect: "manual" });
  const html = await res.text();
  const label = route.path;

  check(res.status === 200, `${label}: HTTP 200`, `got ${res.status}`);

  const title = decode(between(html, /<title>([\s\S]*?)<\/title>/));
  const description = decode(between(html, /<meta name="description" content="([\s\S]*?)">/));
  const canonical = decode(between(html, /<link rel="canonical" href="([^"]*)"/));

  check(title === route.title, `${label}: own <title>`, `got ${JSON.stringify(title)}`);
  check(
    description === route.description,
    `${label}: own meta description`,
    `got ${JSON.stringify(description?.slice(0, 60))}`,
  );
  if (route !== home) {
    check(title !== home.title, `${label}: title is not the homepage's`);
    check(description !== home.description, `${label}: description is not the homepage's`);
  }
  check(
    canonical === absoluteUrl(route.path),
    `${label}: canonical is its own URL`,
    `got ${JSON.stringify(canonical)}`,
  );

  const prev = seenTitles.get(title);
  check(prev === undefined, `${label}: title is unique`, `also used by ${prev}`);
  seenTitles.set(title, label);
  const prevD = seenDescriptions.get(description);
  check(prevD === undefined, `${label}: description is unique`, `also used by ${prevD}`);
  seenDescriptions.set(description, label);

  const text = visibleText(html);
  check(
    text.length > MIN_BODY_TEXT,
    `${label}: >${MIN_BODY_TEXT} chars of body text in the SERVED html`,
    `got ${text.length}`,
  );

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  check(h1s === 1, `${label}: exactly one <h1>`, `got ${h1s}`);

  const ld = between(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let graph = null;
  try {
    graph = JSON.parse(ld ?? "");
  } catch {
    /* handled below */
  }
  check(graph !== null, `${label}: valid JSON-LD`);
  if (graph) {
    check(Array.isArray(graph["@graph"]) && graph["@graph"].length >= 4, `${label}: JSON-LD @graph`);
    const types = (graph["@graph"] ?? []).map((n) => n["@type"]);
    check(types.includes("Organization"), `${label}: JSON-LD Organization`);
    check(types.includes("WebSite"), `${label}: JSON-LD WebSite`);
    check(types.includes("BreadcrumbList"), `${label}: JSON-LD BreadcrumbList`);
    check(types.includes(route.type), `${label}: JSON-LD ${route.type}`);
    if (route.productId) {
      check(types.includes("SoftwareApplication"), `${label}: JSON-LD SoftwareApplication`);
    }
    // Never claim traction the company does not have.
    const json = JSON.stringify(graph);
    check(!/aggregateRating|"review"|"offers"/i.test(json), `${label}: no rating/review/offers markup`);
  }

  console.log(`  ${green("✓")} ${label.padEnd(28)} ${dim(`${text.length} chars · ${title.length}-char title`)}`);
}

/* A real 404, not a soft 200 serving the homepage. */
{
  const res = await fetch(`${origin}/products/does-not-exist`, { redirect: "manual" });
  const html = await res.text();
  check(res.status === 404, "/products/does-not-exist: HTTP 404", `got ${res.status}`);
  const title = decode(between(html, /<title>([\s\S]*?)<\/title>/));
  check(title === notFoundRoute.title, "/products/does-not-exist: 404 title", `got ${JSON.stringify(title)}`);
  check(title !== home.title, "/products/does-not-exist: NOT the homepage document");
  check(/noindex/.test(html), "/products/does-not-exist: 404 is noindex");
  console.log(`  ${green("✓")} ${"/products/does-not-exist".padEnd(28)} ${dim(`${res.status} ${title}`)}`);
}

/* sitemap + robots */
{
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  for (const route of prerenderRoutes) {
    check(
      sitemap.includes(`<loc>${absoluteUrl(route.path)}</loc>`),
      `sitemap.xml lists ${route.path}`,
    );
  }
  check(!sitemap.includes("/404"), "sitemap.xml does not advertise the 404 page");
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  for (const agent of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Googlebot"]) {
    check(robots.includes(`User-agent: ${agent}`), `robots.txt names ${agent}`);
  }
  check(robots.includes("Sitemap: https://sraisystems.in/sitemap.xml"), "robots.txt points at the sitemap");
  console.log(`  ${green("✓")} ${"sitemap.xml + robots.txt".padEnd(28)} ${dim(`${prerenderRoutes.length} urls`)}`);
}

/* ── Browser checks ───────────────────────────────────────────────────── */

console.log("\nHeadless Chromium");
const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });

  /**
   * Web fonts are third-party and irrelevant to these assertions. They are
   * answered with an empty 200 rather than aborted: an abort would surface as a
   * console error of our own making and mask a real one. Same-origin requests
   * are untouched.
   */
  await context.route("**/*", (route) =>
    route.request().url().startsWith(origin)
      ? route.continue()
      : route.fulfill({ status: 200, body: "", contentType: "text/plain" }),
  );

  const targets = [...prerenderRoutes.map((r) => r.path), "/products/does-not-exist"];

  for (const path of targets) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    // The 404 route is requested on purpose; Chromium logs the document's own
    // 404 status as a console error, which is the correct behaviour, not a bug.
    const expected404 = path === "/products/does-not-exist";
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      if (expected404 && /status of 404/.test(m.text())) return;
      consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => pageErrors.push(e.message));
    page.on("requestfailed", (r) => {
      if (r.url().startsWith(origin)) failedRequests.push(`${r.url()} ${r.failure()?.errorText ?? ""}`);
    });

    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    // Let the client render settle (route chunk + first paint).
    await page.waitForSelector("h1", { timeout: 10_000 }).catch(() => {});

    const label = `${path} @ ${viewport.name}`;
    check(consoleErrors.length === 0, `${label}: no console errors`, consoleErrors.join(" | "));
    check(pageErrors.length === 0, `${label}: no page errors`, pageErrors.join(" | "));
    check(
      failedRequests.length === 0,
      `${label}: no failed same-origin requests`,
      failedRequests.join(" | "),
    );

    const h1Count = await page.locator("h1").count();
    check(h1Count === 1, `${label}: exactly one <h1> after hydration`, `got ${h1Count}`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(overflow <= 0, `${label}: no horizontal overflow`, `${overflow}px wider than the viewport`);

    if (path === "/products/does-not-exist") {
      const heading = (await page.locator("h1").first().textContent()) ?? "";
      check(
        /couldn't find|not found/i.test(heading),
        `${label}: client renders the 404 page, agreeing with the 404 status`,
        `h1 was ${JSON.stringify(heading)}`,
      );
    }

    await page.close();
  }

  console.log(`  ${green("✓")} ${String(targets.length).padStart(2)} routes at ${viewport.name}`);
  await context.close();
}

await browser.close();
server.close();

/* ── Result ───────────────────────────────────────────────────────────── */

if (failures.length) {
  console.error(`\n${red(`✗ ${failures.length} of ${checks} checks failed`)}\n`);
  for (const f of failures) console.error(`  ${red("·")} ${f}`);
  console.error("");
  process.exit(1);
}

console.log(`\n${green(`✓ all ${checks} checks passed`)}`);
console.log(dim("  served without an SPA catch-all — the same way Vercel will serve it.\n"));
