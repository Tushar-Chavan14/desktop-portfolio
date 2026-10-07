// Structured output model for the terminal. Every printed line is a list of
// segments with an optional Tailwind color class and optional link target.
// Nothing here renders HTML strings.

export interface Seg {
  text: string;
  cls?: string;
  href?: string;
}

/** One printed line, before the component assigns it an id. */
export type Out = Seg[];

export const C = {
  text: "text-mocha-text",
  dim: "text-mocha-overlay1",
  chrome: "text-mocha-overlay2",
  sub: "text-mocha-subtext0",
  error: "text-mocha-red",
  dir: "text-mocha-blue font-semibold",
  hidden: "text-mocha-overlay1",
  h1: "text-mocha-mauve font-semibold",
  h2: "text-mocha-blue font-semibold",
  key: "text-mocha-sky",
  accent: "text-mocha-peach",
  ok: "text-mocha-green",
  warn: "text-mocha-yellow",
  user: "text-mocha-green",
  host: "text-mocha-blue",
  path: "text-mocha-yellow",
  time: "text-mocha-mauve",
} as const;

const LINK_RE = /(https?:\/\/[^\s<>"')]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Split plain text into segments, turning URLs and emails into links. */
export function linkify(text: string, cls?: string): Seg[] {
  const out: Seg[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    let raw = m[0];
    const start = m.index ?? 0;
    // Do not swallow trailing sentence punctuation.
    while (/[.,;:!?]$/.test(raw)) raw = raw.slice(0, -1);
    if (start > last) out.push({ text: text.slice(last, start), cls });
    const isEmail = !raw.startsWith("http");
    out.push({ text: raw, cls, href: isEmail ? `mailto:${raw}` : raw });
    last = start + raw.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), cls });
  return out.length ? out : [{ text: "", cls }];
}

/** A single line of (linkified) text. */
export const line = (text: string, cls?: string): Out => linkify(text, cls);

export const blank = (): Out => [{ text: "" }];

export const err = (text: string): Out => [{ text, cls: C.error }];

/** "Key: value" with a colored key. */
export const kv = (key: string, value: string, keyCls: string = C.key): Out => [
  { text: `${key}: `, cls: keyCls },
  ...linkify(value, C.text),
];

/**
 * Render file content. Markdown-ish files get colored headings, bullets and
 * keys; other files get dimmed comment lines.
 */
export function renderDoc(content: string, markdown: boolean): Out[] {
  return content.replace(/\n$/, "").split("\n").map((raw): Out => {
    if (!markdown) {
      if (/^\s*#/.test(raw)) return [{ text: raw, cls: C.dim }];
      return linkify(raw, C.text);
    }
    if (raw.startsWith("# ")) return [{ text: raw, cls: C.h1 }];
    if (raw.startsWith("## ")) return [{ text: raw, cls: C.h2 }];
    if (raw.startsWith("- ")) return [{ text: "  - ", cls: C.dim }, ...linkify(raw.slice(2), C.text)];
    const kvMatch = /^([A-Z][A-Za-z ]{0,18}): (.+)$/.exec(raw);
    if (kvMatch) return kv(kvMatch[1], kvMatch[2]);
    return linkify(raw, C.text);
  });
}
