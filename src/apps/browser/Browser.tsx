"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import {
  PiArrowClockwise,
  PiArrowLeft,
  PiArrowRight,
  PiArrowSquareOut,
  PiHouse,
  PiLockSimple,
  PiMagnifyingGlass,
  PiX,
} from "react-icons/pi";
import type { AppComponentProps } from "@src/apps/types";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { useEmbedStatus } from "./embedCheck";
import NewTab from "./NewTab";
import { BlockedPage, LoadingBar, ToolbarButton } from "./parts";
import { HOME, displayUrl, hostOf, normalizeInput } from "./url";

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

interface History {
  entries: string[];
  index: number;
  /** Bumped on reload so the iframe remounts. */
  reloads: number;
}

type HistoryAction =
  | { type: "navigate"; url: string }
  | { type: "back" }
  | { type: "forward" }
  | { type: "reload" };

const historyReducer = (state: History, action: HistoryAction): History => {
  switch (action.type) {
    case "navigate": {
      if (state.entries[state.index] === action.url) {
        return { ...state, reloads: state.reloads + 1 };
      }
      // Navigating drops any forward entries, like a real browser.
      const entries = [...state.entries.slice(0, state.index + 1), action.url];
      return { entries, index: entries.length - 1, reloads: state.reloads };
    }
    case "back":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "forward":
      return state.index < state.entries.length - 1 ? { ...state, index: state.index + 1 } : state;
    case "reload":
      return { ...state, reloads: state.reloads + 1 };
  }
};

const resolveTarget = (raw: unknown): string | null =>
  typeof raw === "string" && raw ? normalizeInput(raw) : null;

const openExternal = (url: string) => {
  if (url !== HOME) window.open(url, "_blank", "noopener,noreferrer");
};

const SANDBOX = "allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox";
const ALLOW = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";

/* ------------------------------------------------------------------ */
/* Page area: embed check, loading bar, iframe or interstitial         */
/* ------------------------------------------------------------------ */

