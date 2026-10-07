import Link from "next/link";
import { profile } from "@src/data/profile";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-mocha-crust px-6 font-mono text-[14px]">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-mocha-base p-5 shadow-[0_24px_64px_-12px_rgb(17_17_27/0.75)]">
        <p className="text-mocha-overlay2">
          <span className="text-mocha-green">{profile.username}</span>@<span className="text-mocha-blue">{profile.hostname}</span>{" "}
          <span className="text-mocha-yellow">~</span> $ cd this-page
        </p>
        <p className="mt-1 text-mocha-red">cd: this-page: No such file or directory</p>
        <p className="mt-4 font-sans text-mocha-subtext1">That page doesn&apos;t exist. The desktop has everything else.</p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center rounded-lg bg-mocha-mauve px-3.5 py-2 font-sans text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
        >
          Back to the desktop
        </Link>
      </div>
    </main>
  );
}
