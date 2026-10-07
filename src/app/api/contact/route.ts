import type { NextRequest } from "next/server";
import { LIMITS, validateContact, type ContactMessage } from "@src/lib/contact";

// Forwards contact-form messages to a Telegram chat through a bot.
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (server-only, see .env.local).

const NO_STORE = { "Cache-Control": "no-store" };

const fail = (status: number, error: string) => Response.json({ error }, { status, headers: NO_STORE });

/* Best-effort rate limit: 5 messages per IP per 10 minutes, per server instance. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const isLimited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return false;
};

const clientIp = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

/** Only accept posts from this site's own pages. */
const isSameOrigin = (request: NextRequest) => {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from some browsers omit it
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max * 2) : "");

const format = (m: Required<Omit<ContactMessage, "website">>) =>
  [
    "<b>New portfolio message</b>",
    "",
    `<b>Name:</b> ${escapeHtml(m.name)}`,
    `<b>Email:</b> ${escapeHtml(m.email)}`,
    ...(m.subject ? [`<b>Subject:</b> ${escapeHtml(m.subject)}`] : []),
    `<b>Sent from:</b> ${escapeHtml(m.source)}`,
    "",
    escapeHtml(m.message),
  ].join("\n");

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return fail(403, "Messages can only be sent from this site.");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[contact] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set");
    return fail(503, "Messaging is not set up yet. Please email me directly.");
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object") throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, "That request wasn't valid.");
  }

  // Bots fill every field, people never see this one: pretend it worked.
  if (str(body.website, 200).trim()) return Response.json({ ok: true }, { headers: NO_STORE });

  const message = {
    name: str(body.name, LIMITS.name).trim(),
    email: str(body.email, LIMITS.email).trim(),
    subject: str(body.subject, LIMITS.subject).trim(),
    message: str(body.message, LIMITS.message).trim(),
    source: str(body.source, 40).trim() || "Contact form",
  };
  const errors = validateContact(message);
  const firstError = Object.values(errors)[0];
  if (firstError) return fail(400, firstError);

  if (isLimited(clientIp(request))) return fail(429, "Too many messages in a short time. Try again in a few minutes.");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: format(message),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[contact] Telegram responded", res.status, await res.text().catch(() => ""));
      return fail(502, "Your message didn't go through. Please try again or email me directly.");
    }
  } catch (err) {
    console.error("[contact] Telegram request failed", err);
    return fail(502, "Your message didn't go through. Please try again or email me directly.");
  }

  return Response.json({ ok: true }, { headers: NO_STORE });
}
