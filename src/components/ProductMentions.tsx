import { Fragment } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/srai";

/** Longest first, so "SRAI Auctions" is matched before any shorter overlap. */
const NAMES = [...products]
  .map((p) => ({ id: p.id, name: p.name }))
  .sort((a, b) => b.name.length - a.name.length);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN = new RegExp(`(${NAMES.map((n) => escapeRe(n.name)).join("|")})`, "g");

/**
 * Turns product names inside a sentence into links to those product pages.
 *
 * This is the reciprocal half of the internal linking: product pages name the
 * services they demonstrate, and service copy names the products that prove it.
 * Linking in prose rather than in a "see also" rail is deliberate — the sentence
 * around the link is what tells a crawler (and a reader) why these two pages
 * belong to each other, and a bare related-items rail says nothing at all.
 *
 * Nothing is rewritten: the text renders exactly as written, with matched names
 * wrapped. A product renamed in src/data/srai.ts is linked automatically.
 */
const ProductMentions = ({ text }: { text: string }) => (
  <>
    {text.split(PATTERN).map((part, i) => {
      const match = NAMES.find((n) => n.name === part);
      return match ? (
        <Link
          key={`${match.id}-${i}`}
          to={`/products/${match.id}`}
          className="text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {part}
        </Link>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      );
    })}
  </>
);

export default ProductMentions;
