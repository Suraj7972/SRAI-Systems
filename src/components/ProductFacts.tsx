import StatusBadge from "./StatusBadge";
import type { Product } from "@/data/srai";

/**
 * Availability, derived from the product's own status and public URL.
 *
 * Nothing here is a new claim: every string restates the fixed ProductStatus
 * union (the same six labels StatusBadge renders) in the one sentence a buyer
 * actually wants — can I use this today, and how.
 */
const availabilityOf = (p: Product): string => {
  switch (p.status) {
    case "LIVE":
      return p.url
        ? `Public and self-serve at ${p.url.replace(/^https?:\/\//, "")}`
        : "Publicly available today";
    case "DEPLOYING":
      return "Deployment in progress";
    case "READY":
      return "Built and complete — walkthrough on request, not yet publicly deployed";
    case "PRIVATE PILOT":
      return "In use with selected partners";
    case "IN DEVELOPMENT":
      return "Actively being built — not yet available";
    case "COMING SOON":
      return "Not publicly available yet";
  }
};

/**
 * The five facts a buyer checks before reading anything else, as a real <dl>.
 *
 * A row with no honest value is OMITTED. It never prints "TBD" or "Coming
 * soon" as a value: an empty row tells a reader the company does not know, and
 * a filled one they cannot verify tells them the company does not care. Today
 * "What it replaces" is absent on ModGuardian and "Where it runs" is absent on
 * every product without a public URL, because src/data/srai.ts does not
 * establish either — see the `replaces` and `runsOn` comments there.
 */
const ProductFacts = ({ product, accent }: { product: Product; accent: string }) => {
  const rows: { term: string; value: React.ReactNode }[] = [
    { term: "Status", value: <StatusBadge status={product.status} /> },
    { term: "Who it's for", value: product.bestFor },
    ...(product.replaces ? [{ term: "What it replaces", value: product.replaces }] : []),
    ...(product.runsOn ? [{ term: "Where it runs", value: product.runsOn }] : []),
    { term: "Availability", value: availabilityOf(product) },
  ];

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
      {rows.map((row) => (
        <div key={row.term} className="min-w-0">
          <dt
            className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5"
            style={{ color: accent, opacity: 0.85 }}
          >
            {row.term}
          </dt>
          <dd className="text-[15px] text-foreground leading-relaxed">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default ProductFacts;
