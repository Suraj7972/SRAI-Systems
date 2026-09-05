import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, History, FlaskConical, Zap, Play, TrendingUp, TrendingDown, ShieldAlert, Ban } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Meter, Stat, type Step } from "./parts";

const ACCENT = "190 85% 55%";

const FLOW: Step[] = [
  { id: "define", label: "Define", icon: LineChart },
  { id: "backtest", label: "Backtest", icon: History },
  { id: "paper", label: "Paper", icon: FlaskConical },
  { id: "live", label: "Live", icon: Zap },
];

/**
 * Deterministic synthetic price series. Fixed seed so the same settings always
 * produce the same result — a backtest that changed on every run would be
 * exactly the sort of thing this product exists to argue against.
 */
const PRICES = (() => {
  let s = 20240115, last = 100;
  const out: number[] = [];
  for (let i = 0; i < 180; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const r = s / 2147483648;
    last = Math.max(40, last * (1 + (r - 0.485) * 0.038));
    out.push(last);
  }
  return out;
})();

const sma = (arr: number[], i: number, n: number) => {
  if (i < n - 1) return null;
  let t = 0;
  for (let k = i - n + 1; k <= i; k++) t += arr[k];
  return t / n;
};

interface Trade { entry: number; exit: number; pnl: number; reason: "signal" | "stop"; }