function Page({
  url,
  frameKey,
  onBack,
  onNavigate,
  onLoadingChange,
  stopToken,
  isMobile,
  chromeless,
}: {
  url: string;
  frameKey: string;
  onBack?: () => void;
  onNavigate: (input: string) => void;
  onLoadingChange: (loading: boolean) => void;
  stopToken: number;
  isMobile?: boolean;
  chromeless?: boolean;
}) {
  const status = useEmbedStatus(url);
  // The iframe key (entry + reload count) whose load event we've seen, or that the user stopped.
  const [doneKey, setDoneKey] = useState<string | null>(null);
  const [stoppedAt, setStoppedAt] = useState(stopToken);

  if (stopToken !== stoppedAt) {
    setStoppedAt(stopToken);
    setDoneKey(frameKey);
  }

  const isHome = url === HOME && !chromeless;
  const loading = !isHome && (status.state === "checking" || (status.state === "ok" && doneKey !== frameKey));

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  let body;
  if (isHome) {
    body = <NewTab onNavigate={onNavigate} isMobile={isMobile} />;
  } else if (status.state === "blocked") {
    body = <BlockedPage url={url} reason={status.reason} onOpen={() => openExternal(url)} onBack={onBack} />;
  } else if (status.state === "ok") {
    body = (
      <iframe
        key={frameKey}
        src={url}
        title={chromeless ? `Embedded page: ${hostOf(url)}` : `Web page: ${hostOf(url)}`}
        sandbox={SANDBOX}
        allow={ALLOW}
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setDoneKey(frameKey)}
        className="block h-full w-full border-0"
      />
    );
  } else {
    body = null; // checking: the loading bar is the feedback
  }

  return (
    <div className="relative min-h-0 flex-1 bg-mocha-base">
      <LoadingBar active={loading} />
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Browser                                                             */
/* ------------------------------------------------------------------ */

export default function Browser(props: AppComponentProps) {
  const { windowId, isMobile, isFocused } = props;
  const chromeless = props.chromeless === true;
  const urlProp = props.url;

  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    entries: [resolveTarget(urlProp) ?? HOME],
    index: 0,
    reloads: 0,
  }));

  // Navigate when the `url` prop changes while mounted (e.g. a link opened from another app).
  const [prevUrlProp, setPrevUrlProp] = useState(urlProp);
  if (urlProp !== prevUrlProp) {
    setPrevUrlProp(urlProp);
    const target = resolveTarget(urlProp);
    if (target) dispatch({ type: "navigate", url: target });
  }

  const current = history.entries[history.index];
  const canBack = history.index > 0;
  const canForward = history.index < history.entries.length - 1;
  const frameKey = `${history.index}:${current}:${history.reloads}`;

  const [loading, setLoading] = useState(false);
  const [stopToken, setStopToken] = useState(0);

  const navigate = useCallback((input: string) => {
    const target = normalizeInput(input);
    if (target) dispatch({ type: "navigate", url: target });
  }, []);
  const back = useCallback(() => dispatch({ type: "back" }), []);
  const forward = useCallback(() => dispatch({ type: "forward" }), []);
  const reload = useCallback(() => dispatch({ type: "reload" }), []);

  /* Address field ----------------------------------------------------- */
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const submitAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    navigate(draft);
    inputRef.current?.blur();
  };

  /* Title ------------------------------------------------------------- */
  useEffect(() => {
    if (chromeless) return;
    const title = current === HOME ? "New Tab" : `Chrome - ${hostOf(current).replace(/^www\./, "")}`;
    useWindowStore.getState().setTitle(windowId, title);
  }, [chromeless, current, windowId]);

  /* Keyboard shortcuts -------------------------------------------------- */
  const active = isFocused ?? isMobile ?? false;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "l" && !chromeless) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        forward();
      } else if (e.key === "F5" || (mod && key === "r" && !e.shiftKey)) {
        e.preventDefault();
        reload();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, chromeless, back, forward, reload]);

  const page = (
    <Page
      url={current}
      frameKey={frameKey}
      onBack={canBack ? back : undefined}
      onNavigate={navigate}
      onLoadingChange={setLoading}
      stopToken={stopToken}
      isMobile={isMobile}
      chromeless={chromeless}
    />
  );

  if (chromeless) {
    return <div className="flex h-full w-full flex-col bg-mocha-base">{page}</div>;
  }

  const isHome = current === HOME;
  const isHttps = current.startsWith("https://");
  const fieldText = isMobile ? "text-base" : "text-sm";

  return (
    <div className="@container flex h-full w-full flex-col bg-mocha-base">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-mocha-surface0 bg-mocha-mantle px-1.5">
        <ToolbarButton label="Back" onClick={back} disabled={!canBack}>
          <PiArrowLeft aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Forward" onClick={forward} disabled={!canForward}>
          <PiArrowRight aria-hidden="true" />
        </ToolbarButton>
        {loading ? (
          <ToolbarButton label="Stop loading" onClick={() => setStopToken((n) => n + 1)}>
            <PiX aria-hidden="true" />
          </ToolbarButton>
        ) : (
          <ToolbarButton label="Reload" onClick={reload} disabled={isHome}>
            <PiArrowClockwise aria-hidden="true" />
          </ToolbarButton>
        )}
        <ToolbarButton
          label="Home"
          onClick={() => navigate(HOME)}
          className="@max-[400px]:hidden"
        >
          <PiHouse aria-hidden="true" />
        </ToolbarButton>

        <form onSubmit={submitAddress} className="mx-1 min-w-0 flex-1">
          <label className="flex h-7 items-center gap-2 rounded-full border border-transparent bg-mocha-crust px-3 transition focus-within:border-mocha-mauve/50 focus-within:ring-2 focus-within:ring-mocha-mauve/30 hover:border-mocha-surface0">
            {isHttps && !editing ? (
              <PiLockSimple aria-label="Secure connection" role="img" className="shrink-0 text-sm text-mocha-subtext0" />
            ) : (
              <PiMagnifyingGlass aria-hidden="true" className="shrink-0 text-sm text-mocha-overlay1" />
            )}
            <span className="sr-only">Address and search bar</span>
            <input
              ref={inputRef}
              type="text"
              value={editing ? draft : displayUrl(current)}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={(e) => {
                setEditing(true);
                setDraft(isHome ? "" : current);
                const el = e.currentTarget;
                requestAnimationFrame(() => el.select());
              }}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraft(isHome ? "" : current);
                  e.currentTarget.blur();
                }
              }}
              placeholder="Search Google or type a URL"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className={`h-full min-w-0 flex-1 truncate bg-transparent text-mocha-text outline-none placeholder:text-mocha-overlay0 ${fieldText}`}
            />
          </label>
        </form>

        <ToolbarButton label="Open in new tab" onClick={() => openExternal(current)} disabled={isHome}>
          <PiArrowSquareOut aria-hidden="true" />
        </ToolbarButton>
      </div>
      {page}
    </div>
  );
}
