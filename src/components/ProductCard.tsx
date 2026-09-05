import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/srai";
import ProductIcon from "./ProductIcon";
import StatusBadge from "./StatusBadge";
import ProductGlyph from "./ProductGlyph";
import { track } from "@/lib/analytics";

interface Props {
  product: Product;
  index: number;
}

/**
 * Product card. Navigates to the product page — it no longer opens a modal,
 * and it no longer renders an invented "match" percentage.
 */
const ProductCard = ({ product, index }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative rounded-2xl overflow-hidden card-tier card-interactive h-full"
      style={{
        transform: hovering ? "translateY(-4px)" : "translateY(0)",
        borderColor: hovering ? `hsl(${product.accentHsl} / 0.4)` : undefined,
        boxShadow: hovering ? `0 20px 50px -24px hsl(${product.accentHsl} / 0.35)` : undefined,
      }}
    >
      {/* Product motif watermark */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 pointer-events-none transition-all duration-500"
        style={{ opacity: hovering ? 0.26 : 0.09, transform: hovering ? "scale(1.06)" : "scale(1)" }} aria-hidden="true">
        <ProductGlyph productId={product.id} accentHsl={product.accentHsl} className="w-full h-full" />
      </div>

      {/* Pointer spotlight */}
      {hovering && (
        <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl" aria-hidden="true"
          style={{ background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, hsl(${product.accentHsl} / 0.09), transparent 62%)` }} />
      )}

      <Link
        to={`/products/${product.id}`}
        onClick={() => track("product_card_click", { product: product.id, position: index + 1 })}
        className="relative z-10 flex flex-col h-full p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `hsl(${product.accentHsl} / 0.12)`, border: `1px solid hsl(${product.accentHsl} / 0.22)` }}>
            <ProductIcon name={product.icon} className="w-5 h-5" style={{ color: `hsl(${product.accentHsl})` }} />
          </div>
          <StatusBadge status={product.status} />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1.5 transition-colors"
          style={{ color: hovering ? `hsl(${product.accentHsl})` : undefined }}>
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{product.tagline}</p>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground truncate">{product.bestFor}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium shrink-0"
            style={{ color: `hsl(${product.accentHsl})` }}>
            View
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
