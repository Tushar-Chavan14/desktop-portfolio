"use client";
import { useState } from "react";

export const TextEditorWindow: React.FC = () => {
  const [content, setContent] = useState("");

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      {/* <div className="p-2 bg-mocha-surface0 border-b border-mocha-surface1 flex gap-2">
        <button className="px-3 py-1 bg-mocha-surface1 hover:bg-mocha-surface2 rounded text-sm text-mocha-text transition-colors">
          New
        </button>
        <button className="px-3 py-1 bg-mocha-surface1 hover:bg-mocha-surface2 rounded text-sm text-mocha-text transition-colors">
          Save
        </button>
        <button className="px-3 py-1 bg-mocha-surface1 hover:bg-mocha-surface2 rounded text-sm text-mocha-text transition-colors">
          Open
        </button>
      </div> */}

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 p-4 bg-mocha-base text-mocha-text resize-none outline-none font-mono text-sm"
        style={{ minHeight: "300px" }}
      />

      {/* Status bar */}
      <div className="p-2 bg-mocha-surface0 border-t border-mocha-surface1 text-xs text-mocha-subtext1">
        Characters: {content.length} | Lines: {content.split("\n").length}
      </div>
    </div>
  );
};