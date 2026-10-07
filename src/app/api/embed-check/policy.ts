// Pure helpers for /api/embed-check: SSRF guards and frame-header decisions.
// Kept free of Next.js imports so they can be unit-tested with plain bun/node.

import { isIP } from "node:net";

export const MAX_URL_LENGTH = 2048;

/* ------------------------------------------------------------------ */
/* IP classification                                                   */
/* ------------------------------------------------------------------ */

const parseIPv4 = (ip: string): number[] | null => {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
};

const isPrivateIPv4 = (ip: string): boolean => {
  const o = parseIPv4(ip);
  if (!o) return true; // unparseable: fail closed
  const [a, b] = o;
  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // 10/8
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64/10 CGNAT
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 192 && b === 0 && o[2] === 0) return true; // 192.0.0/24 IETF protocol assignments
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15 benchmarking
  if (a >= 224) return true; // multicast 224/4 + reserved 240/4 + broadcast
  return false;
};

/** Expand an IPv6 string into 8 16-bit groups. Handles "::" and a trailing dotted IPv4. */
const parseIPv6 = (input: string): number[] | null => {
  let ip = input.toLowerCase();
  const zone = ip.indexOf("%");
  if (zone !== -1) ip = ip.slice(0, zone);

  let tail: number[] = [];
  const lastColon = ip.lastIndexOf(":");
  const maybeV4 = ip.slice(lastColon + 1);
  if (maybeV4.includes(".")) {
    const v4 = parseIPv4(maybeV4);
    if (!v4) return null;
    tail = [(v4[0] << 8) | v4[1], (v4[2] << 8) | v4[3]];
    ip = ip.slice(0, lastColon + 1) + "0:0"; // placeholder groups, replaced below
  }

  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const toGroups = (s: string) => (s === "" ? [] : s.split(":"));
  const head = toGroups(halves[0]);
  const rest = halves.length === 2 ? toGroups(halves[1]) : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 && missing !== 0) return null;
  if (halves.length === 2 && missing < 1) return null;

  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  const nums: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    nums.push(parseInt(g, 16));
  }
  if (nums.length !== 8) return null;
  if (tail.length) {
    nums[6] = tail[0];
    nums[7] = tail[1];
  }
  return nums;
};

const isPrivateIPv6 = (ip: string): boolean => {
  const g = parseIPv6(ip);
  if (!g) return true; // unparseable: fail closed

  const allZeroUntil = (n: number) => g.slice(0, n).every((x) => x === 0);
  const embeddedV4 = () =>
    `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;

  if (allZeroUntil(8)) return true; // ::
  if (allZeroUntil(7) && g[7] === 1) return true; // ::1
  // ::ffff:a.b.c.d (IPv4-mapped) and ::a.b.c.d (deprecated IPv4-compatible)
  if (allZeroUntil(5) && (g[5] === 0xffff || g[5] === 0)) return isPrivateIPv4(embeddedV4());
  // 64:ff9b::/96 NAT64: judge by the embedded IPv4
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0))
    return isPrivateIPv4(embeddedV4());
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((g[0] & 0xffc0) === 0xfec0) return true; // fec0::/10 deprecated site-local
  if ((g[0] & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  return false;
};

/** True for any address we must never fetch: private, loopback, link-local, CGNAT, multicast, unspecified. */
export const isPrivateAddress = (address: string): boolean => {
  const bare = address.replace(/^\[|\]$/g, "");
  const family = isIP(bare.split("%")[0]);
  if (family === 4) return isPrivateIPv4(bare);
  if (family === 6) return isPrivateIPv6(bare);
  return true; // not an IP at all: fail closed
};

/* ------------------------------------------------------------------ */
/* URL / host validation                                               */
/* ------------------------------------------------------------------ */

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Syntactic checks only (scheme, length, credentials, obviously-internal names, IP literals). */
export const validateTargetUrl = (raw: string | null | undefined): UrlCheck => {
  if (!raw) return { ok: false, reason: "missing url" };
  if (raw.length > MAX_URL_LENGTH) return { ok: false, reason: "url too long" };
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid url" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    return { ok: false, reason: "unsupported protocol" };
  if (url.username || url.password) return { ok: false, reason: "credentials not allowed" };
  const hostCheck = checkHostname(url.hostname);
  if (!hostCheck.ok) return hostCheck;
  return { ok: true, url };
};

export const checkHostname = (hostname: string): { ok: true } | { ok: false; reason: string } => {
  const host = hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
  if (!host) return { ok: false, reason: "invalid host" };
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan") ||
    host.endsWith(".home.arpa")
  )
    return { ok: false, reason: "forbidden host" };
  if (isIP(host) && isPrivateAddress(host)) return { ok: false, reason: "forbidden address" };
  return { ok: true };
};

/* ------------------------------------------------------------------ */
/* Frame headers                                                       */
/* ------------------------------------------------------------------ */

type HeaderSource = Pick<Headers, "get">;

/**
 * Collect frame-ancestors source lists from every enforced CSP policy.
 * Multiple CSP headers arrive comma-joined; each policy is enforced independently.
 */
const frameAncestorsLists = (csp: string | null): string[][] => {
  if (!csp) return [];
  const lists: string[][] = [];
  for (const policy of csp.split(",")) {
    for (const directive of policy.split(";")) {
      const tokens = directive.trim().split(/\s+/).filter(Boolean);
      if (tokens[0]?.toLowerCase() === "frame-ancestors") {
        lists.push(tokens.slice(1).map((t) => t.toLowerCase()));
        break; // only the first occurrence in a policy counts
      }
    }
  }
  return lists;
};

/** Sources that let any third-party origin embed the page. */
const isOpenSource = (src: string) =>
  src === "*" || src === "https:" || src === "http:" || src === "https://*" || src === "http://*";

/** True when one of the frame headers would make the browser refuse to render us in an iframe. */
export const frameBlockReason = (headers: HeaderSource): string | null => {
  const lists = frameAncestorsLists(headers.get("content-security-policy"));
  // CSP frame-ancestors takes precedence over X-Frame-Options in modern browsers.
  if (lists.length > 0) {
    for (const list of lists) {
      if (!list.some(isOpenSource)) return "csp frame-ancestors";
    }
    return null;
  }
  const xfo = headers.get("x-frame-options")?.toLowerCase() ?? "";
  if (xfo.includes("deny") || xfo.includes("sameorigin")) return "x-frame-options";
  return null;
};

export const isFrameBlocked = (headers: HeaderSource) => frameBlockReason(headers) !== null;

/** Whether a response carries any header that informs the framing decision. */
export const hasFrameHeaders = (headers: HeaderSource) =>
  headers.get("x-frame-options") !== null ||
  frameAncestorsLists(headers.get("content-security-policy")).length > 0;
