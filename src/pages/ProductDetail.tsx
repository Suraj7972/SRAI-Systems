import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, ImageOff } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductIcon from "@/components/ProductIcon";
import StatusBadge, { statusHelp } from "@/components/StatusBadge";
import ProductGlyph from "@/components/ProductGlyph";
import FeatureWalkthrough from "@/components/FeatureWalkthrough";
import { ProductDemo, hasDemo } from "@/components/demos";
import { products, type Product } from "@/data/srai";
import { track } from "@/lib/analytics";

/** Short rail labels derived from each screenshot's caption lead-in. */
const railLabels: Record<string, string[]> = {
  fundos: [
    "Grant eligibility", "Scheme catalogue", "Investor readiness", "ODI / FEMA",
    "Investor directory", "Pipeline", "Data room", "Overview",
  ],
};

const ctaFor = (p: Product) => {
  if (p.status === "LIVE" && p.url) return { label: `Open ${p.name}`, href: p.url, external: true };
  if (p.status === "IN DEVELOPMENT" || p.status === "COMING SOON")
    return { label: "Get notified when it launches", href: `/contact?product=${p.id}`, external: false };
  return { label: "Book a walkthrough", href: `/contact?product=${p.id}`, external: false };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.id === slug);

  useEffect(() => {
    if (!product) return;
    document.title = product.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", product.seo.description);
    track("product_page_view", { product: product.id, status: product.status });
  }, [product]);

  if (!product) return <Navigate to="/products" replace />;

  const cta = ctaFor(product);
  const accent = `hsl(${product.accentHsl})`;
  const related = products.filter((p) => product.related.includes(p.id));

  return (
    <Layout>
      {/* ── Identity ── */}
      <section className="pt-14 pb-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 20% 0%, hsl(${product.accentHsl} / 0.10), transparent 70%)`,
        }} />
        <div className="container mx-auto px-4 md:px-8 relative">
          <SectionReveal>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link to="/products" className="hover:text-foreground transition-colors">Products</Link></li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground">{product.name}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-10 lg:gap-16 items-center">
            <div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `hsl(${product.accentHsl} / 0.12)`, border: `1px solid hsl(${product.accentHsl} / 0.25)` }}>
                <ProductIcon name={product.icon} className="w-7 h-7" style={{ color: accent }} />
              </div>
              <StatusBadge status={product.status} size="md" withHelp />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5">
              {product.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {product.oneLiner}
            </p>

            <div className="flex flex-wrap gap-3">
              {cta.external ? (
                <a href={cta.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("outbound_product_click", { product: product.id, location: "product_page_hero" })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ background: accent }}>
                  {cta.label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : (
                <Link to={cta.href}
                  onClick={() => track("product_waitlist_cta_click", { product: product.id, location: "product_page_hero" })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ background: accent }}>
                  {cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-foreground border border-border hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                All products
              </Link>
            </div>
            </div>

            <div className="hidden lg:block">
              <ProductGlyph productId={product.id} accentHsl={product.accentHsl} className="w-full max-w-[340px] mx-auto" />
            </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Walkthrough / evidence ── */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            {product.screenshots.length > 0 ? (
              <>
                <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">See it working</h2>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Real screens from the product
                  </p>
                </div>
                <FeatureWalkthrough
                  screenshots={product.screenshots}
                  labels={railLabels[product.id] ?? product.screenshots.map((_, i) => `Screen ${i + 1}`)}
                  productId={product.id}
                  accentHsl={product.accentHsl}
                />
              </>
            ) : hasDemo(product.id) ? (
              <>
                <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">Try it yourself</h2>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Runs live in your browser
                  </p>
                </div>
                <ProductDemo productId={product.id} />
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-dashed border-border px-4 py-3">
                  <ImageOff className="w-4 h-4 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground flex-1 min-w-[240px]">
                    A working model of the mechanic, not the product's own interface.{" "}
                    {product.status === "COMING SOON" || product.status === "IN DEVELOPMENT"
                      ? `${product.name} is still being built — tell us your use case and we'll keep you posted as it lands.`
                      : `${product.name} is built, and we'll show you the real thing on a call.`}
                  </p>
                  <Link to={`/contact?product=${product.id}`}
                    onClick={() => track("product_waitlist_cta_click", { product: product.id, location: "demo_footer" })}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    Book a walkthrough <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <ImageOff className="w-7 h-7 text-muted-foreground/50 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground mb-2">Screens not published yet</h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
                  {product.status === "COMING SOON" || product.status === "IN DEVELOPMENT"
                    ? `${product.name} is still in development, so there is nothing to show yet.`
                    : `${product.name} is built and complete, but we haven't published its interface publicly yet.`}
                </p>
                <Link to={`/contact?product=${product.id}`}
                  onClick={() => track("product_waitlist_cta_click", { product: product.id, location: "empty_gallery" })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  Book a walkthrough <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </SectionReveal>
        </div>
      </section>

      {/* ── Interactive demo (products that also have screenshots) ── */}
      {product.screenshots.length > 0 && hasDemo(product.id) && (
        <section className="pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <SectionReveal>
              <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">Try it yourself</h2>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Runs live in your browser
                </p>
              </div>
              <ProductDemo productId={product.id} />
            </SectionReveal>
          </div>
        </section>
      )}

      {/* ── Problem / Solution ── */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 max-w-5xl">
            <SectionReveal>
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">The problem</h2>
              <p className="text-lg text-foreground leading-relaxed">{product.problem}</p>
            </SectionReveal>
            <SectionReveal delay={0.08}>
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] mb-4" style={{ color: accent }}>What {product.name} does</h2>
              <p className="text-lg text-foreground leading-relaxed">{product.solution}</p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      {product.capabilities.length > 0 && (
        <section className="py-14 border-t border-border/60">
          <div className="container mx-auto px-4 md:px-8">
            <SectionReveal><h2 className="text-2xl font-bold text-foreground mb-8">Core capabilities</h2></SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.capabilities.map((c, i) => (
                <SectionReveal key={c.title} delay={i * 0.05}>
                  <div className="h-full card-tier p-6">
                    <ProductIcon name={c.icon} className="w-5 h-5 mb-4" style={{ color: accent }} />
                    <h3 className="text-base font-semibold text-foreground mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Feature list ── */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal><h2 className="text-2xl font-bold text-foreground mb-8">What's included</h2></SectionReveal>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 max-w-4xl">
            {product.features.map((f, i) => (
              <SectionReveal key={f} delay={i * 0.03}>
                <li className="flex items-start gap-3 text-[15px] text-foreground">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: accent }} aria-hidden="true" />
                  <span>{f}</span>
                </li>
              </SectionReveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ── */}
      {product.howItWorks.length > 0 && (
        <section className="py-14 border-t border-border/60">
          <div className="container mx-auto px-4 md:px-8">
            <SectionReveal><h2 className="text-2xl font-bold text-foreground mb-8">How it works</h2></SectionReveal>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {product.howItWorks.map((s, i) => (
                <SectionReveal key={s.step} delay={i * 0.06}>
                  <li className="card-tier p-6 h-full">
                    <span className="text-xs font-mono font-bold" style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-base font-semibold text-foreground mt-3 mb-2">{s.step}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                  </li>
                </SectionReveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Who it's for + differentiator ── */}
      <section className="py-14 border-t border-border/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <SectionReveal>
              <h2 className="text-2xl font-bold text-foreground mb-6">Who it's for</h2>
              <ul className="space-y-3">
                {product.audience.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: accent }} aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </SectionReveal>
            <SectionReveal delay={0.08}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Why it's different</h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{product.differentiator}</p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── Related + CTA ── */}
      <section className="py-16 border-t border-border/60">
        <div className="container mx-auto px-4 md:px-8">
          {related.length > 0 && (
            <SectionReveal>
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">Related products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14 max-w-3xl">
                {related.map((r) => (
                  <Link key={r.id} to={`/products/${r.id}`}
                    className="group flex items-center gap-4 card-tier card-interactive p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `hsl(${r.accentHsl} / 0.12)` }}>
                      <ProductIcon name={r.icon} className="w-5 h-5" style={{ color: `hsl(${r.accentHsl})` }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.tagline}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </SectionReveal>
          )}

          <SectionReveal>
            <div className="panel p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {product.status === "LIVE" ? `Try ${product.name} today` : `Want to see ${product.name}?`}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {product.status === "LIVE"
                  ? "It's live and free to start. No sales call required."
                  : product.status === "COMING SOON" || product.status === "IN DEVELOPMENT"
                  ? `${statusHelp(product.status)}. Tell us what you need it to do — early input shapes what we build.`
                  : `${statusHelp(product.status)}. Tell us your use case and we'll show you the working product.`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {cta.external ? (
                  <a href={cta.href} target="_blank" rel="noopener noreferrer"
                    onClick={() => track("outbound_product_click", { product: product.id, location: "product_page_footer" })}
                    className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-primary-foreground hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    style={{ background: accent }}>{cta.label} <ArrowUpRight className="w-4 h-4" /></a>
                ) : (
                  <Link to={cta.href}
                    onClick={() => track("product_waitlist_cta_click", { product: product.id, location: "product_page_footer" })}
                    className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-primary-foreground hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    style={{ background: accent }}>{cta.label} <ArrowRight className="w-4 h-4" /></Link>
                )}
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 press rounded-xl font-semibold text-sm text-foreground border border-border hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  Talk to us
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
