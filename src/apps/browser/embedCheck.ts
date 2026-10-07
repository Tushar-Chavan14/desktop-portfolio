import { useEffect, useState } from "react";
import { HOME, isKnownEmbeddable } from "./url";

export type EmbedStatus =
  | { state: "checking" }
  | { state: "ok" }
  | { state: "blocked"; reason: string };

const OK: EmbedStatus = { state: "ok" };
const CHECKING: EmbedStatus = { state: "checking" };

/** Settled results, shared by every browser window for the session. */
const results = new Map<string, EmbedStatus>();
const inflight = new Map<string, Promise<EmbedStatus>>();

const runCheck = (url: string): Promise<EmbedStatus> => {
  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = fetch(`/api/embed-check?url=${encodeURIComponent(url)}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`embed-check ${res.status}`);
      const data = (await res.json()) as { embeddable?: boolean; reason?: string };
      const status: EmbedStatus = data.embeddable
        ? OK
        : { state: "blocked", reason: data.reason ?? "blocked" };
      results.set(url, status);
      return status;
    })
    // If the check itself fails, let the iframe try; don't cache so a later visit re-checks.
    .catch(() => OK)
    .finally(() => inflight.delete(url));

  inflight.set(url, promise);
  return promise;
};

const immediate = (url: string): EmbedStatus | undefined => {
  if (url === HOME || isKnownEmbeddable(url)) return OK;
  return results.get(url);
};

/** Whether `url` may be shown in an iframe. Re-renders once the server answers. */
export const useEmbedStatus = (url: string): EmbedStatus => {
  const [settled, setSettled] = useState<{ url: string; status: EmbedStatus } | null>(null);

  useEffect(() => {
    if (immediate(url)) return;
    let alive = true;
    runCheck(url).then((status) => {
      if (alive) setSettled({ url, status });
    });
    return () => {
      alive = false;
    };
  }, [url]);

  return immediate(url) ?? (settled?.url === url ? settled.status : CHECKING);
};
