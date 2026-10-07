"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import {
  PiArrowBendUpLeftBold,
  PiArrowLeftBold,
  PiCalendarCheckBold,
  PiCheckCircleBold,
  PiPaperPlaneTiltBold,
  PiPaperPlaneTiltFill,
  PiPencilSimpleBold,
  PiSpinnerGapBold,
  PiTrayFill,
} from "react-icons/pi";
import { profile } from "@src/data/profile";
import { LIMITS, sendContact, validateContact, type ContactErrors, type ContactField } from "@src/lib/contact";
import useWindowStore from "@src/store/zustore/useWindowStore";
import type { AppComponentProps } from "../types";
import { Monogram, buttonClass } from "../ui";

/** Pre-filled draft passed in by other apps (Calendar's "Request this time"). */
export interface ComposeDraft {
  subject?: string;
  message?: string;
  /** Changes on every request so the same draft can be opened twice. */
  nonce: number;
}

interface SentMail {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  at: number;
}

type Folder = "inbox" | "sent";
type Pane = { kind: "list" } | { kind: "welcome" } | { kind: "sent"; id: string } | { kind: "compose" };

const SENT_KEY = "mail:sent";
const firstName = profile.firstName;

const loadSent = (): SentMail[] => {
  try {
    return JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]") as SentMail[];
  } catch {
    return [];
  }
};

const saveSent = (mails: SentMail[]) => {
  try {
    sessionStorage.setItem(SENT_KEY, JSON.stringify(mails));
  } catch {
    // Storage blocked: the Sent folder just won't survive a reload.
  }
};

const timeLabel = (at: number) =>
  new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(at);

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const FolderButton = ({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-mocha-mauve ${
      active ? "bg-mocha-surface0 font-medium text-mocha-text" : "text-mocha-subtext1 hover:bg-mocha-surface0/60"
    }`}
  >
    <span aria-hidden className="text-mocha-mauve [&>svg]:size-4">
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {count ? <span className="text-xs text-mocha-overlay2 tabular-nums">{count}</span> : null}
  </button>
);

const ListItem = ({
  active,
  unread,
  from,
  subject,
  preview,
  time,
  onClick,
}: {
  active: boolean;
  unread?: boolean;
  from: string;
  subject: string;
  preview: string;
  time: string;
  onClick: () => void;
}) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mocha-mauve ${
        active ? "bg-mocha-surface0/70" : "hover:bg-mocha-surface0/40"
      }`}
    >
      <span className="flex items-center gap-2">
        {unread && <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-mocha-mauve" />}
        <span className={`flex-1 truncate text-sm ${unread ? "font-semibold text-mocha-text" : "text-mocha-subtext1"}`}>{from}</span>
        <span className="shrink-0 text-xs text-mocha-overlay2">{time}</span>
      </span>
      <span className="truncate text-sm text-mocha-text">{subject}</span>
      <span className="truncate text-xs text-mocha-subtext0">{preview}</span>
    </button>
  </li>
);

const MessageHeader = ({ subject, from, to, time }: { subject: string; from: ReactNode; to: string; time: string }) => (
  <header className="border-b border-white/5 pb-4">
    <h2 className="text-xl font-semibold tracking-tight text-pretty text-mocha-text">{subject}</h2>
    <div className="mt-3 flex items-center gap-3">
      {from}
      <span className="ml-auto shrink-0 self-start text-xs text-mocha-overlay2">{time}</span>
    </div>
    <p className="mt-2 text-xs text-mocha-subtext0">To: {to}</p>
  </header>
);

const Welcome = ({ onReply, onBook }: { onReply: () => void; onBook: () => void }) => (
  <article className="flex flex-col gap-5">
    <MessageHeader
      subject="Thanks for stopping by"
      to="You"
      time="Today"
      from={
        <span className="flex min-w-0 items-center gap-3">
          <Monogram size={40} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-mocha-text">{profile.name}</span>
            <span className="block truncate text-xs text-mocha-subtext0">{profile.contact.email}</span>
          </span>
        </span>
      }
    />
    <div className="flex max-w-[62ch] flex-col gap-3 text-[15px] leading-relaxed text-mocha-subtext1">
      <p>Hi there,</p>
      <p>
        Thanks for taking the time to look around. I am a {profile.role.toLowerCase()} with {profile.yearsOfExperience} years
        of experience building microservices backends and Next.js frontends for clients across the GCC.
      </p>
      <p>
        If you are hiring or have a project in mind, hit Reply. Your message reaches me on my phone straight away and I reply by
        email, usually within a day. Prefer to talk? Pick a time in my calendar.
      </p>
      <p>
        {profile.availability.status}. Notice period: {profile.availability.noticePeriod}.
      </p>
      <p>
        Best,
        <br />
        {firstName}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onReply} className={buttonClass.primary}>
        <PiArrowBendUpLeftBold className="size-4" aria-hidden />
        Reply
      </button>
      <button type="button" onClick={onBook} className={buttonClass.secondary}>
        <PiCalendarCheckBold className="size-4" aria-hidden />
        Book a call
      </button>
    </div>
  </article>
);

