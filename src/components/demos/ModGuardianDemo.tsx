import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, ScrollText, Inbox, Filter, Gauge, Gavel, Archive } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Meter, EmptyState, type Step } from "./parts";

const ACCENT = "25 90% 55%";
type Action = "allow" | "flag" | "block";

interface Rule { id: string; label: string; action: Action; weight: number; test: (t: string) => boolean; }

/** Real rules — these genuinely evaluate whatever the visitor types. */
const RULES: Rule[] = [
  { id: "contact-leak", label: "Contact details in public post", action: "flag", weight: 30,
    test: (t) => /(\+?\d[\d\s-]{8,}\d)|([\w.+-]+@[\w-]+\.[\w.]{2,})/.test(t) },
  { id: "external-payment", label: "Off-platform payment request", action: "block", weight: 55,
    test: (t) => /\b(upi|gpay|google\s?pay|paytm|phonepe|bank\s?transfer|western\s?union)\b/i.test(t) },
  { id: "urgency", label: "High-pressure urgency language", action: "flag", weight: 20,
    test: (t) => /\b(urgent|hurry|limited time|act now|today only|last chance)\b/i.test(t) },
  { id: "guarantee", label: "Unrealistic returns claim", action: "block", weight: 50,
    test: (t) => /\b(guaranteed?|100%|risk[- ]free|double your)\b.{0,24}\b(return|profit|money|income)\b/i.test(t) },
  { id: "link-shortener", label: "Shortened link", action: "flag", weight: 25,
    test: (t) => /\b(bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy)\b/i.test(t) },
  { id: "shouting", label: "Excessive capitalisation", action: "flag", weight: 12,
    test: (t) => { const l = t.replace(/[^A-Za-z]/g, ""); return l.length > 18 && (l.replace(/[^A-Z]/g, "").length / l.length) > 0.6; } },
  { id: "repetition", label: "Character flooding", action: "flag", weight: 10,
    test: (t) => /(.)\1{5,}/.test(t) },
];

const PIPELINE: Step[] = [
  { id: "ingest", label: "Ingest", icon: Inbox },
  { id: "rules", label: "Rules", icon: Filter },
  { id: "score", label: "Score", icon: Gauge },
  { id: "decide", label: "Decision", icon: Gavel },
  { id: "audit", label: "Audit", icon: Archive },
];

const SAMPLES = [
  { label: "Clean listing", text: "Fresh organic wheat available, 20 quintal, delivery within Pune district." },
  { label: "Scam", text: "GUARANTEED 200% RETURN!!! Pay by UPI today only — limited time!!! bit.ly/x9j" },
  { label: "Contact leak", text: "Interested in your listing. Call me on 98765 43210 or mail raj@example.com" },
];

