import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Emits a page_view on every client-side route change and pins scroll to the top.
 *
 * scrollRestoration is forced to "manual": the intro screen unmounts after the
 * browser has already restored a remembered scroll position, which otherwise
 * leaves the hero starting part-way down the page on a reload.
 */
const RouteAnalytics = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Re-assert after paint — the route's own content mounts a frame later.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    trackPageView(pathname);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

export default RouteAnalytics;
