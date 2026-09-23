import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import type { ComponentType } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Partnerships from "@/pages/Partnerships";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFoundPage from "@/pages/NotFound";

import { routePatterns, type PageKey } from "@/routes";

/**
 * SRAI Systems — server entry used by scripts/prerender.mjs.
 *
 * Nothing here runs in the browser bundle. Pages are imported statically (no
 * React.lazy) because renderToString would otherwise suspend and emit the empty
 * Suspense fallback — a "successful" build that ships blank pages.
 *
 * The whole tree renders inside <MotionConfig isStatic>: framer-motion then
 * emits one static frame instead of an animation, with no effects, timers or
 * rAF on the server. Entry states that survive that (opacity:0, blur, translate)
 * are neutralised by the prerenderer's post-processing step.
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
  notFound: NotFoundPage,
};

export function render(url: string): string {
  return renderToString(
    <MotionConfig isStatic reducedMotion="always">
      <TooltipProvider>
        <StaticRouter location={url}>
          <Routes>
            {routePatterns.map(({ pattern, page }) => {
              const Page = PAGES[page];
              return <Route key={pattern} path={pattern} element={<Page />} />;
            })}
          </Routes>
        </StaticRouter>
      </TooltipProvider>
    </MotionConfig>,
  );
}

/* Re-exported so the prerenderer consumes exactly what the app consumes. */
export {
  routes,
  prerenderRoutes,
  sitemapRoutes,
  notFoundRoute,
  absoluteUrl,
  SITE_URL,
  type RouteDef,
} from "@/routes";
export {
  headTagsFor,
  titleTag,
  descriptionTag,
  buildSitemap,
  buildRobots,
  buildLlmsTxt,
} from "@/lib/seo";
export { jsonLdFor, answerFor, faqsFor } from "@/lib/jsonld";
