import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import LoadingScreen from "./components/LoadingScreen";
import RouteAnalytics from "./components/RouteAnalytics";
import { initAnalytics } from "./lib/analytics";

/* Home ships in the main chunk; every other route is split out. */
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Minimal hold while a route chunk loads. Deliberately quiet — no spinner flash. */
const RouteFallback = () => <div className="min-h-screen" aria-busy="true" aria-live="polite" />;

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAnalytics();
    try {
      if (sessionStorage.getItem("hasVisited")) setLoading(false);
    } catch {
      // sessionStorage can throw in private-browsing modes; show the intro instead of crashing.
      setLoading(false);
    }
  }, []);

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen
            key="loading"
            onComplete={() => {
              try {
                sessionStorage.setItem("hasVisited", "true");
              } catch {
                /* non-fatal */
              }
              setLoading(false);
            }}
          />
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <Sonner />
            <BrowserRouter>
              <RouteAnalytics />
              <AnimatedRoutes />
            </BrowserRouter>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default App;
