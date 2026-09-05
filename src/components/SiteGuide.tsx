import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageSquare, X, ArrowRight, Compass, CornerDownLeft } from "lucide-react";
import { products } from "@/data/srai";
import { CONTACT_EMAIL } from "@/lib/contact-form";
import { track } from "@/lib/analytics";

/**
 * Site guide.
 *
 * Deliberately NOT presented as an AI chatbot. There is no model behind this —
 * it matches a question against a hand-written answer set and routes the
 * visitor to the right page. Every answer is written by us and is true, which
 * is the whole reason to build it this way: a hallucinating assistant on a
 * credibility-focused site would undo everything the site is trying to do.
 * The header says "answers written by us, not generated" so nobody is misled.
 */

interface Answer {
  id: string;
  /** Shown as a suggested question. */
  q: string;
  /** Extra match terms beyond the question text. */
  keys: string[];
  a: string;
  to?: string;
  cta?: string;
  href?: string;
}

const liveProduct = products.find((p) => p.status === "LIVE");
const readyCount = products.filter((p) => p.status === "READY").length;

const ANSWERS: Answer[] = [
  {
    id: "what",
    q: "What does SRAI Systems do?",
    keys: ["what", "who", "about", "company", "do you"],
    a: `We're an AI product studio in Pune. We've designed and built ${products.length} products in-house — for founders, farmers, restaurants, traders and now systematic markets — and we take on AI engineering work for other companies. The products are the portfolio; the services are the business.`,
    to: "/about", cta: "About us",
  },
  {
    id: "try",
    q: "Can I try something right now?",
    keys: ["try", "demo", "test", "play", "see it", "example"],
    a: "Yes — every product has a working demo that runs in your browser. Place a bid, moderate a post, backtest a trading strategy. It's real code, not a video.",
    to: "/#try", cta: "Try the demos",
  },
  {
    id: "live",
    q: "Which products are actually live?",
    keys: ["live", "available", "launched", "released", "use now", "ready", "status"],
    a: `${liveProduct?.name ?? "FundOS"} is public and free to start. ${readyCount} others are built and complete but not yet publicly deployed — we'll walk you through those on a call. Every card on the site says exactly where that product stands.`,
    to: "/products", cta: "See all products",
  },
  {
    id: "fundos",
    q: "What is FundOS?",
    keys: ["fundos", "funding", "grant", "scheme", "investor", "startup", "compliance", "dpiit", "rbi"],
    a: "FundOS tells Indian founders which government schemes they qualify for, scores how investor-ready they are across six weighted categories, and tracks RBI ODI/FEMA deadlines before they're missed. It's live and has a free tier.",
    to: "/products/fundos", cta: "Open FundOS page",
  },
  {
    id: "quant",
    q: "Tell me about the trading product",
    keys: ["trading", "trade", "quant", "stock", "market", "algo", "bot", "invest"],
    a: "SRAI Quant is in development. It analyses market data, backtests rule-based strategies with realistic costs, paper trades them, then executes through a broker with enforced risk limits. It's being built against SEBI's retail algo framework rather than around it. There's a working backtest demo on its page.",
    to: "/products/sraiquant", cta: "See SRAI Quant",
  },
  {
    id: "hire",
    q: "Can you build something for us?",
    keys: ["hire", "build", "service", "project", "consult", "work with", "engage", "cost", "price", "quote"],
    a: "Yes — that's most of what we do. Product engineering, computer vision and NLP, cloud architecture, data pipelines and automation. We scope and price before starting, so you know what you're getting before you commit.",
    to: "/services", cta: "See services",
  },
  {
    id: "contact",
    q: "How do I get in touch?",
    keys: ["contact", "talk", "call", "email", "reach", "message", "get in touch", "meeting"],
    a: `The contact form is the fastest route, or email ${CONTACT_EMAIL} directly. Tell us what you're trying to build and we'll reply with a straight answer about whether we're the right fit.`,
    to: "/contact", cta: "Contact us",
  },
  {
    id: "where",
    q: "Where are you based?",
    keys: ["where", "location", "based", "office", "city", "pune", "india"],
    a: "Pune, India. We build for Indian conditions specifically — regional languages, Indian regulation, mid-range Android phones and patchy connectivity are the baseline we design against, not an afterthought.",
    to: "/about", cta: "More about us",
  },
  {
    id: "trust",
    q: "Why should I trust a young studio?",
    keys: ["trust", "why you", "credible", "proof", "experience", "clients", "portfolio", "reference"],
    a: "You shouldn't take our word for it — that's why everything on this site is checkable. One product is live right now, the rest have demos you can use, and every status label is honest about what is and isn't deployed. We publish no fabricated statistics and no client logos we haven't earned.",
    to: "/products", cta: "Check for yourself",
  },
];

