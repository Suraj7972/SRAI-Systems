import { ReactNode } from "react";
import { RotateCcw, Zap } from "lucide-react";

interface Props {
  title: string;
  /** One line saying what the visitor is looking at. */
  subtitle: string;
  accentHsl: string;
  onReset?: () => void;
  children: ReactNode;
}

/**
 * Frame shared by every interactive demo.
 *
 * These demos are REAL running code — the logic below each one genuinely
 * executes in the visitor's browser. They are working models of how a product
 * behaves, not captures of the shipped product's interface, and the badge says
 * so. That distinction is deliberate: we never present a simulation as a
 * screenshot of the real thing.
 */
const DemoShell = ({ title, subtitle, accentHsl, onReset, children }: Props) => (
  <div className="card-tier overflow-hidden">
    <div className="flex items-start gap-4 px-5 py-4 border-b border-[hsl(var(--line))] surface-3 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
            style={{ background: `hsl(${accentHsl} / 0.12)`, color: `hsl(${accentHsl})`, border: `1px solid hsl(${accentHsl} / 0.3)` }}>
            <Zap className="w-2.5 h-2.5" aria-hidden="true" />
            Interactive demo
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {onReset && (
        <button type="button" onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          <RotateCcw className="w-3 h-3" aria-hidden="true" /> Reset
        </button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default DemoShell;
