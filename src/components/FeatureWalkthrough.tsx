import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause } from "lucide-react";
import type { Screenshot } from "@/data/srai";
import { track } from "@/lib/analytics";

interface Props {
  screenshots: Screenshot[];
  /** Short labels for the tab rail, one per screenshot. */
  labels: string[];
  productId: string;
  accentHsl: string;
}

/**
 * Interactive walkthrough of REAL product screenshots.
 *
 * This component exists to replace the hand-drawn mock dashboards that used to
 * live in ProductDemos.tsx. Every image it renders is an actual capture of a
 * shipping product — never an illustration of one.
 */
const FeatureWalkthrough = ({ screenshots, labels, productId, accentHsl }: Props) => {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  /* Tour mode: advances on its own like a screen recording, but every frame is
     a real capture and the visitor can take over at any point. */
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();
  const STEP_MS = 3800;
  const railRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  const total = screenshots.length;
  const go = useCallback(
    (next: number) => {
      const wrapped = (next + total) % total;
      setIndex(wrapped);
      track("product_demo_step", { product: productId, step: wrapped + 1 });
    },
    [total, productId]
  );

  /* Auto-advance while playing, with a progress bar that tracks the dwell. */
  useEffect(() => {
    if (!playing || zoomed) return;
    setProgress(0);
    const started = Date.now();
    const tick = setInterval(() => setProgress(Math.min(1, (Date.now() - started) / STEP_MS)), 60);
    const next = setTimeout(() => go(index + 1), STEP_MS);
    return () => { clearInterval(tick); clearTimeout(next); };
  }, [playing, index, zoomed, go]);

  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);

  /** Any manual interaction hands control back to the visitor. */
  const takeOver = (fn: () => void) => { setPlaying(false); fn(); };

  // Keyboard support on the tab rail (WAI-ARIA tabs pattern).
  const onRailKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(total - 1); }
  };

  // Lightbox: Escape closes, focus moves in and back out.
  useEffect(() => {
    if (!zoomed) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      triggerRef.current?.focus();
    };
  }, [zoomed, index, go]);

  // Keep the active tab scrolled into view on narrow screens.
  useEffect(() => {
    const active = railRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  if (!total) return null;
  const shot = screenshots[index];

  return (
    <div className="relative">
      {/* Tab rail */}
      <div ref={railRef} role="tablist" aria-label="Product walkthrough" onKeyDown={onRailKey}
        className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-none">
        {labels.map((label, i) => (
          <button key={label} role="tab" type="button"
            aria-selected={i === index}
            aria-controls={i === index ? panelId : undefined}
            tabIndex={i === index ? 0 : -1}
            onClick={() => takeOver(() => go(i))}
            className="shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={
              i === index
                ? { background: `hsl(${accentHsl} / 0.14)`, color: `hsl(${accentHsl})`, border: `1px solid hsl(${accentHsl} / 0.35)` }
                : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Screen */}
      <div id={panelId} role="tabpanel" aria-label={labels[index]}
        className="card-tier overflow-hidden">
        {/* Browser chrome — presentational frame around a real capture, not a fake UI */}
        <div className="flex items-center gap-2 px-4 h-9 border-b border-[hsl(var(--line))] surface-3" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-2 text-[11px] font-mono text-muted-foreground truncate">{labels[index]}</span>
          <button type="button" onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause tour" : "Play tour"}
            className="ml-auto mr-1 inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{playing ? "Pause" : "Play tour"}</span>
          </button>
          <button ref={triggerRef} type="button" onClick={() => setZoomed(true)} aria-hidden="false"
            aria-label={`Enlarge screenshot: ${labels[index]}`}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {playing && (
          <div className="h-0.5 w-full" style={{ background: "hsl(var(--surface-3))" }} aria-hidden="true">
            <div className="h-full transition-none" style={{ width: `${progress * 100}%`, background: `hsl(${accentHsl})` }} />
          </div>
        )}

        <div className="relative bg-[#0b0d12]">
          <AnimatePresence mode="wait">
            <motion.img
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              width={1500}
              height={853}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full h-auto block"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Caption + controls */}
      <div className="flex items-start gap-4 mt-4">
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed" aria-live="polite">{shot.caption}</p>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => takeOver(() => go(index - 1))} aria-label="Previous screen"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground tabular-nums px-1.5">{index + 1}/{total}</span>
          <button type="button" onClick={() => takeOver(() => go(index + 1))} aria-label="Next screen"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-label={`${labels[index]} — enlarged`}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
            style={{ background: "hsl(220 20% 4% / 0.94)" }}
            onClick={() => setZoomed(false)}
          >
            <button ref={closeRef} type="button" onClick={() => setZoomed(false)} aria-label="Close enlarged view"
              className="absolute top-4 right-4 p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <X className="w-5 h-5" />
            </button>
            <figure className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={shot.src} alt={shot.alt} className="w-full h-auto rounded-lg border border-border" />
              <figcaption className="text-sm text-muted-foreground mt-3 text-center">{shot.caption}</figcaption>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeatureWalkthrough;
