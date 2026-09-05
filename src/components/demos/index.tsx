import { lazy, Suspense, type ComponentType } from "react";

/**
 * Registry of interactive product demos.
 *
 * Each demo is real code that runs in the visitor's browser — a working model
 * of how the product behaves. They are labelled "Interactive demo" throughout
 * and are never presented as captures of the shipped product interface.
 * Every one is lazy-loaded so a product page only pays for its own demo.
 */
const REGISTRY: Record<string, ComponentType> = {
  fundos: lazy(() => import("./FundOSDemo")),
  smartbhoomi: lazy(() => import("./SmartBhoomiDemo")),
  hotelai: lazy(() => import("./HotelAIDemo")),
  modguardian: lazy(() => import("./ModGuardianDemo")),
  thecrows: lazy(() => import("./TheCrowsDemo")),
  sraiauctions: lazy(() => import("./AuctionsDemo")),
  foodieflow: lazy(() => import("./FoodieFlowDemo")),
  sraiquant: lazy(() => import("./QuantDemo")),
};

export const hasDemo = (productId: string) => productId in REGISTRY;

export const ProductDemo = ({ productId }: { productId: string }) => {
  const Demo = REGISTRY[productId];
  if (!Demo) return null;
  return (
    <Suspense fallback={<div className="rounded-xl border border-border bg-card/40 h-[380px] animate-pulse" aria-busy="true" />}>
      <Demo />
    </Suspense>
  );
};
