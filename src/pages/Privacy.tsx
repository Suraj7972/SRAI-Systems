import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { analyticsProvider } from "@/lib/analytics";

/**
 * Placeholder privacy policy. Describes actual current site behaviour.
 * TODO (counsel review): confirm data-controller details, retention periods,
 * lawful basis wording, and whether India's DPDP Act 2023 obligations apply
 * to SRAI Systems in its current form. Do not remove the review banner until then.
 */
const analyticsSentence =
  analyticsProvider === "none"
    ? "This website currently runs no analytics or advertising trackers. No analytics cookies are set."
    : analyticsProvider === "posthog"
    ? "This website uses PostHog to measure anonymous product-interest events (for example, which product cards are opened and whether the contact form was submitted). We have disabled autocapture and session recording. We do not send your name, email address, or message content to PostHog."
    : "This website uses Google Analytics 4 to measure anonymous product-interest events (for example, which product cards are opened and whether the contact form was submitted). IP anonymisation is enabled. We do not send your name, email address, or message content to Google Analytics.";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: (
      <p>
        SRAI Systems is an AI product studio based in Pune, India. This policy covers the
        website at sraisystems.in. Individual SRAI products hosted on their own subdomains may
        publish their own, separate privacy policies; where they do, that policy governs the
        product. You can reach us about anything in this document at{" "}
        <a href="mailto:contact@sraisystems.in">contact@sraisystems.in</a>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    heading: "Information we collect",
    body: (
      <>
        <p>We collect only two categories of information through this website:</p>
        <ul>
          <li>
            <strong>Information you send us.</strong> When you submit the contact form we receive the
            name, email address, optional role or company, the product or topic you selected, and
            the message you wrote.
          </li>
          <li>
            <strong>Anonymous usage events.</strong> {analyticsSentence}
          </li>
        </ul>
        <p>
          We do not ask for, and this website does not collect, payment details, government
          identifiers, precise location, or any special category of personal data.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    heading: "How we use it",
    body: (
      <ul>
        <li>To reply to your enquiry and, where relevant, continue that conversation.</li>
        <li>To understand which products and pages people find useful, in aggregate.</li>
        <li>To keep the website secure and to prevent automated abuse of the contact form.</li>
      </ul>
    ),
  },
  {
    id: "no-marketing-lists",
    heading: "Marketing",
    body: (
      <p>
        We do not add contact-form submissions to a marketing list, and we do not sell, rent, or
        trade personal information to anyone. If we ever want to send you something you did not ask
        for, we will ask first.
      </p>
    ),
  },
  {
    id: "processors",
    heading: "Third parties who process data for us",
    body: (
      <>
        <p>
          Message delivery and analytics may be handled by third-party providers acting on our
          instructions. The specific providers in use are listed here and this list is updated when
          they change.
        </p>
        <ul>
          <li>
            <strong>Contact form delivery:</strong> the submission endpoint configured for this
            build. If no endpoint is configured, the form does not transmit anything — it opens your
            own email client instead, and your message goes directly to us.
          </li>
          <li>
            <strong>Analytics:</strong>{" "}
            {analyticsProvider === "none"
              ? "none in use."
              : analyticsProvider === "posthog"
              ? "PostHog."
              : "Google Analytics 4."}
          </li>
          <li>
            <strong>Hosting and fonts:</strong> our hosting provider serves this site, and web fonts
            are loaded from Google Fonts, which receives your IP address as part of that request.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep it",
    body: (
      <p>
        We keep enquiry emails for as long as the conversation is live and for a reasonable period
        afterwards for business records. Anonymous usage events are retained according to the
        analytics provider's default retention settings. You can ask us to delete your enquiry at
        any time. <em>Counsel review: set explicit retention periods here.</em>
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your choices",
    body: (
      <>
        <p>You can, at any time:</p>
        <ul>
          <li>Ask what information we hold about you.</li>
          <li>Ask us to correct it or delete it.</li>
          <li>Ask us to stop contacting you.</li>
        </ul>
        <p>
          Email <a href="mailto:contact@sraisystems.in">contact@sraisystems.in</a> and we will
          respond. Your browser's "Do Not Track" or tracking-protection settings are respected by
          our analytics configuration where the provider supports them.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and local storage",
    body: (
      <p>
        This site stores a small flag in your browser's session storage so the intro animation is
        shown only once per visit. {analyticsProvider === "none"
          ? "No analytics or advertising cookies are set."
          : "Our analytics provider may set a first-party identifier so repeat visits are not double-counted."}
      </p>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: (
      <p>
        This website and our products are intended for businesses and adults. We do not knowingly
        collect information from children.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We will update this page when our practices change and revise the "last updated" date above.
        Material changes will be noted at the top of the page.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Questions, requests, or complaints:{" "}
        <a href="mailto:contact@sraisystems.in">contact@sraisystems.in</a>. SRAI Systems, Pune,
        India. <em>Counsel review: add the registered business name and postal address.</em>
      </p>
    ),
  },
];

const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    documentTitle="Privacy Policy | SRAI Systems"
    lastUpdated="25 August 2026"
    intro="What this website collects, why, and what you can ask us to do about it. Written in plain language on purpose."
    sections={sections}
  />
);

export default Privacy;
