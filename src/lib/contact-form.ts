import { z } from "zod";

/**
 * SRAI Systems — contact form submission layer.
 *
 * The site is a static SPA with no backend of its own, so submission is
 * delegated to an HTTP endpoint supplied at build time via
 * `VITE_CONTACT_ENDPOINT`. Any endpoint that accepts a JSON POST and answers
 * 2xx on success satisfies this contract (Formspree, Web3Forms, Formspark, or
 * a serverless function on whichever host this site is eventually deployed to).
 *
 * Rules this module enforces:
 *  - Success is reported ONLY on a 2xx response. Never optimistically.
 *  - With no endpoint configured, submission raises `FormNotConfiguredError`
 *    so the UI can show an honest fallback instead of a false confirmation.
 *  - No credentials are embedded here. Nothing is invented.
 */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address."),
  company: z.string().trim().max(120, "This field is too long.").optional().or(z.literal("")),
  product: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — at least 10 characters.")
    .max(4000, "Message is too long (4000 characters max)."),
  /** Honeypot — must stay empty. Hidden from real users and from screen readers. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;
export type ContactFieldErrors = Partial<Record<keyof ContactPayload, string>>;

export class FormNotConfiguredError extends Error {
  constructor() {
    super("No contact endpoint is configured for this build.");
    this.name = "FormNotConfiguredError";
  }
}

export class FormSubmissionError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "FormSubmissionError";
    this.status = status;
  }
}

/** Every route to us ends at this address. Single source of truth. */
export const CONTACT_EMAIL = "contact@sraisystems.in";

const accessKey = (import.meta.env.VITE_CONTACT_ACCESS_KEY as string | undefined)?.trim();

/**
 * Submission endpoint.
 *
 * If VITE_CONTACT_ENDPOINT is set it wins. Otherwise, supplying only
 * VITE_CONTACT_ACCESS_KEY is enough: we assume Web3Forms, which delivers
 * straight to the inbox the key was created for. That makes "make the form
 * work" a one-variable job rather than a two-variable one.
 */
const endpoint =
  (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() ||
  (accessKey ? "https://api.web3forms.com/submit" : undefined);

/** True when this build can actually deliver a message. */
export const isContactEndpointConfigured = Boolean(endpoint);

export function validateContact(input: ContactPayload): ContactFieldErrors | null {
  const result = contactSchema.safeParse(input);
  if (result.success) return null;
  const errors: ContactFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ContactPayload;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

const TIMEOUT_MS = 15000;

export async function submitContactForm(payload: ContactPayload): Promise<void> {
  if (!endpoint) throw new FormNotConfiguredError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...(accessKey ? { access_key: accessKey } : {}),
        subject: `SRAI Systems enquiry — ${payload.product || "General"}`,
        from_name: payload.name,
        replyto: payload.email,
        to: CONTACT_EMAIL,
        name: payload.name,
        email: payload.email,
        company: payload.company || "",
        product: payload.product || "",
        message: payload.message,
        source: "sraisystems.in/contact",
      }),
    });

    // Success is gated strictly on the HTTP status. Nothing else counts.
    if (!response.ok) {
      throw new FormSubmissionError(
        `The server rejected the message (HTTP ${response.status}).`,
        response.status
      );
    }

    // Some providers return 200 with { success: false }. Honour that too.
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => null);
      if (body && typeof body === "object" && "success" in body && body.success === false) {
        throw new FormSubmissionError(
          typeof body.message === "string" ? body.message : "The message could not be delivered."
        );
      }
    }
  } catch (error) {
    if (error instanceof FormSubmissionError || error instanceof FormNotConfiguredError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FormSubmissionError("The request timed out. Please try again.");
    }
    throw new FormSubmissionError("We could not reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}

/** Mailto fallback used only when no endpoint is configured — never presented as a success. */
export function buildMailtoHref(payload: ContactPayload): string {
  const subject = encodeURIComponent(`SRAI Systems enquiry — ${payload.product || "General"}`);
  const body = encodeURIComponent(
    `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company || "-"}\nInterest: ${payload.product || "-"}\n\nMessage:\n${payload.message}`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
