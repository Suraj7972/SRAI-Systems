import type { ProductStatus } from "@/data/srai";

/**
 * Honest deployment status. The six labels are the only ones allowed —
 * vague labels like "Active Platform" are what this replaces.
 */
const STYLES: Record<ProductStatus, { dot: string; text: string; bg: string; border: string; help: string }> = {
  LIVE: {
    dot: "#34d399", text: "#6ee7b7", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.35)",
    help: "Publicly available today",
  },
  DEPLOYING: {
    dot: "#38bdf8", text: "#7dd3fc", bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.35)",
    help: "Deployment in progress",
  },
  READY: {
    dot: "#a5b4fc", text: "#c7d2fe", bg: "rgba(165,180,252,0.10)", border: "rgba(165,180,252,0.35)",
    help: "Built and complete — not yet publicly deployed",
  },
  "PRIVATE PILOT": {
    dot: "#fbbf24", text: "#fcd34d", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.35)",
    help: "In use with selected partners",
  },
  "IN DEVELOPMENT": {
    dot: "#fb923c", text: "#fdba74", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.35)",
    help: "Actively being built",
  },
  "COMING SOON": {
    dot: "#94a3b8", text: "#cbd5e1", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)",
    help: "Planned",
  },
};

interface Props {
  status: ProductStatus;
  size?: "sm" | "md";
  withHelp?: boolean;
  className?: string;
}

const StatusBadge = ({ status, size = "sm", withHelp = false, className = "" }: Props) => {
  const s = STYLES[status];
  const pad = size === "md" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-mono font-medium uppercase tracking-wider ${pad} ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} aria-hidden="true" />
      {status}
      {withHelp && <span className="normal-case tracking-normal font-sans opacity-70">· {s.help}</span>}
    </span>
  );
};

export const statusHelp = (status: ProductStatus) => STYLES[status].help;
export default StatusBadge;
