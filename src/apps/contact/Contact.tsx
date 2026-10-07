"use client";

import { useState, type FormEvent } from "react";
import {
  PiCheckBold,
  PiCopyBold,
  PiEnvelopeSimpleBold,
  PiGithubLogoBold,
  PiLinkedinLogoBold,
  PiMediumLogoBold,
  PiPaperPlaneTiltBold,
  PiPhoneBold,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import { profile } from "@src/data/profile";
import type { AppComponentProps } from "../types";
import { buttonClass } from "../ui";

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

const inputClass =
  "w-full rounded-lg border border-mocha-surface1 bg-mocha-crust/60 px-3 py-2 text-[15px] text-mocha-text placeholder:text-mocha-overlay0 transition focus:border-mocha-mauve focus:outline-none focus:ring-2 focus:ring-mocha-mauve/30 aria-invalid:border-mocha-red";

export default function Contact(_props: AppComponentProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Add your name so I know who's writing.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "That email address doesn't look right.";
    if (form.message.trim().length < 10) next.message = "Write at least a sentence.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // No backend: hand the draft to the visitor's own mail client.
    const subject = `Hello from ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n${form.name.trim()}${form.email ? `\n${form.email.trim()}` : ""}`;
    window.location.href = `mailto:${profile.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = (key: keyof typeof form) => ({
    id: `contact-${key}`,
    value: form[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
    onChange: (e: { target: { value: string } }) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

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
          <p className="mt-1 text-sm text-mocha-subtext0">Sends through your own email app.</p>

          <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-name" className="text-sm font-medium text-mocha-subtext1">
                Name
              </label>
              <input {...field("name")} autoComplete="name" className={inputClass} placeholder="Sara Mehta" />
              {errors.name && (
                <p id="contact-name-error" className="text-sm text-mocha-red">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-email" className="text-sm font-medium text-mocha-subtext1">
                Your email <span className="font-normal text-mocha-overlay1">(optional)</span>
              </label>
              <input {...field("email")} type="email" autoComplete="email" className={inputClass} placeholder="sara@company.com" />
              {errors.email && (
                <p id="contact-email-error" className="text-sm text-mocha-red">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-sm font-medium text-mocha-subtext1">
                Message
              </label>
              <textarea {...field("message")} rows={5} className={`${inputClass} resize-none`} placeholder="We're hiring for a full stack role and..." />
              {errors.message && (
                <p id="contact-message-error" className="text-sm text-mocha-red">
                  {errors.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm text-mocha-green">
                {sent ? "Draft opened in your email app." : ""}
              </p>
              <button type="submit" className={buttonClass.primary}>
                <PiPaperPlaneTiltBold className="size-4" aria-hidden />
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
