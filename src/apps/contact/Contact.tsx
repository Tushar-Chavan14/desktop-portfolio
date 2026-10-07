"use client";

import { useState } from "react";
import {
  PiCheckBold,
  PiCopyBold,
  PiEnvelopeSimpleBold,
  PiGithubLogoBold,
  PiLinkedinLogoBold,
  PiMediumLogoBold,
  PiPhoneBold,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import { profile } from "@src/data/profile";
import type { AppComponentProps } from "../types";
import { buttonClass } from "../ui";
import ContactForm from "@src/components/contact/ContactForm";

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonClass.icon}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied" : "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <PiCheckBold className="size-4 text-mocha-green" aria-hidden /> : <PiCopyBold className="size-4" aria-hidden />}
    </button>
  );
};

const Channel = ({
  icon: Icon,
  label,
  value,
  href,
  copy,
}: {
  icon: IconType;
  label: string;
  value: string;
  href: string;
  copy?: boolean;
}) => {
  const external = href.startsWith("http");
  return (
    <li className="flex items-center gap-3 rounded-xl bg-mocha-mantle py-2 pr-2 pl-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mocha-surface0 text-mocha-mauve">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="min-w-0 flex-1 rounded focus-visible:outline-2 focus-visible:outline-mocha-mauve"
      >
        <span className="block text-xs text-mocha-subtext0">{label}</span>
        <span className="block truncate text-sm font-medium text-mocha-text hover:underline underline-offset-4">{value}</span>
      </a>
      {copy && <CopyButton value={value} label={label.toLowerCase()} />}
    </li>
  );
};

export default function Contact(_props: AppComponentProps) {
  return (
    <div className="@container h-full overflow-y-auto scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
      <div className="mx-auto grid max-w-4xl gap-8 px-5 py-6 @3xl:grid-cols-[1fr_1.1fr] @3xl:px-8">
        <section aria-labelledby="contact-title">
          <h1 id="contact-title" className="text-2xl font-semibold tracking-tight text-mocha-text">
            Get in touch
          </h1>
          <p className="mt-2 max-w-[45ch] text-sm leading-relaxed text-mocha-subtext1">
            Open to full stack roles and freelance work. Email is the fastest way to reach me.
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            <Channel icon={PiEnvelopeSimpleBold} label="Email" value={profile.contact.email} href={`mailto:${profile.contact.email}`} copy />
            <Channel icon={PiPhoneBold} label="Phone" value={profile.contact.phone} href={profile.contact.phoneHref} copy />
            <Channel icon={PiLinkedinLogoBold} label="LinkedIn" value="tushar-chavan" href={profile.contact.linkedin} />
            <Channel icon={PiGithubLogoBold} label="GitHub" value={profile.contact.githubUser} href={profile.contact.github} />
            <Channel icon={PiMediumLogoBold} label="Blog" value="medium.com/@tushar_chavan" href={profile.contact.blog} />
          </ul>
        </section>

        <section aria-labelledby="contact-form-title" className="rounded-2xl bg-mocha-mantle p-5">
          <h2 id="contact-form-title" className="font-semibold text-mocha-text">
            Write a message
          </h2>
          <p className="mt-1 text-sm text-mocha-subtext0">I get it instantly and reply by email.</p>

          <ContactForm className="mt-4" source="Desktop Contact app" />
        </section>
      </div>
    </div>
  );
}
