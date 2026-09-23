import type { Answer } from "@/data/answers";
import SectionReveal from "./SectionReveal";

/**
 * The answer block: an <h2> phrased as the question a buyer would type, and one
 * self-contained paragraph answering it.
 *
 * It is deliberately the FIRST thing in a page's main content. Generative
 * engines lift passages that stand on their own and drop passages that need the
 * surrounding page to make sense, so the paragraph opens with the proper noun
 * and no sentence in it leans on the heading above it. Every string comes from
 * src/data/answers.ts or the product itself, which is also what the FAQPage and
 * WebPage JSON-LD are built from — the markup and the visible words cannot
 * drift, because there is only one copy of them.
 */
const AnswerBlock = ({ answer, accent }: { answer: Answer; accent?: string }) => (
  <SectionReveal>
    <div className="max-w-3xl">
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight"
        style={accent ? { color: accent } : undefined}
      >
        {answer.question}
      </h2>
      <p className="text-lg text-muted-foreground leading-relaxed">{answer.body}</p>
    </div>
  </SectionReveal>
);

export default AnswerBlock;
