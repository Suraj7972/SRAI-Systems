import { Link } from "react-router-dom";
import { products } from "@/data/srai";
import { track } from "@/lib/analytics";
import { CONTACT_EMAIL } from "@/lib/contact-form";

const Footer = () => (
  <footer className="relative border-t border-border bg-card/40 backdrop-blur-sm z-10 overflow-hidden">
    {/* Top gradient line */}
    <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
      background: "linear-gradient(90deg, transparent, #818cf830, #38bdf830, transparent)",
    }} />

    {/* Background */}
    <div className="absolute inset-0 mesh-bg pointer-events-none opacity-50" />

    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(230 90% 60% / 0.04), transparent 70%)", filter: "blur(60px)" }} />

    <div className="container mx-auto px-4 md:px-8 py-12 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 15px hsl(230 90% 60% / 0.2)" }}>
              SR
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground tracking-tight leading-tight">SRAI Systems</span>
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground leading-tight">AI Product Studio</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            Building AI-native products that solve real problems. Engineering-first, research-driven, India-focused.
          </p>
        </div>

        {/* Products */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Products</h4>
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`}
                onClick={() => track("product_card_click", { product: p.id, position: 0, variant: "footer" })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `hsl(${p.accentHsl})` }} />
                {p.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigate */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Navigate</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: "/services", label: "Services" },
              { to: "/about", label: "About" },
              { to: "/partnerships", label: "Partnerships" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact & Legal */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Contact</h4>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted-foreground hover:text-primary transition-colors block mb-6">
            {CONTACT_EMAIL}
          </a>
          <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* System Status + Bottom bar */}
      <div className="mt-10 pt-6 border-t border-border relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-muted-foreground">
          <span>{CONTACT_EMAIL}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SRAI Systems · Pune, India</p>
        </div>
      </div>

      {/* Massive Watermark */}
      <div className="relative pointer-events-none select-none overflow-hidden text-center mt-12 -mb-8">
        <div className="font-black leading-none whitespace-nowrap text-white" style={{ fontSize: 'clamp(80px, 15vw, 180px)', opacity: 0.018 }}>
          SRAI SYSTEMS
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
