import { useState, useEffect, useRef, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Mail, Copy, Check, AlertTriangle, Loader2, MapPin, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductIcon from "@/components/ProductIcon";
import { products } from "@/data/srai";
import { track } from "@/lib/analytics";
import {
  submitContactForm,
  validateContact,
  isContactEndpointConfigured,
  buildMailtoHref,
  FormNotConfiguredError,
  type ContactPayload,
  type ContactFieldErrors,
  CONTACT_EMAIL,
} from "@/lib/contact-form";

type Status = "idle" | "submitting" | "success" | "error" | "unconfigured";

const emptyForm: ContactPayload = {
  name: "",
  email: "",
  company: "",
  product: "",
  message: "",
  website: "",
};

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<ContactPayload>(emptyForm);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);

  /** Guards against a double submit landing before React re-renders the disabled button. */
  const inFlight = useRef(false);
  /** contact_form_started fires once per visit, on first meaningful interaction. */
  const startedTracked = useRef(false);
  const fieldId = useId();
  const id = (field: string) => `${fieldId}-${field}`;

  useEffect(() => {
    document.title = "Contact SRAI Systems — Start a Project or Request Early Access";
    const productParam = searchParams.get("product");
    if (productParam) {
      if (productParam === "pitch-deck") {
        setForm((f) => ({ ...f, product: "pitch-deck", message: "I'd like to request your pitch deck." }));
      } else {
        setForm((f) => ({ ...f, product: productParam }));
      }
    }
  }, [searchParams]);

  const markStarted = () => {
    if (startedTracked.current) return;
    startedTracked.current = true;
    track("contact_form_started");
  };

  const update = (field: keyof ContactPayload, value: string) => {
    markStarted();
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current || status === "submitting") return;

    const validationErrors = validateContact(form);
    if (validationErrors) {
      setErrors(validationErrors);
      setStatus("idle");
      // Move focus to the first invalid field for keyboard and screen-reader users.
      const firstField = Object.keys(validationErrors)[0];
      document.getElementById(id(firstField))?.focus();
      return;
    }

    inFlight.current = true;
    setErrors({});
    setErrorMessage("");
    setStatus("submitting");

    try {
      await submitContactForm(form);
      setStatus("success");
      track("contact_form_submitted", { product: form.product || "general" });
    } catch (error) {
      if (error instanceof FormNotConfiguredError) {
        setStatus("unconfigured");
        track("contact_form_failed", { reason: "not_configured" });
      } else {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        track("contact_form_failed", { reason: "request_failed" });
      }
    } finally {
      inFlight.current = false;
    }
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(CONTACT_EMAIL);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const productOptions = [
    { id: "pitch-deck", name: "Pitch Deck Request", icon: "Rocket" },
    ...products.map((p) => ({ id: p.id, name: p.name, icon: p.icon })),
  ];

  const intentChips = [
    { label: "Early Access", value: "early-access" },
    { label: "Partnership", value: "partnership" },
    { label: "Investor Inquiry", value: "investor" },
    { label: "General", value: "general" },
  ];

  const busy = status === "submitting";
  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-60";
  const errorClass = "border-destructive focus:ring-destructive/50";

  const describedBy = (field: keyof ContactPayload) => (errors[field] ? id(`${field}-error`) : undefined);

  return (
    <Layout>
      <section className="py-16 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: what to expect — replaces the decorative panel */}
            <div className="hidden lg:block">
              <SectionReveal direction="left">
                <div className="panel p-8 h-full relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 70% 50% at 20% 0%, hsl(230 90% 60% / 0.10), transparent 70%)",
                  }} />
                  <div className="relative">
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4">
                      What happens next
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mb-6 leading-snug">
                      A real reply from a person who read it
                    </h2>

                    <ol className="space-y-5 mb-8">
                      {[
                        { n: "01", t: "We read it properly", d: "Not a queue and not an auto-responder. If your problem is not one we should take, we will say so." },
                        { n: "02", t: "We reply with a view", d: "Whether AI is the right tool here, roughly what it would take, and what we would need from you." },
                        { n: "03", t: "A call, if it makes sense", d: "Thirty minutes to see whether this is worth either of us spending more time on." },
                      ].map((step) => (
                        <li key={step.n} className="flex gap-4">
                          <span className="text-xs font-mono font-bold text-primary tabular-nums pt-0.5 shrink-0">{step.n}</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">{step.t}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.d}</p>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="border-t border-[hsl(var(--line))] pt-6 space-y-3">
                      <a href={`mailto:${CONTACT_EMAIL}`}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                        <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        {CONTACT_EMAIL}
                      </a>
                      <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        Pune, India
                      </p>
                      <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <span>We do not add you to a mailing list. See our{" "}
                          <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>

            {/* Right: Form */}
            <div>
              <SectionReveal>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
                  Get In Touch
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Start Building{" "}
                  <span className="heading-gradient">With Us</span>
                </h1>
                <p className="text-muted-foreground mb-4">
                  A project, a pilot, a partnership, or a second opinion on an AI system you already
                  have. Tell us what you are trying to build.
                </p>
                <button type="button" onClick={copyEmail}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <Mail className="w-4 h-4" />
                  {CONTACT_EMAIL}
                  {emailCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span className="sr-only">{emailCopied ? "Email address copied" : "Copy email address"}</span>
                </button>
              </SectionReveal>

              {/* Quick intent chips */}
              <SectionReveal delay={0.05}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {intentChips.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      aria-pressed={form.product === chip.value}
                      onClick={() => update("product", chip.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      style={{
                        background: form.product === chip.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: form.product === chip.value ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        color: form.product === chip.value ? "#818cf8" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </SectionReveal>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div key="success" role="status" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium rounded-2xl p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Message sent</h2>
                    <p className="text-muted-foreground">
                      Thanks for reaching out — your message reached us. We'll reply to {form.email}.
                    </p>
                  </motion.div>
                ) : status === "unconfigured" ? (
                  <motion.div key="unconfigured" role="alert" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium rounded-2xl p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">This form isn't connected yet</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      We haven't hooked up message delivery on this build, so we won't pretend your message was sent.
                      Send it to us directly instead — the button below opens your email app with everything already filled in.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a href={buildMailtoHref(form)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all">
                        <Mail className="w-4 h-4" /> Open email with your message
                      </a>
                      <button type="button" onClick={() => setStatus("idle")}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary/60 transition-all">
                        Back to the form
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit} noValidate aria-busy={busy}
                    className="glass-premium rounded-2xl p-8 space-y-6">

                    {/* Quick product chips */}
                    <fieldset className="border-0 p-0 m-0">
                      <legend className="text-sm font-medium text-foreground mb-3">I'm interested in...</legend>
                      <div className="flex flex-wrap gap-2">
                        {productOptions.map((p) => (
                          <button key={p.id} type="button"
                            aria-pressed={form.product === p.id}
                            onClick={() => update("product", p.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                              form.product === p.id
                                ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(230_90%_60%_/_0.2)]"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}>
                            <ProductIcon name={p.icon} className="w-3 h-3" />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={id("name")} className="text-sm font-medium text-foreground mb-1.5 block">
                          Name <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
                        </label>
                        <input id={id("name")} name="name" type="text" autoComplete="name" value={form.name}
                          disabled={busy}
                          aria-required="true"
                          aria-invalid={errors.name ? true : undefined}
                          aria-describedby={describedBy("name")}
                          onChange={(e) => update("name", e.target.value)}
                          className={`${inputClass} ${errors.name ? errorClass : ""}`}
                          placeholder="Your name" />
                        {errors.name && (
                          <p id={id("name-error")} className="text-xs text-destructive mt-1.5">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={id("email")} className="text-sm font-medium text-foreground mb-1.5 block">
                          Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
                        </label>
                        <input id={id("email")} name="email" type="email" autoComplete="email" value={form.email}
                          disabled={busy}
                          aria-required="true"
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={describedBy("email")}
                          onChange={(e) => update("email", e.target.value)}
                          className={`${inputClass} ${errors.email ? errorClass : ""}`}
                          placeholder="you@company.com" />
                        {errors.email && (
                          <p id={id("email-error")} className="text-xs text-destructive mt-1.5">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor={id("company")} className="text-sm font-medium text-foreground mb-1.5 block">
                        Role / Company <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input id={id("company")} name="company" type="text" autoComplete="organization" value={form.company}
                        disabled={busy}
                        aria-invalid={errors.company ? true : undefined}
                        aria-describedby={describedBy("company")}
                        onChange={(e) => update("company", e.target.value)}
                        className={`${inputClass} ${errors.company ? errorClass : ""}`}
                        placeholder="Founder at Acme, Head of Ops, …" />
                      {errors.company && (
                        <p id={id("company-error")} className="text-xs text-destructive mt-1.5">{errors.company}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={id("message")} className="text-sm font-medium text-foreground mb-1.5 block">
                        Message <span aria-hidden="true">*</span><span className="sr-only">(required)</span>
                      </label>
                      <textarea id={id("message")} name="message" rows={4} value={form.message}
                        disabled={busy}
                        aria-required="true"
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={describedBy("message")}
                        onChange={(e) => update("message", e.target.value)}
                        className={`${inputClass} resize-none ${errors.message ? errorClass : ""}`}
                        placeholder="Tell us what you're looking for..." />
                      {errors.message && (
                        <p id={id("message-error")} className="text-xs text-destructive mt-1.5">{errors.message}</p>
                      )}
                    </div>

                    {/* Honeypot — hidden from users and assistive tech; bots fill it in. */}
                    <div aria-hidden="true" className="absolute w-px h-px -m-px overflow-hidden opacity-0 pointer-events-none">
                      <label htmlFor={id("website")}>Leave this field empty</label>
                      <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off"
                        value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                    </div>

                    {status === "error" && (
                      <div role="alert"
                        className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div className="text-sm text-foreground">
                          <p className="font-medium mb-0.5">Your message wasn't sent.</p>
                          <p className="text-muted-foreground">{errorMessage}</p>
                          <p className="text-muted-foreground mt-1">
                            You can also email us at{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                              {CONTACT_EMAIL}
                            </a>.
                          </p>
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={busy}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_hsl(230_90%_60%_/_0.2)] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      {busy ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </button>

                    {!isContactEndpointConfigured && (
                      <p className="text-xs text-muted-foreground text-center">
                        Prefer email? Write to{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                          {CONTACT_EMAIL}
                        </a>.
                      </p>
                    )}

                    {/* Status announcements for screen readers */}
                    <p className="sr-only" aria-live="polite">
                      {busy ? "Sending your message." : ""}
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