const SentView = ({ mail, justSent }: { mail: SentMail; justSent: boolean }) => (
  <article className="flex flex-col gap-5">
    {justSent && (
      <p role="status" className="flex items-center gap-2 rounded-lg bg-mocha-green/10 px-3 py-2 text-sm text-mocha-green">
        <PiCheckCircleBold className="size-4 shrink-0" aria-hidden />
        Sent. {firstName} has it now and will reply to {mail.email}.
      </p>
    )}
    <MessageHeader
      subject={mail.subject || "(no subject)"}
      to={`${profile.name} <${profile.contact.email}>`}
      time={timeLabel(mail.at)}
      from={
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-mocha-text">{mail.name}</span>
          <span className="block truncate text-xs text-mocha-subtext0">{mail.email}</span>
        </span>
      }
    />
    <p className="max-w-[62ch] text-[15px] leading-relaxed whitespace-pre-wrap text-mocha-subtext1">{mail.message}</p>
  </article>
);

/* ------------------------------------------------------------------ */
/* Compose                                                             */
/* ------------------------------------------------------------------ */

const rowInput =
  "min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-mocha-text placeholder:text-mocha-overlay0 focus:outline-none";

const Row = ({ htmlFor, label, error, children }: { htmlFor?: string; label: string; error?: ReactNode; children: ReactNode }) => (
  <div className="border-b border-white/5">
    <div className="flex items-center gap-3">
      <label htmlFor={htmlFor} className="w-17 shrink-0 text-sm text-mocha-subtext0">
        {label}
      </label>
      {children}
    </div>
    {error}
  </div>
);

