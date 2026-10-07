"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className="grid min-h-dvh place-items-center bg-mocha-crust px-6 font-mono text-[14px] text-mocha-text">
        <main className="w-full max-w-xl rounded-xl border border-white/10 bg-mocha-base p-5">
          <p className="text-mocha-overlay2">
            <span className="text-mocha-red">[FAILED]</span> The desktop session crashed.
          </p>
          <p className="mt-2 break-words text-mocha-subtext0">{error.message || "Unknown error"}</p>
          {error.digest && <p className="mt-1 text-xs text-mocha-overlay1">Error ID: {error.digest}</p>}
          <div className="mt-5 flex gap-2 font-sans">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-mocha-mauve px-3.5 py-2 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98]"
            >
              Restart session
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-mocha-surface0 px-3.5 py-2 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98]"
            >
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
