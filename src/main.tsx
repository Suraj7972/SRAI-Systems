import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;

/**
 * A non-empty #root means scripts/prerender.mjs already put real markup there.
 * We still mount with createRoot rather than hydrateRoot — the animation-heavy
 * tree is not hydration-safe and a mismatch would be worse than a re-render —
 * but the intro screen is skipped so the prerendered content is not covered up.
 */
const prerendered = root.childElementCount > 0;

createRoot(root).render(<App skipIntro={prerendered} />);
