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
 * WIRED INTO `npm run build`, so a regression fails the build rather than a
 * report nobody reads. The HTML assertions need no browser and always run. The
 * headless-Chromium pass runs when a browser is available and is SKIPPED, with
 * a notice, when it is not — a CI or hosting build image without Chromium must
 * not be able to turn a broken prerender into a green deploy, but it must also
 * not fail a deploy for a reason that has nothing to do with the site. Pass
 * --no-browser to skip it deliberately.
 *
 * Run on its own:  npm run verify
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Playwright is imported dynamically, not at the top of the file. This script
 * gates `npm run build`, which also runs on the host's build image — where
 * neither the package nor a browser binary is guaranteed. A missing browser
 * must degrade to "skipped, and said so", never to a failed deploy and never to
 * a module-resolution crash before a single SEO assertion has run.
 */
const SKIP_BROWSER = process.argv.includes("--no-browser");

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

/**
 * index.html carries a long comment explaining why no canonical may be
 * hardcoded there — including the literal text `<link rel="canonical">`. Every
 * structural assertion runs against the document with comments removed, so the
 * warning about the bug cannot be mistaken for the bug.
 */
const withoutComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

/** Every JSON-LD block on the page, parsed. Throws the raw text on a parse failure. */
function jsonLdBlocks(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map((m) => {
    const raw = m[1].replace(/\\u003c/g, "<");
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (error) {
      return { ok: false, error: String(error), raw: raw.slice(0, 120) };
    }
  });
}

/** Collect every @id defined anywhere in a graph, including nested nodes. */
function collectIds(value, into = new Set()) {
  if (Array.isArray(value)) {
    for (const v of value) collectIds(v, into);
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    // A node that is ONLY {"@id": ...} is a reference, not a definition.
    if (typeof value["@id"] === "string" && keys.length > 1) into.add(value["@id"]);
    for (const v of Object.values(value)) collectIds(v, into);
  }
  return into;
}

/** Every pure {"@id": ...} reference in a graph. */
function collectRefs(value, into = []) {
  if (Array.isArray(value)) {
    for (const v of value) collectRefs(v, into);
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && typeof value["@id"] === "string") into.push(value["@id"]);
    else for (const v of Object.values(value)) collectRefs(v, into);
  }
  return into;
}

/**
 * React escapes apostrophes and quotes when it serialises text, so the rendered
 * HTML says `farmer&#x27;s` where the page says `farmer's`. Comparing JSON-LD
 * strings against page text without decoding first reports false mismatches on
 * every sentence containing an apostrophe.
 */
const decode = (s = "") =>
  s
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&");

/** Body text of a served document, as a crawler would reduce it. */
function bodyTextOf(html) {
  const body = html.split('<div id="root">')[1] ?? html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * How far into the body text the first <h2> ending in "?" appears.
 *
 * The answer block is the single highest-leverage thing on these pages: a
 * question a buyer would actually type, answered completely in the paragraph
 * below it. Buried three screens down it stops being the passage an engine
 * lifts, so its position is asserted, not just its existence.
 */
const ANSWER_WITHIN = 1500;
function answerHeadingAt(html) {
  const body = html.split('<div id="root">')[1] ?? html;
  for (const m of body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)) {
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!text.endsWith("?")) continue;
    const before = body
      .slice(0, m.index)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { text, at: before.length };
  }
  return null;
}

