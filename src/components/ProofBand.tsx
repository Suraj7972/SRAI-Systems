import { Link } from "react-router-dom";
import { ArrowUpRight, Boxes, MousePointerClick, ShieldCheck, Code2 } from "lucide-react";
import { products } from "@/data/srai";
import SectionReveal from "./SectionReveal";

/**
 * Trust band.
 *
 * Every claim here is something a visitor can check for themselves within one
 * click — a live product, a demo they can run, a status label, a policy page.
 * Nothing about customers, funding, headcount or certifications, because none
 * of that is established. An empty slot is honest; a filled one we cannot back
 * is what loses the deal.
 */
const proofs = [
  {
    icon: Boxes,
    label: "Eight products, built in-house",
    body: "Not case studies from other people's projects. Each one designed, engineered and shipped by this team.",
    to: "/products",
    cta: "See all eight",
  },
  {
    icon: ArrowUpRight,
    label: "One is live right now",
    body: "FundOS is public, self-serve and has a free tier. Open it and use it before you talk to us.",
    href: products.find((p) => p.id === "fundos")?.url ?? undefined,
    cta: "Open FundOS",
  },
  {
    icon: MousePointerClick,
    label: "The rest, running in your browser",
    body: "Working demos of every product's core mechanic. Real code, not a video and not a slideshow.",
    to: "/#try",
    cta: "Try them",
  },
  {
    icon: ShieldCheck,
    label: "Status we don't dress up",
    body: "Every product says exactly where it stands — live, ready, or in development. No product is described as further along than it is.",
    to: "/products",
    cta: "Check the labels",
  },
];

const ProofBand = () => (
  <section className="py-20 border-t border-[hsl(var(--line-soft))]">
    <div className="container mx-auto px-4 md:px-8">
      <SectionReveal>
        <div className="max-w-2xl mb-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
            Why trust us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Everything below, you can verify yourself
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're a young studio. We don't have a wall of client logos, and we're not going to
            borrow one. What we do have is working software you can open in the next thirty seconds.
          </p>
        </div>
      </SectionReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {proofs.map((p, i) => (
          <SectionReveal key={p.label} delay={i * 0.06}>
            <div className="card-tier p-6 h-full flex flex-col">
              <p.icon className="w-5 h-5 text-primary mb-4 shrink-0" aria-hidden="true" />
              <h3 className="text-base font-semibold text-foreground mb-2">{p.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{p.body}</p>
              {p.href ? (
                <a href={p.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  {p.cta} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ) : (
                <Link to={p.to!}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  {p.cta} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </SectionReveal>
        ))}
      </div>

      <SectionReveal delay={0.3}>
        <div className="panel mt-4 px-6 py-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Code2 className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground flex-1 min-w-[280px] leading-relaxed">
            No fabricated statistics, no certifications we haven't earned, and no customers we
            can't name. If we can't show you the evidence, we don't put it on the page.
          </p>
          <Link to="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            How we work <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </SectionReveal>
    </div>
  </section>
);

export default ProofBand;
