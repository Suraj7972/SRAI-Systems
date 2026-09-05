import { ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import BackgroundEffects from "./BackgroundEffects";
import Constellation from "./Constellation";
import SiteGuide from "./SiteGuide";

/**
 * Two decorative layers only (constellation + aurora). The scanline, noise and
 * cursor-glow layers were removed — they cost paint on every route and added
 * texture rather than character.
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="relative min-h-screen overflow-x-hidden"
  >
    <Constellation />
    <BackgroundEffects />
    <ScrollProgress />
    <Header />
    <main className="relative z-10 pt-16">{children}</main>
    <Footer />
    <SiteGuide />
  </motion.div>
);

export default Layout;
