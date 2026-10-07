"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { AppComponentProps } from "@src/apps/types";
import { profile } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { commandNames, createShell, execute, APP_IDS, type Effect, type Shell } from "./commands";
import { HOME } from "./content";
import { complete, displayPath } from "./fs";
import { C, type Out, type Seg } from "./lines";

const MAX_LINES = 600;

type LineInput =
  | { kind: "out"; segs: Seg[] }
  | { kind: "prompt"; path: string; time: string; input: string; suffix?: string };

type Line = LineInput & { id: number };

const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });

const bootTime = () =>
  typeof performance !== "undefined" && performance.timeOrigin ? performance.timeOrigin : Date.now();

const DIR_COMMANDS = new Set(["cd", "mkdir", "tree"]);

function SegView({ seg }: { seg: Seg }) {
  if (!seg.href) return <span className={seg.cls}>{seg.text}</span>;
  const external = !seg.href.startsWith("mailto:");
  return (
    <a
      href={seg.href}
      target={external ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="text-mocha-sapphire underline-offset-2 hover:underline"
    >
      {seg.text}
    </a>
  );
}

function PromptHeader({ path, time }: { path: string; time: string }) {
  return (
    <div>
      <span className={C.chrome}>┬─[</span>
      <span className={C.user}>{profile.username}</span>
      <span className={C.chrome}>@</span>
      <span className={C.host}>{profile.hostname}</span>
      <span className={C.chrome}>:</span>
      <span className={C.path}>{path}</span>
      <span className={C.chrome}>]─[</span>
      <span className={C.time} suppressHydrationWarning>
        {time}
      </span>
      <span className={C.chrome}>]</span>
    </div>
  );
}

const PromptArrow = () => (
  <>
    <span className={C.chrome}>╰─&gt;</span>
    <span className={C.user}>$ </span>
  </>
);

export default function Terminal(props: AppComponentProps) {
  const { windowId, isMobile, isFocused } = props;
  const [shell] = useState<Shell>(() => createShell());
  const nextId = useRef(0);
  const [lines, setLines] = useState<Line[]>(() => [
    { id: -2, kind: "out", segs: [{ text: "Fedora Linux 42 (Portfolio Edition)", cls: C.h2 }] },
    {
      id: -1,
      kind: "out",
      segs: [
        { text: "Type ", cls: C.sub },
        { text: "help", cls: C.ok },
        { text: " to see commands, or try ", cls: C.sub },
        { text: "neofetch", cls: C.ok },
        { text: ".", cls: C.sub },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(shell.cwd);
  const [promptTime, setPromptTime] = useState(() => formatTime(new Date()));
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback((items: LineInput[]) => {
    setLines((prev) => {
      const added: Line[] = items.map((l) => ({ ...l, id: nextId.current++ }));
      const merged = [...prev, ...added];
      return merged.length > MAX_LINES ? merged.slice(merged.length - MAX_LINES) : merged;
    });
  }, []);

  const outLines = (out: Out[]): LineInput[] => out.map((segs) => ({ kind: "out", segs }));

  const promptLine = (value: string, suffix?: string): LineInput => ({
    kind: "prompt" as const,
    path: displayPath(cwd, HOME),
    time: promptTime,
    input: value,
    suffix,
  });

  const newPrompt = () => {
    setPromptTime(formatTime(new Date()));
    setInput("");
    historyIndex.current = null;
    draft.current = "";
  };

  const runEffects = (effects: Effect[]) => {
    const store = useWindowStore.getState();
    for (const e of effects) {
      if (e.type === "openApp") store.openApp(e.appId, e.props);
      else if (e.type === "url") window.open(e.url, "_blank", "noopener,noreferrer");
      else if (e.type === "mailto") window.location.href = `mailto:${e.email}`;
      else if (e.type === "close") store.closeWindow(windowId);
    }
  };

  const submit = () => {
    const value = input;
    const result = execute(shell, value, { now: new Date(), bootTime: bootTime() });
    if (result.clear) {
      setLines([]);
    } else {
      append([promptLine(value), ...outLines(result.out)]);
    }
    setCwd(shell.cwd);
    newPrompt();
    runEffects(result.effects);
  };

  const onTab = () => {
    const { input: next, candidates } = complete(input, {
      root: shell.fs,
      cwd: shell.cwd,
      home: HOME,
      commands: commandNames(),
      dirsOnly: (cmd) => DIR_COMMANDS.has(cmd),
      extraWords: (cmd) => (cmd === "open" ? APP_IDS : cmd === "man" ? commandNames() : []),
    });
    setInput(next);
    if (candidates.length) {
      const segs: Seg[] = [];
      candidates.forEach((c, i) => {
        if (i) segs.push({ text: "  " });
        segs.push({ text: c, cls: c.endsWith("/") ? C.dir : C.text });
      });
      append([promptLine(input), { kind: "out", segs }]);
    }
  };

  const walkHistory = (dir: -1 | 1) => {
    const hist = shell.history;
    if (!hist.length) return;
    let idx = historyIndex.current;
    if (idx === null) {
      if (dir === 1) return;
      draft.current = input;
      idx = hist.length - 1;
    } else {
      idx += dir;
    }
    if (idx >= hist.length) {
      historyIndex.current = null;
      setInput(draft.current);
      return;
    }
    idx = Math.max(0, idx);
    historyIndex.current = idx;
    setInput(hist[idx]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      onTab();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      walkHistory(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      walkHistory(1);
    } else if (e.ctrlKey && !e.altKey && !e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === "l") {
        e.preventDefault();
        setLines([]);
      } else if (key === "c") {
        // Leave copy alone when the user has text selected.
        if (window.getSelection()?.toString()) return;
        e.preventDefault();
        append([promptLine(input, "^C")]);
        newPrompt();
      } else if (key === "u") {
        e.preventDefault();
        setInput("");
      }
    }
  };

  // Keep the newest output in view.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (isFocused) inputRef.current?.focus({ preventScroll: true });
  }, [isFocused]);

  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={scrollRef}
      onClick={focusInput}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-mocha-base px-3 py-2 font-mono text-[13px] leading-relaxed text-mocha-text scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0"
      role="log"
      aria-live="polite"
    >
      {lines.map((l) =>
        l.kind === "out" ? (
          <div key={l.id} className="min-h-[1lh] whitespace-pre-wrap break-words">
            {l.segs.map((seg, i) => (
              <SegView key={i} seg={seg} />
            ))}
          </div>
        ) : (
          <div key={l.id} className="mt-1 first:mt-0">
            <PromptHeader path={l.path} time={l.time} />
            <div className="whitespace-pre-wrap break-words">
              <PromptArrow />
              <span className={C.text}>{l.input}</span>
              {l.suffix && <span className={C.dim}>{l.suffix}</span>}
            </div>
          </div>
        )
      )}

      <div className="mt-1 first:mt-0">
        <PromptHeader path={displayPath(cwd, HOME)} time={promptTime} />
        <label className="flex items-center">
          <span className="sr-only">Terminal input</span>
          <span className="shrink-0 whitespace-pre">
            <PromptArrow />
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              historyIndex.current = null;
            }}
            onKeyDown={onKeyDown}
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            aria-label="Terminal input"
            className={`min-w-0 flex-1 border-0 font-mono text-[13px] leading-relaxed text-mocha-text caret-mocha-rosewater outline-none ${
              isMobile ? "min-h-8 rounded-sm bg-mocha-surface0/60 px-1.5" : "bg-transparent p-0"
            }`}
          />
        </label>
      </div>
    </div>
  );
}