const QuantDemo = () => {
  const [fast, setFast] = useState(10);
  const [slow, setSlow] = useState(30);
  const [stopPct, setStopPct] = useState(4);
  const [costs, setCosts] = useState(true);
  const [stage, setStage] = useState(1);

  /** The actual backtest. Runs on every parameter change. */
  const result = useMemo(() => {
    const trades: Trade[] = [];
    const equity: number[] = [];
    let cash = 100_000, pos = 0, entry = 0;
    const feeRate = costs ? 0.0012 : 0; // brokerage + taxes + slippage, round trip approximation

    for (let i = 0; i < PRICES.length; i++) {
      const p = PRICES[i];
      const f = sma(PRICES, i, fast), sl = sma(PRICES, i, slow);
      if (f !== null && sl !== null) {
        if (pos > 0 && p <= entry * (1 - stopPct / 100)) {
          const gross = pos * p; cash += gross - gross * feeRate;
          trades.push({ entry, exit: p, pnl: (p - entry) * pos - gross * feeRate, reason: "stop" });
          pos = 0;
        } else if (pos === 0 && f > sl) {
          const spend = cash * 0.95; pos = spend / p; entry = p; cash -= spend + spend * feeRate;
        } else if (pos > 0 && f < sl) {
          const gross = pos * p; cash += gross - gross * feeRate;
          trades.push({ entry, exit: p, pnl: (p - entry) * pos - gross * feeRate, reason: "signal" });
          pos = 0;
        }
      }
      equity.push(cash + pos * p);
    }

    const final = equity[equity.length - 1];
    const ret = ((final - 100_000) / 100_000) * 100;
    let peak = equity[0], maxDd = 0;
    for (const e of equity) { peak = Math.max(peak, e); maxDd = Math.max(maxDd, ((peak - e) / peak) * 100); }
    const wins = trades.filter((t) => t.pnl > 0).length;
    return {
      equity, ret, maxDd, trades,
      winRate: trades.length ? Math.round((wins / trades.length) * 100) : 0,
      stops: trades.filter((t) => t.reason === "stop").length,
    };
  }, [fast, slow, stopPct, costs]);

  const reset = useCallback(() => { setFast(10); setSlow(30); setStopPct(4); setCosts(true); setStage(1); }, []);
  const profitable = result.ret > 0;

  /* Equity curve path */
  const path = useMemo(() => {
    const e = result.equity, min = Math.min(...e), max = Math.max(...e), span = max - min || 1;
    return e.map((v, i) => `${(i / (e.length - 1)) * 100},${46 - ((v - min) / span) * 42 - 2}`).join(" L ");
  }, [result.equity]);

  return (
    <DemoShell title="Strategy backtest" subtitle="A real moving-average crossover, backtested in your browser over a fixed price series. Change the inputs and the result recomputes."
      accentHsl={ACCENT} onReset={reset}>

      <Stepper steps={FLOW} current={stage} accent={ACCENT} compact />

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="space-y-4">
          {[
            { id: "fast", label: "Fast average", value: fast, set: setFast, min: 3, max: 25, unit: " bars" },
            { id: "slow", label: "Slow average", value: slow, set: setSlow, min: 20, max: 80, unit: " bars" },
            { id: "stop", label: "Stop-loss", value: stopPct, set: setStopPct, min: 1, max: 12, unit: "%" },
          ].map((c) => (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={`q-${c.id}`} className="text-[11px] text-muted-foreground">{c.label}</label>
                <span className="font-mono text-xs tabular-nums" style={{ color: `hsl(${ACCENT})` }}>{c.value}{c.unit}</span>
              </div>
              <input id={`q-${c.id}`} type="range" min={c.min} max={c.max} value={c.value}
                onChange={(e) => c.set(Number(e.target.value))}
                className="w-full accent-current" style={{ color: `hsl(${ACCENT})` }} />
            </div>
          ))}

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={costs} onChange={(e) => setCosts(e.target.checked)}
              className="w-4 h-4 rounded accent-current" style={{ color: `hsl(${ACCENT})` }} />
            <span className="text-xs text-foreground">Include brokerage, taxes and slippage</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {(["Backtest", "Paper", "Live"] as const).map((label, i) => (
              <button key={label} type="button" onClick={() => setStage(i + 1)} aria-pressed={stage === i + 1}
                disabled={i === 2 && !profitable}
                className="press inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                style={stage === i + 1
                  ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)`, color: `hsl(${ACCENT})` }
                  : { borderColor: "hsl(var(--line))", color: "hsl(var(--muted-foreground))" }}>
                <Play className="w-3 h-3" aria-hidden="true" />{label}
              </button>
            ))}
          </div>

          <StatePanel
            title={stage === 3 ? "Live trading — limits enforced" : profitable ? "Backtest is positive" : "Backtest loses money"}
            tone={stage === 3 ? "accent" : profitable ? "success" : "danger"}
            accent={ACCENT}
            body={stage === 3
              ? `Running with a ${stopPct}% stop and a daily loss cap. The execution layer refuses orders that would breach either — a strategy cannot trade its way past its own limits.`
              : profitable
              ? `${result.ret.toFixed(1)}% over the series with a ${result.maxDd.toFixed(1)}% worst drawdown. Promotion to live is a deliberate step, never automatic.`
              : `Down ${Math.abs(result.ret).toFixed(1)}%. Most strategy ideas fail here — which is the point of testing before capital is involved. Try a wider gap between the averages.`}
          />

          {!costs && (
            <p className="flex items-start gap-1.5 text-[11px] text-amber-400/90 leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
              Costs are off. Backtests that ignore brokerage and slippage are how losing strategies look profitable.
            </p>
          )}
        </div>

        <div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Stat label="Return" value={`${result.ret > 0 ? "+" : ""}${result.ret.toFixed(1)}%`}
              icon={profitable ? TrendingUp : TrendingDown} accent={ACCENT} danger={!profitable} />
            <Stat label="Max drawdown" value={`−${result.maxDd.toFixed(1)}%`} icon={TrendingDown} accent={ACCENT} danger />
            <Stat label="Trades" value={result.trades.length} icon={History} accent={ACCENT} />
          </div>

          <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-3.5 mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Equity curve</p>
            <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="w-full" style={{ height: 92 }} aria-hidden="true">
              <defs>
                <linearGradient id="q-eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`hsl(${ACCENT})`} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={`hsl(${ACCENT})`} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M 0,46 L ${path} L 100,46 Z`} fill="url(#q-eq)" />
              <motion.path key={path} d={`M ${path}`} fill="none"
                stroke={profitable ? `hsl(${ACCENT})` : "hsl(var(--destructive))"} strokeWidth="1.5"
                vectorEffect="non-scaling-stroke" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <Meter label="Win rate" value={result.winRate} accent={ACCENT} suffix="%" />
            <Meter label="Stopped out" value={result.stops} max={Math.max(1, result.trades.length)} accent={ACCENT} danger />
          </div>

          <div className="rounded-lg border border-[hsl(var(--line))] surface-1 px-3.5 py-3 flex items-start gap-2">
            <Ban className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Synthetic prices, illustrative only. Not investment advice, not a forecast, and past results — real or
              simulated — do not predict future returns.
            </p>
          </div>
        </div>
      </div>
    </DemoShell>
  );
};

export default QuantDemo;
