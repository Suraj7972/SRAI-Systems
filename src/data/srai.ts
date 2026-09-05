/** Honest deployment/build state. Never a free string — the union is the point. */
export type ProductStatus =
  | "LIVE"
  | "DEPLOYING"
  | "READY"
  | "PRIVATE PILOT"
  | "IN DEVELOPMENT"
  | "COMING SOON";

export interface Screenshot {
  /** Path under /screens/. Real product capture only — never a mock. */
  src: string;
  alt: string;
  /** Names what is on screen. Shown under the image. */
  caption: string;
}

export interface Capability {
  title: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  /** One sentence of positioning. Used as the product page lede. */
  oneLiner: string;
  description: string;
  /** The customer's problem, in their language. */
  problem: string;
  /** How this product answers it. */
  solution: string;
  features: string[];
  capabilities: Capability[];
  /** Real captures only. Empty array is honest and renders an explicit empty state. */
  screenshots: Screenshot[];
  howItWorks: { step: string; detail: string }[];
  audience: string[];
  /** The paragraph a competitor could not copy-paste. */
  differentiator: string;
  /** Technology actually used. Empty until confirmed by the owner. */
  stack: string[];
  status: ProductStatus;
  bestFor: string;
  accent: string;
  accentHsl: string;
  themeGradient: string;
  /** Public URL. null when the product is not publicly reachable — no dead links. */
  url: string | null;
  icon: string;
  /** Slugs of related products. */
  related: string[];
  seo: { title: string; description: string };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Who this is for, in one line. */
  who: string;
  /** What actually lands in the client's hands. */
  deliverable: string;
  /** Typical calendar length. */
  scope: string;
  /** How it is priced. Shapes only — numbers are agreed per engagement. */
  pricing: string;
  /** What we can point at that proves we can do it. */
  proof: string;
}

export interface RoadmapPhase {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
}

