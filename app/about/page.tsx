import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedPhotos } from "@/lib/gallery";
import { site } from "@/site.config";
import { ArrowIcon, CheckIcon, MapPinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is a local remodeling and property maintenance company serving Scenic 30A and South Walton, Florida.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const photos = getFeaturedPhotos(3);
  const years = site.foundedYear
    ? new Date().getFullYear() - site.foundedYear
    : 0;

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              A local crew that sticks around.
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-800/70">
              {site.name} handles remodeling and year-round property maintenance
              along Scenic Highway 30A
              {years > 0
                ? ` — and we've been doing it here for ${years} years.`
                : "."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="reveal space-y-5 text-pretty leading-relaxed text-ink-800/80">
            <p>
              Living on 30A is great. Maintaining a house on 30A is a different
              story. Salt air chews through hardware, humidity finds every gap
              in the caulk, and a rental that&apos;s booked forty weeks a year
              takes more abuse in one season than most homes see in five.
            </p>
            <p>
              We built this business around that reality. Instead of chasing
              one-off jobs and disappearing, we work the same stretch of coast
              year-round — which means we know which materials hold up out here,
              we know how tight a turnover window really is, and we&apos;re
              still around when something needs a second look.
            </p>
            <p>
              The work ranges from full kitchen and bath remodels down to
              swapping a corroded fixture before the next guest checks in. Same
              crew either way, same standard either way.
            </p>
            <p>
              If you&apos;ve got a project in mind or a list that keeps getting
              longer, get in touch. We&apos;ll walk it, price it in writing, and
              tell you honestly where it fits in the schedule.
            </p>

            <div className="!mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-sand-50 shadow-lift transition-all hover:bg-ink-800 active:scale-[0.98]"
              >
                Get in touch
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 ring-1 ring-sand-200 transition-colors hover:bg-sand-100"
              >
                See our work
              </Link>
            </div>
          </div>

          <div className="reveal space-y-5">
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl bg-sand-200 ring-1 ring-sand-200">
                  <Image
                    src={photos[0].src}
                    alt={photos[0].alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {photos.slice(1, 3).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-sand-200 ring-1 ring-sand-200"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl bg-white p-7 shadow-lift ring-1 ring-sand-200">
              <h2 className="flex items-center gap-2 font-semibold text-ink-900">
                <MapPinIcon className="h-4.5 w-4.5 text-gulf-600" />
                Where we work
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-ink-800/75">
                {site.areasServed.map((area) => (
                  <li key={area} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gulf-500" />
                    {area}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-sand-200 pt-4 text-xs leading-relaxed text-ink-800/55">
                Roughly a {site.location.serviceRadiusMiles}-mile radius around{" "}
                {site.location.city}. Just outside it? Ask — we make exceptions
                for the right project.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
