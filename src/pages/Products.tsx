import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductCard from "@/components/ProductCard";
import { products, type ProductStatus } from "@/data/srai";

const FILTERS = ["All", "Live", "Ready", "In development"] as const;
type Filter = (typeof FILTERS)[number];

const matches = (status: ProductStatus, filter: Filter) => {
  if (filter === "All") return true;
  if (filter === "Live") return status === "LIVE" || status === "DEPLOYING";
  if (filter === "Ready") return status === "READY" || status === "PRIVATE PILOT";
  return status === "IN DEVELOPMENT" || status === "COMING SOON";
};

const Products = () => {
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    document.title = "Products — eight AI platforms built by SRAI Systems";
  }, []);

  const visible = products.filter((p) => matches(p.status, filter));
  const liveCount = products.filter((p) => p.status === "LIVE").length;

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
              Our products
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 max-w-3xl">
              Eight products. <span className="heading-gradient">One engineering team.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-4 leading-relaxed">
              Everything here was designed, built and shipped by SRAI Systems. Each card shows exactly
              where that product stands today — nothing is described as further along than it is.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              {liveCount} publicly available · {products.length - liveCount} built and available for a walkthrough
            </p>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter products by status">
              {FILTERS.map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="text-muted-foreground py-12 text-center">Nothing in this category right now.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
