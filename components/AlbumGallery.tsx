"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Album, Photo } from "@/lib/gallery";
import { ArrowIcon, InstagramIcon } from "./icons";

const ALBUMS_PER_PAGE = 8;

type Props = {
  albums: Album[];
  categories: string[];
  /** Category per album id — computed on the server. */
  categoryById: Record<string, string | null>;
};

/** "March 2026" — enough to date a project without implying a day-precise log. */
function formatMonth(timestamp: string | null): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function AlbumGallery({
  albums,
  categories,
  categoryById,
}: Props) {
  const [filter, setFilter] = useState("All");
  const [visible, setVisible] = useState(ALBUMS_PER_PAGE);

  // The lightbox works within one album at a time, mirroring how a carousel
  // behaves on Instagram.
  const [viewer, setViewer] = useState<{
    albumId: string;
    index: number;
  } | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return albums;
    return albums.filter((a) => categoryById[a.id] === filter);
  }, [albums, filter, categoryById]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;
  const totalPhotos = filtered.reduce((n, a) => n + a.photos.length, 0);

  const activeAlbum = viewer
    ? albums.find((a) => a.id === viewer.albumId)
    : null;
  const activePhoto = activeAlbum ? activeAlbum.photos[viewer!.index] : null;

  const close = useCallback(() => setViewer(null), []);
  const step = useCallback(
    (delta: number) =>
      setViewer((current) => {
        if (!current) return null;
        const album = albums.find((a) => a.id === current.albumId);
        if (!album) return current;
        const next = current.index + delta;
        if (next < 0 || next >= album.photos.length) return current;
        return { ...current, index: next };
      }),
    [albums],
  );

  if (!albums.length) return <EmptyState />;

  return (
    <>
      {categories.length > 0 && (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by type of work"
        >
          {["All", ...categories].map((category) => {
            const selected = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setFilter(category);
                  setVisible(ALBUMS_PER_PAGE);
                }}
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

      <p className="mb-10 text-sm text-navy-800/55" aria-live="polite">
        Showing {shown.length} of {filtered.length} project
        {filtered.length === 1 ? "" : "s"} · {totalPhotos} photo
        {totalPhotos === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-14">
        {shown.map((album, albumIndex) => (
          <AlbumSection
            key={album.id}
            album={album}
            eager={albumIndex === 0}
            onOpen={(index) => setViewer({ albumId: album.id, index })}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + ALBUMS_PER_PAGE)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lift ring-1 ring-paper-200 transition-all hover:shadow-lift-lg active:scale-[0.98]"
          >
            Load more projects
            <span className="text-navy-800/45">
              ({filtered.length - visible} left)
            </span>
          </button>
        </div>
      )}

      {activeAlbum && activePhoto && (
        <Lightbox
          album={activeAlbum}
          photo={activePhoto}
          index={viewer!.index}
          onClose={close}
          onStep={step}
        />
      )}
    </>
  );
}

function AlbumSection({
  album,
  eager,
  onOpen,
}: {
  album: Album;
  eager: boolean;
  onOpen: (index: number) => void;
}) {
  const month = formatMonth(album.timestamp);
  const heading = album.title || (month ? `Project — ${month}` : "Project");

  return (
    <article className="reveal">
      <header className="mb-4 max-w-3xl">
        <h2 className="text-balance text-xl font-semibold leading-snug tracking-tight text-navy-900 sm:text-2xl">
          {heading}
        </h2>
        <p className="mt-1.5 text-sm text-navy-800/50">
          {album.photos.length} photo{album.photos.length === 1 ? "" : "s"}
          {month && ` · ${month}`}
        </p>
        {album.body && (
          <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-navy-800/75">
            {album.body}
          </p>
        )}
      </header>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {album.photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-paper-200 ring-1 ring-paper-200 transition-shadow hover:shadow-lift-lg"
              aria-label={`Open photo ${index + 1} of ${album.photos.length}: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                priority={eager && index < 5}
              />
              <span className="pointer-events-none absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Lightbox({
  album,
  photo,
  index,
  onClose,
  onStep,
}: {
  album: Album;
  photo: Photo;
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
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
  }, [onClose, onStep]);

  const total = album.photos.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/92 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={album.title || "Project photos"}
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
          {album.title && (
            <p className="font-semibold text-paper-50">{album.title}</p>
          )}
          {album.body && (
            <p className="mx-auto mt-2 max-h-24 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-paper-100/75">
              {album.body}
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
      <ArrowIcon className={`h-5 w-5 ${side === "left" ? "rotate-180" : ""}`} />
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
      <InstagramIcon className="mx-auto h-10 w-10 text-navy-700" />
      <h2 className="mt-4 text-xl font-semibold text-navy-900">
        No photos synced yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-800/65">
        Run the <strong>Sync photos</strong> workflow from the Actions tab on
        GitHub, or from the project folder:
      </p>
      <div className="mx-auto mt-5 max-w-md space-y-2 text-left">
        <code className="block rounded-lg bg-navy-950 px-4 py-3 font-mono text-xs text-paper-100">
          npm run import:export
        </code>
      </div>
    </div>
  );
}