const Compose = ({
  initial,
  onSent,
  onCancel,
}: {
  initial: { subject: string; message: string };
  onSent: (mail: SentMail) => void;
  onCancel: () => void;
}) => {
  const uid = useId();
  const id = (f: ContactField) => `${uid}-${f}`;
  const [form, setForm] = useState({ name: "", email: "", subject: initial.subject, message: initial.message });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const set = (f: ContactField) => (e: { target: { value: string } }) => {
    setForm((v) => ({ ...v, [f]: e.target.value }));
    if (errors[f]) setErrors((er) => ({ ...er, [f]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const next = validateContact(form);
    setErrors(next);
    const first = (["name", "email", "subject", "message"] as ContactField[]).find((f) => next[f]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setSending(true);
    setFailure(null);
    const result = await sendContact({ ...form, source: "Desktop Mail app", website: honeypot });
    setSending(false);
    if (!result.ok) {
      setFailure(result.error);
      return;
    }
    onSent({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      at: Date.now(),
    });
  };

  const err = (f: ContactField) =>
    errors[f] && (
      <p id={`${id(f)}-error`} className="pb-2 pl-20 text-sm text-mocha-red">
        {errors[f]}
      </p>
    );

  const a11y = (f: ContactField) => ({
    id: id(f),
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${id(f)}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate aria-label="New message" className="relative flex h-full min-h-0 flex-col">
      <h2 className="sr-only">New message</h2>
      <Row label="To">
        <span className="my-1.5 inline-flex min-w-0 items-center gap-2 rounded-full bg-mocha-surface0 py-1 pr-3 pl-1">
          <Monogram size={22} />
          <span className="truncate text-sm text-mocha-text">{profile.name}</span>
        </span>
      </Row>
      <Row htmlFor={id("name")} label="From" error={err("name")}>
        <input {...a11y("name")} value={form.name} onChange={set("name")} autoComplete="name" maxLength={LIMITS.name} placeholder="Your name" className={rowInput} />
      </Row>
      <Row htmlFor={id("email")} label="Reply to" error={err("email")}>
        <input
          {...a11y("email")}
          type="email"
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
          maxLength={LIMITS.email}
          placeholder="you@company.com"
          className={rowInput}
        />
      </Row>
      <Row htmlFor={id("subject")} label="Subject" error={err("subject")}>
        <input {...a11y("subject")} value={form.subject} onChange={set("subject")} maxLength={LIMITS.subject} placeholder="Full stack role at ..." className={rowInput} />
      </Row>
      <label htmlFor={id("message")} className="sr-only">
        Message
      </label>
      <textarea
        {...a11y("message")}
        value={form.message}
        onChange={set("message")}
        maxLength={LIMITS.message}
        placeholder={`Hi ${firstName}, ...`}
        className="min-h-40 flex-1 resize-none bg-transparent py-4 text-[15px] leading-relaxed text-mocha-text placeholder:text-mocha-overlay0 focus:outline-none"
      />
      {errors.message && (
        <p id={`${id("message")}-error`} className="pb-2 text-sm text-mocha-red">
          {errors.message}
        </p>
      )}
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
      <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-3">
        <button type="submit" disabled={sending} className={buttonClass.primary}>
          {sending ? <PiSpinnerGapBold className="size-4 animate-spin" aria-hidden /> : <PiPaperPlaneTiltBold className="size-4" aria-hidden />}
          {sending ? "Sending" : "Send"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass.ghost}>
          Discard
        </button>
        <p aria-live="polite" className={`min-w-0 flex-1 text-right text-sm ${failure ? "text-mocha-red" : "text-mocha-overlay2"}`}>
          {failure ? (
            <>
              {failure}{" "}
              <a href={`mailto:${profile.contact.email}`} className="underline underline-offset-4">
                Use my email
              </a>
            </>
          ) : (
            `${form.message.length} / ${LIMITS.message}`
          )}
        </p>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function Mail({ compose }: AppComponentProps) {
  const draft = compose as ComposeDraft | undefined;
  const openApp = useWindowStore((s) => s.openApp);
  const [folder, setFolder] = useState<Folder>("inbox");
  const [pane, setPane] = useState<Pane>({ kind: "welcome" });
  const [read, setRead] = useState(false);
  const [sent, setSent] = useState<SentMail[]>([]);
  const [justSent, setJustSent] = useState<string | null>(null);
  const [initial, setInitial] = useState({ subject: "", message: "", key: 0 });

  useEffect(() => setSent(loadSent()), []);

  // Another app asked for a pre-filled draft.
  useEffect(() => {
    if (!draft) return;
    setInitial({ subject: draft.subject ?? "", message: draft.message ?? "", key: draft.nonce });
    setPane({ kind: "compose" });
  }, [draft?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCompose = (subject = "", message = "") => {
    setInitial({ subject, message, key: Date.now() });
    setPane({ kind: "compose" });
  };

  const openWelcome = () => {
    setRead(true);
    setPane({ kind: "welcome" });
  };

  const onSent = (mail: SentMail) => {
    const next = [mail, ...sent];
    setSent(next);
    saveSent(next);
    setFolder("sent");
    setJustSent(mail.id);
    setPane({ kind: "sent", id: mail.id });
  };

  const current = pane.kind === "sent" ? sent.find((m) => m.id === pane.id) : undefined;
  const showingDetail = pane.kind !== "list";

  return (
    <div className="@container flex h-full min-h-0 bg-mocha-base text-mocha-text">
      {/* Folders */}
      <nav aria-label="Mailboxes" className="hidden w-48 shrink-0 flex-col gap-1 border-r border-white/5 bg-mocha-mantle p-3 @3xl:flex">
        <button type="button" onClick={() => startCompose()} className={`${buttonClass.primary} mb-3 w-full`}>
          <PiPencilSimpleBold className="size-4" aria-hidden />
          Compose
        </button>
        <FolderButton
          active={folder === "inbox"}
          icon={<PiTrayFill />}
          label="Inbox"
          count={read ? undefined : 1}
          onClick={() => {
            setFolder("inbox");
            openWelcome();
          }}
        />
        <FolderButton
          active={folder === "sent"}
          icon={<PiPaperPlaneTiltFill />}
          label="Sent"
          count={sent.length || undefined}
          onClick={() => {
            setFolder("sent");
            setPane(sent[0] ? { kind: "sent", id: sent[0].id } : { kind: "list" });
          }}
        />
      </nav>

      {/* Message list */}
      <section
        aria-label={folder === "inbox" ? "Inbox" : "Sent"}
        className={`min-h-0 w-full shrink-0 flex-col border-r border-white/5 @2xl:flex @2xl:w-72 ${showingDetail ? "hidden" : "flex"}`}
      >
        <div className="flex items-center gap-2 border-b border-white/5 p-3 @3xl:hidden">
          {(["inbox", "sent"] as Folder[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolder(f)}
              aria-current={folder === f ? "page" : undefined}
              className={`min-h-9 rounded-lg px-3 text-sm capitalize transition ${
                folder === f ? "bg-mocha-surface0 font-medium text-mocha-text" : "text-mocha-subtext1 hover:bg-mocha-surface0/60"
              }`}
            >
              {f}
            </button>
          ))}
          <button type="button" onClick={() => startCompose()} aria-label="Compose" className={`${buttonClass.icon} ml-auto size-9`}>
            <PiPencilSimpleBold className="size-4" aria-hidden />
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
          {folder === "inbox" ? (
            <ListItem
              active={pane.kind === "welcome"}
              unread={!read}
              from={profile.name}
              subject="Thanks for stopping by"
              preview="If you are hiring or have a project in mind, hit Reply."
              time="Today"
              onClick={openWelcome}
            />
          ) : sent.length ? (
            sent.map((m) => (
              <ListItem
                key={m.id}
                active={pane.kind === "sent" && pane.id === m.id}
                from={`To: ${profile.name}`}
                subject={m.subject || "(no subject)"}
                preview={m.message}
                time={timeLabel(m.at)}
                onClick={() => {
                  setJustSent(null);
                  setPane({ kind: "sent", id: m.id });
                }}
              />
            ))
          ) : (
            <li className="flex flex-col items-start gap-3 p-5 text-sm text-mocha-subtext0">
              Nothing sent yet.
              <button type="button" onClick={() => startCompose()} className={buttonClass.secondary}>
                <PiPencilSimpleBold className="size-4" aria-hidden />
                Write to {firstName}
              </button>
            </li>
          )}
        </ul>
      </section>

      {/* Reading pane / composer */}
      <main className={`min-h-0 min-w-0 flex-1 flex-col @2xl:flex ${showingDetail ? "flex" : "hidden"}`}>
        <div className="flex items-center border-b border-white/5 px-2 py-1.5 @2xl:hidden">
          <button type="button" onClick={() => setPane({ kind: "list" })} className={buttonClass.ghost}>
            <PiArrowLeftBold className="size-4" aria-hidden />
            {folder === "inbox" ? "Inbox" : "Sent"}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0 @2xl:px-7">
          {pane.kind === "compose" ? (
            <Compose key={initial.key} initial={initial} onSent={onSent} onCancel={openWelcome} />
          ) : pane.kind === "sent" && current ? (
            <SentView mail={current} justSent={justSent === current.id} />
          ) : pane.kind === "welcome" ? (
            <Welcome
              onReply={() => {
                setRead(true);
                startCompose("Re: Thanks for stopping by");
              }}
              onBook={() => openApp("calendar")}
            />
          ) : (
            <p className="text-sm text-mocha-subtext0">Select a message.</p>
          )}
        </div>
      </main>
    </div>
  );
}
