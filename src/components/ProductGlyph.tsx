import { useMemo } from "react";

/**
 * Generative identity artwork, one motif per product.
 *
 * Every product gets real imagery without stock photography and without
 * pretending to be a screenshot: each motif is drawn from the product's own
 * domain — scoring rings for FundOS, field contours for SmartBhoomi, a trust
 * graph for TheCrows — and coloured by that product's accent. Output is
 * deterministic, so a given product always renders the same figure.
 */

const rand = (seed: number) => {
  // Small deterministic PRNG so motifs are stable across renders and builds.
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

type MotifProps = { c: string };

const Rings = ({ c }: MotifProps) => (
  <g fill="none" stroke={c}>
    {[26, 40, 54, 68, 82].map((r, i) => (
      <circle key={r} cx="100" cy="100" r={r} strokeWidth={i === 2 ? 1.6 : 0.7} opacity={i === 2 ? 0.85 : 0.28} />
    ))}
    <path d="M100 18 A82 82 0 0 1 171 141" strokeWidth="3" opacity="0.95" strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((a) => {
      const rad = (a * Math.PI) / 180;
      return <circle key={a} cx={100 + Math.cos(rad) * 54} cy={100 + Math.sin(rad) * 54} r="3" fill={c} stroke="none" opacity="0.9" />;
    })}
  </g>
);

const Contours = ({ c }: MotifProps) => (
  <g fill="none" stroke={c} strokeLinecap="round">
    {Array.from({ length: 9 }, (_, i) => {
      const y = 46 + i * 14;
      const amp = 13 - i * 0.9;
      return (
        <path key={i} strokeWidth={i === 4 ? 1.8 : 0.8} opacity={i === 4 ? 0.9 : 0.3}
          d={`M12 ${y} C 45 ${y - amp}, 72 ${y + amp}, 100 ${y} S 155 ${y - amp}, 188 ${y}`} />
      );
    })}
    <circle cx="100" cy="102" r="4" fill={c} stroke="none" opacity="0.95" />
  </g>
);

const Grid = ({ c }: MotifProps) => {
  const r = rand(7);
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const x = 32 + (i % 4) * 40, y = 32 + Math.floor(i / 4) * 40;
        const on = r() > 0.55;
        return (
          <rect key={i} x={x} y={y} width="26" height="26" rx="5"
            fill={on ? c : "none"} fillOpacity={on ? 0.22 : 0}
            stroke={c} strokeWidth={on ? 1.4 : 0.7} opacity={on ? 0.9 : 0.3} />
        );
      })}
    </g>
  );
};

const ShieldLattice = ({ c }: MotifProps) => (
  <g fill="none" stroke={c} strokeLinejoin="round">
    <path d="M100 22 L162 48 V104 C162 140 132 166 100 178 C68 166 38 140 38 104 V48 Z" strokeWidth="1.8" opacity="0.85" />
    <path d="M100 42 L144 60 V104 C144 130 122 150 100 159 C78 150 56 130 56 104 V60 Z" strokeWidth="0.7" opacity="0.35" />
    {[70, 90, 110, 130, 150].map((y) => (
      <line key={y} x1="44" y1={y} x2="156" y2={y} strokeWidth="0.6" opacity="0.22" />
    ))}
    <path d="M78 100 L94 118 L126 82" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
  </g>
);

const TrustGraph = ({ c }: MotifProps) => {
  const nodes = useMemo(() => {
    const r = rand(23);
    return Array.from({ length: 11 }, () => ({ x: 26 + r() * 148, y: 30 + r() * 140, s: 2 + r() * 3 }));
  }, []);
  return (
    <g>
      <g stroke={c} strokeWidth="0.7" opacity="0.3">
        {nodes.flatMap((a, i) =>
          nodes.slice(i + 1).map((b, j) => {
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            return d < 68 ? <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> : null;
          })
        )}
      </g>
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.s} fill={c} opacity={i % 3 === 0 ? 0.95 : 0.5} />
      ))}
    </g>
  );
};