function visibleText(html) {
  const body = html.split('<div id="root">')[1] ?? html;
  return decode(
    body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

const home = prerenderRoutes.find((r) => r.path === "/");
const seenTitles = new Map();
const seenDescriptions = new Map();

console.log("HTTP (no browser — this is what a crawler receives)");

for (const route of prerenderRoutes) {
  const res = await fetch(`${origin}${route.path}`, { redirect: "manual" });
  const html = await res.text();
  const clean = withoutComments(html);
  const label = route.path;

  check(res.status === 200, `${label}: HTTP 200`, `got ${res.status}`);

  const title = decode(between(html, /<title>([\s\S]*?)<\/title>/));
  const description = decode(between(html, /<meta name="description" content="([\s\S]*?)">/));
  const canonical = decode(between(clean, /<link rel="canonical" href="([^"]*)"/));

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

  // Exactly one canonical. Comments are stripped first: index.html's warning
  // about hardcoded canonicals contains the literal tag text.
  const canonicals = (clean.match(/<link rel="canonical"/g) ?? []).length;
  check(canonicals === 1, `${label}: exactly one <link rel="canonical">`, `got ${canonicals}`);

  const text = visibleText(html);
  check(
    text.length > MIN_BODY_TEXT,
    `${label}: >${MIN_BODY_TEXT} chars of body text in the SERVED html`,
    `got ${text.length}`,
  );

  const h1s = (clean.match(/<h1[\s>]/g) ?? []).length;
  check(h1s === 1, `${label}: exactly one <h1>`, `got ${h1s}`);

  // The answer block, and how early it is.
  const answer = answerHeadingAt(html);
  check(answer !== null, `${label}: has an <h2> phrased as a question`);
  if (answer) {
    check(
      answer.at < ANSWER_WITHIN,
      `${label}: answer <h2> within the first ${ANSWER_WITHIN} chars of body text`,
      `"${answer.text}" appears ${answer.at} chars in`,
    );
  }

  // Every JSON-LD block on the page must parse, not just the first.
  const blocks = jsonLdBlocks(html);
  check(blocks.length >= 1, `${label}: has JSON-LD`, `found ${blocks.length} blocks`);
  for (const [i, b] of blocks.entries()) {
    check(b.ok, `${label}: JSON-LD block ${i + 1} parses`, b.ok ? "" : `${b.error} — ${b.raw}`);
  }

  const graph = blocks.find((b) => b.ok)?.value ?? null;
  if (graph) {
    const nodes = graph["@graph"] ?? [];
    check(Array.isArray(nodes) && nodes.length >= 4, `${label}: JSON-LD @graph`);
    // A node may carry several types (a product page is WebPage AND FAQPage).
    const types = nodes.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    check(types.includes("Organization"), `${label}: JSON-LD Organization`);
    check(types.includes("WebSite"), `${label}: JSON-LD WebSite`);
    check(types.includes("BreadcrumbList"), `${label}: JSON-LD BreadcrumbList`);
    check(types.includes(route.type), `${label}: JSON-LD ${route.type}`);
    if (route.productId) {
      check(types.includes("SoftwareApplication"), `${label}: JSON-LD SoftwareApplication`);
      check(types.includes("FAQPage"), `${label}: JSON-LD FAQPage`);
    }
    if (route.path === "/products") check(types.includes("ItemList"), `${label}: JSON-LD ItemList`);
    if (route.path === "/services") check(types.includes("Service"), `${label}: JSON-LD Service`);

    const json = JSON.stringify(graph);

    // Never claim traction, ratings or a vacancy the company does not have.
    check(
      !/aggregateRating|ratingValue|"review"|"offers"|JobPosting/i.test(json),
      `${label}: no rating / review / offers / JobPosting markup`,
    );

    // The serializer must drop empty values rather than assert emptiness.
    check(!/"sameAs":\s*\[\]/.test(json), `${label}: no empty sameAs array`);
    check(!/:\s*(null|undefined)([,}\]])/.test(json), `${label}: no null or undefined values`);

    // Every {"@id": x} reference must resolve to a node defined in this graph.
    const defined = collectIds(graph);
    const dangling = [...new Set(collectRefs(graph))].filter((id) => !defined.has(id));
    check(dangling.length === 0, `${label}: every @id reference resolves`, dangling.join(", "));

    // dateModified is the page's own content date, and it is on the page too.
    const page = nodes.find((n) => String(n["@id"]).endsWith("#webpage"));
    check(page?.dateModified === route.lastUpdated, `${label}: dateModified matches the route`);

    // FAQ markup must match words that are visible on the page.
    for (const node of nodes) {
      for (const q of node.mainEntity ?? []) {
        check(
          text.includes(q.name),
          `${label}: FAQ question is visible on the page`,
          JSON.stringify(q.name),
        );
        check(
          text.includes(q.acceptedAnswer?.text ?? ""),
          `${label}: FAQ answer is visible on the page`,
          JSON.stringify(String(q.acceptedAnswer?.text).slice(0, 50)),
        );
      }
    }
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

  // llms.txt: checked for existence and shape only. See the comment on
  // buildLlmsTxt() in src/lib/seo.ts for why nothing more is invested in it.
  const llms = await (await fetch(`${origin}/llms.txt`)).text();
  check(llms.startsWith("# SRAI Systems"), "llms.txt names the site");
  for (const route of prerenderRoutes) {
    check(llms.includes(absoluteUrl(route.path)), `llms.txt lists ${route.path}`);
  }
  console.log(
    `  ${green("✓")} ${"sitemap + robots + llms.txt".padEnd(28)} ${dim(`${prerenderRoutes.length} urls`)}`,
  );
}

/* ── Browser checks ───────────────────────────────────────────────────── */

/**
 * The browser pass is best-effort by design. These assertions (console errors,
 * hydration, horizontal overflow) need a real engine; the SEO assertions above
 * do not, and those are the ones that must gate a deploy. A build image with no
 * Chromium skips this and says so, loudly, rather than failing a deploy for a
 * missing binary or quietly passing as though it had run.
 */
let browser = null;
if (SKIP_BROWSER) {
  console.log(dim("\nHeadless Chromium — skipped (--no-browser)"));
} else {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch();
    console.log("\nHeadless Chromium");
  } catch (error) {
    console.log(
      `\n${dim("Headless Chromium — SKIPPED, no browser available:")} ${
        error instanceof Error ? error.message.split("\n")[0] : String(error)
      }`,
    );
    console.log(
      dim("  the HTML assertions above still ran; run `npm run verify` locally for the browser pass."),
    );
  }
}

if (browser) {

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
}

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
