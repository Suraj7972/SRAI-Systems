import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { products } from "@/data/srai";
import ProductIcon from "./ProductIcon";
import StatusBadge from "./StatusBadge";
import { ProductDemo, hasDemo } from "./demos";
import { track } from "@/lib/analytics";

const demoable = products.filter((p) => hasDemo(p.id));

/**
 * Homepage showcase: pick a product, its demo mounts and runs. Every panel is
 * real interactive code, so a visitor can use the mechanic rather than read
 * about it. Demos are lazy-loaded, so only the selected one is downloaded.
 */
const LiveShowcase = () => {
  const [active, setActive] = useState(demoable[0]?.id ?? "");
  const product = products.find((p) => p.id === active);
  if (!product) return null;

  return (
    <div>
      {/* Product selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1" role="tablist" aria-label="Choose a product to try">
        {demoable.map((p) => {
          const on = p.id === active;
          return (
            <button key={p.id} role="tab" aria-selected={on} type="button"
              onClick={() => { setActive(p.id); track("product_demo_open", { product: p.id, location: "homepage_showcase" }); }}
              className="group shrink-0 flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={on
                ? { borderColor: `hsl(${p.accentHsl} / 0.5)`, background: `hsl(${p.accentHsl} / 0.10)` }
                : { borderColor: "hsl(var(--border))", background: "hsl(var(--card) / 0.4)" }}>
              <ProductIcon name={p.icon} className="w-4 h-4 shrink-0"
                style={{ color: on ? `hsl(${p.accentHsl})` : "hsl(var(--muted-foreground))" }} />
              <span className="text-sm font-medium whitespace-nowrap"
                style={{ color: on ? `hsl(${p.accentHsl})` : "hsl(var(--muted-foreground))" }}>
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <StatusBadge status={product.status} />
            <p className="text-sm text-muted-foreground flex-1 min-w-[220px]">{product.tagline}</p>
            <Link to={`/products/${product.id}`}
              onClick={() => track("product_card_click", { product: product.id, position: 0, variant: "showcase" })}
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={{ color: `hsl(${product.accentHsl})` }}>
              Full details <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ProductDemo productId={active} />
        </motion.div>
      </AnimatePresence>

      <p className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
        <MousePointerClick className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Everything above is live code running in your browser — click, type and change things.
      </p>
    </div>
  );
};

export default LiveShowcase;
