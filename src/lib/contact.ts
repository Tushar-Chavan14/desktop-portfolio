// Contact message shape, validation and client sender. Shared by the
// /api/contact route (server) and every form that posts to it (client),
// so both sides agree on the rules.

export type ContactField = "name" | "email" | "subject" | "message";

export interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Which form sent it, e.g. "Mail app". Shown in the notification. */
  source?: string;
  /** Honeypot: hidden from people, filled in by bots. */
  website?: string;
}

/** Telegram caps a message at 4096 characters; these keep the whole notification under that. */
export const LIMITS: Record<ContactField, number> = { name: 100, email: 200, subject: 150, message: 3000 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactErrors = Partial<Record<ContactField, string>>;

export const validateContact = (m: Pick<ContactMessage, "name" | "email" | "subject" | "message">): ContactErrors => {
  const errors: ContactErrors = {};
  const name = m.name.trim();
  const email = m.email.trim();
  const message = m.message.trim();
  if (!name) errors.name = "Add your name so I know who's writing.";
  else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;
  if (!email) errors.email = "Add your email so I can reply.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "That email address doesn't look right.";
  if ((m.subject ?? "").trim().length > LIMITS.subject) errors.subject = `Keep the subject under ${LIMITS.subject} characters.`;
  if (message.length < 10) errors.message = "Write at least a sentence.";
  else if (message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;
  return errors;
};

export type SendResult = { ok: true } | { ok: false; error: string };

/** Post a message to /api/contact. Never throws. */
export const sendContact = async (message: ContactMessage): Promise<SendResult> => {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Your message didn't send. Try again in a moment." };
  } catch {
    return { ok: false, error: "You seem to be offline. Check your connection and try again." };
  }
};