const AscendingBars = ({ c }: MotifProps) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const h = 22 + i * 15;
      return (
        <rect key={i} x={22 + i * 19} y={172 - h} width="11" height={h} rx="3"
          fill={c} opacity={0.18 + i * 0.085} />
      );
    })}
    <path d="M24 150 L176 34" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.9"
      strokeDasharray="4 6" />
    <circle cx="176" cy="34" r="4.5" fill={c} />
  </g>
);

const RadialPins = ({ c }: MotifProps) => {
  const pins = useMemo(() => {
    const r = rand(41);
    return Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2, d = 26 + r() * 62;
      return { x: 100 + Math.cos(a) * d, y: 100 + Math.sin(a) * d * 0.86, s: 2.5 + r() * 2 };
    });
  }, []);
  return (
    <g>
      {[34, 58, 82].map((r) => (
        <ellipse key={r} cx="100" cy="100" rx={r} ry={r * 0.86} fill="none" stroke={c} strokeWidth="0.7" opacity="0.28" />
      ))}
      {pins.map((p, i) => (
        <g key={i}>
          <line x1="100" y1="100" x2={p.x} y2={p.y} stroke={c} strokeWidth="0.6" opacity="0.25" />
          <circle cx={p.x} cy={p.y} r={p.s} fill={c} opacity="0.85" />
        </g>
      ))}
      <circle cx="100" cy="100" r="5" fill={c} />
      <circle cx="100" cy="100" r="11" fill="none" stroke={c} strokeWidth="1.4" opacity="0.6" />
    </g>
  );
};

const Candles = ({ c }: MotifProps) => {
  const bars = useMemo(() => {
    const r = rand(59);
    let last = 100;
    return Array.from({ length: 11 }, () => {
      const move = (r() - 0.42) * 26;
      const open = last, close = last + move;
      last = close;
      const wick = 6 + r() * 12;
      return { open, close, hi: Math.min(open, close) - wick, lo: Math.max(open, close) + wick, up: close < open };
    });
  }, []);
  return (
    <g>
      {bars.map((b, i) => {
        const x = 22 + i * 15.5;
        const top = Math.min(b.open, b.close), h = Math.max(4, Math.abs(b.close - b.open));
        return (
          <g key={i} opacity={0.35 + i * 0.055}>
            <line x1={x + 4} y1={b.hi} x2={x + 4} y2={b.lo} stroke={c} strokeWidth="1" />
            <rect x={x} y={top} width="8" height={h} rx="1.5"
              fill={b.up ? c : "none"} fillOpacity={b.up ? 0.55 : 0} stroke={c} strokeWidth="1.3" />
          </g>
        );
      })}
      <path d="M18 132 Q 60 118, 100 96 T 186 52" fill="none" stroke={c} strokeWidth="1.6"
        strokeLinecap="round" opacity="0.55" strokeDasharray="3 5" />
    </g>
  );
};

const MOTIFS: Record<string, (p: MotifProps) => JSX.Element> = {
  sraiquant: Candles,
  fundos: Rings,
  smartbhoomi: Contours,
  hotelai: Grid,
  modguardian: ShieldLattice,
  thecrows: TrustGraph,
  sraiauctions: AscendingBars,
  foodieflow: RadialPins,
};

interface Props {
  productId: string;
  accentHsl: string;
  className?: string;
}

const ProductGlyph = ({ productId, accentHsl, className = "" }: Props) => {
  const Motif = MOTIFS[productId] ?? Rings;
  const c = `hsl(${accentHsl})`;
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" className={className}
      style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`glow-${productId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c} stopOpacity="0.16" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-20" y="-20" width="240" height="240" fill={`url(#glow-${productId})`} />
      <Motif c={c} />
    </svg>
  );
};

export default ProductGlyph;
