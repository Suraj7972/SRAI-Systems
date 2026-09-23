import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Mail, MapPin, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import ProductIcon from "@/components/ProductIcon";
import StatusBadge from "@/components/StatusBadge";
import { products } from "@/data/srai";
import { openRoles, hiringProcess, workingHere, beingHonest, type Role } from "@/data/careers";
import AnswerBlock from "@/components/AnswerBlock";
import LastUpdated from "@/components/LastUpdated";
import { answerForPath } from "@/data/answers";
import { CONTENT_UPDATED } from "@/routes";
import { CONTACT_EMAIL } from "@/lib/contact-form";
import { track } from "@/lib/analytics";

/**
 * /careers
 *
 * `openRoles` is empty today and the page is designed around that being its
 * normal state, not an error state: someone who lands here still learns what
 * the work is, what is wrong with it, and how to get a reply.
 */

const applyHref = (role?: Role) => {
  const subject = role
    ? `Application — ${role.title} (${role.location})`
    : "Open application — SRAI Systems";
  const body = [
    role
      ? `Hello SRAI Systems,\n\nI'd like to apply for ${role.title}.`
      : "Hello SRAI Systems,\n\nThere isn't a named role open right now, but I'd like to be considered anyway.",
    "",
    "Links to things I actually built (a repo, something deployed, a write-up):",
    "1. ",
    "2. ",
    "",
    "For one of those — what was hard about it, and what I'd do differently now:",
    "",
    "",
    "What I'm hoping to work on here:",
    "",
    "",
    "(A CV is welcome but optional. The links are the part we read first.)",
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/** Expandable role card. Only rendered when a real role exists. */
const RoleCard = ({ role, index }: { role: Role; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  const panelId = `role-panel-${role.id}`;

  const lists: { label: string; items: string[] }[] = [
    { label: "What you'd do", items: role.responsibilities },
    { label: "Must have", items: role.mustHave },
    { label: "Nice to have", items: role.niceToHave },
  ];

  return (
    <article className="card-tier overflow-hidden">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) track("career_role_open", { role: role.id, team: role.team });
          }}
          className="w-full text-left px-6 py-5 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <span className="flex-1 min-w-0">
            <span className="block text-lg font-bold text-foreground leading-snug">{role.title}</span>
            <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <span>{role.team}</span>
              <span aria-hidden="true">·</span>
              <span>{role.type}</span>
              <span aria-hidden="true">·</span>
              <span>{role.location}</span>
            </span>
          </span>
          <ChevronDown
            className={`w-5 h-5 shrink-0 mt-1 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div id={panelId} hidden={!open} className="px-6 pb-6 border-t border-[hsl(var(--line-soft))] pt-5">
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{role.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list.label}>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2.5">
                {list.label}
              </h4>
              <ul className="space-y-2">
                {list.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13.5px] text-foreground leading-relaxed">
                    <Check className="w-3.5 h-3.5 mt-1 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <dl className="mt-6 panel p-4 rounded-xl">
          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Compensation
          </dt>
          <dd className="text-[13.5px] text-foreground leading-relaxed">
            {role.compensation ?? "Not fixed yet — we'll agree a number with you before the first call, not after the fourth."}
          </dd>
        </dl>

        <a
          href={applyHref(role)}
          onClick={() => track("career_apply_click", { role: role.id, variant: "role_card" })}
          className="press inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Apply for this role <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

const Careers = () => {
  useEffect(() => {
    document.title = "Careers at SRAI Systems — build things people use";
    track("careers_page_view", { open_roles: openRoles.length });
  }, []);

  const roleCount = openRoles.length;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="pt-14 pb-16 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 15% 0%, hsl(230 90% 60% / 0.10), transparent 70%)" }}
        />
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-10 lg:gap-14 items-start">
            <SectionReveal>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
                Careers
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.08]">
                Build things <span className="heading-gradient">people actually use</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                SRAI Systems is a small, self-funded AI product studio in Pune. The work is
                unglamorous and specific: scheme eligibility rules that founders get wrong, a
                Marathi-first interface a farmer will actually open, execution limits that a broker
                enforces. If you would rather ship one real thing than sit in the planning for four,
                you will recognise this place.
              </p>

              {/* The answer block sits here rather than below the hero: the
                  eight-product aside to the right is long, and the answer has to
                  stay near the top of the body text to be the thing a generative
                  engine lifts. */}
              <div className="mb-10">
                <AnswerBlock answer={answerForPath("/careers")} />
                <LastUpdated date={CONTENT_UPDATED} className="mt-5" />
              </div>

              <dl className="flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    Where
                  </dt>
                  <dd className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Pune, India
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    Open roles
                  </dt>
                  <dd className="text-sm font-medium text-foreground tabular-nums">
                    {roleCount === 0 ? "None named right now" : `${roleCount} open`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    Open applications
                  </dt>
                  <dd className="text-sm font-medium text-foreground">Always read</dd>
                </div>
              </dl>
            </SectionReveal>

            {/* Real portfolio, not decoration: this is the actual surface area. */}
            <SectionReveal delay={0.1}>
              <aside className="panel rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-foreground mb-1">What you'd be working on</h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Every product we have built, with its real deployment status. Nothing here is a
                  concept slide.
                </p>
                <ul className="space-y-1">
                  {products.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/products/${p.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg hover:surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `hsl(${p.accentHsl} / 0.12)`, border: `1px solid hsl(${p.accentHsl} / 0.22)` }}
                        >
                          <ProductIcon name={p.icon} className="w-4 h-4" style={{ color: `hsl(${p.accentHsl})` }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-foreground">{p.name}</span>
                          <span className="block text-[11px] text-muted-foreground truncate">{p.tagline}</span>
                        </span>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── Open roles ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]" id="roles">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Open roles</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              {roleCount === 0
                ? "Every role we list is one we are genuinely trying to fill."
                : "Each role names what you would do, what the job cannot be done without, and what it pays."}
            </p>
          </SectionReveal>

          {roleCount === 0 ? (
            <SectionReveal>
              <div className="panel rounded-2xl p-8 md:p-10 max-w-3xl">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">
                  Current status
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-snug">
                  We are not hiring for a named position right now
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We would rather say that plainly than keep an evergreen listing open. A job post
                  that goes nowhere costs you a tailored application, a portfolio dig and a
                  rearranged week, for a role that does not exist.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Open applications are a different matter — those we do read, and they have started
                  conversations before. If your work is close to what is on this page, write to us
                  anyway. The worst outcome is a clear no within a week.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={applyHref()}
                    onClick={() => track("career_apply_click", { variant: "empty_state" })}
                    className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Send an open application <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <Link
                    to="/products"
                    className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[hsl(var(--line-strong))] surface-2 text-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Look at what we have built
                  </Link>
                </div>
              </div>
            </SectionReveal>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {openRoles.map((role, i) => (
                <SectionReveal key={role.id} delay={i * 0.05}>
                  <RoleCard role={role} index={i} />
                </SectionReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── What the work is like ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">What the work is like</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Four things that are true about working here, each of which you can check against the
              rest of this site.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
            {workingHere.map((point, i) => (
              <SectionReveal key={point.title} delay={i * 0.05}>
                <article className="card-tier p-7 h-full">
                  <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.detail}</p>
                </article>
              </SectionReveal>
            ))}
          </div>

          {/* Visibly separate: this is the part most careers pages leave out. */}
          <SectionReveal>
            <div className="panel rounded-2xl p-7 md:p-9 border-l-2 border-l-primary/50">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-3">
                Read this part twice
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                Before you apply, the downsides
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                These are the things you would otherwise find out in month three. We would rather
                lose a candidate at this paragraph than waste a year of theirs.
              </p>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {beingHonest.map((point) => (
                  <li key={point.title}>
                    <h4 className="text-sm font-semibold text-foreground mb-1.5">{point.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── How hiring works ── */}
      <section className="py-16 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">How hiring works here</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Five steps, and no hidden sixth. The task in step four is paid whether or not you get
              the offer.
            </p>
          </SectionReveal>

          <ol className="space-y-4 max-w-3xl">
            {hiringProcess.map((step, i) => (
              <SectionReveal key={step.step} delay={i * 0.05}>
                <li className="card-tier p-6 flex gap-5">
                  <span
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-primary/12 border border-primary/20 text-sm font-mono font-bold text-primary tabular-nums"
                    aria-hidden="true"
                  >
                    {String(step.step).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground mb-1.5">
                      <span className="sr-only">Step {step.step}: </span>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-[hsl(var(--line-soft))]">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <div className="panel rounded-2xl p-8 md:p-12 max-w-3xl">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Show us something you built
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Not a CV, at least not first. Send links to work that exists — a repository, a
                deployed thing, a write-up of a problem you solved — and tell us what was hard about
                it. That is what we read. The email below opens prefilled with the four things we
                need.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <a
                  href={applyHref()}
                  onClick={() => track("career_apply_click", { variant: "page_cta" })}
                  className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" /> Write to us
                </a>
                <Link
                  to="/contact"
                  className="press inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[hsl(var(--line-strong))] surface-2 text-foreground font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  Or use the contact form <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2">
                <Plus className="w-3 h-3 shrink-0" aria-hidden="true" />
                Everything goes to {CONTACT_EMAIL}. You get a reply either way, within a week.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
