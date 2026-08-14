"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/lib/gallery";
import { ArrowIcon, InstagramIcon } from "./icons";

const PAGE_SIZE = 24;

type Props = {
  photos: Photo[];
  categories: string[];
  /** Category for each photo, keyed by id — computed on the server. */
  categoryById: Record<string, string | null>;
};

export default function GalleryGrid({
  photos,
  categories,
  categoryById,
}: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return photos;
    return photos.filter((p) => categoryById[p.id] === filter);
  }, [photos, filter, categoryById]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  const selectFilter = (next: string) => {
    setFilter(next);
    setVisible(PAGE_SIZE);
  };

  /* ── Lightbox ──────────────────────────────────────────────────────── */

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (delta: number) =>
      setLightbox((current) => {
        if (current === null) return null;
        const next = current + delta;
        if (next < 0 || next >= filtered.length) return current;
        // Keep the grid in sync so "next" past the fold still has a tile.
        setVisible((v) => (next >= v ? v + PAGE_SIZE : v));
        return next;
      }),
    [filtered.length],
  );

  useEffect(() => {
    if (lightbox === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [lightbox, close, step]);

  const active = lightbox !== null ? filtered[lightbox] : null;

  if (!photos.length) return <EmptyState />;

  return (
    <>
      {categories.length > 1 && (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter photos by type of work"
        >
          {["All", ...categories].map((category) => {
            const selected = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectFilter(category)}
                aria-pressed={selected}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selected
                    ? "bg-navy-900 text-paper-50 shadow-lift"
                    : "bg-white text-navy-800/75 ring-1 ring-paper-200 hover:bg-paper-100 hover:text-navy-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <p className="mb-6 text-sm text-navy-800/55" aria-live="polite">
        Showing {shown.length} of {filtered.length} photo
        {filtered.length === 1 ? "" : "s"}
      </p>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {shown.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setLightbox(index)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-paper-200 ring-1 ring-paper-200 transition-shadow hover:shadow-lift-lg"
              aria-label={`Open photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                // The first row is above the fold on most screens.
                priority={index < 4}
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {photo.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-left text-xs leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.alt}
                </span>
              )}
              {photo.albumSize > 1 && (
                <span
                  className="pointer-events-none absolute right-2 top-2 rounded-md bg-navy-950/55 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm"
                  aria-hidden="true"
                >
                  {photo.albumIndex + 1}/{photo.albumSize}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lift ring-1 ring-paper-200 transition-all hover:shadow-lift-lg active:scale-[0.98]"
          >
            Load more photos
            <span className="text-navy-800/45">
              ({filtered.length - visible} left)
            </span>
          </button>
        </div>
      )}

      {active && (
        <Lightbox
          photo={active}
          index={lightbox as number}
          total={filtered.length}
          onClose={close}
          onStep={step}
        />
      )}
    </>
  );
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onStep,
}: {
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const caption = photo.caption.replace(/#[\wÀ-ɏ]+/g, "").trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/92 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5 sm:top-5"
        aria-label="Close"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      {index > 0 && (
        <NavButton side="left" onClick={() => onStep(-1)} label="Previous photo" />
      )}
      {index < total - 1 && (
        <NavButton side="right" onClick={() => onStep(1)} label="Next photo" />
      )}

      <figure className="flex max-h-full w-full max-w-4xl flex-col items-center gap-4">
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- natural sizing
              matters more than optimisation for a single full-screen view */}
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width ?? undefined}
            height={photo.height ?? undefined}
            className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>

        <figcaption className="w-full max-w-2xl text-center">
          {caption && (
            <p className="mx-auto max-h-24 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-paper-100/85">
              {caption}
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-paper-100/50">
            <span>
              {index + 1} of {total}
            </span>
            {photo.permalink && (
              <a
                href={photo.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                View on Instagram
              </a>
            )}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${
        side === "left" ? "left-2 sm:left-5" : "right-2 sm:right-5"
      }`}
    >
      <ArrowIcon
        className={`h-5 w-5 ${side === "left" ? "rotate-180" : ""}`}
      />
    </button>
  );
}

/**
 * Shown until photos are synced. Deliberately instructional rather than a
 * generic "coming soon" — this repo ships empty and the owner needs to know
 * what to run.
 */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-paper-300 bg-white/60 p-10 text-center">
      <InstagramIcon className="mx-auto h-10 w-10 text-gold-500" />
      <h2 className="mt-4 text-xl font-semibold text-navy-900">
        No photos synced yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-800/65">
        Run one of these from the project folder to pull your Instagram photos
        into the site, then commit and push:
      </p>
      <div className="mx-auto mt-5 max-w-md space-y-2 text-left">
        <code className="block rounded-lg bg-navy-950 px-4 py-3 font-mono text-xs text-paper-100">
          npm run sync:instagram
        </code>
        <p className="text-center text-xs text-navy-800/45">
          or, with no API setup at all
        </p>
        <code className="block rounded-lg bg-navy-950 px-4 py-3 font-mono text-xs text-paper-100">
          npm run import:export
        </code>
      </div>
      <p className="mt-5 text-xs text-navy-800/50">
        See the README for the two-minute setup on each.
      </p>
    </div>
  );
}
