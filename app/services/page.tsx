import type { Metadata } from "next";
import Link from "next/link";
import { services, site } from "@/site.config";
import { ArrowIcon, CheckIcon, ServiceIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Services",
  description: `Remodeling, property maintenance, vacation rental turnovers, painting, carpentry and handyman work across Scenic 30A and South Walton, Florida.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Services
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-800/70">
              We handle remodels and ongoing upkeep for homes, second homes, and
              vacation rentals across {site.areasServed.length} communities on
              Scenic 30A and in South Walton.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="space-y-5">
          {services.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="reveal scroll-mt-24 rounded-2xl bg-white p-8 shadow-lift ring-1 ring-sand-200 sm:p-10"
            >
              <div className="grid gap-8 md:grid-cols-[auto_1fr_1fr] md:gap-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gulf-50 text-gulf-600 ring-1 ring-gulf-100">
                  <ServiceIcon name={service.icon} className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gulf-600">
                    0{index + 1}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-pretty leading-relaxed text-ink-800/70">
                    {service.blurb}
                  </p>
                </div>

                <ul className="grid gap-3 self-center sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  {service.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-sm text-ink-800/80"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gulf-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="reveal mt-14 rounded-2xl border border-dashed border-sand-300 bg-white/60 p-9 text-center">
          <h2 className="text-xl font-semibold text-ink-900">
            Don&apos;t see what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-ink-800/70">
            This list covers most of what comes through, but it isn&apos;t
            everything. Tell us what you&apos;re dealing with and we&apos;ll
            either take it on or point you to someone local who should.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-sand-50 shadow-lift transition-all hover:bg-ink-800 active:scale-[0.98]"
            >
              Ask about your project
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <a
              href={site.contact.phoneHref}
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 ring-1 ring-sand-200 transition-colors hover:bg-sand-100"
            >
              Call {site.contact.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
