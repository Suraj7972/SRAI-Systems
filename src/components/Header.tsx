import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ExternalLink, ArrowRight } from "lucide-react";
import { products } from "@/data/srai";
import ProductIcon from "./ProductIcon";
import StatusBadge from "./StatusBadge";
import { track } from "@/lib/analytics";

const fundos = products.find((p) => p.id === "fundos");

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/partnerships", label: "Partnerships" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.85)" }}>

        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
          background: "linear-gradient(90deg, transparent, #818cf820, #38bdf820, transparent)",
        }} />

        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm relative overflow-hidden shimmer-sweep"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 0 20px hsl(230 90% 60% / 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              SR
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground tracking-tight leading-tight">
                SRAI Systems
              </span>
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground leading-tight">
                AI PRODUCT STUDIO
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div key={link.to} className="relative"
                onMouseEnter={() => link.label === "Products" && setProductsOpen(true)}
                onMouseLeave={() => link.label === "Products" && setProductsOpen(false)}
              >
                <Link
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1 ${
                    location.pathname === link.to
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {link.label}
                  {link.label === "Products" && <ChevronDown className="w-3 h-3" />}
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #818cf8, #38bdf8)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Products dropdown */}
                {link.label === "Products" && (
                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[320px] glass-premium rounded-xl p-2 shadow-2xl"
                      >
                        {products.map((p) => (
                          <Link
                            key={p.id}
                            to={`/products/${p.id}`}
                            onClick={() => { setProductsOpen(false); track("product_card_click", { product: p.id, position: 0, variant: "header_dropdown" }); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `hsl(${p.accentHsl} / 0.1)` }}
                            >
                              <ProductIcon name={p.icon} className="w-4 h-4" style={{ color: `hsl(${p.accentHsl})` }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{p.tagline}</div>
                            </div>
                            <StatusBadge status={p.status} />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + pill + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={fundos?.url ?? "/products/fundos"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("outbound_product_click", { product: "fundos", location: "header" })}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Open FundOS
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>

            <Link to="/contact"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 press rounded-lg font-semibold text-xs text-primary-foreground transition-all btn-glow"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 0 20px hsl(230 90% 60% / 0.25)",
              }}>
              Start a Project
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 text-foreground hover:text-primary transition-colors" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: 0.1 }} className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-4">
                <span className="text-lg font-bold text-foreground tracking-tight">SRAI <span className="text-primary">Systems</span></span>
                <button onClick={() => setMenuOpen(false)} className="p-2 text-foreground hover:text-primary" aria-label="Close menu"><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col items-center justify-center flex-1 gap-2">
                {navLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                    <Link to={link.to} onClick={() => setMenuOpen(false)}
                      className={`text-2xl font-semibold px-6 py-3 rounded-xl transition-colors ${location.pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Link to="/contact" onClick={() => setMenuOpen(false)}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                    Start a Project <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
