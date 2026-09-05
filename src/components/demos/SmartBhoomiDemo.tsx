import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, Sprout, Wheat, Droplets, Tractor, ScrollText, Coins } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Stat, Sparkline, EmptyState, type Step } from "./parts";

const ACCENT = "160 70% 45%";

interface Entry { id: number; kind: "expense" | "sale"; labelMr: string; labelEn: string; amount: number; }

const SEED: Entry[] = [
  { id: 1, kind: "expense", labelMr: "बियाणे", labelEn: "Seed", amount: 8400 },
  { id: 2, kind: "expense", labelMr: "खत", labelEn: "Fertilizer", amount: 5200 },
  { id: 3, kind: "sale", labelMr: "सोयाबीन विक्री", labelEn: "Soybean sale", amount: 41000 },
  { id: 4, kind: "expense", labelMr: "मजुरी", labelEn: "Labour", amount: 6800 },
];

const PRESETS = [
  { kind: "expense" as const, labelMr: "औषध", labelEn: "Pesticide", amount: 3100 },
  { kind: "expense" as const, labelMr: "पाणी", labelEn: "Irrigation", amount: 1900 },
  { kind: "sale" as const, labelMr: "तूर विक्री", labelEn: "Tur sale", amount: 17500 },
];

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const SEASON: Step[] = [
  { id: "sow", label: "पेरणी · Sowing", icon: Wheat },
  { id: "grow", label: "वाढ · Growing", icon: Droplets },
  { id: "harvest", label: "कापणी · Harvest", icon: Tractor },
  { id: "sell", label: "विक्री · Sale", icon: Coins },
];

const SmartBhoomiDemo = () => {
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [nextId, setNextId] = useState(5);

  const { income, spend, net } = useMemo(() => {
    const income = entries.filter((e) => e.kind === "sale").reduce((s, e) => s + e.amount, 0);
    const spend = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, spend, net: income - spend };
  }, [entries]);

  /* Running net after each entry, oldest → newest, for the sparkline. */
  const runningNet = useMemo(() => {
    let acc = 0;
    return [...entries].reverse().map((e) => { acc += e.kind === "sale" ? e.amount : -e.amount; return acc; });
  }, [entries]);

  const sales = entries.filter((e) => e.kind === "sale").length;
  const stage = sales >= 2 ? 3 : sales === 1 ? 2 : entries.length > 2 ? 1 : 0;

  const add = (p: (typeof PRESETS)[number]) => {
    setEntries((prev) => [{ ...p, id: nextId }, ...prev]);
    setNextId((n) => n + 1);
  };
  const reset = useCallback(() => { setEntries(SEED); setNextId(5); }, []);
  const clearAll = useCallback(() => { setEntries([]); }, []);

  return (
    <DemoShell title="Farm ledger — नफा/तोटा" subtitle="Add entries and the season's profit and loss recalculates live. Labels are Marathi-first, as they are in the product." accentHsl={ACCENT} onReset={reset}>
      <Stepper steps={SEASON} current={stage} accent={ACCENT} compact />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="विक्री · Income" value={fmt(income)} icon={TrendingUp} accent={ACCENT} />
        <Stat label="खर्च · Spend" value={fmt(spend)} icon={TrendingDown} accent={ACCENT} danger />
        <Stat label="नफा · Net" value={fmt(net)} icon={Sprout} accent={ACCENT} danger={net < 0} />
      </div>

      <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-3.5 mb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          नफा वक्र · Running net
        </p>
        <Sparkline points={runningNet} accent={ACCENT} height={42} />
      </div>

      <div className="mb-4">
        <StatePanel
          title={net >= 0 ? "नफ्यात · In profit" : "तोट्यात · In loss"}
          tone={net >= 0 ? "success" : "danger"}
          accent={ACCENT}
          body={net >= 0
            ? `This season is ${fmt(net)} ahead. The number updates as each entry goes in, so the answer exists during the season instead of after it.`
            : `Spend is ${fmt(Math.abs(net))} ahead of sales so far. A farmer sees this while there is still time to act on it.`}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button key={p.labelEn} type="button" onClick={() => add(p)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--line))] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <Plus className="w-3 h-3" aria-hidden="true" />
            {p.labelMr} <span className="text-muted-foreground/60">{fmt(p.amount)}</span>
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-[hsl(var(--line))] surface-1">
          <EmptyState icon={ScrollText} title="कोणतीही नोंद नाही · No entries"
            body="Add an expense or a sale above and the season's profit and loss starts building immediately." />
        </div>
      ) : (
      <ul className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1" aria-live="polite">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 rounded-lg border border-[hsl(var(--line))] surface-1 px-3 py-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: e.kind === "sale" ? `hsl(${ACCENT})` : "hsl(var(--destructive))" }} aria-hidden="true" />
                <span className="text-sm text-foreground truncate">{e.labelMr}</span>
                <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">{e.labelEn}</span>
              </span>
              <span className="font-mono text-xs tabular-nums shrink-0"
                style={{ color: e.kind === "sale" ? `hsl(${ACCENT})` : "hsl(var(--muted-foreground))" }}>
                {e.kind === "sale" ? "+" : "−"}{fmt(e.amount)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      )}
    </DemoShell>
  );
};

export default SmartBhoomiDemo;
