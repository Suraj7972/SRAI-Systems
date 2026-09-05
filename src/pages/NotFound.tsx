import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";

const suggestions = [
  { to: "/products", label: "Products", hint: "All seven SRAI platforms" },
  { to: "/services", label: "Services", hint: "AI engineering and consulting" },
  { to: "/about", label: "About", hint: "Who we are and how we work" },
  { to: "/partnerships", label: "Partnerships", hint: "Pilots, partners and investors" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page not found (404) | SRAI Systems";
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("404: no route matches", location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout>
      <section className="py-24 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <SectionReveal>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3">
              Error 404
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              We couldn't find that page
            </h1>
            <p className="text-muted-foreground mb-2">
              The page you were looking for doesn't exist, or it has moved.
            </p>
            <p className="text-sm text-muted-foreground mb-10 font-mono break-all">
              {location.pathname}
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <Home className="w-4 h-4" /> Back to home
              </Link>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Tell us what you were looking for <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h2 className="text-sm font-semibold text-foreground mb-4">Try one of these instead</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s) => (
                <li key={s.to}>
                  <Link to={s.to}
                    className="block p-4 rounded-xl border border-border/40 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <span className="block text-sm font-medium text-foreground">{s.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{s.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
