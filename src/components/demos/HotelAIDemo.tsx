import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Receipt, IndianRupee, Armchair, UtensilsCrossed, ChefHat, FileText, CheckCircle2 } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Stat, EmptyState, type Step } from "./parts";

const ACCENT = "35 85% 55%";

const MENU = [
  { id: "thali", name: "Veg Thali", price: 180, cost: 74 },
  { id: "paneer", name: "Paneer Masala", price: 240, cost: 96 },
  { id: "roti", name: "Tandoori Roti", price: 25, cost: 7 },
  { id: "chai", name: "Masala Chai", price: 30, cost: 9 },
];

interface Line { id: number; itemId: string; qty: number; }
const TABLES = ["T1", "T2", "T3", "T4", "T5", "T6"];

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const SERVICE: Step[] = [
  { id: "seat", label: "Seat", icon: Armchair },
  { id: "order", label: "Order", icon: UtensilsCrossed },
  { id: "kitchen", label: "Kitchen", icon: ChefHat },
  { id: "bill", label: "Bill", icon: FileText },
  { id: "settle", label: "Settled", icon: CheckCircle2 },
];

const HotelAIDemo = () => {
  const [active, setActive] = useState("T2");
  const [orders, setOrders] = useState<Record<string, Line[]>>({
    T2: [{ id: 1, itemId: "thali", qty: 2 }, { id: 2, itemId: "chai", qty: 2 }],
    T5: [{ id: 3, itemId: "paneer", qty: 1 }, { id: 4, itemId: "roti", qty: 4 }],
  });
  const [nextId, setNextId] = useState(5);

  const lines = orders[active] ?? [];

  const totals = useMemo(() => {
    const all = Object.values(orders).flat();
    const rev = all.reduce((s, l) => s + (MENU.find((m) => m.id === l.itemId)?.price ?? 0) * l.qty, 0);
    const cogs = all.reduce((s, l) => s + (MENU.find((m) => m.id === l.itemId)?.cost ?? 0) * l.qty, 0);
    const bill = lines.reduce((s, l) => s + (MENU.find((m) => m.id === l.itemId)?.price ?? 0) * l.qty, 0);
    return { rev, cogs, margin: rev ? Math.round(((rev - cogs) / rev) * 100) : 0, bill, gst: Math.round(bill * 0.05) };
  }, [orders, lines]);

  const addItem = (itemId: string) => {
    setOrders((prev) => {
      const cur = prev[active] ?? [];
      const found = cur.find((l) => l.itemId === itemId);
      if (found) return { ...prev, [active]: cur.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)) };
      return { ...prev, [active]: [...cur, { id: nextId, itemId, qty: 1 }] };
    });
    setNextId((n) => n + 1);
  };

  const [justSettled, setJustSettled] = useState<{ table: string; total: number } | null>(null);
  const settle = () => {
    setJustSettled({ table: active, total: totals.bill + totals.gst });
    setOrders((prev) => { const n = { ...prev }; delete n[active]; return n; });
    setTimeout(() => setJustSettled(null), 4200);
  };
  const reset = useCallback(() => {
    setOrders({ T2: [{ id: 1, itemId: "thali", qty: 2 }, { id: 2, itemId: "chai", qty: 2 }], T5: [{ id: 3, itemId: "paneer", qty: 1 }, { id: 4, itemId: "roti", qty: 4 }] });
    setActive("T2"); setNextId(5);
  }, []);

  const occupied = Object.keys(orders).length;

  return (
    <DemoShell title="Floor and billing" subtitle="Seat a table, add items, settle the bill — margin and covers recalculate as you go." accentHsl={ACCENT} onReset={reset}>
      <Stepper steps={SERVICE} current={justSettled ? 4 : lines.length ? 3 : occupied ? 1 : 0} accent={ACCENT} compact />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Covers open" value={`${occupied}/${TABLES.length}`} icon={Users} accent={ACCENT} />
        <Stat label="Revenue today" value={fmt(totals.rev)} icon={IndianRupee} accent={ACCENT} />
        <Stat label="Gross margin" value={`${totals.margin}%`} icon={Receipt} accent={ACCENT} />
      </div>

      {justSettled && (
        <div className="mb-4">
          <StatePanel title={`Table ${justSettled.table} settled — ${fmt(justSettled.total)}`} tone="success"
            body="Cleared from the floor, added to today's revenue, and the margin above recalculated. Inventory would draw down from the same action." />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Floor</p>
          <div className="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="Select a table">
            {TABLES.map((t) => {
              const busy = !!orders[t]?.length, sel = t === active;
              return (
                <button key={t} type="button" onClick={() => setActive(t)} aria-pressed={sel}
                  className="aspect-[4/3] rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={sel
                    ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.16)`, color: `hsl(${ACCENT})` }
                    : busy
                    ? { borderColor: `hsl(${ACCENT} / 0.35)`, background: `hsl(${ACCENT} / 0.06)`, color: "hsl(var(--foreground))" }
                    : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  {t}
                  <span className="block text-[9px] font-normal font-mono uppercase mt-0.5 opacity-70">{busy ? "seated" : "free"}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Add to {active}</p>
          <div className="flex flex-wrap gap-1.5">
            {MENU.map((m) => (
              <button key={m.id} type="button" onClick={() => addItem(m.id)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <Plus className="w-2.5 h-2.5" aria-hidden="true" />{m.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Bill · {active}</p>
          <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-4 min-h-[210px] flex flex-col">
            {lines.length === 0 ? (
              <EmptyState icon={Armchair} title={`Table ${active} is free`}
                body="Pick a menu item on the left to seat it. The bill, covers and margin all update from the same action." />
            ) : (
              <>
                <ul className="space-y-2 flex-1">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => {
                      const m = MENU.find((x) => x.id === l.itemId)!;
                      return (
                        <motion.li key={l.itemId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{m.name} <span className="text-muted-foreground">× {l.qty}</span></span>
                          <span className="font-mono tabular-nums text-muted-foreground">{fmt(m.price * l.qty)}</span>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-[hsl(var(--line))] mt-3 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span><span className="font-mono tabular-nums">{fmt(totals.bill)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST 5%</span><span className="font-mono tabular-nums">{fmt(totals.gst)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-1">
                    <span className="text-foreground">Total</span>
                    <span className="font-mono tabular-nums" style={{ color: `hsl(${ACCENT})` }}>{fmt(totals.bill + totals.gst)}</span>
                  </div>
                </div>
                <button type="button" onClick={settle}
                  className="press mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={{ background: `hsl(${ACCENT})`, color: "#1a1000" }}>
                  Settle and clear table
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DemoShell>
  );
};

export default HotelAIDemo;
