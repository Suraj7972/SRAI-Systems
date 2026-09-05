import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, Search, Hammer, Code, Rocket } from "lucide-react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import IndiaSection from "@/components/IndiaSection";
import SectionReveal from "@/components/SectionReveal";
import ProductCard from "@/components/ProductCard";
import ProductIcon from "@/components/ProductIcon";
import StatusBadge from "@/components/StatusBadge";
import FeatureWalkthrough from "@/components/FeatureWalkthrough";
import LiveShowcase from "@/components/LiveShowcase";
import ProofBand from "@/components/ProofBand";
import { products, services, howWeWork } from "@/data/srai";
import { track } from "@/lib/analytics";

const STEP_ICONS = [Search, Hammer, Code, Rocket];

const Index = () => {
  const fundos = products.find((p) => p.id === "fundos")!;

  useEffect(() => {
    document.title = "SRAI Systems — AI product studio building for India";
  }, []);

  return (
    <Layout>
      <HeroSection />

      {/* ─── Flagship: FundOS, shown with real screens ─── */}
      <section className="py-20 border-t border-border/50" id="flagship">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="max-w-3xl mb-10">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
                Flagship product
              </span>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">FundOS</h2>
                <StatusBadge status={fundos.status} size="md" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-7">{fundos.oneLiner}</p>
              <a href={fundos.url ?? "/products/fundos"} target="_blank" rel="noopener noreferrer"
                onClick={() => track("outbound_product_click", { product: "fundos", location: "homepage_flagship" })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Open FundOS <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <FeatureWalkthrough
              screenshots={fundos.screenshots}
              labels={["Grant eligibility", "Scheme catalogue", "Investor readiness", "ODI / FEMA", "Investor directory", "Pipeline", "Data room", "Overview"]}
              productId="fundos"
              accentHsl={fundos.accentHsl}
            />
          </SectionReveal>

          <SectionReveal delay={0.12}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              {fundos.capabilities.slice(0, 3).map((c) => (
                <div key={c.title} className="card-tier p-6">
                  <ProductIcon name={c.icon} className="w-5 h-5 text-primary mb-4" />
                  <h3 className="text-base font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
            <Link to="/products/fundos"
              onClick={() => track("product_card_click", { product: "fundos", position: 0, variant: "flagship_more" })}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-6 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              Everything FundOS does <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* ─── Proof band ─── */}
      <ProofBand />

      {/* ─── Live showcase: every product, running ─── */}
      <section className="py-20 border-t border-border/50" id="try">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
                Try our products
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Don't take our word for it. Use it.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Eight working demos, one per product. Place a bid, moderate a post, backtest a trading
                strategy — all of it executes here, in your browser, right now.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.08}>
            <LiveShowcase />
          </SectionReveal>
        </div>
      </section>

      {/* ─── Product ecosystem ─── */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
                The portfolio
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Eight products, built end to end
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Each card carries an honest status. What is live says live; what is built but not
                yet public says so, and we will walk you through it instead.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-20 items-start">
            <SectionReveal>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
                Work with us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                We build these for ourselves. We'll build one for you.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                The products above are the portfolio. The same team takes on AI engineering
                work for other companies — scoped, priced and shipped the same way.
              </p>
              <Link to="/services"
                onClick={() => track("services_cta_click", { location: "homepage" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                What we can build <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </SectionReveal>

            <SectionReveal delay={0.08}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="card-tier p-6">
                    <ProductIcon name={s.icon} className="w-5 h-5 text-primary mb-4" />
                    <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── Built for India ─── */}
      <IndiaSection />

      {/* ─── How we work ─── */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
              How we work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 leading-tight max-w-2xl">
              Four steps, no surprises
            </h2>
          </SectionReveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howWeWork.map((step, i) => {
              const StepIcon = STEP_ICONS[i] ?? Search;
              return (
                <SectionReveal key={step.step} delay={i * 0.07}>
                  <li className="card-tier p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <StepIcon className="w-5 h-5 text-primary" aria-hidden="true" />
                      <span className="text-xs font-mono font-bold text-primary tabular-nums">
                        {String(step.step).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </li>
                </SectionReveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="panel p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 80% at 50% 100%, hsl(230 90% 60% / 0.12), transparent 70%)",
              }} />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                  Tell us what you need built.
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                  A product, a pilot, or a second opinion on an AI system you already have.
                  We read every message.
                </p>
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  <Link to="/contact"
                    onClick={() => track("hero_cta_click", { cta: "final_start_project" })}
                    className="inline-flex items-center gap-2 px-8 py-4 press rounded-xl font-semibold text-sm text-primary-foreground hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                    Start a project <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link to="/partnerships"
                    className="inline-flex items-center gap-2 px-8 py-4 press rounded-xl font-semibold text-sm text-foreground border border-border hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    Explore partnerships
                  </Link>
                </div>
                <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-muted-foreground">
                  {["Fixed scope before we start", "You own the code", "Based in Pune, India"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
