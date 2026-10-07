"use client";

import { useId, useState, type FormEvent } from "react";
import { PiCheckCircleBold, PiPaperPlaneTiltBold, PiSpinnerGapBold } from "react-icons/pi";
import { profile } from "@src/data/profile";
import { sendContact, validateContact } from "@src/lib/contact";

const inputClass =
  "w-full rounded-lg border border-mocha-surface1 bg-mocha-crust/60 px-3 py-2 text-[15px] text-mocha-text placeholder:text-mocha-overlay0 transition focus:border-mocha-mauve focus:outline-none focus:ring-2 focus:ring-mocha-mauve/30 aria-invalid:border-mocha-red";

type Field = "name" | "email" | "message";
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const empty: Record<Field, string> = { name: "", email: "", message: "" };

/**
 * Message form shared by the desktop Contact app and the overview page.
 * Posts to /api/contact, which forwards the message to Tushar on Telegram.
 */
export default function ContactForm({
  messageRows = 5,
  className = "",
  source = "Contact form",
}: {
  messageRows?: number;
  className?: string;
  /** Label for where the message came from, included in the notification. */
  source?: string;
}) {
  const uid = useId();
  const id = (field: Field) => `${uid}-${field}`;
  const [form, setForm] = useState(empty);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const validate = () => {
    const next = validateContact(form) as Partial<Record<Field, string>>;
    setErrors(next);
    const first = (["name", "email", "message"] as Field[]).find((f) => next[f]);
    if (first) document.getElementById(id(first))?.focus();
    return !first;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending" || !validate()) return;
    setStatus({ kind: "sending" });
    const result = await sendContact({ ...form, source, website: honeypot });
    if (result.ok) {
      setForm(empty);
      setStatus({ kind: "sent" });
    } else {
      setStatus({ kind: "error", message: result.error });
    }
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className={`flex flex-col items-start justify-center gap-3 rounded-xl bg-mocha-crust/40 p-6 ${className}`}>
        <PiCheckCircleBold className="size-8 text-mocha-green" aria-hidden />
        <p className="text-lg font-semibold text-mocha-text">Message sent</p>
        <p className="max-w-[40ch] text-sm leading-relaxed text-mocha-subtext1">
          Thanks for writing. It went straight to my phone, and I usually reply within a day.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-1 text-sm font-medium text-mocha-mauve underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-mocha-mauve"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field = (key: Field) => ({
    id: id(key),
    value: form[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id(key)}-error` : undefined,
    onChange: (e: { target: { value: string } }) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  const error = (key: Field) =>
    errors[key] && (
      <p id={`${id(key)}-error`} className="text-sm text-mocha-red">
        {errors[key]}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate className={`relative flex flex-col gap-4 ${className}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id("name")} className="text-sm font-medium text-mocha-subtext1">
            Name
          </label>
          <input {...field("name")} required autoComplete="name" className={inputClass} placeholder="Sara Mehta" />
          {error("name")}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id("email")} className="text-sm font-medium text-mocha-subtext1">
            Your email
          </label>
          <input {...field("email")} type="email" required autoComplete="email" className={inputClass} placeholder="sara@company.com" />
          {error("email")}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor={id("message")} className="text-sm font-medium text-mocha-subtext1">
          Message
        </label>
        <textarea
          {...field("message")}
          rows={messageRows}
          className={`${inputClass} min-h-28 flex-1 resize-none`}
          placeholder="We're hiring for a full stack role and..."
        />
        {error("message")}
      </div>
      {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] size-px opacity-0"
      />
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className={`text-sm ${status.kind === "error" ? "text-mocha-red" : "text-mocha-subtext0"}`}>
          {status.kind === "error" ? (
            <>
              {status.message}{" "}
              <a href={`mailto:${profile.contact.email}`} className="underline underline-offset-4">
                Email instead
              </a>
            </>
          ) : (
            "Goes straight to my phone."
          )}
        </p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-mocha-mauve px-4 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve disabled:opacity-60"
        >
          {status.kind === "sending" ? (
            <PiSpinnerGapBold className="size-4 animate-spin" aria-hidden />
          ) : (
            <PiPaperPlaneTiltBold className="size-4" aria-hidden />
          )}
          {status.kind === "sending" ? "Sending" : "Send"}
        </button>
      </div>
    </form>
  );
}
