"use client";

import { useEffect, useRef, useState } from "react";
import { PiDownloadSimpleBold, PiTrashBold } from "react-icons/pi";
import type { AppComponentProps } from "../types";
import { buttonClass } from "../ui";

const STORAGE_KEY = "editor:notes.txt";
const STARTER = `Thanks for stopping by.

This note is saved in your browser, so it will still be here next time.
Use it however you like, or download it as a .txt file.
`;

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export default function TextEditor(_props: AppComponentProps) {
  const [content, setContent] = useState("");
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [saved, setSaved] = useState(true);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(readSaved() ?? STARTER);
  }, []);

  // Debounced autosave.
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, content);
      } catch {
        // Storage can be unavailable (private mode); the editor still works.
      }
      setSaved(true);
    }, 400);
    return () => clearTimeout(t);
  }, [content]);

  const updateCursor = () => {
    const el = ref.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split("\n");
    setCursor({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "notes.txt" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-mocha-surface0 bg-mocha-mantle px-3">
        <p className="text-sm text-mocha-subtext1">
          notes.txt
          <span className="ml-2 text-xs text-mocha-overlay1">{saved ? "Saved" : "Saving"}</span>
        </p>
        <div className="flex gap-1">
          <button type="button" className={buttonClass.icon} onClick={() => setContent("")} aria-label="Clear note" title="Clear">
            <PiTrashBold className="size-4" aria-hidden />
          </button>
          <button type="button" className={buttonClass.icon} onClick={download} aria-label="Download as notes.txt" title="Download">
            <PiDownloadSimpleBold className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <label htmlFor="editor-notes" className="sr-only">
        Note
      </label>
      <textarea
        id="editor-notes"
        ref={ref}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          updateCursor();
        }}
        onSelect={updateCursor}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-mocha-base p-4 font-mono text-[13.5px] leading-relaxed text-mocha-text caret-mocha-rosewater outline-none selection:bg-mocha-mauve/30"
      />
      <div className="flex h-7 shrink-0 items-center justify-end gap-4 border-t border-mocha-surface0 bg-mocha-mantle px-3 text-xs text-mocha-subtext0 tabular-nums">
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span>{words} words</span>
        <span>Plain text</span>
      </div>
    </div>
  );
}
