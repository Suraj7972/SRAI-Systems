import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/srai";
import { track } from "@/lib/analytics";
import StatusBadge from "./StatusBadge";

const fundos = products.find((p) => p.id === "fundos")!;

/**
 * Ambient field. A slow lattice that drifts and brightens near the pointer —
 * one decorative layer doing real work, rather than five doing none. Paused
 * entirely under prefers-reduced-motion and while the tab is hidden.
 */
const AmbientField = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0, w = 0, h = 0, t = 0, visible = true;
    const pointer = { x: -999, y: -999 };
    type Node = { x: number; y: number; ox: number; oy: number; ph: number };
    let nodes: Node[] = [];

    const build = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = w < 640 ? 68 : 54;
      nodes = [];
      for (let x = gap / 2; x < w + gap; x += gap) {
        for (let y = gap / 2; y < h + gap; y += gap) {
          nodes.push({ x, y, ox: x, oy: y, ph: Math.random() * Math.PI * 2 });
        }
      }
    };
    build();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += 0.004;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x = n.ox + Math.sin(t + n.ph) * 6;
        n.y = n.oy + Math.cos(t * 0.85 + n.ph) * 6;
      }

      // Links, brightening toward the pointer.
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        const near = Math.max(0, 1 - pd / 230);
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 76) continue;
          const base = 0.05 * (1 - d / 76);
          ctx.strokeStyle = `hsla(230, 90%, 72%, ${base + near * 0.24})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.fillStyle = `hsla(230, 90%, 76%, ${0.16 + near * 0.5})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, 1.1 + near * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    };
    draw();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    };
    const onLeave = () => { pointer.x = -999; pointer.y = -999; };
    const onVis = () => { visible = !document.hidden; };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", build);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" />;
};

/* One orchestrated entrance, staggered from a single parent. */
const stagger = { animate: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } } };
const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const liveCount = products.filter((p) => p.status === "LIVE").length;

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto"><AmbientField /></div>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 75% 60% at 12% -10%, hsl(230 90% 60% / 0.13), transparent 68%)",
        }} />
        <div className="absolute inset-x-0 bottom-0 h-32" style={{
          background: "linear-gradient(to top, hsl(var(--surface-0)), transparent)",
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative">
        <motion.div variants={stagger} initial="initial" animate="animate"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-16 items-center">

          <div>
            <motion.div variants={rise}>
              <span className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground px-3.5 py-2 rounded-full border border-[hsl(var(--line))] surface-2 backdrop-blur-sm mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                AI Product Studio · Pune, India
              </span>
            </motion.div>

            <motion.h1 variants={rise}
              className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-foreground leading-[1.05] tracking-[-0.025em] mb-6">
              We build AI systems for the businesses{" "}
              <span className="heading-gradient">India actually runs on.</span>
            </motion.h1>

            <motion.p variants={rise} className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-9">
              Eight products designed, built and shipped in-house — for founders, farmers,
              restaurants, traders and now systematic markets. The same team builds them for other companies too.
            </motion.p>

            <motion.div variants={rise} className="flex flex-wrap gap-3 mb-10">
              <Link to="/contact"
                onClick={() => track("hero_cta_click", { cta: "start_a_project" })}
                className="press inline-flex items-center justify-center gap-2 px-7 h-[52px] rounded-xl font-semibold text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 10px 34px -14px rgba(99,102,241,0.85)" }}>
                Start a project
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a href="#try"
                onClick={() => track("hero_cta_click", { cta: "try_demos" })}
                className="press inline-flex items-center justify-center gap-2 px-7 h-[52px] rounded-xl font-semibold text-sm text-foreground border border-[hsl(var(--line-strong))] surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                Try our products
              </a>
            </motion.div>

            <motion.p variants={rise} className="text-sm text-muted-foreground">
              {products.length} products · {liveCount} publicly live · {products.length} you can use right here
            </motion.p>
          </div>

          {/* Real product screenshot — never a mock */}
          <motion.figure variants={rise} className="relative m-0">
            <div className="card-tier overflow-hidden" style={{ boxShadow: "0 40px 90px -50px rgba(0,0,0,0.95)" }}>
              <div className="flex items-center gap-2 px-4 h-9 border-b border-[hsl(var(--line))] surface-3" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
                <span className="ml-3 text-[11px] font-mono text-muted-foreground">fundos — grant eligibility</span>
              </div>
              <img
                src="/screens/fundos/schemes-eligibility.webp"
                alt="FundOS showing a startup's government grant eligibility: an estimated value range, a grant readiness score, and the requirement putting an application at risk"
                width={1500} height={967}
                fetchPriority="high" decoding="async"
                onLoad={() => setLoaded(true)}
                className="w-full h-auto block transition-opacity duration-700"
                style={{ opacity: loaded ? 1 : 0, background: "hsl(var(--surface-2))" }}
              />
            </div>

            <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
              <StatusBadge status={fundos.status} />
              <span className="text-sm text-muted-foreground">FundOS — real screen, not a mockup.</span>
              <a href={fundos.url ?? "/products/fundos"} target="_blank" rel="noopener noreferrer"
                onClick={() => track("outbound_product_click", { product: "fundos", location: "hero_figure" })}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
                Open it <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </figcaption>
          </motion.figure>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
