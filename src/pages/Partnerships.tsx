import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Handshake, FlaskConical, TrendingUp, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import SectionReveal from "@/components/SectionReveal";
import { Link } from "react-router-dom";

const partnerTypes = [
  {
    title: "Strategic Partners",
    description: "Organizations with aligned missions in agriculture, fintech, food, or hospitality seeking technology collaboration.",
    icon: Handshake,
  },
  {
    title: "Pilot Customers",
    description: "Early adopters who want to shape product direction and get priority access to our platforms.",
    icon: FlaskConical,
  },
  {
    title: "Early-Stage Investors",
    description: "Angels and micro-VCs who back engineering-first teams building for India's underserved markets.",
    icon: TrendingUp,
  },
];

const Partnerships = () => {
  const [pitchDeckModal, setPitchDeckModal] = useState(false);

  useEffect(() => {
    document.title = "Partnerships & Investors | SRAI Systems";
  }, []);

  return (
    <Layout>
      <section className="py-16 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <SectionReveal>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3 block">
              Collaborate
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Partnerships & Investors
            </h1>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              We're looking for partners, pilots, and believers who share our commitment to building real technology for real impact.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {partnerTypes.map((pt, i) => (
              <SectionReveal key={pt.title} delay={i * 0.1}>
                <motion.div
                  className="glass-premium rounded-xl p-8 h-full group"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                    <pt.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {pt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pt.description}
                  </p>
                </motion.div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal>
            <div className="rounded-2xl relative overflow-hidden border border-border bg-card/60">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 80% at 50% 100%, hsl(230 90% 60% / 0.12), transparent 70%)",
              }} />

              <div className="relative z-10 p-10 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Interested in What We're Building?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Request our pitch deck or reach out directly to explore collaboration opportunities.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setPitchDeckModal(true)}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_hsl(230_90%_60%_/_0.2)]"
                  >
                    Request Pitch Deck
                  </button>
                  <Link to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors">
                    Contact Us <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Pitch Deck Modal */}
      <AnimatePresence>
        {pitchDeckModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: "hsl(220 20% 5% / 0.85)", backdropFilter: "blur(20px)" }}
            onClick={() => setPitchDeckModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              onClick={(e) => e.stopPropagation()}
              className="glass-premium rounded-2xl max-w-md w-full p-8 relative"
            >
              <button onClick={() => setPitchDeckModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-foreground mb-2">Request Pitch Deck</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We'll redirect you to our contact form with the subject pre-filled.
              </p>
              <Link to="/contact?product=pitch-deck" onClick={() => setPitchDeckModal(false)}
                className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                Continue to Contact Form <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Partnerships;
