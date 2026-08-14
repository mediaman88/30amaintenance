"use client";

import { useState } from "react";
import { services, site } from "@/site.config";
import { ArrowIcon, CheckIcon } from "./icons";

type Status = "idle" | "sending" | "sent";
type Errors = Record<string, string>;

const field =
  "w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-800/35 transition-colors focus:border-gulf-500 focus:outline-none focus:ring-2 focus:ring-gulf-500/25";
const label = "block text-sm font-medium text-ink-900";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<{
    text: string;
    email?: string;
  } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setErrors({});
    setNotice(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      setStatus("idle");

      if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        return;
      }

      if (body.error === "not_configured" || body.error === "send_failed") {
        setNotice(
          body.fallbackEmail
            ? {
                text: "We couldn't send that automatically. Please email us directly and we'll get right back to you:",
                email: body.fallbackEmail,
              }
            : {
                text: `We couldn't send that automatically. Please call us at ${site.contact.phone} and we'll get right back to you.`,
              },
        );
        return;
      }

      setNotice({
        text: body.error || "Something went wrong. Please try again, or call us.",
      });
    } catch {
      setStatus("idle");
      setNotice({
        text: "Network error — please check your connection and try again.",
      });
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-lift ring-1 ring-sand-200">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gulf-50 text-gulf-600 ring-1 ring-gulf-100">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-ink-900">
          Thanks — we got it.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-pretty leading-relaxed text-ink-800/70">
          We&apos;ll be in touch within a business day or two. If it&apos;s
          urgent, calling is always faster.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-gulf-700 underline underline-offset-4 transition-colors hover:text-gulf-500"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl bg-white p-7 shadow-lift ring-1 ring-sand-200 sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Name <span className="text-gulf-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={`mt-2 ${field}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="phone" className={label}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={`mt-2 ${field}`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className={label}>
            Email <span className="text-gulf-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`mt-2 ${field}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className={label}>
            Property address or area
          </label>
          <input
            id="address"
            name="address"
            autoComplete="street-address"
            placeholder="e.g. Seagrove Beach"
            className={`mt-2 ${field}`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service" className={label}>
            What do you need?
          </label>
          <select
            id="service"
            name="service"
            defaultValue=""
            className={`mt-2 ${field}`}
          >
            <option value="">Select one…</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Other">Something else</option>
          </select>
          <FieldError id="service-error" message={errors.service} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>
            Tell us about the project <span className="text-gulf-600">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="What needs doing, roughly when, and anything we should know about access or scheduling."
            className={`mt-2 resize-y ${field}`}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {notice && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-sun-400/12 px-4 py-3 text-sm leading-relaxed text-ink-900 ring-1 ring-sun-400/35"
        >
          {notice.text}{" "}
          {notice.email && (
            <a
              href={`mailto:${notice.email}`}
              className="font-semibold text-gulf-700 underline underline-offset-4"
            >
              {notice.email}
            </a>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-8 py-4 text-base font-semibold text-sand-50 shadow-lift transition-all hover:bg-ink-800 hover:shadow-lift-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send request"}
        {status !== "sending" && <ArrowIcon className="h-4 w-4" />}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-ink-800/50">
        We only use your details to reply about your project. No lists, no
        sharing.
      </p>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  );
}
