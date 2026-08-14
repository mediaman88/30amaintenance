import Image from "next/image";
import Link from "next/link";
import { getFeaturedPhotos, hasPhotos } from "@/lib/gallery";
import { services, site, testimonials } from "@/site.config";
import {
  ArrowIcon,
  CheckIcon,
  InstagramIcon,
  ServiceIcon,
  Stars,
} from "@/components/icons";

export default function HomePage() {
  const featured = getFeaturedPhotos(8);
  const hero = featured[0];

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-950">
        {hero ? (
          <>
            <Image
              src={hero.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* Heavy on the left where the headline sits, lighter on the right
                so the photo itself is still readable. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgb(11 14 42 / 0.95) 0%, rgb(11 14 42 / 0.86) 42%, rgb(11 14 42 / 0.5) 100%)",
              }}
            />
          </>
        ) : (
          // No photos synced yet — a coastal gradient stands in for the hero.
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 15% 0%, #333b7d 0%, #161a45 55%, #0b0e2a 100%)",
            }}
            aria-hidden="true"
          />
        )}

        <div className="container-page relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-paper-50/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-200 ring-1 ring-paper-50/15">
              Scenic 30A &amp; South Walton
            </p>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-paper-50 sm:text-5xl lg:text-6xl">
              Remodeling and maintenance, done right the first time.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper-100/75">
              From full kitchen and bath remodels to the punch list you&apos;ve
              been putting off — one crew you can actually get on the phone,
              serving homes and vacation rentals from Dune Allen to Inlet Beach.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-4 text-base font-semibold text-navy-950 shadow-lift-lg transition-all hover:bg-gold-300 active:scale-[0.98]"
              >
                Request a free estimate
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <a
                href={site.contact.phoneHref}
                className="inline-flex items-center justify-center rounded-full bg-paper-50/10 px-7 py-4 text-base font-semibold text-paper-50 ring-1 ring-paper-50/20 backdrop-blur-sm transition-colors hover:bg-paper-50/20"
              >
                Call {site.contact.phone}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-paper-100/70">
              {site.googleRating.show && site.googleRating.count > 0 && (
                <span className="flex items-center gap-2">
                  <Stars rating={site.googleRating.rating} />
                  <span className="font-semibold text-paper-50">
                    {site.googleRating.rating.toFixed(1)}
                  </span>
                  on Google ({site.googleRating.count})
                </span>
              )}
              {["Free written estimates", "Local, year-round crew"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 shrink-0 text-gold-400" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────────── */}
      <section className="container-page py-20 sm:py-28">
        <div className="reveal max-w-2xl">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">
            What we do
          </h2>
          <p className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl">
            One call handles the whole list.
          </p>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-navy-800/70">
            Most of our work falls into these six buckets. If what you need
            isn&apos;t here, ask anyway — chances are we do it or know who does.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li
              key={service.slug}
              className="reveal group rounded-2xl bg-white p-7 shadow-lift ring-1 ring-paper-200 transition-all hover:-translate-y-1 hover:shadow-lift-lg"
              style={{ transitionDelay: `${Math.min(index, 5) * 60}ms` }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-navy-700 ring-1 ring-gold-100 transition-colors group-hover:bg-navy-700 group-hover:text-white">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
                {service.blurb}
              </p>
              <Link
                href={`/services#${service.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors hover:text-gold-500"
              >
                Learn more
                <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Recent work ─────────────────────────────────────────────────── */}
      <section className="border-y border-paper-200 bg-white py-20 sm:py-28">
        <div className="container-page">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">
                Recent work
              </h2>
              <p className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl">
                Straight from the job site.
              </p>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-navy-800/70">
                Every photo here is our own work, posted to{" "}
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy-800 underline decoration-gold-200 underline-offset-4 transition-colors hover:decoration-gold-500"
                >
                  {site.social.instagramHandle}
                </a>{" "}
                as we finish it.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-paper-50 shadow-lift transition-all hover:bg-navy-800 hover:shadow-lift-lg active:scale-[0.98]"
            >
              See the full gallery
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          {hasPhotos() ? (
            <ul className="reveal mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {featured.map((photo, index) => (
                <li key={photo.id}>
                  <Link
                    href="/gallery"
                    className="group relative block aspect-square overflow-hidden rounded-xl bg-paper-200 ring-1 ring-paper-200"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      priority={index < 2}
                    />
                    <span className="pointer-events-none absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="reveal mt-12 rounded-2xl border border-dashed border-paper-300 bg-paper-50 p-10 text-center">
              <InstagramIcon className="mx-auto h-9 w-9 text-gold-500" />
              <p className="mt-4 text-sm text-navy-800/70">
                Photos appear here automatically once you run{" "}
                <code className="rounded bg-navy-950 px-2 py-1 font-mono text-xs text-paper-100">
                  npm run sync:instagram
                </code>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Why us ──────────────────────────────────────────────────────── */}
      <section className="container-page py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="reveal">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">
              Why {site.name}
            </h2>
            <p className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl">
              Built for how 30A actually works.
            </p>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-navy-800/70">
              Rental calendars don&apos;t wait, salt air is hard on everything,
              and half the trades out here disappear after season. We work this
              stretch of coast year-round and schedule around your bookings, not
              ours.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors hover:text-gold-500"
            >
              More about us
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <dl className="reveal grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "We answer the phone",
                body: "No dispatch queue, no ghosting. You get a real answer on timing, even if the answer is 'not this week.'",
              },
              {
                title: "Written estimates",
                body: "Scope and price in writing before we start, so there are no surprises when the invoice arrives.",
              },
              {
                title: "Turnover-aware scheduling",
                body: "We plan around check-in and check-out windows so your rental never sits empty waiting on us.",
              },
              {
                title: "Coastal-grade materials",
                body: "Stainless fasteners, marine sealants, and finishes chosen to survive humidity and salt.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-lift ring-1 ring-paper-200"
              >
                <dt className="flex items-start gap-2.5 font-semibold text-navy-900">
                  <CheckIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-navy-700" />
                  {item.title}
                </dt>
                <dd className="mt-2.5 pl-7 text-sm leading-relaxed text-navy-800/70">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Testimonials (hidden until you add real ones) ────────────────── */}
      {testimonials.length > 0 && (
        <section className="border-y border-paper-200 bg-white py-20 sm:py-24">
          <div className="container-page">
            <h2 className="reveal text-center text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">
              What clients say
            </h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <li
                  key={item.author}
                  className="reveal rounded-2xl bg-paper-50 p-7 ring-1 ring-paper-200"
                >
                  <blockquote className="text-pretty leading-relaxed text-navy-800/85">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <p className="mt-5 text-sm font-semibold text-navy-900">
                    {item.author}
                    {item.role && (
                      <span className="block font-normal text-navy-800/55">
                        {item.role}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section className="container-page py-20 sm:py-28">
        <div className="reveal relative overflow-hidden rounded-3xl bg-navy-950 px-8 py-16 text-center sm:px-14">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(100% 120% at 50% 0%, #333b7d 0%, #161a45 60%, #0b0e2a 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-paper-50 sm:text-4xl">
              Got a project or a list that keeps growing?
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-paper-100/70">
              Send over the details and we&apos;ll get you a written estimate.
              Most quotes go out within two business days.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-4 text-base font-semibold text-navy-950 shadow-lift-lg transition-all hover:bg-gold-300 active:scale-[0.98]"
              >
                Request an estimate
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <a
                href={site.contact.phoneHref}
                className="inline-flex items-center justify-center rounded-full bg-paper-50/10 px-7 py-4 text-base font-semibold text-paper-50 ring-1 ring-paper-50/20 transition-colors hover:bg-paper-50/20"
              >
                Call {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
