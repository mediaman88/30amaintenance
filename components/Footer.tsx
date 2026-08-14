import Link from "next/link";
import { services, site } from "@/site.config";
import Logo from "./Logo";
import { InstagramIcon, FacebookIcon } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-navy-800/15 bg-navy-950 text-paper-100">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <Logo className="h-9 w-9 text-gold-400" />
              <span className="text-lg font-semibold text-paper-50">
                {site.shortName}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-100/65">
              {site.description}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper-50/10 text-paper-50 transition-colors hover:bg-navy-700"
                aria-label={`${site.name} on Instagram`}
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              {site.social.facebook && (
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper-50/10 text-paper-50 transition-colors hover:bg-navy-700"
                  aria-label={`${site.name} on Facebook`}
                >
                  <FacebookIcon className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Services
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services#${service.slug}`}
                    className="text-paper-100/70 transition-colors hover:text-paper-50"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Areas We Serve
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-paper-100/70">
              {site.areasServed.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Get in Touch
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={site.contact.phoneHref}
                  className="font-semibold text-paper-50 transition-colors hover:text-gold-400"
                >
                  {site.contact.phone}
                </a>
              </li>
              {site.contact.email && (
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="text-paper-100/70 transition-colors hover:text-paper-50"
                  >
                    {site.contact.email}
                  </a>
                </li>
              )}
              <li className="text-paper-100/70">
                {site.location.street}
                <br />
                {site.location.city}, {site.location.region}{" "}
                {site.location.postalCode}
              </li>
              <li className="pt-2 text-paper-100/60">
                <div>{site.hours.weekdays}</div>
                <div>{site.hours.saturday}</div>
              </li>
              <li className="pt-1">
                <Link
                  href="/contact"
                  className="inline-flex rounded-full bg-gold-400 px-5 py-2.5 font-semibold text-navy-950 transition-colors hover:bg-gold-300"
                >
                  Request an estimate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper-50/10 pt-6 text-xs text-paper-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
            {site.licenseNumber && (
              <span className="ml-2">FL License #{site.licenseNumber}</span>
            )}
          </p>
          <p>
            Serving Scenic 30A &amp; South Walton, {site.location.regionName}
          </p>
        </div>
      </div>
    </footer>
  );
}
