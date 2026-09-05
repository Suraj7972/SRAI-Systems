import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, TrendingUp, Lock, Trophy, Timer, Users, ListPlus, Radio, HandCoins, PackageCheck } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Stat, Sparkline, type Step } from "./parts";

const ACCENT = "45 95% 55%";
const RIVALS = ["Traderr_91", "AgriMart", "S. Deshmukh", "Vidarbha Co-op"];
const START = 42_000;
const DURATION = 45;

const FLOW: Step[] = [
  { id: "listed", label: "Listed", icon: ListPlus },
  { id: "live", label: "Live bidding", icon: Radio },
  { id: "won", label: "Won", icon: Trophy },
  { id: "escrow", label: "In escrow", icon: HandCoins },
  { id: "settled", label: "Settled", icon: PackageCheck },
];

interface Bid { id: number; who: string; amount: number; you: boolean; at: string; }
const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const now = () => new Date().toLocaleTimeString("en-IN", { hour12: false });

const AuctionsDemo = () => {
  const [bids, setBids] = useState<Bid[]>([{ id: 0, who: "Opening price", amount: START, you: false, at: now() }]);
  const [seconds, setSeconds] = useState(DURATION);
  const [running, setRunning] = useState(true);
  const [extended, setExtended] = useState(false);
  const [settleStep, setSettleStep] = useState(0);
  const nextId = useRef(1);

  const top = bids[0];
  const increment = 500;
  const youLead = top.you;
  const bidders = new Set(bids.filter((b) => b.id !== 0).map((b) => b.who)).size;

  const reset = useCallback(() => {
    setBids([{ id: 0, who: "Opening price", amount: START, you: false, at: now() }]);
    setSeconds(DURATION); setRunning(true); setExtended(false); setSettleStep(0); nextId.current = 1;
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setBids((prev) => {
        const cur = prev[0];
        const bump = increment * (1 + Math.floor(Math.random() * 3));
        return [{ id: nextId.current++, who: RIVALS[Math.floor(Math.random() * RIVALS.length)], amount: cur.amount + bump, you: false, at: now() }, ...prev];
      });
    }, 4200 + Math.random() * 3800);
    return () => clearTimeout(t);
  }, [bids, running]);

  const placeBid = () => {
    if (!running) return;
    setBids((prev) => [{ id: nextId.current++, who: "You", amount: prev[0].amount + increment, you: true, at: now() }, ...prev]);
    setSeconds((s) => { if (s <= 10) { setExtended(true); return s + 15; } return s; });
  };

  /* Stage: 1 while live; after close, 2 (won) then escrow steps the user advances. */
  const stage = running ? 1 : 2 + settleStep;
  const won = !running && youLead;

  const panel = running
    ? { title: extended ? "Anti-snipe extension active" : "Bidding is open", tone: "accent" as const,
        body: extended
          ? "A bid landed inside the final ten seconds, so the close moved back by fifteen. Sniping the last second does not win here."
          : "Rival bids arrive on their own. Every bid resets nothing — the clock only extends if someone bids in the last ten seconds." }
    : won
    ? settleStep === 0
      ? { title: "You won the lot", tone: "success" as const,
          body: `Winning bid ${fmt(top.amount)}. Nothing has moved yet — funding escrow is the next step, and the seller cannot touch the money until you confirm delivery.` }
      : settleStep === 1
      ? { title: "Funds held in escrow", tone: "accent" as const,
          body: "The seller can see the money is committed and will dispatch. If the goods do not arrive as described, the funds return to you rather than to them." }
      : { title: "Settled", tone: "success" as const,
          body: "Delivery confirmed, escrow released to the seller, and both trust scores move up. The whole exchange is on the audit trail." }
    : { title: "Auction closed", tone: "neutral" as const,
        body: `${top.who} took the lot at ${fmt(top.amount)}. Reset to run it again and try bidding in the last ten seconds.` };

  return (
    <DemoShell title="Live auction" subtitle="The clock, the rival bidders and the anti-snipe extension all run here — nothing is pre-recorded."
      accentHsl={ACCENT} onReset={reset}>

      <Stepper steps={FLOW} current={stage} accent={ACCENT} />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Current bid" value={fmt(top.amount)} icon={TrendingUp} accent={ACCENT} />
        <Stat label="Bidders" value={bidders} icon={Users} accent={ACCENT} />
        <Stat label="Time left" value={running ? `0:${String(seconds).padStart(2, "0")}` : "closed"} icon={Timer}
          accent={ACCENT} danger={running && seconds <= 10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5">
        <div>
          <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-4 mb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Soybean · 40 quintal · Grade A</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pune APMC</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider shrink-0"
                style={running
                  ? { color: "hsl(var(--destructive))", borderColor: "hsl(var(--destructive) / 0.4)", background: "hsl(var(--destructive) / 0.1)" }
                  : { color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--line))" }}>
                {running && <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
                {running ? "Live" : "Closed"}
              </span>
            </div>

            <Sparkline points={[...bids].reverse().map((b) => b.amount)} accent={ACCENT} />

            <div className="h-1.5 rounded-full overflow-hidden mt-3" style={{ background: "hsl(var(--surface-3))" }}
              role="progressbar" aria-valuenow={seconds} aria-valuemin={0} aria-valuemax={DURATION} aria-label="Time remaining">
              <motion.div className="h-full rounded-full" animate={{ width: `${(seconds / DURATION) * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
                style={{ background: seconds <= 10 ? "hsl(var(--destructive))" : `hsl(${ACCENT})` }} />
            </div>
          </div>

          {running ? (
            <button type="button" onClick={placeBid}
              className="press w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={{ background: `hsl(${ACCENT})`, color: "#1a1200" }}>
              <Gavel className="w-4 h-4" aria-hidden="true" /> Bid {fmt(top.amount + increment)}
            </button>
          ) : won && settleStep < 2 ? (
            <button type="button" onClick={() => setSettleStep((s) => s + 1)}
              className="press w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              style={{ background: `hsl(${ACCENT})`, color: "#1a1200" }}>
              {settleStep === 0 ? <><HandCoins className="w-4 h-4" aria-hidden="true" /> Fund escrow</>
                : <><PackageCheck className="w-4 h-4" aria-hidden="true" /> Confirm delivery</>}
            </button>
          ) : (
            <div className="rounded-lg border border-[hsl(var(--line))] surface-1 px-4 py-3 text-center text-sm text-muted-foreground">
              {won ? "Settled — reset to run it again." : "Outbid. Reset to try again."}
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2.5">
            <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
            Settlement held in escrow until the buyer confirms delivery.
          </p>

          <div className="mt-3"><StatePanel title={panel.title} tone={panel.tone} accent={ACCENT} body={panel.body} /></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Bid history</p>
            {youLead && running && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                <TrendingUp className="w-3 h-3" aria-hidden="true" /> You lead
              </motion.span>
            )}
          </div>
          <ul className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1" aria-live="polite">
            <AnimatePresence initial={false}>
              {bids.map((b) => (
                <motion.li key={b.id} layout initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
                  style={b.you
                    ? { borderColor: `hsl(${ACCENT} / 0.4)`, background: `hsl(${ACCENT} / 0.08)` }
                    : { borderColor: "hsl(var(--line))", background: "hsl(var(--surface-1))" }}>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">{b.at}</span>
                    <span className={`truncate ${b.you ? "font-semibold" : "text-muted-foreground"}`}
                      style={b.you ? { color: `hsl(${ACCENT})` } : undefined}>{b.who}</span>
                  </span>
                  <span className="font-mono tabular-nums text-foreground shrink-0">{fmt(b.amount)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </DemoShell>
  );
};

export default AuctionsDemo;
