import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, IndianRupee, Target, Users } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductIcon from "@/components/ProductIcon";
import { services, howWeWork, engagementModels } from "@/data/srai";
import { track } from "@/lib/analytics";

const Services = () => {
  useEffect(() => {
    document.title = "Services — AI engineering, scoped and priced before it starts | SRAI Systems";
  }, []);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="pt-14 pb-16 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 15% 0%, hsl(230 90% 60% / 0.10), transparent 70%)",
        }} />
        <div className="container mx-auto px-4 md:px-8 relative">
          <SectionReveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
              What we do
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-3xl leading-[1.08]">
              AI engineering, <span className="heading-gradient">scoped before it starts</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
              We build our own products, so we know what these projects actually cost in time and
              attention. Every engagement below has a defined deliverable and a stated shape of
              pricing — you will know what you are getting before you commit to anything.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact"
                onClick={() => track("services_cta_click", { location: "services_hero" })}
                className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Start a project <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/products"
                className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[hsl(var(--line-strong))] surface-2 text-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                See what we've built
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── The six offers ── */}
      <section className="pb-16 border-t border-[hsl(var(--line-soft))] pt-16">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Six ways to work with us</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Each one names its customer, its deliverable and its proof. If we cannot point at
              something we have built, we say so.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {services.map((s, i) => (
              <SectionReveal key={s.id} delay={i * 0.05}>
                <article className="card-tier p-7 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                      <ProductIcon name={s.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground leading-snug">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.description}</p>
                    </div>
                  </div>

                  <dl className="space-y-3 text-sm flex-1">
                    {[
                      { icon: Users, term: "Who it's for", def: s.who },
                      { icon: Check, term: "What you get", def: s.deliverable },
                      { icon: Clock, term: "Typical scope", def: s.scope },
                      { icon: IndianRupee, term: "How it's priced", def: s.pricing },
                      { icon: Target, term: "Our proof", def: s.proof },
                    ].map((row) => (
                      <div key={row.term} className="flex gap-3">
                        <row.icon className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/70" aria-hidden="true" />
                        <div className="min-w-0">
                          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">{row.term}</dt>
                          <dd className="text-[13.5px] text-foreground leading-relaxed">{row.def}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>

                  <Link to={`/contact?product=${s.id}`}
                    onClick={() => track("service_cta_click", { service: s.id })}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-6 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    Talk about this <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How we work ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">How an engagement runs</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Four stages. You get something concrete out of each one, so you can stop after any of
              them and still be ahead.
            </p>
          </SectionReveal>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howWeWork.map((step, i) => (
              <SectionReveal key={step.step} delay={i * 0.06}>
                <li className="card-tier p-6 h-full">
                  <span className="text-xs font-mono font-bold text-primary tabular-nums">
                    {String(step.step).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-foreground mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Engagement models ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">Shapes of engagement</h2>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {engagementModels.map((m, i) => (
              <SectionReveal key={m.id} delay={i * 0.06}>
                <div className="card-tier p-6 h-full">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <ProductIcon name={m.icon} className="w-5 h-5 text-primary" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{m.duration}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="panel p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 80% at 50% 100%, hsl(230 90% 60% / 0.12), transparent 70%)",
              }} />
              <div className="relative">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  Tell us the problem, not the solution
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                  Describe what is actually going wrong and we will tell you honestly whether AI is
                  the right answer — including when it is not.
                </p>
                <Link to="/contact"
                  onClick={() => track("services_cta_click", { location: "services_footer" })}
                  className="press inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                  Start a project <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
