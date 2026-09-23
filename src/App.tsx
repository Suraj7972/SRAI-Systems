import { useState, useEffect, lazy, Suspense, type ComponentType } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import LoadingScreen from "./components/LoadingScreen";
import RouteAnalytics from "./components/RouteAnalytics";
import { initAnalytics } from "./lib/analytics";
import { routePatterns, type PageKey } from "./routes";

/* Home ships in the main chunk; every other route is split out. */
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * Every PageKey must have a component. Adding a route to src/routes.tsx without
 * one is a type error here, not a 404 discovered in production.
 */
const PAGES: Record<PageKey, ComponentType> = {
  home: Index,
  products: Products,
  productDetail: ProductDetail,
  services: Services,
  about: About,
  partnerships: Partnerships,
  careers: Careers,
  contact: Contact,
  privacy: Privacy,
  terms: Terms,
  notFound: NotFound,
};

/** Minimal hold while a route chunk loads. Deliberately quiet — no spinner flash. */
const RouteFallback = () => <div className="min-h-screen" aria-busy="true" aria-live="polite" />;

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          {routePatterns.map(({ pattern, page }) => {
            const Page = PAGES[page];
            return <Route key={pattern} path={pattern} element={<Page />} />;
          })}
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

/**
 * `skipIntro` is set by main.tsx when the document arrived prerendered.
 *
 * The whole point of prerendering is that the first paint is real content. An
 * intro screen that covers it immediately afterwards throws that away and hurts
 * LCP, so on a prerendered document the intro does not run at all. It still
 * runs in `npm run dev`, where #root arrives empty.
 */
const App = ({ skipIntro = false }: { skipIntro?: boolean }) => {
  const [loading, setLoading] = useState(!skipIntro);

  useEffect(() => {
    initAnalytics();
    if (skipIntro) return;
    try {
      if (sessionStorage.getItem("hasVisited")) setLoading(false);
    } catch {
      // sessionStorage can throw in private-browsing modes; show the intro instead of crashing.
      setLoading(false);
    }
  }, [skipIntro]);

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