const ModGuardianDemo = () => {
  const [text, setText] = useState(SAMPLES[1].text);
  const [stage, setStage] = useState(3);
  const [log, setLog] = useState<{ id: number; verdict: Action; score: number; at: string; excerpt: string }[]>([]);
  const [nextId, setNextId] = useState(1);

  const fired = useMemo(() => RULES.filter((r) => r.test(text)), [text]);
  const score = useMemo(() => Math.min(100, fired.reduce((s, r) => s + r.weight, 0)), [fired]);
  const verdict: Action = fired.some((r) => r.action === "block") || score >= 60 ? "block" : fired.length ? "flag" : "allow";

  /* Animate the pipeline forward whenever the input changes. */
  useEffect(() => {
    setStage(0);
    const timers = [1, 2, 3].map((n) => setTimeout(() => setStage(n), n * 190));
    return () => timers.forEach(clearTimeout);
  }, [text]);

  const commit = useCallback(() => {
    setLog((prev) => [{
      id: nextId, verdict, score,
      at: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      excerpt: text.slice(0, 40) + (text.length > 40 ? "…" : ""),
    }, ...prev].slice(0, 6));
    setNextId((n) => n + 1);
    setStage(4);
  }, [nextId, verdict, score, text]);

  const V = {
    allow: { icon: ShieldCheck, label: "Allowed", tone: "success" as const,
      note: "No rule matched. The post publishes immediately with no human in the loop." },
    flag: { icon: ShieldAlert, label: "Flagged for review", tone: "accent" as const,
      note: "Below the block threshold but not clean. It goes to a moderator queue rather than being removed automatically." },
    block: { icon: ShieldX, label: "Blocked", tone: "danger" as const,
      note: "A blocking rule fired, or the weighted score crossed 60. The post never reaches the marketplace." },
  }[verdict];

  return (
    <DemoShell title="Moderation pipeline" subtitle="Type anything. Seven rules evaluate it live in your browser — real matching logic, not a canned response."
      accentHsl={ACCENT} onReset={() => { setText(SAMPLES[0].text); setLog([]); }}>

      <Stepper steps={PIPELINE} current={stage} accent={ACCENT} error={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="mg-input" className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Incoming content
          </label>
          <textarea id="mg-input" rows={4} value={text} onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--line))] surface-1 px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />

          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {SAMPLES.map((s) => (
              <button key={s.label} type="button" onClick={() => setText(s.text)}
                className="rounded-md border border-[hsl(var(--line))] px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                {s.label}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <Meter label="Risk score" value={score} accent={ACCENT} danger={verdict === "block"} />
          </div>

          <StatePanel
            title={V.label}
            tone={V.tone}
            accent={ACCENT}
            body={<><span className="flex items-center gap-1.5 mb-1.5" style={{ color: "inherit" }}>
              <V.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-wider">{fired.length} rule{fired.length === 1 ? "" : "s"} firing</span>
            </span>{V.note}</>}
          />

          <button type="button" onClick={commit}
            className="press mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{ background: `hsl(${ACCENT})`, color: "#1a1000" }}>
            <ScrollText className="w-4 h-4" aria-hidden="true" /> Record decision to audit trail
          </button>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Rules</p>
          <ul className="space-y-1.5 mb-5">
            {RULES.map((r) => {
              const on = fired.includes(r);
              const c = r.action === "block" ? "hsl(var(--destructive))" : `hsl(${ACCENT})`;
              return (
                <motion.li key={r.id} animate={{ opacity: on ? 1 : 0.5 }}
                  className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors"
                  style={on
                    ? { borderColor: `${c}55`, background: `${c}10`, color: "hsl(var(--foreground))" }
                    : { borderColor: "hsl(var(--line))", color: "hsl(var(--muted-foreground))" }}>
                  <span className="flex items-center gap-2 min-w-0">
                    <motion.span animate={on ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: on ? c : "hsl(var(--line-strong))" }} aria-hidden="true" />
                    <span className="truncate">{r.label}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase shrink-0">{on ? r.action : "—"}</span>
                </motion.li>
              );
            })}
          </ul>

          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Audit trail</p>
          <div className="rounded-lg border border-[hsl(var(--line))] surface-1 min-h-[110px]">
            {log.length === 0 ? (
              <EmptyState icon={Archive} title="Nothing recorded yet"
                body="Record a decision and it lands here with a timestamp — that record is what makes a moderation call defensible later." />
            ) : (
              <ul className="divide-y divide-[hsl(var(--line))]" aria-live="polite">
                <AnimatePresence initial={false}>
                  {log.map((e) => (
                    <motion.li key={e.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2 text-[11px]">
                      <span className="font-mono text-muted-foreground shrink-0">{e.at}</span>
                      <span className="truncate text-muted-foreground flex-1">{e.excerpt}</span>
                      <span className="font-mono tabular-nums text-muted-foreground shrink-0">{e.score}</span>
                      <span className="font-mono uppercase text-[10px] shrink-0"
                        style={{ color: e.verdict === "block" ? "hsl(var(--destructive))" : e.verdict === "flag" ? `hsl(${ACCENT})` : "hsl(152 60% 55%)" }}>
                        {e.verdict}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>
    </DemoShell>
  );
};

export default ModGuardianDemo;
