/**
 * SRAI Systems — careers content.
 *
 * Same rule as the rest of this repo: nothing here may be invented. There is no
 * placeholder role, no fabricated headcount, no "we're always hiring rockstars".
 * What is written below is either checkable on this site or is a commitment the
 * company is willing to be held to.
 */

export interface Role {
  id: string;
  title: string;
  team: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  location: "Pune, India" | "Remote (India)" | "Hybrid — Pune";
  summary: string;
  responsibilities: string[];
  mustHave: string[];
  niceToHave: string[];
  /** State it openly. `null` only if it genuinely has not been decided yet. */
  compensation: string | null;
  /** ISO date, e.g. "2026-09-14". */
  posted: string;
}

/**
 * EMPTY ON PURPOSE. Do not add a placeholder role.
 *
 * SRAI Systems is not hiring for a named position today. A listing that goes
 * nowhere costs a candidate a week of work — a tailored application, a portfolio
 * dig, a rearranged calendar — for a job that does not exist, and it costs more
 * trust than the page could ever earn back. /careers is built to be useful in
 * exactly this state: it tells people what the work is like, what is wrong with
 * it, and how to reach us anyway.
 *
 * When a real role opens, uncomment the example below, replace every field, and
 * append it. The page switches out of its empty state automatically — nothing
 * else needs changing.
 */
export const openRoles: Role[] = [
  /*
  {
    id: "full-stack-engineer",
    title: "Full-stack engineer",
    team: "Product",
    type: "Full-time",
    location: "Hybrid — Pune",
    summary:
      "One paragraph, plain language: what this person owns and what changes because they joined.",
    responsibilities: [
      "The work, concretely. Not 'drive impact' — the actual thing they will do on a Tuesday.",
    ],
    mustHave: [
      "What the job genuinely cannot be done without. Keep this list short and true.",
    ],
    niceToHave: [
      "Real bonuses, not a second must-have list.",
    ],
    compensation: "₹X–₹Y per year, stated before the first call.",
    posted: "2026-01-01",
  },
  */
];

export interface HiringStep {
  step: number;
  title: string;
  detail: string;
}

/** How hiring actually runs here. Five steps, no hidden sixth. */
export const hiringProcess: HiringStep[] = [
  {
    step: 1,
    title: "Write to us",
    detail:
      "Email us and point at something real you built — a repo, a deployed thing, a paper, a teardown of something you fixed. A link beats a CV, because we can read a link. Tell us what was hard about it and what you would do differently now.",
  },
  {
    step: 2,
    title: "We reply either way, within a week",
    detail:
      "A no is a reply. You will not be left to work out from silence that you were not selected. If we are slower than a week, we are late and you should nudge us.",
  },
  {
    step: 3,
    title: "A 45-minute conversation, not a quiz",
    detail:
      "We talk about what you have built and what we are building. No whiteboard algorithms, no trivia about language internals you would look up in ten seconds. You get time to ask us things, and we answer them honestly, including the awkward ones.",
  },
  {
    step: 4,
    title: "A small paid task from the real backlog",
    detail:
      "A scoped piece of actual work, agreed in advance, paid at a fair rate whether or not you get the offer. Never unpaid, never a puzzle unrelated to the job, never work we ship without paying for it. If you would rather not do a task at all, say so and we will find another way to assess.",
  },
  {
    step: 5,
    title: "A decision, with reasons",
    detail:
      "Yes or no, with the actual reasoning. If it is a no, you will know what tipped it — useful information you can take to the next place. If it is a yes, the number and the terms are on the table straight away.",
  },
];

export interface WorkingHerePoint {
  title: string;
  detail: string;
}

/** The honest case for joining. All four are checkable against this site. */
export const workingHere: WorkingHerePoint[] = [
  {
    title: "You ship in weeks, not quarters",
    detail:
      "There is no roadmap committee and no six-week design review. Something you start on a Monday can be in front of users inside a month. The eight products on this site were built that way.",
  },
  {
    title: "Small team — you touch product, design and infra",
    detail:
      "Nobody here does one narrow slice. The person who writes the feature usually designs the screen, picks the schema and owns the deploy. If you want to stay strictly in one lane, this will frustrate you; if you have been waiting for permission to own the whole thing, this is that.",
  },
  {
    title: "The problems are specifically Indian",
    detail:
      "Marathi-first interfaces for farmers who will not use an English app. RBI ODI and FEMA deadlines that founders actually miss. SEBI's retail algo framework. Mandi price data. These are not generic SaaS problems with a rupee sign bolted on.",
  },
  {
    title: "We do not fake things — internally or on the site",
    detail:
      "Every product status on this site is the real one, including the ones that say COMING SOON. There are no invented customer logos and no statistics we cannot produce. The same standard applies to what you will be asked to say inside the company.",
  },
];

export interface Downside {
  title: string;
  detail: string;
}

/**
 * The downsides, stated before the first conversation rather than discovered in
 * month three. This reads as weakness and works as a filter — the people it puts
 * off were going to leave anyway, and the people it does not are the ones worth
 * talking to. Keep it.
 */
export const beingHonest: Downside[] = [
  {
    title: "There is no HR function",
    detail:
      "No people team, no formal grievance process, no onboarding programme. If something goes wrong you raise it with the person running the company, directly. For some people that is better than an HR portal; if you need institutional process to feel safe, this is a real gap and you should weigh it.",
  },
  {
    title: "No structured learning budget or training programme",
    detail:
      "You will learn a great deal, but from the work rather than from a curriculum. There is no conference allowance, no course catalogue, no mentoring scheme. What there is: unusual latitude to choose how a problem gets solved.",
  },
  {
    title: "No fixed career ladder",
    detail:
      "There are no levels, no titles to climb, and no defined promotion cycle, because the team is too small for any of that to mean anything yet. Scope grows by taking things on. If you need a visible ladder to measure progress against, that does not exist here.",
  },
  {
    title: "Pay is competitive for Pune, not for a funded metro startup",
    detail:
      "We are a self-funded studio. The number will be fair for this city and this stage, and you will hear it before the first call rather than after the fourth. If you are optimising purely for cash, a funded company in Bengaluru or Gurugram will beat us and we will not pretend otherwise.",
  },
  {
    title: "Some weeks are messy",
    detail:
      "Customers move priorities, a pilot changes shape, and something you planned for Thursday gets pushed. We try not to make that a habit, but it happens more than it would at a company with a product manager between you and the customer.",
  },
];
