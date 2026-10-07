// Network side of /api/embed-check. Framework-free so it can be exercised from a script.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  checkHostname,
  frameBlockReason,
  hasFrameHeaders,
  isPrivateAddress,
} from "./policy";

export interface EmbedResult {
  embeddable: boolean;
  reason?: string;
  finalUrl?: string;
}

const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 5000;
/** Upper bound for the whole check, across HEAD/GET retries and redirects. */
const TOTAL_BUDGET_MS = 7000;
const RETRY_WITH_GET = new Set([403, 405, 501]);

const REQUEST_HEADERS = {
  // A browser-like UA: several sites answer bots with stripped or different headers.
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
};

class BlockedHostError extends Error {}

/** Resolve the host and make sure every address is public. */
const withBudget = <T,>(work: Promise<T>, budget: AbortSignal): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    if (budget.aborted) return reject(budget.reason);
    const onAbort = () => reject(budget.reason);
    budget.addEventListener("abort", onAbort, { once: true });
    work.then(resolve, reject).finally(() => budget.removeEventListener("abort", onAbort));
  });

const assertPublicHost = async (url: URL, budget: AbortSignal) => {
  const hostCheck = checkHostname(url.hostname);
  if (!hostCheck.ok) throw new BlockedHostError(hostCheck.reason);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return; // literal already checked above
  const addresses = await withBudget(lookup(host, { all: true, verbatim: true }), budget);
  if (addresses.length === 0) throw new Error("no addresses");
  if (addresses.some((a) => isPrivateAddress(a.address)))
    throw new BlockedHostError("forbidden address");
};

const isTimeout = (err: unknown) =>
  err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");

const request = async (url: URL, method: "HEAD" | "GET", budget: AbortSignal) => {
  const res = await fetch(url, {
    method,
    redirect: "manual",
    headers: REQUEST_HEADERS,
    signal: AbortSignal.any([AbortSignal.timeout(TIMEOUT_MS), budget]),
    cache: "no-store",
  });
  // Never read bodies: we only care about headers.
  await res.body?.cancel().catch(() => {});
  return res;
};

const isRedirect = (status: number) => status >= 300 && status < 400 && status !== 304;

/** Probe one hop: HEAD first, GET when HEAD is refused or tells us nothing. */
const probe = async (url: URL, budget: AbortSignal) => {
  let res: Response | null = null;
  try {
    res = await request(url, "HEAD", budget);
  } catch (err) {
    // A timeout means the host is not answering at all; a GET would only wait again.
    if (isTimeout(err)) throw err;
    res = null; // some servers reset on HEAD; try GET below
  }
  const needsGet =
    !res ||
    RETRY_WITH_GET.has(res.status) ||
    res.status >= 400 ||
    (!isRedirect(res.status) && !hasFrameHeaders(res.headers));
  if (needsGet) {
    try {
      return await request(url, "GET", budget);
    } catch (err) {
      if (res) return res; // HEAD worked, GET failed: use what we have
      throw err;
    }
  }
  return res!;
};

export const checkEmbeddable = async (start: URL): Promise<EmbedResult> => {
  let current = start;
  const budget = AbortSignal.timeout(TOTAL_BUDGET_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicHost(current, budget);
      const res = await probe(current, budget);

      if (isRedirect(res.status)) {
        const location = res.headers.get("location");
        if (!location) break;
        const next = new URL(location, current);
        if (next.protocol !== "http:" && next.protocol !== "https:")
          return { embeddable: false, reason: "unsupported redirect", finalUrl: next.href };
        current = next;
        continue;
      }

      const blocked = frameBlockReason(res.headers);
      return blocked
        ? { embeddable: false, reason: blocked, finalUrl: current.href }
        : { embeddable: true, finalUrl: current.href };
    }
    return { embeddable: false, reason: "too many redirects", finalUrl: current.href };
  } catch (err) {
    if (err instanceof BlockedHostError)
      return { embeddable: false, reason: "blocked host", finalUrl: current.href };
    return { embeddable: false, reason: "unreachable" };
  }
};
