import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MapPin, Boxes, Languages, Landmark } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductIcon from "@/components/ProductIcon";
import StatusBadge from "@/components/StatusBadge";
import { roadmap, principles, products } from "@/data/srai";

const statusStyle = (status: string) =>
  status === "completed"
    ? { dot: "hsl(152 60% 50%)", label: "Done" }
    : status === "in-progress"
    ? { dot: "hsl(230 90% 70%)", label: "In progress" }
    : { dot: "hsl(var(--line-strong))", label: "Ahead" };

const About = () => {
  useEffect(() => {
    document.title = "About SRAI Systems — an AI product studio in Pune";
  }, []);

  const live = products.filter((p) => p.status === "LIVE").length;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="pt-14 pb-16 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 12% 0%, hsl(230 90% 60% / 0.10), transparent 70%)",
        }} />
        <div className="container mx-auto px-4 md:px-8 relative">
          <SectionReveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
              Who we are
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-3xl leading-[1.08]">
              A product studio that <span className="heading-gradient">ships its own software</span>
            </h1>
            <div className="max-w-2xl space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                SRAI Systems is an AI product studio in Pune. We have built {products.length} products
                in-house — {live} of them publicly live, the rest complete and available for a
                walkthrough — and we take on AI engineering work for other companies.
              </p>
              <p>
                That order matters. The products came first, which means when we quote a timeline
                for your project, we are quoting from having done it rather than from a template.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> Pune, India</span>
              <span className="inline-flex items-center gap-2"><Boxes className="w-4 h-4 text-primary" aria-hidden="true" /> {products.length} products built</span>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Why India-first is a design constraint ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
            <SectionReveal>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                Building here changes the engineering
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                "Built for India" is usually a marketing line. For us it decides architecture: which
                language the interface is written in, which regulator's deadlines the product tracks,
                and which phone it has to run on.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.08}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Languages, title: "Regional languages first",
                    body: "SmartBhoomi's interface is written in Marathi, not translated into it. An app a farmer needs help operating is an app a farmer does not open." },
                  { icon: Landmark, title: "Indian regulation, in the product",
                    body: "FundOS tracks DPIIT, MSME and RBI obligations. SRAI Quant is built against SEBI's retail algo framework. These only exist here." },
                  { icon: Boxes, title: "The conditions are the spec",
                    body: "Patchy connectivity, mid-range Android, shared devices. We design against these rather than treating them as edge cases." },
                  { icon: MapPin, title: "Close to the customer",
                    body: "The restaurants, farms and traders we build for are a short drive away. We can go and watch someone use it." },
                ].map((c) => (
                  <div key={c.title} className="card-tier p-6 h-full">
                    <c.icon className="w-5 h-5 text-primary mb-4" aria-hidden="true" />
                    <h3 className="text-base font-semibold text-foreground mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">How we operate</h2>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((p, i) => (
              <SectionReveal key={p.title} delay={i * 0.06}>
                <div className="card-tier p-6 h-full">
                  <h3 className="text-base font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we've built ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">What we've built</h2>
              <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                All products <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {products.map((p, i) => (
              <SectionReveal key={p.id} delay={i * 0.04}>
                <Link to={`/products/${p.id}`}
                  className="card-tier card-interactive p-5 h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <ProductIcon name={p.icon} className="w-5 h-5 shrink-0" style={{ color: `hsl(${p.accentHsl})` }} />
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.bestFor}</p>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">Where we're going</h2>
          </SectionReveal>
          <ol className="space-y-3 max-w-3xl">
            {roadmap.map((r, i) => {
              const st = statusStyle(r.status);
              return (
                <SectionReveal key={r.id} delay={i * 0.06}>
                  <li className="card-tier p-6 flex gap-5">
                    <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.dot }} aria-hidden="true" />
                      {i < roadmap.length - 1 && <span className="w-px flex-1 min-h-[28px]" style={{ background: "hsl(var(--line))" }} aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{r.phase}</span>
                        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: st.dot }}>{st.label}</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">{r.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                    </div>
                  </li>
                </SectionReveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── The honest bit ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="panel p-8 md:p-12 max-w-3xl">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">What we are not, yet</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are a young studio. We do not have a decade of case studies, a wall of client
                logos, or a compliance certification — and we are not going to imply otherwise on
                this website. If a claim is not on this site, it is usually because we could not
                back it up.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                What we do have is software you can open right now, demos you can use without
                talking to anyone, and status labels that say plainly what is deployed and what
                is not. Judge us on that.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products"
                  className="press inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  See the products <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link to="/contact"
                  className="press inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--line-strong))] surface-2 text-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  Talk to us <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
