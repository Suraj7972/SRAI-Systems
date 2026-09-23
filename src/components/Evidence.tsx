import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface EvidenceProps {
  /** The factual claim being made. */
  claim: ReactNode;
  /**
   * What backs the claim: an absolute URL, a site path, or the name of an
   * artifact a reader could ask for. Absent means there is nothing to point at.
   */
  source?: string;
  /** Link text. Ignored when `source` is a named artifact rather than a link. */
  sourceLabel?: string;
  className?: string;
}

/**
 * A claim that cannot outlive its evidence.
 *
 * With no `source`, this renders `null` — the claim disappears rather than
 * degrading into an unsourced assertion. That is the whole design: an
 * un-evidenced claim on a page is not a weaker version of an evidenced one, it
 * is the thing that loses the deal when a buyer checks. Deleting the source in
 * this codebase deletes the claim from the page, automatically, with no second
 * decision to get wrong.
 *
 * `source` may be a URL, a site path, or the name of an artifact ("the FundOS
 * evaluation report") that a reader can ask for by name.
 */
const Evidence = ({ claim, source, sourceLabel, className = "" }: EvidenceProps) => {
  if (!source) return null;

  const external = /^https?:\/\//.test(source);
  const isLink = external || source.startsWith("/") || source.startsWith("#");

  return (
    <div className={className}>
      <div className="text-sm text-muted-foreground leading-relaxed">{claim}</div>
      {isLink ? (
        external ? (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {sourceLabel ?? "Check it yourself"}{" "}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        ) : (
          <Link
            to={source}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {sourceLabel ?? "Check it yourself"}{" "}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        )
      ) : (
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 mt-3">
          Source: {source}
        </p>
      )}
    </div>
  );
};

export default Evidence;
