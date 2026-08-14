import { NextResponse } from "next/server";
import { services, site } from "@/site.config";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  address?: string;
  message?: string;
  /** Honeypot — real users never fill this in. */
  website?: string;
};

/** Very small in-memory rate limit. Resets whenever the lambda cycles, which
 *  is fine — it exists to blunt bursts, not to be a real quota system. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Silently accept honeypot submissions so bots don't learn anything.
  if (body.website) return NextResponse.json({ ok: true });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a minute." },
      { status: 429 },
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const message = (body.message ?? "").trim();
  const address = (body.address ?? "").trim();
  const service = (body.service ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (message.length < 10)
    errors.message = "Please tell us a bit more about the project.";
  if (message.length > 5000) errors.message = "That message is a little too long.";

  const validService =
    !service || services.some((s) => s.title === service) || service === "Other";
  if (!validService) errors.service = "Please choose from the list.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // CONTACT_TO_EMAIL lets you change the recipient in Vercel without a code
  // change; site.config.ts is the fallback.
  const to =
    process.env.CONTACT_TO_EMAIL ||
    site.contact.formRecipient ||
    site.contact.email;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  // Not wired to an email provider yet — tell the client so it can point the
  // visitor somewhere real instead of pretending the message was delivered.
  if (!apiKey || !from || !to) {
    console.warn(
      "[contact] Email not configured (need RESEND_API_KEY, CONTACT_FROM_EMAIL, and a recipient) — message not sent.",
      { name, email, phone, service },
    );
    return NextResponse.json(
      { error: "not_configured", fallbackEmail: to || null },
      { status: 503 },
    );
  }

  const lines = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Property address", address || "—"],
    ["Service", service || "—"],
  ];

  const html = `
    <h2 style="font-family:sans-serif">New estimate request</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${lines
        .map(
          ([label, value]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(
              value,
            )}</strong></td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;white-space:pre-wrap;margin-top:16px">${escapeHtml(
      message,
    )}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New estimate request — ${name}${service ? ` (${service})` : ""}`,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[contact] Resend rejected the message:", res.status, detail);
      return NextResponse.json(
        { error: "send_failed", fallbackEmail: to },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[contact] Could not reach the email provider:", err);
    return NextResponse.json(
      { error: "send_failed", fallbackEmail: to },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
