"use client";

import { useState } from "react";
import { PiArrowSquareOutBold, PiDownloadSimpleBold, PiFilePdfFill } from "react-icons/pi";
import { profile } from "@src/data/profile";
import type { AppComponentProps } from "../types";
import { buttonClass } from "../ui";

const FILE_NAME = "Tushar-Chavan-Resume.pdf";

export default function Resume({ isMobile }: AppComponentProps) {
  const [loaded, setLoaded] = useState(false);

  const actions = (
    <div className="flex items-center gap-1.5">
      <a href={profile.resumeUrl} download={FILE_NAME} className={buttonClass.primary}>
        <PiDownloadSimpleBold className="size-4" aria-hidden />
        Download
      </a>
      <a
        href={profile.resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass.icon}
        aria-label="Open the PDF in a new tab"
        title="Open in a new tab"
      >
        <PiArrowSquareOutBold className="size-4" aria-hidden />
      </a>
    </div>
  );

  // Mobile browsers render embedded PDFs poorly, so hand the file to the OS viewer.
  if (isMobile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <PiFilePdfFill className="size-20 text-mocha-red" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-mocha-text">{FILE_NAME}</p>
          <p className="mt-1 text-sm text-mocha-subtext0">2 pages. {profile.role}.</p>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-mocha-surface0 bg-mocha-mantle px-3">
        <p className="flex min-w-0 items-center gap-2 text-sm text-mocha-subtext1">
          <PiFilePdfFill className="size-4 shrink-0 text-mocha-red" aria-hidden />
          <span className="truncate">{FILE_NAME}</span>
        </p>
        {actions}
      </div>
      <div className="relative min-h-0 flex-1 bg-mocha-crust">
        {!loaded && (
          <div className="absolute inset-0 flex justify-center p-6" aria-busy="true" aria-label="Loading resume">
            <div className="aspect-[1/1.414] h-full max-w-full animate-pulse rounded-md bg-mocha-surface0/60" />
          </div>
        )}
        <iframe
          src={`${profile.resumeUrl}#view=FitH&toolbar=0`}
          title={`${profile.name} resume`}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
