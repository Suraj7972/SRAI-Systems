import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Store, Clock, SearchX } from "lucide-react";
import DemoShell from "./DemoShell";
import { StatePanel, Stat, EmptyState } from "./parts";

const ACCENT = "170 65% 45%";

const VENDORS = [
  { id: 1, name: "Ashirwad Bhojnalaya", kind: "Thali", km: 0.6, rating: 4.6, tags: ["Veg", "Thali"], open: true },
  { id: 2, name: "Sai Chinese Corner", kind: "Street food", km: 1.2, rating: 4.2, tags: ["Chinese", "Late night"], open: true },
  { id: 3, name: "Gokul Home Kitchen", kind: "Home kitchen", km: 0.9, rating: 4.8, tags: ["Veg", "Tiffin"], open: true },
  { id: 4, name: "Mahalaxmi Misal", kind: "Breakfast", km: 2.4, rating: 4.5, tags: ["Misal", "Breakfast"], open: false },
  { id: 5, name: "New Punjab Dhaba", kind: "Dhaba", km: 3.1, rating: 4.1, tags: ["Punjabi", "Late night"], open: true },
  { id: 6, name: "Anand Tiffin Service", kind: "Tiffin", km: 1.7, rating: 4.7, tags: ["Tiffin", "Veg"], open: true },
];

const FILTERS = ["All", "Veg", "Tiffin", "Late night", "Breakfast"];

const FoodieFlowDemo = () => {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [radius, setRadius] = useState(3);
  const [openOnly, setOpenOnly] = useState(false);

  const results = useMemo(() =>
    VENDORS
      .filter((v) => v.km <= radius)
      .filter((v) => (openOnly ? v.open : true))
      .filter((v) => (filter === "All" ? true : v.tags.includes(filter)))
      .filter((v) => (q ? (v.name + v.kind + v.tags.join(" ")).toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => a.km - b.km),
  [q, filter, radius, openOnly]);

  const [picked, setPicked] = useState<number | null>(null);
  const vendor = results.find((v) => v.id === picked) ?? null;
  const avgRating = results.length ? (results.reduce((s, v) => s + v.rating, 0) / results.length).toFixed(1) : "—";
  const nearest = results.length ? `${results[0].km} km` : "—";

  const reset = useCallback(() => { setQ(""); setFilter("All"); setRadius(3); setOpenOnly(false); setPicked(null); }, []);

  return (
    <DemoShell title="Hyperlocal discovery" subtitle="Search, filter and set a radius — results re-sort by distance as you change them." accentHsl={ACCENT} onReset={reset}>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
            aria-label="Search vendors" placeholder="Search thali, tiffin, misal…"
            className="w-full rounded-lg border border-[hsl(var(--line))] surface-1 pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button type="button" onClick={() => setOpenOnly((v) => !v)} aria-pressed={openOnly}
          className="rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={openOnly
            ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)`, color: `hsl(${ACCENT})` }
            : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          Open now
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={filter === f
              ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)`, color: `hsl(${ACCENT})` }
              : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="ff-radius" className="text-[11px] text-muted-foreground shrink-0">Within</label>
        <input id="ff-radius" type="range" min={0.5} max={4} step={0.1} value={radius}
          onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-current"
          style={{ color: `hsl(${ACCENT})` }} />
        <span className="font-mono text-xs tabular-nums shrink-0" style={{ color: `hsl(${ACCENT})` }}>{radius.toFixed(1)} km</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Vendors nearby" value={results.length} icon={Store} accent={ACCENT} />
        <Stat label="Nearest" value={nearest} icon={MapPin} accent={ACCENT} />
        <Stat label="Avg rating" value={avgRating} icon={Star} accent={ACCENT} />
      </div>

      {vendor && (
        <div className="mb-4">
          <StatePanel title={vendor.name} tone="accent" accent={ACCENT}
            body={<>
              {vendor.kind} · {vendor.km} km · rated {vendor.rating}
              {vendor.open ? " · open now" : " · currently closed"}. Tagged {vendor.tags.join(", ")}.
              A vendor this small is invisible to the national aggregators — discovery here is the whole point.
            </>} />
        </div>
      )}

      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2" aria-live="polite">
        Results, nearest first
      </p>
      <ul className="space-y-1.5 max-h-[230px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {results.map((v) => (
            <motion.li key={v.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}>
              <button type="button" onClick={() => setPicked(v.id === picked ? null : v.id)} aria-pressed={v.id === picked}
              className="w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={v.id === picked
                ? { borderColor: `hsl(${ACCENT} / 0.5)`, background: `hsl(${ACCENT} / 0.08)` }
                : { borderColor: "hsl(var(--line))", background: "hsl(var(--surface-1))" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `hsl(${ACCENT} / 0.12)` }}>
                <Store className="w-4 h-4" style={{ color: `hsl(${ACCENT})` }} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{v.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{v.kind} · {v.tags.join(", ")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-3 h-3" style={{ color: `hsl(${ACCENT})` }} aria-hidden="true" />{v.rating}
                </span>
                <span className="flex items-center gap-1 font-mono tabular-nums text-muted-foreground">
                  <MapPin className="w-3 h-3" aria-hidden="true" />{v.km}km
                </span>
                {!v.open && <Clock className="w-3 h-3 text-muted-foreground/60" aria-label="Closed" />}
              </div>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {results.length === 0 && (
          <li className="rounded-lg border border-[hsl(var(--line))] surface-1">
            <EmptyState icon={SearchX} title="Nothing within range"
              body="Widen the radius or clear a filter. In a real town this is the moment the app suggests the next street over." />
          </li>
        )}
      </ul>
    </DemoShell>
  );
};

export default FoodieFlowDemo;
