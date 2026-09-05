import SectionReveal from "./SectionReveal";
import { Languages, MapPin, Landmark, Wifi } from "lucide-react";

/**
 * Concrete, checkable statements about how building for India changes the work.
 * No counters, no percentages, no geographic coverage claims.
 */
const points = [
  {
    icon: Languages,
    title: "Regional languages, not translations",
    body: "SmartBhoomi's interface is written in Marathi, because a farm app that needs a translator is an app the farmer does not open.",
  },
  {
    icon: Landmark,
    title: "Indian regulation, in the product",
    body: "FundOS tracks DPIIT, MSME and RBI obligations directly — schemes, filings and deadlines that only exist here.",
  },
  {
    icon: Wifi,
    title: "Built for the conditions",
    body: "Patchy connectivity, mid-range Android phones and shared devices are the baseline we design against, not an edge case.",
  },
  {
    icon: MapPin,
    title: "Close to the customer",
    body: "We are in Pune, which is where the restaurants, farms and traders we build for actually are.",
  },
];

const IndiaSection = () => (
  <section className="py-20 relative overflow-hidden border-t border-border/50">
    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none" />

    <div className="container mx-auto px-4 md:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <SectionReveal>
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-4 block">
            Built for India
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-5">
            Local context isn't a feature.<br />It's the whole design.
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Software built for another market and shipped here tends to fail on the details.
            These are the details we start from.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {points.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.07}>
              <div className="h-full rounded-xl border border-border bg-card/40 p-6">
                <p.icon className="w-5 h-5 text-primary mb-4" aria-hidden="true" />
                <h3 className="text-base font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default IndiaSection;
