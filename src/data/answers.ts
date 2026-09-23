/**
 * SRAI Systems — answer blocks.
 *
 * One question-and-answer pair per non-product page. (Product answers live on
 * the product itself, in src/data/srai.ts, so they cannot drift from the
 * product they describe.)
 *
 * THE RULE THESE ARE WRITTEN TO: every `body` below must survive being
 * copy-pasted out of this website and into somewhere with no surrounding
 * context. So each one opens with the proper noun rather than "we" or "our
 * platform", and no sentence in it depends on the heading above it or on the
 * sentence before it to be intelligible. Generative engines lift self-contained
 * passages and drop context-dependent ones; a paragraph that starts "We build
 * these for ourselves" is unquotable no matter how good it is.
 *
 * Length: 40–70 words. Long enough to answer completely, short enough to be
 * lifted whole. src/test/seo.test.ts enforces the range.
 *
 * Every factual statement here is checkable against this repo. Nothing about
 * customers, headcount, revenue, funding or dates appears, because none of it
 * is established.
 */

export interface Answer {
  /** Rendered as the <h2>. Phrased as the question a buyer would actually type. */
  question: string;
  /** 40–70 words. Answers the question completely, standalone. */
  body: string;
}

/** Keyed by route path, exactly as it appears in src/routes.tsx. */
export const pageAnswers: Record<string, Answer> = {
  "/": {
    question: "What does SRAI Systems do?",
    body:
      "SRAI Systems is an AI product studio based in Pune, India. It has built eight products in-house — FundOS, SmartBhoomi, Hotel Management AI, ModGuardian, TheCrows, SRAI Auctions, FoodieFlow and SRAI Quant — and takes on AI engineering work for other companies. Every product on this site carries its real deployment status rather than a marketing label.",
  },
  "/products": {
    question: "What products has SRAI Systems built?",
    body:
      "SRAI Systems has built eight products in-house: FundOS for startup funding and RBI compliance, SmartBhoomi for Indian farms, Hotel Management AI for hotels and restaurants, ModGuardian for content moderation, TheCrows for trust and escrow, SRAI Auctions for live bidding, FoodieFlow for hyperlocal food, and SRAI Quant for systematic trading. FundOS is publicly live today.",
  },
  "/services": {
    question: "What services does SRAI Systems offer?",
    body:
      "SRAI Systems offers six AI engineering services from its studio in Pune, India: AI product engineering, computer vision and NLP, cloud AI architecture, data pipelines and analytics, AI automation, and custom AI systems. Each one names its customer, its deliverable and the product SRAI Systems built that proves it, and is scoped and priced before work begins.",
  },
  "/about": {
    question: "Who is SRAI Systems?",
    body:
      "SRAI Systems is an AI product studio in Pune, India, that ships its own software. Eight products have been designed, engineered and deployed in-house, one of them publicly live and the rest available for a walkthrough, and the same team takes on AI engineering for other companies. SRAI Systems publishes honest build status instead of client logos.",
  },
  "/partnerships": {
    question: "How can you partner with SRAI Systems?",
    body:
      "SRAI Systems works with three kinds of partner: organisations in agriculture, fintech, food or hospitality wanting technology collaboration; pilot customers who want priority access and a say in product direction; and early-stage angels or micro-VCs who back engineering-first teams. Every one of those conversations starts the same way, at contact@sraisystems.in or through the contact form.",
  },
  "/careers": {
    question: "Is SRAI Systems hiring?",
    body:
      "SRAI Systems is not advertising a named open position right now, and the careers page says so plainly rather than listing roles that do not exist. Open applications are still read. The studio is in Pune, India, asks for links to things you have actually built rather than a CV, and replies either way within a week.",
  },
  "/contact": {
    question: "How do you contact SRAI Systems?",
    body:
      "SRAI Systems can be reached at contact@sraisystems.in, or through the form on this page, which opens a prefilled email when direct delivery is not configured on a given build. The studio is based in Pune, Maharashtra, India. Describe the problem rather than the solution and you will get a straight answer about fit, including when it is no.",
  },
  "/privacy": {
    question: "What personal data does the SRAI Systems website collect?",
    body:
      "The SRAI Systems website collects two things only: what you type into the contact form, and anonymous usage events showing which pages and products people open. It does not collect payment details, government identifiers, precise location, or any special category of personal data, and contact-form submissions are never added to a marketing list or sold.",
  },
  "/terms": {
    question: "What do the SRAI Systems website terms cover?",
    body:
      "The SRAI Systems website terms cover use of sraisystems.in — the pages describing the company, its products and its services, and the contact form. They do not govern the use of any SRAI Systems product: each product is provided under its own agreement, and where a product agreement conflicts with the website terms, the product agreement governs.",
  },
  "/404": {
    question: "Why are you seeing this page?",
    body:
      "SRAI Systems has no page at this address. The link that brought you here is either mistyped or points at something that has moved, and nothing was deleted to make it happen. The products, services, about and contact pages are all reachable from the navigation above, and sraisystems.in/products lists everything the studio has built.",
  },
};

/**
 * Site-level FAQ, rendered on /about and emitted there as FAQPage.
 *
 * Same rule as everything else: each answer is checkable against this site.
 * These are the questions a buyer asks before a first call, and the answers are
 * the ones SRAI Systems would give on that call.
 */
export const siteFaqs: { q: string; a: string }[] = [
  {
    q: "Where is SRAI Systems based?",
    a: "SRAI Systems is based in Pune, Maharashtra, India, and builds primarily for Indian conditions — regional-language interfaces, Indian regulation, and mid-range Android hardware on patchy connectivity.",
  },
  {
    q: "Is SRAI Systems a product company or an agency?",
    a: "Both, in that order. SRAI Systems built eight products in-house first and takes on AI engineering work for other companies second, which means a timeline quoted for a client project is quoted from having done the work rather than from a template.",
  },
  {
    q: "Can I try an SRAI Systems product before talking to anyone?",
    a: "Yes. FundOS is publicly live, self-serve and free to start. The other seven products each have a working demo of their core mechanic that runs in the browser on sraisystems.in, with no sign-up and no sales call.",
  },
  {
    q: "How does SRAI Systems price a project?",
    a: "By engagement shape rather than by hour: a fixed-fee pilot of four to eight weeks, a milestone-based build of three to six months, or an ongoing retainer. Scope and price are agreed before work starts, and discovery is paid because free scoping produces bad estimates.",
  },
  {
    q: "What does SRAI Systems not claim?",
    a: "SRAI Systems publishes no client logos, no customer counts, no accuracy percentages, no uptime figures and no certifications, because none of those are established. Every product carries a status label — LIVE, READY, COMING SOON — stating exactly where it stands.",
  },
  {
    q: "Who owns the code SRAI Systems writes for a client?",
    a: "The client does. Client engagements hand over a working product in production, a deployment runbook, and a handover the client's own engineers can pick up from.",
  },
];

/**
 * The answer block for a page, by route path.
 *
 * Throws rather than returning undefined: a page with no answer block is a page
 * a generative engine has no reason to quote, and the prerender should fail
 * loudly at build time rather than ship one silently.
 */
export const answerForPath = (path: string): Answer => {
  const answer = pageAnswers[path];
  if (!answer) throw new Error(`No answer block defined for ${path} in src/data/answers.ts`);
  return answer;
};
