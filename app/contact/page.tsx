import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/site.config";
import {
  ClockIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Request a free estimate from ${site.name} — remodeling and property maintenance on Scenic 30A and South Walton, Florida.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Request an estimate
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-800/70">
              Tell us what you&apos;re working on and we&apos;ll get back to you
              with a written estimate — usually within a couple of business
              days.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <ContactForm />

          <aside className="space-y-5">
            <div className="rounded-2xl bg-white p-7 shadow-lift ring-1 ring-sand-200">
              <h2 className="font-semibold text-ink-900">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <PhoneIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gulf-600" />
                  <div>
                    <a
                      href={site.contact.phoneHref}
                      className="font-semibold text-ink-900 transition-colors hover:text-gulf-700"
                    >
                      {site.contact.phone}
                    </a>
                    <p className="mt-0.5 text-ink-800/55">
                      Fastest way to reach us
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MailIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gulf-600" />
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="break-all text-ink-800/80 transition-colors hover:text-gulf-700"
                  >
                    {site.contact.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gulf-600" />
                  <div className="text-ink-800/80">
                    <p>
                      {site.location.city}, {site.location.region}
                    </p>
                    <p className="mt-0.5 text-ink-800/55">
                      Serving all of Scenic 30A &amp; South Walton
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <InstagramIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gulf-600" />
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-800/80 transition-colors hover:text-gulf-700"
                  >
                    {site.social.instagramHandle}
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-lift ring-1 ring-sand-200">
              <h2 className="flex items-center gap-2 font-semibold text-ink-900">
                <ClockIcon className="h-4.5 w-4.5 text-gulf-600" />
                Hours
              </h2>
              <dl className="mt-4 space-y-2 text-sm text-ink-800/75">
                <div>{site.hours.weekdays}</div>
                <div>{site.hours.saturday}</div>
                <div>{site.hours.sunday}</div>
              </dl>
              {site.hours.emergencyNote && (
                <p className="mt-5 rounded-xl bg-sun-400/12 px-4 py-3 text-sm leading-relaxed text-ink-900 ring-1 ring-sun-400/30">
                  {site.hours.emergencyNote}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-ink-950 p-7 text-sand-100">
              <h2 className="font-semibold text-sand-50">
                Property managers &amp; rental owners
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-sand-100/70">
                Managing several properties on 30A? We set up recurring
                maintenance schedules and priority turnover slots. Mention how
                many doors you manage and we&apos;ll put together a plan.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
