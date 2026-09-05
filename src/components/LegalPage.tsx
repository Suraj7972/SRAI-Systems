import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import SectionReveal from "./SectionReveal";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  documentTitle: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/**
 * Shared shell for /privacy and /terms.
 *
 * These documents are drafted as structured placeholders. They describe how the
 * site actually behaves today, but they have NOT been reviewed by a lawyer and
 * make no claim of compliance with any specific statute. The review banner is
 * deliberate and should be removed only once counsel has signed the text off.
 */
const LegalPage = ({ title, documentTitle, intro, lastUpdated, sections }: LegalPageProps) => {
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <SectionReveal>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground mb-2">Last updated: {lastUpdated}</p>
            <p className="text-muted-foreground mb-8">{intro}</p>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 mb-10">
              <p className="text-sm text-amber-200/90">
                <strong className="font-semibold">Draft pending legal review.</strong> This document was
                prepared internally to describe how SRAI Systems currently operates. It has not been
                reviewed by a qualified lawyer and should not be read as a statement of compliance with
                any particular law or regulation.
              </p>
            </div>
          </SectionReveal>

          {/* Contents */}
          <SectionReveal delay={0.05}>
            <nav aria-label="Contents" className="mb-12 rounded-xl border border-border/40 bg-secondary/20 p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Contents</h2>
              <ol className="space-y-1.5 list-decimal list-inside">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </SectionReveal>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <SectionReveal key={s.id} delay={0.02 * i}>
                <section id={s.id} className="scroll-mt-24">
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    {i + 1}. {s.heading}
                  </h2>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary hover:[&_a]:underline">
                    {s.body}
                  </div>
                </section>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <div className="mt-14 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default LegalPage;
