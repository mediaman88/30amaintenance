"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/site.config";
import Logo from "./Logo";

const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Don't let the page scroll behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-sand-200 bg-sand-50/90 backdrop-blur-md"
          : "border-b border-transparent bg-sand-50"
      }`}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${site.name} home`}
        >
          <Logo className="h-9 w-9 shrink-0 text-gulf-600" />
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
              {site.shortName}
            </span>
            <span className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-gulf-600">
              Remodeling &amp; Repairs · 30A
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-gulf-700"
                    : "text-ink-800/75 hover:bg-sand-100 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.contact.phoneHref}
            className="hidden rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-sand-50 shadow-lift transition-all hover:bg-ink-800 hover:shadow-lift-lg active:scale-[0.98] sm:inline-flex"
          >
            {site.contact.phone}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-900 transition-colors hover:bg-sand-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-sand-200 bg-sand-50 md:hidden"
        >
          <nav className="container-page flex flex-col py-3" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-3.5 text-base font-medium transition-colors ${
                    active
                      ? "bg-gulf-50 text-gulf-700"
                      : "text-ink-800 hover:bg-sand-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={site.contact.phoneHref}
              className="mt-3 rounded-full bg-ink-900 px-5 py-3.5 text-center text-base font-semibold text-sand-50"
            >
              Call {site.contact.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
