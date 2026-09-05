import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * Shared building blocks for the interactive demos.
 *
 * Extracted from the escrow demo, whose stepper rail / contextual panel /
 * animated meter combination read best in review. Every demo now uses the same
 * vocabulary so the set feels like one system rather than seven experiments.
 */

/* ── Stepper rail ─────────────────────────────────────────────── */
export interface Step { id: string; label: string; icon: LucideIcon; }

export const Stepper = ({
  steps, current, accent, error = false, compact = false,
}: { steps: Step[]; current: number; accent: string; error?: boolean; compact?: boolean }) => (
  <ol className={`flex items-center gap-1 overflow-x-auto pb-1 ${compact ? "mb-4" : "mb-6"}`}>
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current && !error;
      const on = done || active;
      return (
        <li key={s.id} className="flex items-center gap-1 shrink-0">
          <div className="flex flex-col items-center gap-1.5 min-w-[74px]">
            <motion.div
              animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-8 h-8 rounded-full flex items-center justify-center border"
              style={on
                ? { background: `hsl(${accent} / 0.15)`, borderColor: `hsl(${accent})`, color: `hsl(${accent})` }
                : { borderColor: "hsl(var(--line))", color: "hsl(var(--muted-foreground))" }}>
              <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.div>
            <span className="text-[10px] text-center leading-tight"
              style={{ color: active ? `hsl(${accent})` : "hsl(var(--muted-foreground))" }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-px shrink-0 mb-5 overflow-hidden" style={{ background: "hsl(var(--line))" }}>
              <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: done ? "100%" : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }} style={{ background: `hsl(${accent} / 0.6)` }} />
            </div>
          )}
        </li>
      );
    })}
  </ol>
);

/* ── Contextual state panel ───────────────────────────────────── */
export const StatePanel = ({
  title, body, tone = "neutral", accent,
}: { title: string; body: ReactNode; tone?: "neutral" | "accent" | "danger" | "success"; accent?: string }) => {
  const style =
    tone === "danger"
      ? { borderColor: "hsl(var(--destructive) / 0.45)", background: "hsl(var(--destructive) / 0.08)" }
      : tone === "success"
      ? { borderColor: "hsl(152 60% 50% / 0.45)", background: "hsl(152 60% 50% / 0.08)" }
      : tone === "accent" && accent
      ? { borderColor: `hsl(${accent} / 0.4)`, background: `hsl(${accent} / 0.07)` }
      : { borderColor: "hsl(var(--line))", background: "hsl(var(--surface-1))" };
  const titleColor =
    tone === "danger" ? "hsl(var(--destructive))"
    : tone === "success" ? "hsl(152 60% 55%)"
    : tone === "accent" && accent ? `hsl(${accent})`
    : "hsl(var(--foreground))";

  return (
    <AnimatePresence mode="wait">
      <motion.div key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }} className="rounded-lg border p-4" style={style} role="status">
        <p className="text-sm font-semibold mb-1.5" style={{ color: titleColor }}>{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Animated meter ───────────────────────────────────────────── */
export const Meter = ({
  label, value, max = 100, accent, suffix = "", icon: Icon, danger = false,
}: { label: string; value: number; max?: number; accent: string; suffix?: string; icon?: LucideIcon; danger?: boolean }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = danger ? "hsl(var(--destructive))" : `hsl(${accent})`;
  return (
    <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} aria-hidden="true" />}
          <span className="truncate">{label}</span>
        </span>
        <span className="font-mono text-sm tabular-nums font-semibold shrink-0" style={{ color }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--surface-3))" }}
        role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ background: color }} />
      </div>
    </div>
  );
};

/* ── Stat tile ────────────────────────────────────────────────── */
export const Stat = ({
  label, value, icon: Icon, accent, danger = false,
}: { label: string; value: string | number; icon?: LucideIcon; accent: string; danger?: boolean }) => {
  const color = danger ? "hsl(var(--destructive))" : `hsl(${accent})`;
  return (
    <div className="rounded-lg border border-[hsl(var(--line))] surface-1 p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} aria-hidden="true" />}
        <span className="text-[11px] text-muted-foreground truncate">{label}</span>
      </div>
      <AnimatePresence mode="popLayout">
        <motion.p key={String(value)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-lg font-bold tabular-nums" style={{ color: danger ? color : "hsl(var(--foreground))" }}>
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

/* ── Sparkline ────────────────────────────────────────────────── */
export const Sparkline = ({ points, accent, height = 34 }: { points: number[]; accent: string; height?: number }) => {
  if (points.length < 2) return <div style={{ height }} />;
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const w = 100;
  const d = points.map((p, i) => `${(i / (points.length - 1)) * w},${height - ((p - min) / span) * (height - 6) - 3}`).join(" L ");
  const area = `M 0,${height} L ${d} L ${w},${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${accent.replace(/\D/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${accent})`} stopOpacity="0.28" />
          <stop offset="100%" stopColor={`hsl(${accent})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${accent.replace(/\D/g, "")})`} />
      <motion.path d={`M ${d}`} fill="none" stroke={`hsl(${accent})`} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
      <circle cx={w} cy={height - ((points[points.length - 1] - min) / span) * (height - 6) - 3} r="2.4" fill={`hsl(${accent})`} />
    </svg>
  );
};

/* ── Empty state ──────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) => (
  <div className="flex flex-col items-center justify-center text-center py-8 px-4">
    <Icon className="w-6 h-6 text-muted-foreground/40 mb-3" aria-hidden="true" />
    <p className="text-sm font-medium text-foreground mb-1">{title}</p>
    <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">{body}</p>
  </div>
);
