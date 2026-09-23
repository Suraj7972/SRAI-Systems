import SectionReveal from "./SectionReveal";

/**
 * The visible Q&A.
 *
 * These are the same `{ q, a }` objects the page's FAQPage JSON-LD is built
 * from — not a copy of them. Google requires FAQ markup to match content
 * visible on the page, and the only reliable way to guarantee that is to render
 * the same array rather than to maintain two.
 */
const FaqSection = ({
  faqs,
  heading = "Questions people ask",
  accent,
}: {
  faqs: { q: string; a: string }[];
  heading?: string;
  accent?: string;
}) => {
  if (faqs.length === 0) return null;
  return (
    <section className="py-14 border-t border-[hsl(var(--line-soft))]">
      <div className="container mx-auto px-4 md:px-8">
        <SectionReveal>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">{heading}</h2>
        </SectionReveal>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 max-w-5xl">
          {faqs.map((f, i) => (
            <SectionReveal key={f.q} delay={i * 0.04}>
              <div>
                <dt
                  className="text-base font-semibold text-foreground mb-2 leading-snug"
                  style={accent ? { color: accent } : undefined}
                >
                  {f.q}
                </dt>
                <dd className="text-[15px] text-muted-foreground leading-relaxed">{f.a}</dd>
              </div>
            </SectionReveal>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default FaqSection;
