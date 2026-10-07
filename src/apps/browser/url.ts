export const HOME = "about:home";

const SEARCH_BASE = "https://www.google.com/search?igu=1&q=";

export const searchUrl = (query: string) => SEARCH_BASE + encodeURIComponent(query);

const parseHttp = (value: string): URL | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Google search only allows framing with igu=1; add it so typed search URLs work.
    if (/^(www\.)?google\.com$/.test(url.hostname) && url.pathname === "/search") {
      url.hostname = "www.google.com";
      url.searchParams.set("igu", "1");
    }
    return url;
  } catch {
    return null;
  }
};

/**
 * Turn whatever was typed into a navigable URL: full http(s) URLs pass through,
 * domain-like input gets https://, everything else becomes a Google search.
 */
export const normalizeInput = (raw: string): string | null => {
  const input = raw.trim();
  if (!input) return null;
  if (input === HOME) return HOME;

  if (/^https?:\/\//i.test(input)) {
    return parseHttp(input)?.href ?? searchUrl(input);
  }

  const looksLikeHost = !/\s/.test(input) && (input.includes(".") || /^localhost(:\d+)?(\/|$)/i.test(input));
  if (looksLikeHost) {
    const url = parseHttp(`https://${input}`);
    if (url && (url.hostname.includes(".") || url.hostname === "localhost")) return url.href;
  }
  return searchUrl(input);
};

export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/** Compact address shown while the field is not focused: host + path, no scheme. */
export const displayUrl = (url: string): string => {
  if (url === HOME) return "";
  try {
    const u = new URL(url);
    if (u.hostname === "www.google.com" && u.pathname === "/search") {
      const q = u.searchParams.get("q");
      if (q) return `${u.hostname}/search?q=${q}`;
    }
    const path = u.pathname === "/" ? "" : decodeURI(u.pathname).replace(/\/$/, "");
    return u.hostname + path;
  } catch {
    return url;
  }
};

export const faviconUrl = (host: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;

/** Pages we know render inside an iframe; no need to ask the server. */
export const isKnownEmbeddable = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (typeof window !== "undefined" && u.origin === window.location.origin) return true;
    if (u.hostname === "github1s.com" || u.hostname.endsWith(".github1s.com")) return true;
    if (u.hostname === "open.spotify.com" && u.pathname.startsWith("/embed")) return true;
    if (
      u.hostname === "www.google.com" &&
      (u.pathname === "/webhp" || u.pathname === "/search") &&
      u.searchParams.get("igu") === "1"
    )
      return true;
    return false;
  } catch {
    return false;
  }
};
