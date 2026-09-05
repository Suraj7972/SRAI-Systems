import LegalPage, { type LegalSection } from "@/components/LegalPage";

/**
 * Placeholder terms of service for the marketing website only.
 * TODO (counsel review): governing law and jurisdiction clause, limitation of
 * liability wording enforceable under Indian law, and whether separate product
 * terms are needed per platform. Do not remove the review banner until then.
 */
const sections: LegalSection[] = [
  {
    id: "scope",
    heading: "What these terms cover",
    body: (
      <p>
        These terms apply to your use of the SRAI Systems website at sraisystems.in — the pages
        describing our company, products, and services, and the contact form. They do not govern the
        use of any SRAI product or platform. Each product is provided under its own agreement, and
        where a product agreement conflicts with these terms, the product agreement governs.
      </p>
    ),
  },
  {
    id: "acceptance",
    heading: "Accepting these terms",
    body: (
      <p>
        By using this website you agree to these terms. If you do not agree with them, please do not
        use the site.
      </p>
    ),
  },
  {
    id: "informational",
    heading: "The website is informational",
    body: (
      <>
        <p>
          Everything on this website is provided for general information. Product descriptions,
          feature lists, and roadmap items describe what we are building and may change without
          notice. Nothing on this website is:
        </p>
        <ul>
          <li>an offer to sell, or a binding commitment to deliver any product or feature;</li>
          <li>a guarantee of availability, timing, performance, or fitness for your purpose;</li>
          <li>professional, legal, financial, agricultural, or investment advice.</li>
        </ul>
      </>
    ),
  },
  {
    id: "product-availability",
    heading: "Product availability",
    body: (
      <p>
        Some products shown on this site are in active development or are not yet publicly
        available. Where a product is not yet live, we say so. Access to early or pilot versions is
        at our discretion and may be withdrawn or changed at any time.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>When using this website, you agree not to:</p>
        <ul>
          <li>submit false, misleading, unlawful, or abusive content through the contact form;</li>
          <li>attempt to gain unauthorised access to the site, its hosting, or connected systems;</li>
          <li>use automated tools to scrape, overload, or disrupt the site;</li>
          <li>impersonate another person or organisation.</li>
        </ul>
      </>
    ),
  },
  {
    id: "submissions",
    heading: "What you send us",
    body: (
      <p>
        You are responsible for the content you submit through the contact form and you confirm you
        have the right to send it. If you send us an unsolicited idea, suggestion, or feedback, we
        may use it to improve our products without obligation to you. Please do not send confidential
        information through the contact form — email us first and we will arrange an appropriate
        channel.
      </p>
    ),
  },
  {
    id: "ip",
    heading: "Intellectual property",
    body: (
      <p>
        The SRAI Systems name, product names, logos, copy, design, and code of this website belong to
        SRAI Systems unless stated otherwise. You may link to the site and quote short extracts with
        attribution. You may not copy the site's design or content wholesale, or use our marks in a
        way that suggests endorsement or affiliation we have not given.
      </p>
    ),
  },
  {
    id: "third-party-links",
    heading: "Links to other sites",
    body: (
      <p>
        This website links to SRAI product subdomains and, in places, to third-party sources. We are
        not responsible for the content, availability, or practices of sites we do not operate.
      </p>
    ),
  },
  {
    id: "disclaimer",
    heading: "No warranty",
    body: (
      <p>
        This website is provided "as is" and "as available". We do not warrant that it will be
        uninterrupted, error-free, or free of harmful components. To the extent permitted by
        applicable law, we disclaim implied warranties of merchantability and fitness for a
        particular purpose. <em>Counsel review: confirm enforceability and wording under Indian law.</em>
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <p>
        To the extent permitted by applicable law, SRAI Systems is not liable for indirect,
        incidental, or consequential loss arising from your use of this website, including lost
        profits or lost data. <em>Counsel review: confirm scope, carve-outs, and any liability cap.</em>
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <p>
        We may update these terms as the business and the website change. The revised version takes
        effect when published on this page, and the "last updated" date above will reflect it.
      </p>
    ),
  },
  {
    id: "law",
    heading: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India, and the courts at Pune, Maharashtra have
        jurisdiction over any dispute arising from them.{" "}
        <em>Counsel review: confirm jurisdiction and dispute-resolution mechanism.</em>
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Questions about these terms: <a href="mailto:contact@sraisystems.in">contact@sraisystems.in</a>.
        SRAI Systems, Pune, India.{" "}
        <em>Counsel review: add the registered business name, entity type, and postal address.</em>
      </p>
    ),
  },
];

const Terms = () => (
  <LegalPage
    title="Terms of Service"
    documentTitle="Terms of Service | SRAI Systems"
    lastUpdated="25 August 2026"
    intro="The terms that apply to this website. Our products are covered by their own agreements."
    sections={sections}
  />
);

export default Terms;
