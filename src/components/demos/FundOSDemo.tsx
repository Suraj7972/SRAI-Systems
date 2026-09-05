import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, ArrowUpRight, FileText, Lightbulb, Building2, BadgeCheck, Banknote } from "lucide-react";
import DemoShell from "./DemoShell";
import { Stepper, StatePanel, Meter, type Step } from "./parts";

const ACCENT = "230 90% 68%";

type Stage = "idea" | "mvp" | "revenue";
type Entity = "pvtltd" | "llp" | "unregistered";

interface Scheme {
  name: string;
  authority: string;
  category: string;
  ceiling: string;
  needs: { dpiit?: boolean; entity?: Entity[]; stage?: Stage[] };
}

/**
 * Scheme names, authorities and ceilings below are real Indian government
 * programmes. The matching here is a simplified model of the eligibility engine
 * — the product itself evaluates far more conditions.
 */
const SCHEMES: Scheme[] = [
  { name: "Startup India Recognition (DPIIT)", authority: "DPIIT · Ministry of Commerce", category: "Registration", ceiling: "Recognition", needs: { entity: ["pvtltd", "llp"] } },
  { name: "Udyam Registration (MSME)", authority: "Ministry of MSME", category: "Registration", ceiling: "Free", needs: {} },
  { name: "Startup India Seed Fund Scheme", authority: "DPIIT · Ministry of Commerce", category: "Funding", ceiling: "Up to ₹50 lakh", needs: { dpiit: true, entity: ["pvtltd"], stage: ["idea", "mvp"] } },
  { name: "PM MUDRA Yojana", authority: "MUDRA · Ministry of Finance", category: "Funding", ceiling: "Up to ₹10 lakh", needs: { stage: ["mvp", "revenue"] } },
  { name: "Credit Guarantee Scheme for Startups", authority: "DPIIT / NCGTC", category: "Funding", ceiling: "Up to ₹10 crore guarantee", needs: { dpiit: true, entity: ["pvtltd", "llp"] } },
  { name: "Atal Innovation Mission — AIC", authority: "NITI Aayog", category: "Incubation", ceiling: "Incubation support", needs: { stage: ["idea", "mvp"] } },
];

const STAGES: { id: Stage; label: string }[] = [
  { id: "idea", label: "Idea / validation" }, { id: "mvp", label: "MVP built" }, { id: "revenue", label: "Earning revenue" },
];
const ENTITIES: { id: Entity; label: string }[] = [
  { id: "pvtltd", label: "Pvt Ltd" }, { id: "llp", label: "LLP" }, { id: "unregistered", label: "Not registered yet" },
];

const JOURNEY: Step[] = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "entity", label: "Registered", icon: Building2 },
  { id: "dpiit", label: "DPIIT", icon: BadgeCheck },
  { id: "fundable", label: "Fundable", icon: Banknote },
];

const evaluate = (s: Scheme, stage: Stage, entity: Entity, dpiit: boolean) => {
  const missing: string[] = [];
  if (s.needs.dpiit && !dpiit) missing.push("DPIIT recognition");
  if (s.needs.entity && !s.needs.entity.includes(entity)) missing.push(`entity must be ${s.needs.entity.map((e) => ENTITIES.find((x) => x.id === e)!.label).join(" or ")}`);
  if (s.needs.stage && !s.needs.stage.includes(stage)) missing.push("different company stage");
  return missing;
};