export interface EngagementModel {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export const products: Product[] = [
  {
    id: "fundos",
    name: "FundOS",
    tagline: "The system of record for an Indian startup's funding and compliance obligations",
    oneLiner:
      "FundOS tells Indian founders which government schemes they qualify for, what documents investors will ask for, and which RBI deadlines are coming — before any of them are missed.",
    description:
      "FundOS is a funding and compliance workspace for Indian founders. It maintains a catalogue of government schemes with eligibility logic, tracks the documents an investor will ask for, scores fundraising readiness across six weighted categories, and keeps RBI ODI/FEMA obligations on a deadline calendar. An AI copilot works across all of it with the company's own context.",
    problem:
      "Indian founders lose money two ways that are invisible until it is too late: funding they qualified for and never applied to, and compliance deadlines they did not know existed. Both are knowledge problems with hard dates attached, and neither is solved by a generic chatbot or a spreadsheet.",
    solution:
      "FundOS turns both into tracked state. Scheme eligibility becomes a ranked list with named blockers instead of a research project. Investor readiness becomes a score with a gap list instead of a feeling. RBI filings become dated items with reminders instead of a surprise.",
    features: [
      "Government scheme catalogue with per-scheme eligibility verdicts",
      "Grant readiness score and named rejection risks",
      "ODI / FEMA compliance tracker with deadline reminders",
      "Investor readiness scored across six weighted categories",
      "Investor pipeline, directory and outreach templates",
      "Investor-ready data room with view tracking",
      "AI copilot with six task-specific modes",
    ],
    capabilities: [
      {
        title: "Scheme eligibility engine",
        description:
          "A catalogue of Indian government schemes — registration, funding and incubation — each carrying its issuing authority, ceiling and an eligibility verdict for your company. Saveable, filterable, and separated into what you likely qualify for and what you probably do not.",
        icon: "FileText",
      },
      {
        title: "ODI / FEMA compliance tracker",
        description:
          "A twelve-item RBI checklist for founders taking foreign capital — FC-GPR filing, FLA return, share allotment, valuation certificate, board resolution and more — with a phase indicator and upcoming-deadline warnings. Guidance, explicitly not legal advice.",
        icon: "Shield",
      },
      {
        title: "Investor readiness score",
        description:
          "Fundraising readiness scored across Team, Legal & Compliance, Market & Pitch, Product, Traction and Financials, each weighted. Produces a ranked list of blockers and an exportable report you can act on before a meeting, not after.",
        icon: "Target",
      },
      {
        title: "Investor directory and pipeline",
        description:
          "Indian VCs and angels filterable by stage, sector and cheque size, added to a six-stage pipeline in one click, with follow-up dates and copy-ready outreach templates for cold intros, warm intros and post-meeting follow-ups.",
        icon: "Briefcase",
      },
      {
        title: "Data room with view tracking",
        description:
          "The document checklist an investor actually asks for, grouped by compliance, contracts and finance, with required items flagged — and a record of when your data room was opened.",
        icon: "FolderOpen",
      },
      {
        title: "Context-aware AI copilot",
        description:
          "Six modes — general, fundraising, schemes, planning, data room and pitch — each answering against your company's own profile and stage rather than in the abstract.",
        icon: "Sparkles",
      },
    ],
    screenshots: [
      {
        src: "/screens/fundos/schemes-eligibility.webp",
        alt: "FundOS grant eligibility screen showing a potential value range, grant readiness score and locked scheme details",
        caption:
          "Grant eligibility — an estimated value range, a readiness score, and the specific requirement putting an application at risk.",
      },
      {
        src: "/screens/fundos/schemes-list.webp",
        alt: "FundOS government schemes catalogue with eligibility verdicts and issuing authorities",
        caption:
          "The scheme catalogue. Every entry carries its issuing authority, its ceiling, and a verdict: likely eligible, check eligibility, or may not qualify.",
      },
      {
        src: "/screens/fundos/investor-readiness.webp",
        alt: "FundOS investor readiness report with six scored categories and a ranked list of top blockers",
        caption:
          "Investor readiness across six weighted categories, with the blockers ranked and the report exportable as a PDF.",
      },
      {
        src: "/screens/fundos/odi-compliance.webp",
        alt: "FundOS ODI and FEMA compliance tracker listing RBI filings with due dates",
        caption:
          "The ODI / FEMA tracker. RBI obligations for foreign capital, each with a due date — shown as guidance, not legal advice.",
      },
      {
        src: "/screens/fundos/investor-directory.webp",
        alt: "FundOS India investor directory with firm, stage, sector tags and cheque size per investor",
        caption:
          "The investor directory — stage, sector and cheque size on every card, added to your pipeline in one click.",
      },
      {
        src: "/screens/fundos/investor-pipeline.webp",
        alt: "FundOS investor pipeline board with six stages from not contacted to term sheet",
        caption:
          "Pipeline from first contact to term sheet, with follow-up dates so a warm investor does not go cold.",
      },
      {
        src: "/screens/fundos/data-room.webp",
        alt: "FundOS data room showing an investor-ready document checklist grouped by category",
        caption:
          "The data room checklist, grouped by compliance, contracts and finance, with required documents flagged.",
      },
      {
        src: "/screens/fundos/overview.webp",
        alt: "FundOS overview dashboard with startup journey progress and readiness metrics",
        caption:
          "The overview — journey stage, readiness, runway and what is overdue, in one place.",
      },
    ],
    howItWorks: [
      { step: "Describe the company", detail: "Name, stage and basic profile. Two minutes, no documents needed yet." },
      { step: "See what you qualify for", detail: "A ranked list of schemes with verdicts, plus the requirements standing in the way." },
      { step: "Close the gaps", detail: "Readiness scoring and the data room checklist turn the gaps into a task list with dates." },
      { step: "Run the raise", detail: "Directory, pipeline and outreach templates take it from a target list to a term sheet." },
    ],
    audience: [
      "Pre-seed and seed founders in India",
      "Founders pursuing DPIIT, MSME or state schemes",
      "Founders taking foreign capital with RBI obligations",
      "Small teams with no CFO and no company secretary",
    ],
    differentiator:
      "A general AI assistant can describe a government scheme. It cannot tell you whether you qualify for it, what the ceiling is, which document is blocking you, or that a filing is due in three days — because it holds no maintained dataset, no eligibility logic and no state. FundOS holds all three, for the Indian regulatory system specifically.",
    stack: [],
    status: "LIVE",
    bestFor: "Indian founders raising or applying for schemes",
    accent: "structera",
    accentHsl: "230 90% 60%",
    themeGradient: "linear-gradient(135deg, hsl(230 90% 55%), hsl(260 80% 50%))",
    url: "https://structera.sraisystems.in",
    icon: "Rocket",
    related: ["thecrows", "modguardian"],
    seo: {
      title: "FundOS — Government scheme eligibility and RBI compliance for Indian founders",
      description:
        "FundOS shows Indian founders which government schemes they qualify for, scores their investor readiness across six categories, and tracks RBI ODI/FEMA deadlines. Built by SRAI Systems.",
    },
  },
  {
    id: "smartbhoomi",
    name: "SmartBhoomi",
    tagline: "Complete AI-powered farm management for Indian farmers",
    oneLiner:
      "SmartBhoomi is a farm management app built for Indian farmers in their own language — expenses, tasks, crop advisory and scheme discovery in one place.",
    description:
      "SmartBhoomi is a full-featured AI farm management app built specifically for Indian farmers. It covers daily farm life — logging expenses and sales, checking crop health, scanning seeds, fertilizer advice, weather, daily tasks, profit and loss, and AI advisory — in Marathi and regional languages.",
    problem:
      "A farmer's costs, sales, tasks and advice live in a notebook, a WhatsApp group and a neighbour's memory. Nothing adds up at the end of a season, and advisory that does exist is written in a language and a register that was not built for the person reading it.",
    solution:
      "One app in the farmer's own language that records the money, holds the task list, and answers crop questions in context — so the profit and loss at the end of a season is a number rather than a guess.",
    features: [
      "Expense & sale entry (खर्च नोंदवा / विक्री नोंदवा)",
      "Daily task management & work logging (काम जोडा)",
      "AI advisory & crop consultation (सल्ला विचारा)",
      "Seed scanning & quality check (बियाणे तपासा)",
      "Fertilizer & pesticide guidance (खत/औषधे)",
      "Weather forecast with farm tips (हवामान)",
      "Mandi prices & market trends (बाजार)",
      "Profit/loss summary dashboard (नफा/तोटा सारांश)",
      "Government scheme discovery & eligibility (योजना)",
      "Daily tips & farm reminders (दैनिक टिप)",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Smallholder and mid-size farmers", "Agri-businesses and input dealers", "Farmer producer organisations"],
    differentiator:
      "The interface is built in Marathi and regional languages first, not translated into them afterwards — which is the difference between an app a farmer can use and one a farmer's son has to operate for them.",
    stack: [],
    status: "READY",
    bestFor: "Indian farmers & agri-businesses",
    accent: "bhoomi",
    accentHsl: "160 70% 45%",
    themeGradient: "linear-gradient(135deg, hsl(160 70% 40%), hsl(190 80% 40%))",
    url: null,
    icon: "Sprout",
    related: ["sraiauctions", "foodieflow"],
    seo: {
      title: "SmartBhoomi — AI farm management for Indian farmers",
      description:
        "SmartBhoomi is a Marathi-first farm management app covering expenses, sales, daily tasks, crop advisory, mandi prices and scheme discovery. Built by SRAI Systems.",
    },
  },
  {
    id: "hotelai",
    name: "Hotel Management AI",
    tagline: "One AI system to manage your entire hotel business",
    oneLiner:
      "Hotel Management AI runs the operational side of a hotel or restaurant — menu, tables, inventory, billing, payroll and profit and loss — in one system.",
    description:
      "Menu creation, tables, warehouse entry, billing, profit-loss analysis, employee salary and advance tracking, plus analytics across all of it.",
    problem:
      "A restaurant owner runs billing in one system, stock in a register, staff advances on paper, and finds out whether the month was profitable several weeks after it ended. The software that solves this is usually priced by a salesperson and sold with hardware.",
    solution:
      "A single system covering the counter, the storeroom, the payroll book and the P&L, so the month's numbers exist while the month is still running.",
    features: [
      "Menu & table management",
      "Warehouse & inventory tracking",
      "Billing & profit-loss analysis",
      "Employee salary & advance tracking",
      "Unified analytics dashboard",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Independent restaurants", "Small and mid-size hotels", "Multi-outlet food businesses"],
    differentiator:
      "It covers the back office as well as the counter. Most systems at this price point stop at billing and leave inventory, payroll and profitability to a spreadsheet.",
    stack: [],
    status: "READY",
    bestFor: "Hotels & restaurants",
    accent: "hotel",
    accentHsl: "35 85% 55%",
    themeGradient: "linear-gradient(135deg, hsl(35 85% 50%), hsl(25 80% 45%))",
    url: null,
    icon: "Building2",
    related: ["foodieflow", "fundos"],
    seo: {
      title: "Hotel Management AI — operations software for hotels and restaurants",
      description:
        "Menu, tables, inventory, billing, payroll and profit-and-loss analysis in one system for Indian hotels and restaurants. Built by SRAI Systems.",
    },
  },
  {
    id: "modguardian",
    name: "ModGuardian",
    tagline: "Reliable AI moderation with audits and automation",
    oneLiner:
      "ModGuardian is a content moderation pipeline with rules, automated actions and an audit trail you can re-run.",
    description:
      "AI moderation pipeline with rules, audit trail, re-run and backfill, and automated actions.",
    problem:
      "Moderation decisions that cannot be explained or re-run are decisions a platform cannot defend — to a user, to a partner, or to a regulator.",
    solution:
      "A rule-driven pipeline where every decision is recorded, every rule change can be backfilled over past content, and routine actions happen without a human in the loop.",
    features: [
      "Rule-based moderation pipeline",
      "Full audit trail",
      "Re-run & backfill capabilities",
      "Automated actions & escalation",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Marketplaces and community platforms", "Products with user-generated content", "Teams with trust and safety obligations"],
    differentiator:
      "Re-run and backfill. Changing a moderation rule is only useful if you can apply it to what already happened, and most tooling at this level cannot.",
    stack: [],
    status: "READY",
    bestFor: "Platforms needing content safety",
    accent: "modguardian",
    accentHsl: "25 90% 55%",
    themeGradient: "linear-gradient(135deg, hsl(25 90% 50%), hsl(15 80% 45%))",
    url: null,
    icon: "Lock",
    related: ["thecrows", "foodieflow"],
    seo: {
      title: "ModGuardian — AI content moderation with audit trails",
      description:
        "A rule-based moderation pipeline with automated actions, a full audit trail, and re-run and backfill over past content. Built by SRAI Systems.",
    },
  },
  {
    id: "thecrows",
    name: "TheCrows",
    tagline: "Privacy-first trust and transactions",
    oneLiner:
      "TheCrows lets two parties who do not know each other transact safely — a trust engine and escrow, with identity kept to a minimum.",
    description:
      "TheCrows enables trusted interactions between parties using temporary identities, trust scores, an escrow transaction lifecycle, secure chat and anti-abuse systems.",
    problem:
      "Two strangers transacting online each need a reason to go first. The usual answer is to demand full identity from both, which solves the trust problem by removing the privacy.",
    solution:
      "A trust score and an escrow lifecycle carry the risk instead of an identity document — funds are held, work is done, and release or dispute is recorded against a durable trust history.",
    features: [
      "Temporary identities",
      "Trust score engine + audit trail",
      "Escrow (fund → start work → release/dispute)",
      "Secure chat linked to transactions",
      "Rate limits + referrals",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Peer-to-peer marketplaces", "Freelance and services transactions", "Privacy-conscious users"],
    differentiator:
      "The trust score and escrow do the work that identity verification usually does, so a transaction can be safe without either side handing over more than the transaction requires.",
    stack: [],
    status: "READY",
    bestFor: "Privacy-conscious transactions",
    accent: "crows",
    accentHsl: "350 80% 55%",
    themeGradient: "linear-gradient(135deg, hsl(350 80% 50%), hsl(280 70% 45%))",
    url: null,
    icon: "Shield",
    related: ["sraiauctions", "modguardian"],
    seo: {
      title: "TheCrows — trust scores and escrow for private transactions",
      description:
        "Temporary identities, a trust score engine and an escrow transaction lifecycle for parties who do not know each other. Built by SRAI Systems.",
    },
  },
  {
    id: "sraiauctions",
    name: "SRAI Auctions",
    tagline: "Live competitive auctions, escrow-backed",
    oneLiner:
      "SRAI Auctions is a real-time bidding platform with escrow-backed settlement, built with agricultural traders in mind.",
    description:
      "An auction platform where sellers create and list lots and buyers bid in real time, with countdown timers, trust scores, escrow-backed settlement and bid history.",
    problem:
      "A seller with perishable or variable-quality goods takes whatever the buyer in front of them offers. Competitive bidding gets a better price, but only if it can happen quickly and settle safely.",
    solution:
      "Lots listed in minutes, live bidding with a countdown, and escrow holding the money until both sides are satisfied.",
    features: [
      "Create & list auctions in minutes",
      "Real-time live bidding with countdown timers",
      "Secure escrow-backed transactions",
      "Seller & buyer trust scores",
      "Category browsing & smart search",
      "Bid history & auction analytics",
      "Mobile-first design",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Agricultural traders and produce sellers", "Equipment and goods sellers", "Buyers sourcing at volume"],
    differentiator:
      "Escrow settlement and trust scores are built in rather than bolted on, which matters most in exactly the categories where buyer and seller have never met.",
    stack: [],
    status: "READY",
    bestFor: "Sellers, buyers & agri-traders",
    accent: "sraiauctions",
    accentHsl: "45 95% 55%",
    themeGradient: "linear-gradient(135deg, hsl(45 95% 50%), hsl(30 90% 45%))",
    url: null,
    icon: "Gavel",
    related: ["thecrows", "smartbhoomi"],
    seo: {
      title: "SRAI Auctions — live bidding with escrow settlement",
      description:
        "Real-time competitive auctions with countdown timers, trust scores and escrow-backed settlement, built with agricultural traders in mind. By SRAI Systems.",
    },
  },
  {
    id: "foodieflow",
    name: "FoodieFlow",
    tagline: "Connecting local food, restaurants, and communities",
    oneLiner:
      "FoodieFlow is a hyperlocal food platform for towns and sub-districts — discovery for eaters, onboarding and analytics for vendors.",
    description:
      "A hyperlocal food ecosystem platform for towns and sub-districts enabling discovery, vendor onboarding, community recommendations and analytics.",
    problem:
      "Outside the metros, the aggregators are absent or uneconomic, so a good local kitchen is discoverable only by word of mouth and has no idea who its customers are.",
    solution:
      "A local-first platform where vendors onboard themselves, the community does the recommending, and the vendor gets to see the demand they are actually serving.",
    features: [
      "Hyperlocal food discovery",
      "Vendor onboarding & management",
      "Community-driven recommendations",
      "Analytics dashboard",
    ],
    capabilities: [],
    screenshots: [],
    howItWorks: [],
    audience: ["Local restaurants and home kitchens", "Town and sub-district communities", "Food businesses outside metro coverage"],
    differentiator:
      "Built for the towns the national aggregators do not serve, with economics that work at that scale rather than a metro model scaled down.",
    stack: [],
    status: "READY",
    bestFor: "Local food businesses",
    accent: "foodie",
    accentHsl: "170 65% 45%",
    themeGradient: "linear-gradient(135deg, hsl(170 65% 40%), hsl(140 60% 40%))",
    url: null,
    icon: "UtensilsCrossed",
    related: ["hotelai", "smartbhoomi"],
    seo: {
      title: "FoodieFlow — hyperlocal food discovery and vendor management",
      description:
        "Discovery, vendor onboarding, community recommendations and analytics for food businesses in Indian towns and sub-districts. Built by SRAI Systems.",
    },
  },
  {
    id: "sraiquant",
    name: "SRAI Quant",
    tagline: "Systematic trading, built to the rules Indian brokers actually enforce",
    oneLiner:
      "SRAI Quant turns a trading idea into a tested, risk-limited strategy that can place its own orders — inside the SEBI framework that now governs retail algorithmic trading in India.",
    description:
      "SRAI Quant is a systematic trading platform for Indian markets. It ingests market data, evaluates strategies defined as explicit rules, backtests them against historical data, runs them on paper first, and only then places live orders through a broker connection — with hard risk limits and a full audit trail on every order.",
    problem:
      "Most retail algo tools in India are either a black box you cannot inspect, or a spreadsheet you cannot automate. Neither survives the questions that matter: what exactly did this strategy do, why did it place that order, and what stops it when the market moves against you.",
    solution:
      "Strategies are written as rules you can read, tested against history before they touch money, run on paper before they run live, and constrained by limits the system enforces rather than suggests. Every order carries its own identifier, so a whole session can be reconstructed afterwards.",
    features: [
      "Market data ingestion with strategy signal evaluation",
      "Rule-based strategy definition — no unexplainable black box",
      "Backtesting against historical data with slippage and cost assumptions",
      "Paper trading before any live order is placed",
      "Broker-connected order execution with per-client API keys",
      "Enforced risk controls: position sizing, stop-loss, daily loss cap, kill switch",
      "Portfolio, position and realised/unrealised P&L tracking",
      "Full order audit trail with unique per-order identifiers",
    ],
    capabilities: [
      {
        title: "Analyse",
        description:
          "Ingests price and volume data, evaluates each strategy's conditions on every bar, and records why a signal fired. The reasoning is inspectable, not reconstructed after the fact.",
        icon: "LineChart",
      },
      {
        title: "Backtest before it costs anything",
        description:
          "Runs a strategy over historical data with explicit assumptions about slippage, brokerage and taxes, so the result is a plausible outcome rather than a curve fitted to the past.",
        icon: "History",
      },
      {
        title: "Paper trade, then live",
        description:
          "Every strategy runs against live market data with simulated fills before it may place a real order. Promotion to live is a deliberate action, never a default.",
        icon: "FlaskConical",
      },
      {
        title: "Execute with limits that bind",
        description:
          "Position size, per-trade stop-loss, daily loss cap and a manual kill switch are enforced by the execution layer. A strategy cannot trade its way past them.",
        icon: "Zap",
      },
      {
        title: "Built for the Indian framework",
        description:
          "SEBI's retail algo framework requires exchange-issued order identifiers, broker-controlled API access with per-client keys and IP whitelisting, and vendor empanelment with exchanges. SRAI Quant is being built against those requirements rather than retrofitted to them.",
        icon: "Shield",
      },
      {
        title: "Auditable by design",
        description:
          "Signals, orders, fills, rejections and risk-limit trips are all recorded. If a broker, a regulator or you ask what happened at 10:47, the answer exists.",
        icon: "ScrollText",
      },
    ],
    screenshots: [],
    howItWorks: [
      { step: "Define the rules", detail: "Entry, exit, sizing and risk limits, written as conditions you can read back." },
      { step: "Backtest", detail: "Run it over history with realistic costs. Most ideas fail here, which is the point." },
      { step: "Paper trade", detail: "Live data, simulated fills, real conditions — no capital at risk." },
      { step: "Go live, bounded", detail: "Connect a broker, set the daily loss cap, and let it run inside limits it cannot exceed." },
    ],
    audience: [
      "Systematic and semi-systematic retail traders in India",
      "Traders running strategies by hand or in spreadsheets today",
      "Small proprietary desks needing an auditable execution layer",
    ],
    differentiator:
      "Most retail algo products in India are black boxes sold on past returns. SRAI Quant is built the other way round: rules you can read, costs modelled honestly in the backtest, paper trading before live, and risk limits enforced in the execution path. It is designed against SEBI's retail algo framework — exchange order identifiers, broker-controlled API keys, audit trail — rather than hoping the rules do not apply.",
    stack: [],
    status: "COMING SOON",
    bestFor: "Systematic traders in Indian markets",
    accent: "sraiquant",
    accentHsl: "190 85% 55%",
    themeGradient: "linear-gradient(135deg, hsl(190 85% 50%), hsl(215 80% 50%))",
    url: null,
    icon: "LineChart",
    related: ["fundos", "thecrows"],
    seo: {
      title: "SRAI Quant — systematic trading and execution for Indian markets",
      description:
        "SRAI Quant analyses market data, backtests rule-based strategies with realistic costs, paper trades them, and executes through a broker with enforced risk limits. In development at SRAI Systems.",
    },
  },
];

export const services: Service[] = [
  {
    id: "ai-product-engineering",
    title: "AI Product Engineering",
    description:
      "End-to-end product development, from a validated problem to something running in production that your team can maintain.",
    icon: "Cpu",
    who: "A funded startup or established business with a real problem and no in-house AI team.",
    deliverable: "A working product in production, a deployment runbook, and a handover your engineers can pick up.",
    scope: "3–6 months",
    pricing: "Milestone-based fixed fee, or a monthly retainer for an ongoing build.",
    proof: "FundOS — designed, built and shipped by this team, live and self-serve.",
  },
  {
    id: "cv-nlp",
    title: "Computer Vision & NLP",
    description:
      "Models trained on your data and your domain, with an evaluation report that states real accuracy rather than a marketing number.",
    icon: "Eye",
    who: "A business sitting on proprietary images, documents, or regional-language text.",
    deliverable: "Trained model, inference API, and an honest evaluation report including where it fails.",
    scope: "6–12 weeks",
    pricing: "Fixed-fee pilot first, then per-model or per-deployment.",
    proof: "SmartBhoomi's regional-language interface and crop advisory work.",
  },
  {
    id: "cloud-ai-architecture",
    title: "Cloud AI Architecture",
    description:
      "A review of what you are running, what it costs, and what it would take to make it faster or cheaper — with the migration plan attached.",
    icon: "Cloud",
    who: "A team whose inference bill or latency has become a problem.",
    deliverable: "Architecture review, cost model, migration plan, and a reference implementation of the critical path.",
    scope: "2–4 weeks",
    pricing: "Fixed-price audit. You keep the report whether or not you continue with us.",
    proof: "Our own products run on this architecture — we pay these bills too.",
  },
  {
    id: "data-pipelines",
    title: "Data Pipelines & Analytics",
    description:
      "Getting your data out of five systems into one place, with a dashboard someone actually opens on a Monday.",
    icon: "Database",
    who: "A business with data scattered across tools and no single view of it.",
    deliverable: "Ingestion pipeline, warehouse schema, and dashboards built around the decisions you actually make.",
    scope: "4–8 weeks",
    pricing: "Fixed-fee build, with an optional retainer for ongoing changes.",
    proof: "The FundOS metrics module — revenue, burn, runway and history from live data.",
  },
  {
    id: "ai-automation",
    title: "AI Automation",
    description:
      "Taking a repetitive judgement call your team makes fifty times a day and automating it — with a human checkpoint where it matters.",
    icon: "Workflow",
    who: "An operations-heavy business spending expensive hours on repetitive decisions.",
    deliverable: "An automated workflow with a human-in-the-loop step, and a measured before-and-after on hours saved.",
    scope: "3–6 weeks",
    pricing: "Fixed fee per workflow. The easiest place to start if you have not worked with us before.",
    proof: "ModGuardian's rule pipeline and FundOS's task generation.",
  },
  {
    id: "custom-ai-systems",
    title: "Custom AI Systems",
    description:
      "For the problem that does not fit any of the above. We scope it properly before either of us commits.",
    icon: "Wrench",
    who: "Anyone whose requirement is genuinely unusual.",
    deliverable: "A discovery document: the problem stated precisely, options with trade-offs, and a costed recommendation.",
    scope: "Discovery in 1–2 weeks, build scoped from there",
    pricing: "Paid discovery first. We do not scope for free — it produces bad estimates and worse projects.",
    proof: "Eight products across eight different domains.",
  },
];

export const engagementModels: EngagementModel[] = [
  {
    id: "pilot",
    title: "Pilot",
    description: "Short-term proof of concept to validate feasibility and fit. Typically 4–8 weeks.",
    duration: "4–8 weeks",
    icon: "FlaskConical",
  },
  {
    id: "build",
    title: "Build",
    description: "Full product development cycle from architecture to deployment and handoff.",
    duration: "3–6 months",
    icon: "Hammer",
  },
  {
    id: "retainer",
    title: "Retainer",
    description: "Ongoing engineering and research support. Dedicated bandwidth for your AI initiatives.",
    duration: "Ongoing",
    icon: "Handshake",
  },
];

export const roadmap: RoadmapPhase[] = [
  {
    id: "phase-1",
    phase: "Phase 1",
    title: "Foundation",
    description:
      "Core platform development, initial product launches, and establishing engineering practices.",
    status: "completed",
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    title: "Growth & Refinement",
    description:
      "Expanding product capabilities, onboarding early users, and iterating based on real feedback.",
    status: "in-progress",
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    title: "Scale & Partnerships",
    description:
      "Scaling infrastructure, forming strategic partnerships, and preparing for institutional engagement.",
    status: "upcoming",
  },
  {
    id: "phase-4",
    phase: "Phase 4",
    title: "Ecosystem Integration",
    description:
      "Cross-platform synergies, API ecosystem, and expanding into adjacent verticals.",
    status: "upcoming",
  },
];

export const howWeWork = [
  {
    step: 1,
    title: "Discover",
    description: "Deep-dive into your problem space, constraints, and goals.",
  },
  {
    step: 2,
    title: "Prototype",
    description: "Rapid prototyping with real data and user feedback loops.",
  },
  {
    step: 3,
    title: "Build",
    description: "Production-grade engineering with security and scale in mind.",
  },
  {
    step: 4,
    title: "Deploy & Support",
    description: "Continuous deployment, monitoring, and iteration.",
  },
];

export const principles = [
  {
    title: "Trust Over Hype",
    description: "We ship real products, not pitch decks. Every claim we make is backed by working software.",
  },
  {
    title: "Practicality First",
    description: "Technology should solve real problems for real people. We build for impact, not impressions.",
  },
  {
    title: "Engineering + Research",
    description: "We combine rigorous engineering with applied AI research to build systems that last.",
  },
  {
    title: "Local Context",
    description: "We build for India's unique challenges — infrastructure, language, and scale.",
  },
];