const FALLBACK: Answer = {
  id: "fallback",
  q: "",
  keys: [],
  a: `I didn't catch that one — I only know a fixed set of answers about this site. A person will do better: send us a note and you'll get a real reply.`,
  to: "/contact",
  cta: "Ask a human",
};

const match = (input: string): Answer => {
  const q = input.toLowerCase().trim();
  if (!q) return FALLBACK;
  let best: { a: Answer; score: number } | null = null;
  for (const ans of ANSWERS) {
    let score = 0;
    for (const k of [...ans.keys, ...ans.q.toLowerCase().split(/\s+/).filter((w) => w.length > 4)]) {
      if (q.includes(k)) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { a: ans, score };
  }
  return best?.a ?? FALLBACK;
};

interface Msg { id: number; from: "you" | "guide"; text: string; answer?: Answer; }

const SiteGuide = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const suggestions = useMemo(() => ANSWERS.slice(0, 4), []);

  const ask = useCallback((text: string) => {
    const answer = match(text);
    setMsgs((m) => [
      ...m,
      { id: nextId, from: "you", text },
      { id: nextId + 1, from: "guide", text: answer.a, answer },
    ]);
    setNextId((n) => n + 2);
    setInput("");
    track("site_guide_question", { matched: answer.id });
  }, [nextId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [msgs, reduced]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); triggerRef.current?.focus(); };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog" aria-label="Site guide"
            className="fixed bottom-24 right-4 sm:right-6 z-[190] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(560px,calc(100vh-9rem))] flex flex-col rounded-2xl border border-[hsl(var(--line-strong))] surface-2 overflow-hidden"
            style={{ boxShadow: "0 30px 70px -30px rgba(0,0,0,0.9)" }}>

            <div className="flex items-start gap-3 px-4 py-3.5 border-b border-[hsl(var(--line))] surface-3">
              <Compass className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Site guide</p>
                <p className="text-[11px] text-muted-foreground">Answers written by us, not generated</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close site guide"
                className="p-1.5 -m-1.5 rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.length === 0 && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Ask me anything about SRAI Systems and I'll point you to the right place.
                    I know a fixed set of answers — for anything else, a person will reply.
                  </p>
                  <div className="space-y-1.5">
                    {suggestions.map((s) => (
                      <button key={s.id} type="button" onClick={() => ask(s.q)}
                        className="w-full text-left rounded-lg border border-[hsl(var(--line))] surface-1 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                        {s.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={m.from === "you" ? "flex justify-end" : ""}>
                  {m.from === "you" ? (
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/15 border border-primary/25 px-3.5 py-2 text-[13px] text-foreground">
                      {m.text}
                    </p>
                  ) : (
                    <div className="max-w-[92%]">
                      <p className="rounded-2xl rounded-bl-sm border border-[hsl(var(--line))] surface-1 px-3.5 py-2.5 text-[13px] text-muted-foreground leading-relaxed">
                        {m.text}
                      </p>
                      {m.answer?.to && (
                        <button type="button"
                          onClick={() => {
                            const to = m.answer!.to!;
                            setOpen(false);
                            if (to.startsWith("/#")) {
                              navigate("/");
                              setTimeout(() => document.getElementById(to.slice(2))?.scrollIntoView({ behavior: "smooth" }), 120);
                            } else navigate(to);
                            track("site_guide_route", { to });
                          }}
                          className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                          {m.answer.cta} <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) ask(input); }}
              className="border-t border-[hsl(var(--line))] surface-3 p-3 flex items-center gap-2">
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                aria-label="Ask the site guide a question" placeholder="Ask about products, services, pricing…"
                className="flex-1 min-w-0 rounded-lg border border-[hsl(var(--line))] surface-1 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="submit" disabled={!input.trim()} aria-label="Send question"
                className="press shrink-0 rounded-lg bg-primary text-primary-foreground p-2 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button ref={triggerRef} type="button" onClick={() => { setOpen((o) => !o); if (!open) track("site_guide_open"); }}
        aria-expanded={open} aria-label={open ? "Close site guide" : "Open site guide"}
        className="press fixed bottom-5 right-4 sm:right-6 z-[190] inline-flex items-center gap-2.5 rounded-full pl-4 pr-5 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 12px 34px -12px rgba(99,102,241,0.9)" }}>
        {open ? <X className="w-4 h-4" aria-hidden="true" /> : <MessageSquare className="w-4 h-4" aria-hidden="true" />}
        <span className="hidden sm:inline">{open ? "Close" : "Need a hand?"}</span>
      </button>
    </>
  );
};

export default SiteGuide;
