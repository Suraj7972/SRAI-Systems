import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Wallet, Hammer, PackageCheck, AlertTriangle, Shield } from "lucide-react";
import DemoShell from "./DemoShell";

const ACCENT = "350 80% 55%";

const STAGES = [
  { id: "agreed", label: "Agreed", icon: Check, note: "Both sides accept scope and amount. No money has moved." },
  { id: "funded", label: "Funded", icon: Wallet, note: "Buyer's ₹18,000 is held in escrow. The seller can see it is there but cannot touch it." },
  { id: "working", label: "Work started", icon: Hammer, note: "Seller has begun. Escrow stays locked; the audit trail records the start." },
  { id: "delivered", label: "Delivered", icon: PackageCheck, note: "Seller marks delivery. The buyer now has a decision to make." },
  { id: "released", label: "Released", icon: Check, note: "Buyer confirms. Funds release and both trust scores move up." },
] as const;

const TheCrowsDemo = () => {
  const [stage, setStage] = useState(0);
  const [disputed, setDisputed] = useState(false);
  const [buyerTrust, setBuyerTrust] = useState(72);
  const [sellerTrust, setSellerTrust] = useState(64);

  const reset = useCallback(() => { setStage(0); setDisputed(false); setBuyerTrust(72); setSellerTrust(64); }, []);

  const advance = () => {
    if (disputed || stage >= STAGES.length - 1) return;
    const next = stage + 1;
    setStage(next);
    if (next === STAGES.length - 1) { setBuyerTrust((t) => Math.min(100, t + 4)); setSellerTrust((t) => Math.min(100, t + 7)); }
  };

  const dispute = () => {
    if (disputed || stage < 1) return;
    setDisputed(true);
    setSellerTrust((t) => Math.max(0, t - 11));
  };

  const current = STAGES[stage];

  return (
    <DemoShell title="Escrow lifecycle" subtitle="Step a transaction through the trust engine. Every state change updates the audit trail and both trust scores." accentHsl={ACCENT} onReset={reset}>
      {/* Stage rail */}
      <ol className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STAGES.map((s, i) => {
          const done = i < stage, active = i === stage && !disputed;
          return (
            <li key={s.id} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center gap-1.5 min-w-[76px]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
                  style={active || done
                    ? { background: `hsl(${ACCENT} / 0.15)`, borderColor: `hsl(${ACCENT})`, color: `hsl(${ACCENT})` }
                    : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <span className="text-[10px] text-center leading-tight"
                  style={{ color: active ? `hsl(${ACCENT})` : "hsl(var(--muted-foreground))" }}>{s.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-6 h-px shrink-0 mb-5" style={{ background: i < stage ? `hsl(${ACCENT} / 0.5)` : "hsl(var(--border))" }} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-5">
        <div>
          <div className="rounded-lg border p-4 mb-3"
            style={disputed
              ? { borderColor: "hsl(var(--destructive) / 0.45)", background: "hsl(var(--destructive) / 0.08)" }
              : { borderColor: "hsl(var(--border))", background: "hsl(var(--background) / 0.6)" }}>
            <p className="text-sm font-semibold text-foreground mb-1.5">
              {disputed ? "Dispute raised" : current.label}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {disputed
                ? "Funds stay locked in escrow. Neither side can withdraw while the dispute is open, and the seller's trust score has already taken the hit."
                : current.note}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={advance} disabled={disputed || stage >= STAGES.length - 1}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={{ background: `hsl(${ACCENT})` }}>
              {stage >= STAGES.length - 1 ? "Completed" : `Advance to ${STAGES[Math.min(stage + 1, STAGES.length - 1)].label}`}
            </button>
            <button type="button" onClick={dispute} disabled={disputed || stage < 1 || stage >= STAGES.length - 1}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Raise dispute
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {[{ who: "Buyer", handle: "crow_4f2a", score: buyerTrust }, { who: "Seller", handle: "crow_9d17", score: sellerTrust }].map((p) => (
            <div key={p.who} className="rounded-lg border border-border bg-background/50 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">{p.who}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.handle}</p>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-sm tabular-nums" style={{ color: `hsl(${ACCENT})` }}>
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />{p.score}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div className="h-full rounded-full" animate={{ width: `${p.score}%` }} transition={{ duration: 0.5 }}
                  style={{ background: `hsl(${ACCENT})` }} />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Neither party has shared a legal name or a document. The trust score and the escrow
            carry the risk instead.
          </p>
        </div>
      </div>
    </DemoShell>
  );
};

export default TheCrowsDemo;