const FundOSDemo = () => {
  const [stage, setStage] = useState<Stage>("mvp");
  const [entity, setEntity] = useState<Entity>("pvtltd");
  const [dpiit, setDpiit] = useState(false);

  const scored = useMemo(() => SCHEMES.map((s) => ({ scheme: s, missing: evaluate(s, stage, entity, dpiit) })), [stage, entity, dpiit]);
  const eligible = scored.filter((r) => r.missing.length === 0);
  const blocked = scored.filter((r) => r.missing.length > 0);
  const readiness = Math.round((eligible.length / SCHEMES.length) * 100);

  const blockedByDpiit = scored.filter((r) => r.missing.includes("DPIIT recognition")).length;
  const journeyStep = dpiit ? (eligible.length >= 5 ? 3 : 2) : entity === "unregistered" ? 0 : 1;

  const reset = useCallback(() => { setStage("mvp"); setEntity("pvtltd"); setDpiit(false); }, []);

  return (
    <DemoShell title="Scheme eligibility check" subtitle="Change your company profile and watch the eligibility verdicts recalculate — a simplified model of the engine inside FundOS." accentHsl={ACCENT} onReset={reset}>
      <Stepper steps={JOURNEY} current={journeyStep} accent={ACCENT} compact />

      <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-5">
        <div className="space-y-4">
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Company stage</legend>
            <div className="flex flex-col gap-1.5">
              {STAGES.map((s) => (
                <button key={s.id} type="button" onClick={() => setStage(s.id)} aria-pressed={stage === s.id}
                  className="rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={stage === s.id
                    ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)`, color: `hsl(${ACCENT})` }
                    : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Entity type</legend>
            <div className="flex flex-wrap gap-1.5">
              {ENTITIES.map((e) => (
                <button key={e.id} type="button" onClick={() => setEntity(e.id)} aria-pressed={entity === e.id}
                  className="rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={entity === e.id
                    ? { borderColor: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)`, color: `hsl(${ACCENT})` }
                    : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  {e.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={dpiit} onChange={(e) => setDpiit(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-current" style={{ color: `hsl(${ACCENT})` }} />
            <span className="text-xs text-foreground">We have DPIIT recognition</span>
          </label>

          <Meter label="Scheme readiness" value={readiness} accent={ACCENT} suffix="%" />

          <StatePanel
            title={blockedByDpiit > 0 ? `DPIIT recognition is your biggest gap` : eligible.length === SCHEMES.length ? "Fully eligible on this profile" : "Some schemes need a different profile"}
            tone={blockedByDpiit > 0 ? "accent" : eligible.length === SCHEMES.length ? "success" : "neutral"}
            accent={ACCENT}
            body={blockedByDpiit > 0
              ? `${blockedByDpiit} scheme${blockedByDpiit === 1 ? "" : "s"} unlock the moment DPIIT recognition lands — including the largest ones on this list. That is the single highest-value action on this profile.`
              : eligible.length === SCHEMES.length
              ? "Every scheme in this sample matches. The real product checks 53 against a fuller profile, including sector, incorporation date and turnover."
              : `${eligible.length} of ${SCHEMES.length} match. The blocked ones each name what is missing rather than just failing quietly.`}
          />
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Results</p>
          <ul className="space-y-1.5 max-h-[330px] overflow-y-auto pr-1" aria-live="polite">
            <AnimatePresence initial={false}>
              {[...eligible, ...blocked].map(({ scheme, missing }) => {
                const ok = missing.length === 0;
                return (
                  <motion.li key={scheme.name} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border px-3 py-2.5"
                    style={ok
                      ? { borderColor: `hsl(${ACCENT} / 0.4)`, background: `hsl(${ACCENT} / 0.07)` }
                      : { borderColor: "hsl(var(--border))", background: "hsl(var(--background) / 0.5)", opacity: 0.75 }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground leading-snug">{scheme.name}</p>
                        <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{scheme.authority}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-wide shrink-0"
                        style={ok
                          ? { color: `hsl(${ACCENT})`, background: `hsl(${ACCENT} / 0.14)` }
                          : { color: "hsl(var(--muted-foreground))", background: "hsl(var(--secondary))" }}>
                        {ok ? <Check className="w-2.5 h-2.5" aria-hidden="true" /> : <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" />}
                        {ok ? "Likely eligible" : "Blocked"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-1.5">
                      <span className="text-[10.5px] font-mono" style={{ color: ok ? `hsl(${ACCENT})` : "hsl(var(--muted-foreground))" }}>
                        {scheme.ceiling}
                      </span>
                      {!ok && <span className="text-[10.5px] text-muted-foreground truncate">Needs: {missing.join(", ")}</span>}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <p className="flex items-start gap-1.5 text-[10.5px] text-muted-foreground mt-3 leading-relaxed">
            <FileText className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
            Guidance only, never a guarantee of approval — the same wording the product itself uses.
            FundOS evaluates 53 schemes against a fuller profile.
          </p>
          <a href="https://structera.sraisystems.in" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium mt-2 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{ color: `hsl(${ACCENT})` }}>
            Run the real check in FundOS <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </DemoShell>
  );
};

export default FundOSDemo;
